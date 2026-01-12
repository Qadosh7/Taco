
import React, { useState, useEffect } from 'react';
import { GameState, GamePhase } from '../types';
import { COLORS } from '../constants';
import CardUI from './CardUI';
import { HapticService } from '../services/hapticService';
import { AudioService } from '../services/audioService';
import ReactionSystem from './ReactionSystem';
import AvatarCharacter from './AvatarCharacter';

interface GameBoardProps {
  gameState: GameState;
  currentUserId: string;
  onPlay: () => void;
  onSlap: () => void;
  onResolve: (loserId: string) => void;
  onQuit: () => void;
  onSendReaction: (emoji: string) => void;
  onSendMessage: (text: string) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, currentUserId, onPlay, onSlap, onResolve, onQuit, onSendReaction, onSendMessage }) => {
  const [showLoserModal, setShowLoserModal] = useState(false);
  const currentPlayer = gameState.players[gameState.currentTurnIndex];
  const me = gameState.players.find(p => p.id === currentUserId);
  const isMyTurn = currentPlayer?.id === currentUserId;
  const isHost = me?.isHost;
  const hasSlapped = gameState.slapRecords.some(r => r.playerId === currentUserId);

  const currentSequenceIndex = gameState.tablePile.length % 5;

  useEffect(() => {
    if (isMyTurn && !gameState.isSlapActive) {
      HapticService.vibrateTurn();
    }
    if (gameState.isSlapActive && !hasSlapped) {
      HapticService.vibrateAction();
    }
  }, [isMyTurn, gameState.isSlapActive, hasSlapped]);

  if (!me) return <div className="p-8 text-center font-black text-[#0D3B66] animate-pulse">Carregando... 🌮</div>;

  return (
    <div className="h-screen flex flex-col bg-transparent overflow-hidden select-none">
      <style>{`
        @keyframes pulse-slap {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(249, 87, 56, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(249, 87, 56, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(249, 87, 56, 0); }
        }
        .animate-slap-ready {
          animation: pulse-slap 1.5s infinite cubic-bezier(0.66, 0, 0, 1);
        }
        .hand-indicator {
          position: absolute;
          top: -20px;
          font-size: 2rem;
          animation: bounce 0.5s infinite;
        }
        .table-perspective {
          perspective: 1000px;
        }
      `}</style>

      <ReactionSystem 
        players={gameState.players} 
        reactions={gameState.reactions} 
        messages={gameState.chat}
        onSendReaction={onSendReaction}
        onSendMessage={onSendMessage}
      />

      <header className="px-4 py-1.5 flex justify-between items-center z-10 shrink-0">
        <button onClick={onQuit} className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur text-[#0D3B66] flex items-center justify-center shadow-md border border-[#0D3B66]/5 active:scale-90 transition-all">
          <i className="fa-solid fa-house text-xs"></i>
        </button>
        <div className="bg-white/90 backdrop-blur px-4 py-1 rounded-full border border-[#0D3B66]/10 shadow-sm">
             <span className="text-[9px] font-black uppercase text-[#0D3B66] tracking-[0.2em]">#{gameState.roomCode}</span>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#0D3B66] text-white flex items-center justify-center font-black text-xs shadow-xl border-b-2 border-black/20">
          {gameState.tablePile.length}
        </div>
      </header>

      <main className="flex-1 relative flex flex-col items-center justify-center min-h-0 table-perspective">
        {/* Aviso de Tapa Ativo */}
        {gameState.isSlapActive && !hasSlapped && (
          <div className="absolute top-4 z-50 animate-bounce">
             <div className="bg-[#F95738] text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl border-2 border-white">
                BATE NA MESA! 🖐️
             </div>
          </div>
        )}

        {/* Pilha Central interativa para Tapa - Ocupa máximo espaço livre */}
        <div 
          className="relative w-full max-w-[20rem] h-[28rem] flex items-center justify-center cursor-pointer transition-transform active:scale-95"
          onClick={onSlap}
        >
            {gameState.tablePile.length > 0 ? (
                gameState.tablePile.slice(-5).map((card, idx, arr) => {
                    const isTopCard = idx === arr.length - 1;
                    const rotation = ((idx + gameState.tablePile.length) * 15) % 30 - 15;
                    return (
                        <div key={card.id} className={`absolute transition-all duration-500 ease-out ${isTopCard ? 'animate-card-pop' : ''}`} style={{ zIndex: idx, transform: `rotate(${rotation}deg) translate(${isTopCard ? 0 : idx * 1}px, ${isTopCard ? 0 : idx * -2}px)` }}>
                          <CardUI card={card} className={gameState.isSlapActive && isTopCard ? 'animate-slap-ready' : ''} />
                          {/* Mão de quem já bateu */}
                          {isTopCard && gameState.slapRecords.map((record, rIdx) => {
                            const p = gameState.players.find(pl => pl.id === record.playerId);
                            return (
                              <div key={record.playerId} className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 100 + rIdx, transform: `rotate(${rIdx * 45}deg) translateY(-30px)` }}>
                                <span className="text-5xl drop-shadow-2xl">✋</span>
                                <span className="absolute top-12 bg-white px-2 py-0.5 rounded-full text-[8px] font-black border border-gray-200 shadow-sm">{p?.name}</span>
                              </div>
                            );
                          })}
                        </div>
                    );
                })
            ) : (
                <div className="flex flex-col items-center justify-center text-[#0D3B66] opacity-[0.08]">
                    <i className="fa-solid fa-layer-group text-6xl mb-3"></i>
                    <span className="font-black text-[10px] uppercase tracking-[0.3em]">Mesa Vazia</span>
                </div>
            )}
        </div>

        {/* Lista de Jogadores - Altura Reduzida */}
        <div className="w-full absolute bottom-0 flex justify-center gap-4 overflow-x-auto no-scrollbar px-6 pb-2 h-28 items-end">
            {gameState.players.map(p => (
                <div key={p.id} className={`flex flex-col items-center transition-all duration-500 shrink-0 ${p.id === currentPlayer?.id ? 'scale-105 -translate-y-2' : 'opacity-40 scale-90'}`}>
                    <AvatarCharacter avatar={p.avatar} size="sm" isFloating={p.id === currentPlayer?.id} />
                    {p.hand.length > 0 && <div className="absolute -top-1 -right-1.5 bg-[#F95738] text-white text-[9px] w-5 h-5 rounded-lg border-2 border-white flex items-center justify-center font-black z-20 shadow-md">{p.hand.length}</div>}
                    <span className={`text-[7px] font-black uppercase mt-1.5 px-2 py-0.5 rounded-full ${p.id === currentPlayer?.id ? 'bg-[#0D3B66] text-white' : 'text-[#0D3B66]/50'}`}>{p.name.split(' ')[0]}</span>
                </div>
            ))}
        </div>
      </main>

      <footer className={`relative shrink-0 pt-2 pb-6 px-6 flex flex-col items-center z-10 transition-all duration-500 ${isMyTurn && !gameState.isSlapActive ? 'bg-[#F4D35E]/5' : ''}`}>
        <div className="w-full max-w-xs flex flex-col gap-1.5">
          {gameState.isSlapActive ? (
            <button
              onClick={onSlap}
              disabled={hasSlapped}
              className={`w-full py-5 rounded-[2rem] font-black text-xl tracking-tighter flex items-center justify-center gap-4 border-b-8 transition-all shadow-2xl ${
                hasSlapped 
                ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' 
                : 'bg-[#F95738] text-white border-[#A03E2A] animate-slap-ready active:translate-y-2 active:border-b-0'
              }`}
            >
              {hasSlapped ? 'BATI! ✅' : 'BATE NA MESA! ✋'}
            </button>
          ) : isMyTurn ? (
            <div className="animate-in slide-in-from-bottom-5 duration-300 flex flex-col items-center">
               <CardUI faceDown={true} highlightIndex={currentSequenceIndex} onClick={onPlay} className="mb-2 shadow-2xl ring-[8px] ring-white scale-90 origin-bottom" />
               <button onClick={onPlay} className="w-full bg-[#0D3B66] text-white py-4 rounded-[1.8rem] font-black text-lg tracking-widest flex items-center justify-center gap-3 border-b-[5px] border-[#06213D] active:translate-y-1 active:border-b-0 transition-all">
                 JOGAR CARTA <span className="text-yellow-300 text-sm">✨</span>
               </button>
            </div>
          ) : (
            <div className="w-full bg-white/60 py-4 rounded-[1.8rem] text-[#0D3B66]/30 font-black text-center text-[10px] uppercase tracking-[0.3em] border-2 border-dashed border-[#0D3B66]/10">
              Aguardando {currentPlayer?.name}...
            </div>
          )}

          {isHost && gameState.tablePile.length > 0 && (
            <button onClick={() => setShowLoserModal(true)} className="mt-2 text-[#0D3B66]/40 font-black text-[8px] uppercase tracking-[0.2em] hover:text-[#F95738] transition-colors">
              <i className="fa-solid fa-gavel mr-1"></i> Forçar Resolução (Admin)
            </button>
          )}
        </div>
      </footer>

      {showLoserModal && (
        <div className="fixed inset-0 bg-[#0D3B66]/90 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl border-4 border-[#0D3B66] animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-[#0D3B66] text-center mb-6 uppercase italic tracking-tighter">Quem sobrou por último? 🐢</h3>
            <div className="grid grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto no-scrollbar p-1">
              {gameState.players.map(p => (
                <button key={p.id} onClick={() => { onResolve(p.id); setShowLoserModal(false); }} className="p-4 bg-gray-50 border-2 border-gray-100 rounded-[2rem] font-black text-[#0D3B66] flex flex-col items-center gap-3 transition-all hover:bg-[#F4D35E] hover:border-[#0D3B66] active:scale-95 shadow-sm">
                  <AvatarCharacter avatar={p.avatar} size="sm" />
                  <span className="text-[10px] uppercase tracking-tight truncate w-full text-center">{p.name}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowLoserModal(false)} className="mt-6 w-full text-center text-gray-400 font-black text-[9px] uppercase tracking-[0.2em] py-2">Cancelar</button>
          </div>
        </div>
      )}

      {gameState.phase === GamePhase.GAME_OVER && (
          <div className="fixed inset-0 bg-[#F4D35E] z-[110] flex flex-col items-center justify-center p-8 text-center animate-in slide-in-from-top-full duration-1000">
              <div className="text-8xl mb-4 animate-bounce">👑</div>
              <h1 className="text-5xl font-black text-[#0D3B66] mb-2 uppercase italic leading-none tracking-tighter">TEMOS UM<br/>VENCEDOR!</h1>
              <div className="bg-white p-8 rounded-[3rem] border-4 border-[#0D3B66] shadow-2xl mb-10 w-full max-w-sm flex flex-col items-center">
                  <AvatarCharacter avatar={gameState.players.find(p => p.id === gameState.winnerId)!.avatar} size="lg" isFloating={true} className="mb-3" />
                  <p className="text-[#F95738] text-3xl font-black uppercase tracking-tighter">{gameState.players.find(p => p.id === gameState.winnerId)?.name} 🔥</p>
                  <p className="text-[#0D3B66] font-black text-[10px] uppercase mt-2 opacity-40 tracking-widest">Limpou a mão com maestria!</p>
              </div>
              <button onClick={onQuit} className="w-full max-w-xs p-5 bg-[#0D3B66] text-white rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 transition-all border-b-6 border-black/30">VOLTAR AO INÍCIO 🏠</button>
          </div>
      )}
    </div>
  );
};

export default GameBoard;
