
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
    <div className="min-h-screen flex flex-col bg-transparent overflow-hidden">
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 1.5s infinite ease-in-out;
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-rotate-slow {
          animation: rotate-slow 20s infinite linear;
        }
        .play-mat {
           background: radial-gradient(circle, #ffffff 0%, #FAF0CA 70%);
           border-radius: 50%;
           border: 8px dashed rgba(13, 59, 102, 0.05);
        }
      `}</style>

      {/* Header Lúdico */}
      <header className="p-4 flex justify-between items-center bg-white border-b-4 border-[#0D3B66] z-10">
        <button onClick={onQuit} className="w-10 h-10 rounded-full bg-[#F95738] text-white flex items-center justify-center shadow-[0_4px_0_#A03E2A] active:translate-y-1 active:shadow-none transition-all">
            <i className="fa-solid fa-house"></i>
        </button>
        <div className="flex flex-col items-center">
          <div className="bg-[#F4D35E] px-3 py-1 rounded-full border-2 border-[#0D3B66] shadow-sm transform -rotate-1">
             <span className="text-[10px] font-black uppercase text-[#0D3B66]">SALA: {gameState.roomCode}</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#0D3B66] text-white flex items-center justify-center font-black text-xs shadow-[0_4px_0_#06213D]">
          {gameState.tablePile.length}
        </div>
      </header>

      {/* Arena de Jogo */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-4">
        {/* Play Mat de fundo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
             <div className="w-[80vw] h-[80vw] max-w-[400px] max-h-[400px] play-mat animate-rotate-slow"></div>
        </div>

        {/* Turn Indicator Flutuante */}
        <div className="absolute top-8 left-0 right-0 flex justify-center px-4 z-10">
            <div className={`px-8 py-3 rounded-[2rem] border-4 shadow-2xl transition-all duration-500 transform ${
                isMyTurn 
                ? 'bg-[#F95738] border-[#0D3B66] text-white scale-110 animate-pulse-subtle' 
                : 'bg-white border-[#0D3B66] text-[#0D3B66] scale-100'
            }`}>
                <div className="flex items-center gap-3">
                    <span className="text-xl">{isMyTurn ? '🔥' : '⏰'}</span>
                    <span className="font-black text-sm uppercase tracking-wider">
                        {isMyTurn ? 'SUA VEZ!' : currentPlayer?.name}
                    </span>
                </div>
            </div>
        </div>

        {/* Pilha Central Estilo Brinquedo */}
        <div className="relative w-56 h-72 flex items-center justify-center">
            {gameState.tablePile.length > 0 ? (
                gameState.tablePile.slice(-6).map((card, idx) => (
                    <div 
                      key={card.id} 
                      className="absolute transition-all duration-500"
                      style={{ 
                        zIndex: idx,
                        transform: `rotate(${idx * 12 - 30}deg) translate(${idx * 2}px, ${idx * -4}px)`,
                      }}
                    >
                      <CardUI
                          card={card}
                          className="shadow-2xl border-4 border-white"
                      />
                    </div>
                ))
            ) : (
                <div className="bg-white/30 rounded-[3rem] w-32 h-44 flex flex-col items-center justify-center text-[#0D3B66] opacity-20 border-4 border-dashed border-[#0D3B66] animate-pulse">
                    <i className="fa-solid fa-hand-pointer text-4xl mb-2"></i>
                    <span className="font-black text-[10px] uppercase">Vazio</span>
                </div>
            )}
        </div>

        {/* Players como Avatares Redondos */}
        <div className="w-full absolute bottom-4 overflow-x-auto py-4 flex gap-6 no-scrollbar px-10">
            {gameState.players.map(p => (
                <div key={p.id} className={`flex-shrink-0 flex flex-col items-center transition-all duration-500 ${p.id === currentPlayer?.id ? 'opacity-100 scale-125' : 'opacity-30 scale-90'}`}>
                    <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-black text-2xl shadow-lg relative ${p.id === currentUserId ? 'bg-[#F4D35E] border-[#0D3B66] text-[#0D3B66]' : 'bg-[#0D3B66] border-white text-white'}`}>
                        {p.name.charAt(0)}
                        <div className="absolute -top-1 -right-1 bg-[#F95738] text-white text-[10px] w-6 h-6 rounded-full border-2 border-white flex items-center justify-center font-black">
                            {p.hand.length}
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-[#0D3B66] mt-2 uppercase tracking-tighter bg-white/50 px-2 rounded-full">{p.name}</span>
                </div>
            ))}
        </div>
      </main>

      {/* Controles Estilo Painel de Jogo */}
      <footer className={`p-8 pb-12 rounded-t-[4rem] transition-all duration-500 border-t-8 border-[#0D3B66] ${
        isMyTurn 
        ? 'bg-[#F4D35E] shadow-[0_-20px_50px_rgba(244,211,94,0.3)]' 
        : 'bg-white opacity-90'
      } flex flex-col items-center z-10`}>
        
        <div className={`relative mb-6 transition-all duration-500 ${isMyTurn ? 'scale-110' : 'scale-90 opacity-40'}`}>
            <CardUI
                faceDown={!isMyTurn}
                card={me.hand[me.hand.length - 1]}
                className={`transition-all duration-300 ${isMyTurn ? 'animate-bounce shadow-2xl cursor-pointer ring-8 ring-white' : 'pointer-events-none shadow-sm'}`}
                onClick={handlePlayAction}
            />
            
            {isMyTurn && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0D3B66] text-white text-[12px] px-6 py-2 rounded-full font-black uppercase tracking-widest shadow-xl border-2 border-white">
                JOGAR! ✨
              </div>
            )}
        </div>

        {/* Botão Admin Lúdico */}
        {isHost && gameState.tablePile.length > 0 && (
          <button
            onClick={() => {
                HapticService.vibrateAction();
                setShowLoserModal(true);
            }}
            className="w-full bg-[#0D3B66] text-white py-6 rounded-[2.5rem] font-black text-lg tracking-widest shadow-[0_10px_0_#06213D] active:shadow-none active:translate-y-2 transition-all mt-4 flex items-center justify-center gap-4"
          >
            QUEM PERDEU? ⚖️
          </button>
        )}
      </footer>

      {/* Modal de Perdedor Cartoon */}
      {showLoserModal && (
        <div className="fixed inset-0 bg-[#0D3B66]/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-[#FAF0CA] w-full max-w-sm rounded-[3rem] p-8 shadow-2xl border-8 border-white animate-in zoom-in duration-300">
            <h3 className="text-3xl font-black text-[#0D3B66] text-center mb-6 uppercase italic tracking-tighter">Opa! Quem sobrou? 😅</h3>
            <div className="grid grid-cols-2 gap-4">
              {gameState.players.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleResolveAction(p.id)}
                  className="p-6 bg-white border-4 border-[#0D3B66] rounded-3xl font-black text-[#0D3B66] flex flex-col items-center gap-2 transition-all active:bg-[#F4D35E] active:scale-95 shadow-lg"
                >
                  <div className="w-12 h-12 rounded-full bg-[#0D3B66] text-white flex items-center justify-center text-xl">
                      {p.name.charAt(0)}
                  </div>
                  <span className="text-xs truncate w-full text-center">{p.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLoserModal(false)}
              className="mt-8 w-full text-center text-[#F95738] font-black text-sm uppercase underline"
            >
              Vou cancelar...
            </button>
          </div>
        </div>
      )}

      {/* Game Over Party Mode */}
      {gameState.phase === GamePhase.GAME_OVER && (
          <div className="fixed inset-0 bg-[#F4D35E] z-[60] flex flex-col items-center justify-center p-8 text-center animate-in slide-in-from-top-full duration-700">
              <div className="text-9xl mb-4 animate-bounce">🎈</div>
              <h1 className="text-6xl font-black text-[#0D3B66] mb-4 uppercase italic leading-none drop-shadow-[0_6px_0_#FFF]">FIM DE<br/>JOGO!</h1>
              <div className="bg-white p-10 rounded-[4rem] border-8 border-[#0D3B66] shadow-2xl mb-12 w-full max-w-xs rotate-2">
                  <p className="text-[#F95738] text-4xl font-black uppercase tracking-tighter">
                      {gameState.players.find(p => p.id === gameState.winnerId)?.name} 💥
                  </p>
                  <p className="text-[#0D3B66] font-black text-xs uppercase mt-2 tracking-widest">foi o grande perdedor!</p>
              </div>
              <button
                  onClick={onQuit}
                  className="w-full max-w-xs p-8 bg-[#0D3B66] text-white rounded-[3rem] font-black text-2xl shadow-[0_12px_0_#06213D] active:shadow-none active:translate-y-3 transition-all"
              >
                  VOLTAR AO INÍCIO 🏠
              </button>
          </div>
      )}
    </div>
  );
};

export default GameBoard;
