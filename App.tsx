
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GamePhase, Player, Card } from './types';
import { createDeck, distributeCards, generateRoomCode } from './services/gameLogic';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import JoinScreen from './components/JoinScreen';
import { AudioService } from './services/audioService';
import { HapticService } from './services/hapticService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [urlRoomCode, setUrlRoomCode] = useState<string>('');
  
  // Sincronização em tempo real simulada (Funciona entre abas/janelas)
  const syncChannel = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    syncChannel.current = new BroadcastChannel('taco_game_sync');
    
    syncChannel.current.onmessage = (event) => {
      const { type, payload } = event.data;
      
      if (type === 'SYNC_STATE') {
        setGameState(payload);
      } else if (type === 'PLAYER_JOINED') {
        // Se eu sou o host, eu recebo o novo player e atualizo todo mundo
        setGameState(prev => {
          if (!prev || !prev.players.find(p => p.id === currentUserId)?.isHost) return prev;
          const newState = { ...prev, players: [...prev.players, payload] };
          broadcastState(newState);
          return newState;
        });
      }
    };

    return () => syncChannel.current?.close();
  }, [currentUserId]);

  const broadcastState = (state: GameState) => {
    syncChannel.current?.postMessage({ type: 'SYNC_STATE', payload: state });
  };

  // Check URL for room code on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) {
      setUrlRoomCode(room.toUpperCase());
    }
  }, []);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('taco_session');
    if (saved) {
      const { state, userId } = JSON.parse(saved);
      setGameState(state);
      setCurrentUserId(userId);
    }
  }, []);

  useEffect(() => {
    if (gameState && currentUserId) {
      localStorage.setItem('taco_session', JSON.stringify({ state: gameState, userId: currentUserId }));
    }
  }, [gameState, currentUserId]);

  const handleCreateRoom = useCallback((adminName: string) => {
    const adminId = Math.random().toString(36).substr(2, 9);
    const newAdmin: Player = {
      id: adminId,
      name: adminName,
      hand: [],
      isHost: true,
      cardsPlayedThisRound: 0
    };

    const newState: GameState = {
      roomCode: generateRoomCode(),
      phase: GamePhase.LOBBY,
      players: [newAdmin],
      currentTurnIndex: 0,
      tablePile: [],
      lastLoserId: null,
      winnerId: null
    };

    setGameState(newState);
    setCurrentUserId(adminId);
    HapticService.vibrateJoin();
    AudioService.playSuccess();
    broadcastState(newState);
  }, []);

  const handleJoinRoom = useCallback((code: string, playerName: string) => {
    const playerId = Math.random().toString(36).substr(2, 9);
    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      hand: [],
      isHost: false,
      cardsPlayedThisRound: 0
    };

    setCurrentUserId(playerId);
    HapticService.vibrateJoin();
    AudioService.playSuccess();

    // Envia sinal de entrada para quem estiver na sala
    syncChannel.current?.postMessage({ type: 'PLAYER_JOINED', payload: newPlayer });
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
    broadcastState(newState);
  }, [gameState]);

  const handlePlayCard = useCallback(() => {
    if (!gameState || !currentUserId) return;
    const player = gameState.players[gameState.currentTurnIndex];
    if (player.id !== currentUserId) return;

    AudioService.playCard();
    HapticService.vibrateCard();

    if (player.hand.length === 0) {
        const nextState = {
          ...gameState,
          currentTurnIndex: (gameState.currentTurnIndex + 1) % gameState.players.length
        };
        setGameState(nextState);
        broadcastState(nextState);
        return;
    }

    const newHand = [...player.hand];
    const playedCard = newHand.pop()!;

    setGameState(prev => {
      if (!prev) return null;
      const updatedPlayers = prev.players.map((p, idx) => {
        if (idx === prev.currentTurnIndex) {
          return { ...p, hand: newHand, cardsPlayedThisRound: p.cardsPlayedThisRound + 1 };
        }
        return p;
      });

      const nextState = {
        ...prev,
        players: updatedPlayers,
        tablePile: [...prev.tablePile, playedCard],
        currentTurnIndex: (prev.currentTurnIndex + 1) % prev.players.length
      };
      
      broadcastState(nextState);
      return nextState;
    });
  }, [gameState, currentUserId]);

  const handleResolveRound = useCallback((loserId: string) => {
    AudioService.playSlap();
    HapticService.vibrateLoss();

    setGameState(prev => {
      if (!prev) return null;
      const updatedPlayers = prev.players.map(p => {
        if (p.id === loserId) {
          return { ...p, hand: [...p.hand, ...prev.tablePile] };
        }
        return p;
      });

      const totalCards = 52;
      const gameLoser = updatedPlayers.find(p => p.hand.length === totalCards);

      let nextState;
      if (gameLoser) {
          nextState = {
              ...prev,
              players: updatedPlayers,
              phase: GamePhase.GAME_OVER,
              tablePile: [],
              lastLoserId: loserId,
              winnerId: gameLoser.id
          };
      } else {
          nextState = {
            ...prev,
            players: updatedPlayers,
            tablePile: [],
            currentTurnIndex: prev.players.findIndex(p => p.id === loserId),
            phase: GamePhase.PLAYING
          };
      }
      
      broadcastState(nextState);
      return nextState;
    });
  }, []);

  const resetSession = () => {
      localStorage.removeItem('taco_session');
      setGameState(null);
      setCurrentUserId(null);
      window.history.replaceState({}, document.title, window.location.pathname);
  };

  if (!gameState) {
    return <JoinScreen initialCode={urlRoomCode} onCreate={handleCreateRoom} onJoin={handleJoinRoom} />;
  }

  if (gameState.phase === GamePhase.LOBBY) {
    return (
      <Lobby
        gameState={gameState}
        currentUserId={currentUserId!}
        onStart={handleStartGame}
        onQuit={resetSession}
      />
    );
  }

  return (
    <GameBoard
      gameState={gameState}
      currentUserId={currentUserId!}
      onPlay={handlePlayCard}
      onResolve={handleResolveRound}
      onQuit={resetSession}
    />
  );
};

export default App;
