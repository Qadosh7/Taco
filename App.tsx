
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GamePhase, Player, Card } from './types';
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

  // Sincronização em tempo real via Database Changes
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
          // Só atualizamos se a mudança não veio de nós mesmos para evitar loops
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

  // Função para salvar o estado no banco de dados
  const syncStateToDb = async (newState: GameState) => {
    isUpdatingRef.current = true;
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ state: newState, updated_at: new Date().toISOString() })
        .eq('code', newState.roomCode);
      
      if (error) throw error;
    } catch (err) {
      console.error('Erro ao sincronizar com DB:', err);
    } finally {
      // Pequeno delay para garantir que o evento de broadcast do próprio DB seja ignorado
      setTimeout(() => { isUpdatingRef.current = false; }, 500);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) {
      setUrlRoomCode(room.toUpperCase());
    }
  }, []);

  // Tenta recuperar sessão anterior
  useEffect(() => {
    const saved = localStorage.getItem('taco_session');
    if (saved) {
      const { state, userId } = JSON.parse(saved);
      // Validar se a sala ainda existe no banco
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

  // Persistir no localStorage para reconexão rápida
  useEffect(() => {
    if (gameState && currentUserId) {
      localStorage.setItem('taco_session', JSON.stringify({ state: gameState, userId: currentUserId }));
    }
  }, [gameState, currentUserId]);

  const handleCreateRoom = useCallback(async (adminName: string) => {
    const adminId = Math.random().toString(36).substr(2, 9);
    const code = generateRoomCode();
    
    const newAdmin: Player = {
      id: adminId,
      name: adminName,
      hand: [],
      isHost: true,
      cardsPlayedThisRound: 0
    };

    const newState: GameState = {
      roomCode: code,
      phase: GamePhase.LOBBY,
      players: [newAdmin],
      currentTurnIndex: 0,
      tablePile: [],
      lastLoserId: null,
      winnerId: null
    };

    // Salva a nova sala no banco
    const { error } = await supabase.from('rooms').insert([{ code, state: newState }]);
    
    if (error) {
      alert('Erro ao criar sala. Tente novamente.');
      return;
    }

    setCurrentUserId(adminId);
    setGameState(newState);
    HapticService.vibrateJoin();
    AudioService.playSuccess();
  }, []);

  const handleJoinRoom = useCallback(async (code: string, playerName: string) => {
    const cleanCode = code.toUpperCase().trim();
    
    // 1. Buscar estado atual da sala no banco
    const { data, error } = await supabase
      .from('rooms')
      .select('state')
      .eq('code', cleanCode)
      .single();

    if (error || !data) {
      alert('Sala não encontrada. Verifique o código.');
      return;
    }

    const currentState = data.state as GameState;
    const playerId = Math.random().toString(36).substr(2, 9);
    
    // 2. Criar novo jogador
    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      hand: [],
      isHost: false,
      cardsPlayedThisRound: 0
    };

    // 3. Atualizar estado com o novo jogador
    const newState = {
      ...currentState,
      players: [...currentState.players, newPlayer]
    };

    // 4. Salvar de volta no banco
    const { error: updateError } = await supabase
      .from('rooms')
      .update({ state: newState })
      .eq('code', cleanCode);

    if (updateError) {
      alert('Erro ao entrar na sala.');
      return;
    }

    setCurrentUserId(playerId);
    setGameState(newState);
    HapticService.vibrateJoin();
    AudioService.playSuccess();
  }, []);

  const handleStartGame = useCallback(() => {
    if (!gameState) return;
    const deck = createDeck();
    const playersWithCards = distributeCards(gameState.players, deck);

    const newState = {
      ...gameState,
      phase: GamePhase.PLAYING,
      players: playersWithCards,
      currentTurnIndex: 0,
      tablePile: []
    };

    setGameState(newState);
    AudioService.playDeal();
    syncStateToDb(newState);
  }, [gameState]);

  const handlePlayCard = useCallback(() => {
    if (!gameState || !currentUserId) return;
    const player = gameState.players[gameState.currentTurnIndex];
    if (player.id !== currentUserId) return;

    const playerIdx = gameState.currentTurnIndex;
    const currentPlayer = gameState.players[playerIdx];
    
    if (currentPlayer.hand.length === 0) {
      const nextState = {
        ...gameState,
        currentTurnIndex: (gameState.currentTurnIndex + 1) % gameState.players.length
      };
      setGameState(nextState);
      syncStateToDb(nextState);
      return;
    }

    AudioService.playCard();
    HapticService.vibrateCard();

    const newHand = [...currentPlayer.hand];
    const playedCard = newHand.pop()!;

    const updatedPlayers = gameState.players.map((p, idx) => {
      if (idx === playerIdx) {
        return { ...p, hand: newHand, cardsPlayedThisRound: p.cardsPlayedThisRound + 1 };
      }
      return p;
    });

    const nextState: GameState = {
      ...gameState,
      players: updatedPlayers,
      tablePile: [...gameState.tablePile, playedCard],
      currentTurnIndex: (gameState.currentTurnIndex + 1) % gameState.players.length
    };
    
    setGameState(nextState);
    syncStateToDb(nextState);
  }, [gameState, currentUserId]);

  const handleResolveRound = useCallback((loserId: string) => {
    if (!gameState) return;
    AudioService.playSlap();
    HapticService.vibrateLoss();

    const updatedPlayers = gameState.players.map(p => {
      if (p.id === loserId) {
        return { ...p, hand: [...p.hand, ...gameState.tablePile] };
      }
      return p;
    });

    const totalCards = 52;
    const gameLoser = updatedPlayers.find(p => p.hand.length >= totalCards);

    let nextState: GameState;
    if (gameLoser) {
        nextState = {
            ...gameState,
            players: updatedPlayers,
            phase: GamePhase.GAME_OVER,
            tablePile: [],
            lastLoserId: loserId,
            winnerId: gameLoser.id
        };
    } else {
        nextState = {
          ...gameState,
          players: updatedPlayers,
          tablePile: [],
          currentTurnIndex: gameState.players.findIndex(p => p.id === loserId),
          phase: GamePhase.PLAYING
        };
    }
    
    setGameState(nextState);
    syncStateToDb(nextState);
  }, [gameState]);

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
        />
      ) : (
        <GameBoard
          gameState={gameState}
          currentUserId={currentUserId!}
          onPlay={handlePlayCard}
          onResolve={handleResolveRound}
          onQuit={resetSession}
        />
      )}
      
      {/* Indicador de Status de Conexão Realtime */}
      {gameState && (
        <div className={`fixed bottom-2 right-2 text-[8px] font-black uppercase px-2 py-1 rounded-full border shadow-sm z-50 transition-colors ${isConnected ? 'bg-green-100 border-green-200 text-green-600' : 'bg-red-100 border-red-200 text-red-600'}`}>
          {isConnected ? '● Conectado' : '○ Reconectando...'}
        </div>
      )}
    </div>
  );
};

export default App;
