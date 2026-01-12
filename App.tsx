
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GamePhase, Player, Card, PlayerAvatar, Reaction, ChatMessage, CardType, SlapRecord } from './types';
import { createDeck, distributeCards, generateRoomCode } from './services/gameLogic';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import JoinScreen from './components/JoinScreen';
import { AudioService } from './services/audioService';
import { HapticService } from './services/hapticService';
import { supabase } from './services/supabase';

const SEQUENCE = [CardType.TACO, CardType.GATO, CardType.CABRA, CardType.QUEIJO, CardType.PIZZA];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [urlRoomCode, setUrlRoomCode] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  
  const isUpdatingRef = useRef(false);
  const channelRef = useRef<any>(null);

  // Sincroniza apenas LÓGICA CRÍTICA via RPC (Atomic Update)
  const syncStateToDb = async (newState: GameState) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    
    try {
      const incrementedVersion = (newState.version || 0) + 1;
      const stateToSave = { 
        ...newState, 
        version: incrementedVersion,
        reactions: [], // Efêmero via Broadcast
        chat: []       // Efêmero via Broadcast
      };

      // Chama a função SQL RPC para garantir atomicidade (Race Condition protection)
      const { error } = await supabase.rpc('update_room_state_atomic', {
        p_code: newState.roomCode,
        p_new_state: stateToSave
      });
      
      if (error) {
        console.warn('Conflito de versão detectado, recarregando estado...');
        // O listener de DB cuidará de resetar o estado local
      } else {
        setGameState(prev => prev ? { ...prev, version: incrementedVersion } : null);
      }
    } catch (err) {
      console.error('Erro na sincronização atômica:', err);
    } finally {
      setTimeout(() => { isUpdatingRef.current = false; }, 150);
    }
  };

  useEffect(() => {
    if (!gameState?.roomCode || !currentUserId) return;

    const channel = supabase.channel(`room_${gameState.roomCode}`, {
      config: { 
        broadcast: { self: true },
        presence: { key: currentUserId }
      }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const onlineIds = Object.keys(presenceState);
        
        setGameState(prev => {
          if (!prev) return null;
          return {
            ...prev,
            players: prev.players.map(p => ({
              ...p,
              isOnline: onlineIds.includes(p.id)
            }))
          };
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `code=eq.${gameState.roomCode}` }, (payload) => {
        const newState = payload.new.state as GameState;
        if (!isUpdatingRef.current) {
          setGameState(prev => {
            if (!prev || newState.version > prev.version) {
              // Preserva status online localmente
              const onlineIds = Object.keys(channel.presenceState());
              const updatedPlayers = newState.players.map(p => ({
                ...p,
                isOnline: onlineIds.includes(p.id)
              }));
              return { ...newState, players: updatedPlayers, reactions: prev?.reactions || [], chat: prev?.chat || [] };
            }
            return prev;
          });
        }
      })
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        setGameState(prev => prev ? { ...prev, reactions: [payload, ...prev.reactions].slice(0, 15) } : null);
      })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        setGameState(prev => prev ? { ...prev, chat: [...prev.chat, payload].slice(-30) } : null);
        HapticService.vibrateAction();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await channel.track({ 
            user_id: currentUserId,
            online_at: new Date().toISOString()
          });
        } else {
          setIsConnected(false);
        }
      });

    channelRef.current = channel;
    return () => { channel.unsubscribe(); channelRef.current = null; };
  }, [gameState?.roomCode, currentUserId]);

  const handleCreateRoom = useCallback(async (adminName: string, avatar: PlayerAvatar) => {
    const adminId = Math.random().toString(36).substr(2, 9);
    const code = generateRoomCode();
    const newState: GameState = {
      roomCode: code, phase: GamePhase.LOBBY, players: [{ id: adminId, name: adminName, hand: [], isHost: true, cardsPlayedThisRound: 0, avatar, isOnline: true }],
      currentTurnIndex: 0, tablePile: [], lastLoserId: null, winnerId: null, reactions: [], chat: [], version: 1, isSlapActive: false, slapRecords: []
    };
    await supabase.from('rooms').insert([{ code, state: newState }]);
    setCurrentUserId(adminId); setGameState(newState);
    HapticService.vibrateJoin(); AudioService.playSuccess();
  }, []);

  const handleJoinRoom = useCallback(async (code: string, playerName: string, avatar: PlayerAvatar) => {
    const cleanCode = code.toUpperCase().trim();
    const { data } = await supabase.from('rooms').select('state').eq('code', cleanCode).single();
    if (!data) return alert('Sala não encontrada.');
    const currentState = data.state as GameState;
    const playerId = Math.random().toString(36).substr(2, 9);
    const newState = { ...currentState, players: [...currentState.players, { id: playerId, name: playerName, hand: [], isHost: false, cardsPlayedThisRound: 0, avatar, isOnline: true }], version: currentState.version + 1 };
    
    // Usa RPC para entrar na sala com segurança
    const { error } = await supabase.rpc('update_room_state_atomic', { p_code: cleanCode, p_new_state: newState });
    if (error) return alert('Erro ao entrar (conflito de conexão). Tente de novo.');

    setCurrentUserId(playerId); setGameState(newState);
    HapticService.vibrateJoin(); AudioService.playSuccess();
  }, []);

  const handleStartGame = useCallback(() => {
    if (!gameState) return;
    const deck = createDeck();
    const playersWithCards = distributeCards(gameState.players, deck);
    const newState = { ...gameState, phase: GamePhase.PLAYING, players: playersWithCards, currentTurnIndex: 0, tablePile: [], isSlapActive: false, slapRecords: [] };
    setGameState(newState); AudioService.playDeal(); syncStateToDb(newState);
  }, [gameState]);

  const handlePlayCard = useCallback(() => {
    if (!gameState || !currentUserId || gameState.isSlapActive) return;
    
    // Pula jogadores offline automaticamente
    let nextIndex = gameState.currentTurnIndex;
    const player = gameState.players[nextIndex];
    if (player.id !== currentUserId) return;

    AudioService.playCard(); HapticService.vibrateCard();
    const newHand = [...player.hand];
    const playedCard = newHand.pop()!;
    
    const currentWordInSequence = SEQUENCE[gameState.tablePile.length % 5];
    const isMatch = playedCard.type === currentWordInSequence || playedCard.isSpecial;

    const updatedPlayers = gameState.players.map((p, idx) => 
      idx === gameState.currentTurnIndex ? { ...p, hand: newHand, cardsPlayedThisRound: p.cardsPlayedThisRound + 1 } : p
    );

    // Encontra o próximo jogador online
    let searchIdx = (gameState.currentTurnIndex + 1) % gameState.players.length;
    while (!gameState.players[searchIdx].isOnline && searchIdx !== gameState.currentTurnIndex) {
      searchIdx = (searchIdx + 1) % gameState.players.length;
    }

    const nextState: GameState = { 
        ...gameState, 
        players: updatedPlayers, 
        tablePile: [...gameState.tablePile, playedCard], 
        currentTurnIndex: searchIdx,
        isSlapActive: isMatch,
        slapRecords: []
    };
    syncStateToDb(nextState);
  }, [gameState, currentUserId]);

  const handleSlap = useCallback(() => {
    if (!gameState || !currentUserId) return;
    if (!gameState.isSlapActive) {
      AudioService.playError();
      handleResolveRound(currentUserId);
      return;
    }
    if (gameState.slapRecords.some(r => r.playerId === currentUserId)) return;

    const newRecord: SlapRecord = { playerId: currentUserId, timestamp: Date.now() };
    const updatedRecords = [...gameState.slapRecords, newRecord];

    // Considera apenas jogadores online para o encerramento da rodada
    const onlinePlayers = gameState.players.filter(p => p.isOnline);
    if (updatedRecords.length >= onlinePlayers.length) {
      const loserId = updatedRecords[updatedRecords.length - 1].playerId;
      handleResolveRound(loserId);
    } else {
      const nextState = { ...gameState, slapRecords: updatedRecords };
      setGameState(nextState);
      syncStateToDb(nextState);
    }
  }, [gameState, currentUserId]);

  const handleResolveRound = useCallback((loserId: string) => {
    if (!gameState) return;
    AudioService.playSlap(); HapticService.vibrateLoss();
    const updatedPlayers = gameState.players.map(p => p.id === loserId ? { ...p, hand: [...gameState.tablePile, ...p.hand] } : p);
    
    const gameWinner = updatedPlayers.find(p => p.hand.length === 0 && gameState.isSlapActive);
    
    const nextState: GameState = { 
        ...gameState, 
        players: updatedPlayers, 
        tablePile: [], 
        currentTurnIndex: gameState.players.findIndex(p => p.id === loserId), 
        isSlapActive: false,
        slapRecords: [],
        winnerId: gameWinner ? gameWinner.id : null,
        phase: gameWinner ? GamePhase.GAME_OVER : GamePhase.PLAYING
    };
    syncStateToDb(nextState);
  }, [gameState]);

  const handleSendReaction = (emoji: string) => {
    if (channelRef.current) channelRef.current.send({ type: 'broadcast', event: 'reaction', payload: { id: Math.random().toString(36).substr(2, 9), playerId: currentUserId, emoji, timestamp: Date.now() } });
  };

  const handleSendMessage = (text: string) => {
    if (channelRef.current) {
      const p = gameState?.players.find(p => p.id === currentUserId);
      channelRef.current.send({ type: 'broadcast', event: 'chat', payload: { id: Math.random().toString(36).substr(2, 9), playerId: currentUserId, playerName: p?.name, text, timestamp: Date.now(), color: p?.avatar.color } });
    }
  };

  const resetSession = () => { localStorage.removeItem('taco_session'); setGameState(null); setCurrentUserId(null); };

  return (
    <div className="relative">
      {!gameState ? ( <JoinScreen initialCode={urlRoomCode} onCreate={handleCreateRoom} onJoin={handleJoinRoom} />
      ) : gameState.phase === GamePhase.LOBBY ? ( <Lobby gameState={gameState} currentUserId={currentUserId!} onStart={handleStartGame} onQuit={resetSession} onSendReaction={handleSendReaction} onSendMessage={handleSendMessage} />
      ) : ( <GameBoard gameState={gameState} currentUserId={currentUserId!} onPlay={handlePlayCard} onSlap={handleSlap} onResolve={handleResolveRound} onQuit={resetSession} onSendReaction={handleSendReaction} onSendMessage={handleSendMessage} />
      )}
      {gameState && (
        <div className={`fixed bottom-2 right-2 text-[8px] font-black uppercase px-2 py-1 rounded-full border shadow-sm z-50 transition-all ${isConnected ? 'bg-green-100 border-green-200 text-green-600' : 'bg-red-100 border-red-200 text-red-600'}`}>
          {isConnected ? '● Sincronizado' : '○ Conectando...'}
        </div>
      )}
    </div>
  );
};

export default App;
