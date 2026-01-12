
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GamePhase, Player, Card, PlayerAvatar, Reaction, ChatMessage } from './types';
import { createDeck, distributeCards, generateRoomCode } from './services/gameLogic';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import JoinScreen from './components/JoinScreen';
import { AudioService } from './services/audioService';
import { HapticService } from './services/hapticService';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [urlRoomCode, setUrlRoomCode] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!gameState?.roomCode) return;

    const channel = supabase
      .channel(`room_db_${gameState.roomCode}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `code=eq.${gameState.roomCode}`,
        },
        (payload) => {
          if (!isUpdatingRef.current) {
            setGameState(payload.new.state as GameState);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameState?.roomCode]);

  const syncStateToDb = async (newState: GameState) => {
    isUpdatingRef.current = true;
    try {
      // Limpa reações antigas (mais de 10 segundos) e limita chat a 30 mensagens
      const now = Date.now();
      const cleanedReactions = newState.reactions.filter(r => now - r.timestamp < 10000);
      const cleanedChat = newState.chat.slice(-30);

      const stateToSave = { 
        ...newState, 
        reactions: cleanedReactions,
        chat: cleanedChat 
      };

      const { error } = await supabase
        .from('rooms')
        .update({ state: stateToSave, updated_at: new Date().toISOString() })
        .eq('code', newState.roomCode);
      
      if (error) throw error;
    } catch (err) {
      console.error('Erro ao sincronizar com DB:', err);
    } finally {
      setTimeout(() => { isUpdatingRef.current = false; }, 500);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) setUrlRoomCode(room.toUpperCase());
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('taco_session');
    if (saved) {
      const { state, userId } = JSON.parse(saved);
      supabase.from('rooms').select('state').eq('code', state.roomCode).single().then(({ data }) => {
        if (data) {
          setGameState(data.state as GameState);
          setCurrentUserId(userId);
        } else {
          localStorage.removeItem('taco_session');
        }
      });
    }
  }, []);

  useEffect(() => {
    if (gameState && currentUserId) {
      localStorage.setItem('taco_session', JSON.stringify({ state: gameState, userId: currentUserId }));
    }
  }, [gameState, currentUserId]);

  const handleCreateRoom = useCallback(async (adminName: string, avatar: PlayerAvatar) => {
    const adminId = Math.random().toString(36).substr(2, 9);
    const code = generateRoomCode();
    
    const newAdmin: Player = {
      id: adminId,
      name: adminName,
      hand: [],
      isHost: true,
      cardsPlayedThisRound: 0,
      avatar
    };

    const newState: GameState = {
      roomCode: code,
      phase: GamePhase.LOBBY,
      players: [newAdmin],
      currentTurnIndex: 0,
      tablePile: [],
      lastLoserId: null,
      winnerId: null,
      reactions: [],
      chat: []
    };

    const { error } = await supabase.from('rooms').insert([{ code, state: newState }]);
    if (error) return alert('Erro ao criar sala.');

    setCurrentUserId(adminId);
    setGameState(newState);
    HapticService.vibrateJoin();
    AudioService.playSuccess();
  }, []);

  const handleJoinRoom = useCallback(async (code: string, playerName: string, avatar: PlayerAvatar) => {
    const cleanCode = code.toUpperCase().trim();
    const { data, error } = await supabase.from('rooms').select('state').eq('code', cleanCode).single();
    if (error || !data) return alert('Sala não encontrada.');

    const currentState = data.state as GameState;
    const playerId = Math.random().toString(36).substr(2, 9);
    const newPlayer: Player = { id: playerId, name: playerName, hand: [], isHost: false, cardsPlayedThisRound: 0, avatar };
    const newState = { ...currentState, players: [...currentState.players, newPlayer] };

    const { error: updateError } = await supabase.from('rooms').update({ state: newState }).eq('code', cleanCode);
    if (updateError) return alert('Erro ao entrar.');

    setCurrentUserId(playerId);
    setGameState(newState);
    HapticService.vibrateJoin();
    AudioService.playSuccess();
  }, []);

  const handleStartGame = useCallback(() => {
    if (!gameState) return;
    const deck = createDeck();
    const playersWithCards = distributeCards(gameState.players, deck);
    const newState = { ...gameState, phase: GamePhase.PLAYING, players: playersWithCards, currentTurnIndex: 0, tablePile: [] };
    setGameState(newState);
    AudioService.playDeal();
    syncStateToDb(newState);
  }, [gameState]);

  const handlePlayCard = useCallback(() => {
    if (!gameState || !currentUserId) return;
    const player = gameState.players[gameState.currentTurnIndex];
    if (player.id !== currentUserId) return;

    if (player.hand.length === 0) {
      const nextState = { ...gameState, currentTurnIndex: (gameState.currentTurnIndex + 1) % gameState.players.length };
      setGameState(nextState);
      syncStateToDb(nextState);
      return;
    }

    AudioService.playCard();
    HapticService.vibrateCard();
    const newHand = [...player.hand];
    const playedCard = newHand.pop()!;
    const updatedPlayers = gameState.players.map((p, idx) => 
      idx === gameState.currentTurnIndex ? { ...p, hand: newHand, cardsPlayedThisRound: p.cardsPlayedThisRound + 1 } : p
    );
    const nextState: GameState = { ...gameState, players: updatedPlayers, tablePile: [...gameState.tablePile, playedCard], currentTurnIndex: (gameState.currentTurnIndex + 1) % gameState.players.length };
    setGameState(nextState);
    syncStateToDb(nextState);
  }, [gameState, currentUserId]);

  const handleResolveRound = useCallback((loserId: string) => {
    if (!gameState) return;
    AudioService.playSlap();
    HapticService.vibrateLoss();
    const updatedPlayers = gameState.players.map(p => p.id === loserId ? { ...p, hand: [...p.hand, ...gameState.tablePile] } : p);
    
    const totalCards = 64; 
    const gameLoser = updatedPlayers.find(p => p.hand.length >= totalCards);

    let nextState: GameState;
    if (gameLoser) {
        nextState = { ...gameState, players: updatedPlayers, phase: GamePhase.GAME_OVER, tablePile: [], lastLoserId: loserId, winnerId: gameLoser.id };
    } else {
        nextState = { ...gameState, players: updatedPlayers, tablePile: [], currentTurnIndex: gameState.players.findIndex(p => p.id === loserId), phase: GamePhase.PLAYING };
    }
    setGameState(nextState);
    syncStateToDb(nextState);
  }, [gameState]);

  const handleSendReaction = useCallback((emoji: string) => {
    if (!gameState || !currentUserId) return;
    const newReaction: Reaction = {
      id: Math.random().toString(36).substr(2, 9),
      playerId: currentUserId,
      emoji,
      timestamp: Date.now()
    };
    const newState = { ...gameState, reactions: [...gameState.reactions, newReaction] };
    setGameState(newState);
    syncStateToDb(newState);
  }, [gameState, currentUserId]);

  const handleSendMessage = useCallback((text: string) => {
    if (!gameState || !currentUserId) return;
    const player = gameState.players.find(p => p.id === currentUserId);
    if (!player) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      playerId: currentUserId,
      playerName: player.name,
      text,
      timestamp: Date.now(),
      color: player.avatar.color
    };

    const newState = { ...gameState, chat: [...gameState.chat, newMessage] };
    setGameState(newState);
    syncStateToDb(newState);
    HapticService.vibrateAction();
  }, [gameState, currentUserId]);

  const resetSession = () => {
      localStorage.removeItem('taco_session');
      setGameState(null);
      setCurrentUserId(null);
      window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <div className="relative">
      {!gameState ? (
        <JoinScreen initialCode={urlRoomCode} onCreate={handleCreateRoom} onJoin={handleJoinRoom} />
      ) : gameState.phase === GamePhase.LOBBY ? (
        <Lobby 
          gameState={gameState} 
          currentUserId={currentUserId!} 
          onStart={handleStartGame} 
          onQuit={resetSession} 
          onSendReaction={handleSendReaction}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <GameBoard 
          gameState={gameState} 
          currentUserId={currentUserId!} 
          onPlay={handlePlayCard} 
          onResolve={handleResolveRound} 
          onQuit={resetSession} 
          onSendReaction={handleSendReaction}
          onSendMessage={handleSendMessage}
        />
      )}
      {gameState && (
        <div className={`fixed bottom-2 right-2 text-[8px] font-black uppercase px-2 py-1 rounded-full border shadow-sm z-50 transition-colors ${isConnected ? 'bg-green-100 border-green-200 text-green-600' : 'bg-red-100 border-red-200 text-red-600'}`}>
          {isConnected ? '● Conectado' : '○ Reconectando...'}
        </div>
      )}
    </div>
  );
};

export default App;
