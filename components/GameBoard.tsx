
import React, { useState, useEffect } from 'react';
import { GameState, GamePhase } from '../types';
import { COLORS } from '../constants';
import CardUI from './CardUI';
import { HapticService } from '../services/hapticService';
import { AudioService } from '../services/audioService';

interface GameBoardProps {
  gameState: GameState;
  currentUserId: string;
  onPlay: () => void;
  onResolve: (loserId: string) => void;
  onQuit: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, currentUserId, onPlay, onResolve, onQuit }) => {
  const [showLoserModal, setShowLoserModal] = useState(false);
  const currentPlayer = gameState.players[gameState.currentTurnIndex];
  const me = gameState.players.find(p => p.id === currentUserId);
  const isMyTurn = currentPlayer?.id === currentUserId;
  const isHost = me?.isHost;

  useEffect(() => {
    if (isMyTurn) {
      HapticService.vibrateTurn();
    }
  }, [isMyTurn]);

  if (!me) return <div className="p-8 text-center font-bold">Reconectando...</div>;

  const handlePlayAction = () => {
    if (isMyTurn) {
      onPlay();
    }
  };

  const handleResolveAction = (loserId: string) => {
    onResolve(loserId);
    setShowLoserModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF0CA] overflow-hidden">
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite ease-in-out;
        }
        @keyframes border-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(249, 87, 56, 0.4); }
          50% { box-shadow: 0 0 20px rgba(249, 87, 56, 0.8); }
        }
        .animate-glow {
          animation: border-glow 2s infinite ease-in-out;
        }
        @keyframes float-card {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: float-card 3s infinite ease-in-out;
        }
      `}</style>

      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-[#0D3B66] text-white shadow-md z-10">
        <button onClick={onQuit} className="text-white/70 text-sm font-bold active:opacity-50">SAIR</button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
             <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
             <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Sincronizado</span>
          </div>
          <span className="font-bold text-xs">Sala: {gameState.roomCode}</span>
        </div>
        <div className="text-xs font-black text-[#F4D35E] bg-white/10 px-3 py-1 rounded-full">
          Mesa: {gameState.tablePile.length}
        </div>
      </header>

      {/* Main Table Area */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-4">
        {/* Turn Indicator */}
        <div className="absolute top-4 left-0 right-0 flex justify-center px-4 z-10">
            <div className={`px-6 py-2 rounded-full border-2 shadow-lg transition-all duration-500 transform ${
                isMyTurn 
                ? 'bg-[#F95738] border-white text-white scale-110 animate-pulse-subtle' 
                : 'bg-white border-[#0D3B66] text-[#0D3B66] scale-100'
            }`}>
                <div className="flex items-center gap-2">
                    {isMyTurn && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                    )}
                    <span className="font-black text-sm uppercase tracking-tight">
                        {isMyTurn ? 'Sua Vez de Jogar!' : `Vez de: ${currentPlayer?.name}`}
                    </span>
                </div>
            </div>
        </div>

        {/* Center Pile */}
        <div className="relative w-48 h-64 flex items-center justify-center">
            <div className={`absolute w-72 h-72 rounded-full border-4 border-[#0D3B66]/5 bg-[#0D3B66]/2 transition-all duration-700 ${isMyTurn ? 'scale-110 opacity-20' : 'scale-100 opacity-10'}`}></div>

            {gameState.tablePile.length > 0 ? (
                gameState.tablePile.slice(-5).map((card, idx) => (
                    <div 
                      key={card.id} 
                      className="absolute animate-float"
                      style={{ 
                        animationDelay: `${idx * 0.4}s`,
                        zIndex: idx 
                      }}
                    >
                      <CardUI
                          card={card}
                          className="shadow-2xl transition-all duration-300"
                          style={{
                              transform: `rotate(${idx * 8 - 15}deg) translate(${idx * 3}px, ${idx * 2}px)`,
                          }}
                      />
                    </div>
                ))
            ) : (
                <div className="border-4 border-dashed border-[#0D3B66]/10 rounded-3xl w-28 h-40 flex flex-col items-center justify-center text-[#0D3B66]/20 italic text-[10px] gap-2">
                    <i className="fa-solid fa-layer-group text-2xl"></i>
                    Pilha Vazia
                </div>
            )}
        </div>

        {/* Players Summary List */}
        <div className="w-full mt-12 overflow-x-auto py-2 flex gap-4 no-scrollbar px-4">
            {gameState.players.map(p => (
                <div key={p.id} className={`flex-shrink-0 flex flex-col items-center transition-all duration-500 ${p.id === currentPlayer?.id ? 'opacity-100 scale-110' : 'opacity-40 scale-90 grayscale-[0.5]'}`}>
                    <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-black text-xl mb-1 shadow-sm ${p.id === currentUserId ? 'bg-[#F4D35E] border-[#0D3B66] text-[#0D3B66]' : 'bg-[#0D3B66] border-white text-white'}`}>
                        {p.name.charAt(0)}
                    </div>
                    <span className="text-[10px] font-black text-[#0D3B66] truncate w-16 text-center uppercase tracking-tighter">{p.name}</span>
                    <div className="bg-[#EE964B] text-white text-[9px] px-2 rounded-full font-black mt-1">
                        {p.hand.length}
                    </div>
                </div>
            ))}
        </div>
      </main>

      {/* Footer / Player Controls */}
      <footer className={`p-8 rounded-t-[3rem] transition-all duration-500 border-t ${
        isMyTurn 
        ? 'bg-white shadow-[0_-15px_40px_rgba(249,87,56,0.15)] border-white/50' 
        : 'bg-gray-100/80 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] border-transparent'
      } flex flex-col items-center z-10`}>
        <div className={`relative mb-6 transform transition-all duration-500 ${isMyTurn ? 'scale-105' : 'scale-90 opacity-60 grayscale-[0.3]'} ${isMyTurn ? 'animate-float' : ''}`}>
            <CardUI
                faceDown={!isMyTurn}
                card={me.hand[me.hand.length - 1]}
                className={`transition-all duration-500 ${
                  isMyTurn 
                  ? 'animate-bounce shadow-2xl ring-4 ring-[#F4D35E] animate-glow' 
                  : 'shadow-md pointer-events-none'
                }`}
                onClick={handlePlayAction}
            />
            <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-4 border-white shadow-xl transition-colors duration-500 ${
              isMyTurn ? 'bg-[#F95738] text-white' : 'bg-gray-400 text-white'
            }`}>
                {me.hand.length}
            </div>
            {isMyTurn && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0D3B66] text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest animate-pulse">
                Sua Vez!
              </div>
            )}
        </div>

        {/* Admin Controls */}
        {isHost && gameState.tablePile.length > 0 && (
          <button
            onClick={() => {
                HapticService.vibrateAction();
                setShowLoserModal(true);
            }}
            className="w-full bg-[#0D3B66] text-white py-5 rounded-2xl font-black tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all mt-4 hover:bg-[#154c7d]"
          >
            QUEM PERDEU? <i className="fa-solid fa-gavel text-xl text-[#F4D35E]"></i>
          </button>
        )}
      </footer>

      {/* Loser Selection Modal */}
      {showLoserModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#FAF0CA] w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border-4 border-[#0D3B66]">
            <h3 className="text-2xl font-black text-[#0D3B66] text-center mb-2 uppercase italic">DEFINIR PERDEDOR</h3>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
              {gameState.players.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleResolveAction(p.id)}
                  className="w-full p-5 bg-white border-2 border-[#0D3B66]/10 rounded-2xl font-black text-[#0D3B66] flex justify-between items-center transition-all active:bg-[#F4D35E] active:border-[#0D3B66] group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0D3B66] text-white flex items-center justify-center text-xs">
                        {p.name.charAt(0)}
                    </div>
                    <span>{p.name}</span>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLoserModal(false)}
              className="mt-8 w-full text-center text-[#F95738] font-black text-xs uppercase tracking-[0.3em]"
            >
              [ Cancelar ]
            </button>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState.phase === GamePhase.GAME_OVER && (
          <div className="fixed inset-0 bg-[#0D3B66] z-[60] flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
              <h1 className="text-5xl font-black text-[#F4D35E] mb-4 uppercase italic leading-none">TACO<br/>LEVEL MAX!</h1>
              <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm border border-white/20 mb-12 w-full max-w-xs">
                  <p className="text-white text-3xl font-black uppercase tracking-tighter">
                      {gameState.players.find(p => p.id === gameState.winnerId)?.name} Perdeu!
                  </p>
              </div>
              <button
                  onClick={onQuit}
                  className="w-full max-w-xs p-6 bg-[#F95738] text-white rounded-[2rem] font-black text-xl shadow-2xl transition-all"
              >
                  NOVA PARTIDA
              </button>
          </div>
      )}
    </div>
  );
};

export default GameBoard;
