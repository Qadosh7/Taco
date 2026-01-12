
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

  const currentSequenceIndex = gameState.tablePile.length % 5;

  useEffect(() => {
    if (isMyTurn) {
      HapticService.vibrateTurn();
    }
  }, [isMyTurn]);

  if (!me) return <div className="p-8 text-center font-black text-[#0D3B66] animate-pulse">Carregando... 🌮</div>;

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
    <div className="h-screen flex flex-col bg-transparent overflow-hidden select-none">
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes card-pop {
          0% { transform: scale(0.6) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.1) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite ease-in-out;
        }
        .animate-card-pop {
          animation: card-pop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .play-mat {
           background: radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(250,240,202,0) 75%);
        }
        .btn-play-shadow {
          box-shadow: 0 12px 30px rgba(13, 59, 102, 0.35);
        }
      `}</style>

      {/* Header Compacto - Ocupa menos altura */}
      <header className="px-4 py-2 flex justify-between items-center z-10 shrink-0">
        <button 
          onClick={onQuit} 
          className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur text-[#0D3B66] flex items-center justify-center shadow-md border border-[#0D3B66]/5 active:scale-90 transition-all"
        >
          <i className="fa-solid fa-house text-sm"></i>
        </button>
        
        <div className="flex flex-col items-center">
          <div className="bg-white/90 backdrop-blur px-5 py-1.5 rounded-full border border-[#0D3B66]/10 shadow-sm">
             <span className="text-[10px] font-black uppercase text-[#0D3B66] tracking-[0.2em]">#{gameState.roomCode}</span>
          </div>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-[#0D3B66] text-white flex items-center justify-center font-black text-sm shadow-xl border-b-2 border-black/20">
          {gameState.tablePile.length}
        </div>
      </header>

      {/* Arena de Jogo - Flex-1 expande para ocupar o máximo de espaço */}
      <main className="flex-1 relative flex flex-col items-center justify-center min-h-0">
        {/* Play Mat */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-[85vw] h-[85vw] max-w-[450px] max-h-[450px] play-mat opacity-50 rounded-full"></div>
        </div>

        {/* Turn Indicator Slimmer */}
        <div className="absolute top-2 flex justify-center w-full z-10">
            <div className={`px-5 py-2 rounded-full border-2 transition-all duration-500 transform ${
                isMyTurn 
                ? 'bg-[#F95738] border-white text-white scale-105 shadow-xl animate-pulse-subtle' 
                : 'bg-white/90 backdrop-blur border-transparent text-[#0D3B66] shadow-md'
            }`}>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest">
                        {isMyTurn ? '🔥 SUA VEZ' : `👤 ${currentPlayer?.name.toUpperCase()}`}
                    </span>
                </div>
            </div>
        </div>

        {/* Pilha Central com Cartas Maiores */}
        <div className="relative w-72 h-80 flex items-center justify-center scale-100 sm:scale-110">
            {gameState.tablePile.length > 0 ? (
                gameState.tablePile.slice(-5).map((card, idx, arr) => {
                    const isTopCard = idx === arr.length - 1;
                    const rotation = ((idx + gameState.tablePile.length) * 17) % 36 - 18;
                    return (
                        <div 
                          key={card.id} 
                          className={`absolute transition-all duration-500 ease-out ${isTopCard ? 'animate-card-pop' : ''}`}
                          style={{ 
                            zIndex: idx,
                            transform: `rotate(${rotation}deg) translate(${isTopCard ? 0 : idx * 2}px, ${isTopCard ? 0 : idx * -3}px)`,
                          }}
                        >
                          <CardUI card={card} />
                        </div>
                    );
                })
            ) : (
                <div className="flex flex-col items-center justify-center text-[#0D3B66] opacity-[0.08]">
                    <i className="fa-solid fa-layer-group text-7xl mb-4"></i>
                    <span className="font-black text-xs uppercase tracking-[0.3em]">Mesa Vazia</span>
                </div>
            )}
        </div>

        {/* Avatares Laterais/Inferiores Compactos */}
        <div className="w-full absolute bottom-2 flex justify-center gap-3 no-scrollbar px-4 pb-2">
            {gameState.players.map(p => (
                <div key={p.id} className={`flex flex-col items-center transition-all duration-500 ${p.id === currentPlayer?.id ? 'scale-110' : 'opacity-40 scale-90'}`}>
                    <div className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center font-black text-lg shadow-lg relative ${p.id === currentUserId ? 'bg-[#F4D35E] border-[#0D3B66] text-[#0D3B66]' : 'bg-white border-gray-200 text-[#0D3B66]'}`}>
                        {p.name.charAt(0).toUpperCase()}
                        {p.hand.length > 0 && (
                          <div className="absolute -top-1.5 -right-1.5 bg-[#F95738] text-white text-[9px] w-5 h-5 rounded-lg border-2 border-white flex items-center justify-center font-black">
                              {p.hand.length}
                          </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </main>

      {/* Footer Fixo Otimizado */}
      <footer className={`relative shrink-0 pt-4 pb-8 px-6 flex flex-col items-center z-10 transition-all duration-500 ${isMyTurn ? 'bg-[#F4D35E]/10' : ''}`}>
        
        {/* Card do Jogador - Reduzido na base para não empurrar a tela */}
        <div className={`relative mb-4 transition-all duration-500 ${isMyTurn ? 'scale-100 -translate-y-4' : 'scale-75 opacity-20 translate-y-6 grayscale'}`}>
            <CardUI
                faceDown={true}
                highlightIndex={currentSequenceIndex}
                className={`transition-all duration-300 ${isMyTurn ? 'shadow-3xl ring-[12px] ring-white' : 'pointer-events-none'}`}
                onClick={handlePlayAction}
            />
        </div>

        {/* Botão de Jogo */}
        <div className="w-full max-w-xs flex flex-col gap-2">
          {isMyTurn ? (
            <button
              onClick={handlePlayAction}
              className="w-full bg-[#0D3B66] text-white py-4.5 rounded-[2rem] font-black text-xl tracking-widest flex items-center justify-center gap-3 border-b-[6px] border-[#06213D] active:translate-y-1 active:border-b-0 transition-all btn-play-shadow"
            >
              JOGAR! <span className="text-yellow-300 drop-shadow-sm">✨</span>
            </button>
          ) : (
            <div className="w-full bg-white/60 py-4.5 rounded-[2rem] text-[#0D3B66]/30 font-black text-center text-xs uppercase tracking-[0.4em] border-2 border-dashed border-[#0D3B66]/10">
              Aguarde...
            </div>
          )}

          {isHost && gameState.tablePile.length > 0 && (
            <button
              onClick={() => {
                  HapticService.vibrateAction();
                  setShowLoserModal(true);
              }}
              className="mt-2 text-[#0D3B66]/50 font-black text-[10px] uppercase tracking-[0.2em] hover:text-[#F95738] transition-colors"
            >
              <i className="fa-solid fa-gavel mr-1"></i> Resolver Rodada
            </button>
          )}
        </div>
      </footer>

      {/* Modal de Perdedor (Simples) */}
      {showLoserModal && (
        <div className="fixed inset-0 bg-[#0D3B66]/90 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl border-4 border-[#0D3B66] animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-[#0D3B66] text-center mb-8 uppercase italic tracking-tighter">Quem sobrou por último? 🐢</h3>
            <div className="grid grid-cols-2 gap-4">
              {gameState.players.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleResolveAction(p.id)}
                  className="p-5 bg-gray-50 border-2 border-gray-100 rounded-3xl font-black text-[#0D3B66] flex flex-col items-center gap-3 transition-all hover:bg-[#F4D35E] hover:border-[#0D3B66] active:scale-95 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#0D3B66] text-white flex items-center justify-center text-xl">
                      {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs uppercase tracking-tight truncate w-full text-center">{p.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLoserModal(false)}
              className="mt-8 w-full text-center text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] py-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState.phase === GamePhase.GAME_OVER && (
          <div className="fixed inset-0 bg-[#F4D35E] z-[110] flex flex-col items-center justify-center p-8 text-center animate-in slide-in-from-top-full duration-1000">
              <div className="text-9xl mb-6 animate-bounce">👑</div>
              <h1 className="text-6xl font-black text-[#0D3B66] mb-2 uppercase italic leading-none tracking-tighter">TEMOS UM<br/>VENCEDOR!</h1>
              <div className="bg-white p-10 rounded-[3.5rem] border-4 border-[#0D3B66] shadow-2xl mb-12 w-full max-w-sm">
                  <p className="text-[#F95738] text-4xl font-black uppercase tracking-tighter">
                      {gameState.players.find(p => p.id === gameState.winnerId)?.name} 🔥
                  </p>
                  <p className="text-[#0D3B66] font-black text-[11px] uppercase mt-3 opacity-40 tracking-widest">Limpou a mão com maestria!</p>
              </div>
              <button
                  onClick={onQuit}
                  className="w-full max-w-xs p-6 bg-[#0D3B66] text-white rounded-[2.5rem] font-black text-2xl shadow-2xl active:scale-95 transition-all border-b-8 border-black/30"
              >
                  VOLTAR AO INÍCIO 🏠
              </button>
          </div>
      )}
    </div>
  );
};

export default GameBoard;
