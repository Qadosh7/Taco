
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

  // Índice da palavra atual na sequência Taco, Gato, Cabra, Queijo, Pizza
  const currentSequenceIndex = gameState.tablePile.length % 5;

  useEffect(() => {
    if (isMyTurn) {
      HapticService.vibrateTurn();
    }
  }, [isMyTurn]);

  if (!me) return <div className="p-8 text-center font-black text-[#0D3B66] animate-pulse">Peraí... 🔄</div>;

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
          50% { transform: scale(1.05); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite ease-in-out;
        }
        .play-mat {
           background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(250,240,202,0) 70%);
           border-radius: 50%;
        }
        .btn-play-shadow {
          box-shadow: 0 8px 25px rgba(13, 59, 102, 0.3);
        }
      `}</style>

      {/* Header Minimalista */}
      <header className="p-3 flex justify-between items-center z-10">
        <button 
          onClick={onQuit} 
          className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur text-[#0D3B66] flex items-center justify-center shadow-sm border border-[#0D3B66]/5 active:scale-90 transition-all"
        >
          <i className="fa-solid fa-house text-sm"></i>
        </button>
        
        <div className="flex flex-col items-center">
          <div className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full border border-[#0D3B66]/10 shadow-sm">
             <span className="text-[9px] font-black uppercase text-[#0D3B66] tracking-widest">SALA #{gameState.roomCode}</span>
          </div>
        </div>

        <div className="w-9 h-9 rounded-xl bg-[#0D3B66] text-white flex items-center justify-center font-black text-xs shadow-lg">
          {gameState.tablePile.length}
        </div>
      </header>

      {/* Arena de Jogo */}
      <main className="flex-1 relative flex flex-col items-center justify-center">
        {/* Play Mat sutil */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-[90vw] h-[90vw] max-w-[400px] max-h-[400px] play-mat opacity-40"></div>
        </div>

        {/* Turn Indicator Slim */}
        <div className="absolute top-4 flex justify-center w-full z-10 px-6">
            <div className={`px-6 py-2 rounded-full border-2 transition-all duration-500 transform ${
                isMyTurn 
                ? 'bg-[#F95738] border-white text-white scale-105 shadow-xl animate-pulse-subtle' 
                : 'bg-white/80 backdrop-blur border-transparent text-[#0D3B66] scale-100 shadow-sm'
            }`}>
                <div className="flex items-center gap-2">
                    <span className="text-sm">{isMyTurn ? '✨' : '👤'}</span>
                    <span className="font-black text-[10px] uppercase tracking-widest">
                        {isMyTurn ? 'SUA VEZ DE JOGAR!' : `VEZ DE: ${currentPlayer?.name}`}
                    </span>
                </div>
            </div>
        </div>

        {/* Pilha Central com Efeito de Empilhamento */}
        <div className="relative w-64 h-64 flex items-center justify-center">
            {gameState.tablePile.length > 0 ? (
                gameState.tablePile.slice(-5).map((card, idx) => (
                    <div 
                      key={card.id} 
                      className="absolute transition-all duration-500 ease-out"
                      style={{ 
                        zIndex: idx,
                        transform: `rotate(${idx * 8 - 15}deg) translate(${idx * 1.5}px, ${idx * -2}px)`,
                      }}
                    >
                      <CardUI
                          card={card}
                          className="scale-90"
                      />
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center text-[#0D3B66] opacity-10">
                    <i className="fa-solid fa-inbox text-5xl mb-2"></i>
                    <span className="font-black text-[10px] uppercase tracking-widest">Mesa Limpa</span>
                </div>
            )}
        </div>

        {/* Avatares dos Jogadores na parte inferior da arena */}
        <div className="w-full absolute bottom-4 overflow-x-auto py-2 flex gap-4 no-scrollbar px-10">
            {gameState.players.map(p => (
                <div key={p.id} className={`flex-shrink-0 flex flex-col items-center transition-all duration-500 ${p.id === currentPlayer?.id ? 'scale-110' : 'opacity-40 scale-90'}`}>
                    <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-black text-lg shadow-md relative ${p.id === currentUserId ? 'bg-[#F4D35E] border-[#0D3B66] text-[#0D3B66]' : 'bg-white border-gray-200 text-[#0D3B66]'}`}>
                        {p.name.charAt(0)}
                        {p.hand.length > 0 && (
                          <div className="absolute -top-1 -right-1 bg-[#F95738] text-white text-[8px] w-5 h-5 rounded-lg border-2 border-white flex items-center justify-center font-black">
                              {p.hand.length}
                          </div>
                        )}
                    </div>
                    <span className="text-[8px] font-black text-[#0D3B66]/60 mt-1 uppercase truncate w-16 text-center">{p.name}</span>
                </div>
            ))}
        </div>
      </main>

      {/* Controles Estilo App Nativo (Referência Imagem) */}
      <footer className={`relative p-6 pb-10 flex flex-col items-center z-10 transition-colors duration-500 ${isMyTurn ? 'bg-[#F4D35E]/10' : ''}`}>
        
        {/* Carta do Jogador (Virada) */}
        <div className={`relative mb-6 transition-all duration-500 ${isMyTurn ? 'scale-100 -translate-y-2' : 'scale-90 opacity-40 translate-y-2'}`}>
            <CardUI
                faceDown={true}
                highlightIndex={currentSequenceIndex}
                className={`transition-all duration-300 ${isMyTurn ? 'shadow-2xl ring-8 ring-white' : 'pointer-events-none'}`}
                onClick={handlePlayAction}
            />
        </div>

        {/* Botão de Ação Estilo Referência */}
        <div className="w-full max-w-xs flex flex-col gap-3">
          {isMyTurn ? (
            <button
              onClick={handlePlayAction}
              className="w-full bg-[#0D3B66] text-white py-4 rounded-full font-black text-lg tracking-wider flex items-center justify-center gap-2 border-b-4 border-[#06213D] active:translate-y-1 active:border-b-0 transition-all btn-play-shadow"
            >
              JOGAR! <span className="text-yellow-300">✨</span>
            </button>
          ) : (
            <div className="w-full bg-white/50 py-4 rounded-full text-[#0D3B66]/40 font-black text-center text-sm uppercase tracking-widest border border-dashed border-[#0D3B66]/10">
              Esperando...
            </div>
          )}

          {/* Botão Admin Discreto */}
          {isHost && gameState.tablePile.length > 0 && (
            <button
              onClick={() => {
                  HapticService.vibrateAction();
                  setShowLoserModal(true);
              }}
              className="w-full bg-white/80 backdrop-blur py-3 rounded-2xl text-[#0D3B66] font-black text-xs uppercase tracking-widest border border-[#0D3B66]/10 shadow-sm active:scale-95 transition-all"
            >
              <i className="fa-solid fa-gavel mr-2"></i> Resolver Rodada
            </button>
          )}
        </div>
      </footer>

      {/* Modais existentes (Loser e Game Over) mantidos para funcionalidade */}
      {showLoserModal && (
        <div className="fixed inset-0 bg-[#0D3B66]/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-6 shadow-2xl border-4 border-[#0D3B66] animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-[#0D3B66] text-center mb-6 uppercase tracking-tight">Quem foi o último? 🐢</h3>
            <div className="grid grid-cols-2 gap-3">
              {gameState.players.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleResolveAction(p.id)}
                  className="p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-[#0D3B66] flex flex-col items-center gap-2 transition-all active:bg-[#F4D35E] active:border-[#0D3B66] shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0D3B66] text-white flex items-center justify-center">
                      {p.name.charAt(0)}
                  </div>
                  <span className="text-[10px] truncate w-full text-center uppercase">{p.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLoserModal(false)}
              className="mt-6 w-full text-center text-gray-400 font-black text-[10px] uppercase tracking-widest"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {gameState.phase === GamePhase.GAME_OVER && (
          <div className="fixed inset-0 bg-[#F4D35E] z-[60] flex flex-col items-center justify-center p-8 text-center animate-in slide-in-from-top-full duration-700">
              <div className="text-8xl mb-4 animate-bounce">🏆</div>
              <h1 className="text-5xl font-black text-[#0D3B66] mb-4 uppercase italic leading-none">FIM DA<br/>PARTIDA!</h1>
              <div className="bg-white p-8 rounded-[3rem] border-4 border-[#0D3B66] shadow-xl mb-10 w-full max-w-xs">
                  <p className="text-[#F95738] text-3xl font-black uppercase tracking-tighter">
                      {gameState.players.find(p => p.id === gameState.winnerId)?.name} 💨
                  </p>
                  <p className="text-[#0D3B66] font-black text-[10px] uppercase mt-2 opacity-50">Limpou o baralho!</p>
              </div>
              <button
                  onClick={onQuit}
                  className="w-full max-w-xs p-5 bg-[#0D3B66] text-white rounded-[2rem] font-black text-xl shadow-lg active:scale-95 transition-all"
              >
                  NOVO JOGO 🏠
              </button>
          </div>
      )}
    </div>
  );
};

export default GameBoard;
