
import React, { useState } from 'react';
import { GameState, GamePhase } from '../types';
import { COLORS } from '../constants.tsx';
import CardUI from './CardUI';

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
  const me = gameState.players.find(p => p.id === currentUserId)!;
  const isMyTurn = currentPlayer?.id === currentUserId;
  const isHost = me.isHost;

  const topCard = gameState.tablePile.length > 0 ? gameState.tablePile[gameState.tablePile.length - 1] : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF0CA] overflow-hidden">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-[#0D3B66] text-white shadow-md">
        <button onClick={onQuit} className="text-white/70 text-sm font-bold">SAIR</button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Em Jogo</span>
          <span className="font-bold">Sala: {gameState.roomCode}</span>
        </div>
        <div className="text-xs font-black text-[#F4D35E]">
          Pilha: {gameState.tablePile.length}
        </div>
      </header>

      {/* Main Table Area */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-4">
        {/* Turn Indicator */}
        <div className="absolute top-4 left-0 right-0 flex justify-center px-4">
            <div className={`px-6 py-2 rounded-full border-2 shadow-sm transition-colors ${isMyTurn ? 'bg-[#F95738] border-white text-white' : 'bg-white border-[#0D3B66] text-[#0D3B66]'}`}>
                <span className="font-black text-sm uppercase">
                    {isMyTurn ? 'Sua Vez!' : `Vez de: ${currentPlayer?.name}`}
                </span>
            </div>
        </div>

        {/* Center Pile */}
        <div className="relative w-48 h-64 flex items-center justify-center">
            {/* Table background decoration */}
            <div className="absolute w-64 h-64 rounded-full border-4 border-[#0D3B66]/5 bg-[#0D3B66]/2"></div>

            {gameState.tablePile.length > 0 ? (
                gameState.tablePile.slice(-3).map((card, idx) => (
                    <CardUI
                        key={card.id}
                        card={card}
                        className="absolute shadow-2xl"
                        style={{
                            transform: `rotate(${idx * 5 - 5}deg) translate(${idx * 2}px, ${idx * 2}px)`,
                            zIndex: idx
                        } as any}
                    />
                ))
            ) : (
                <div className="border-2 border-dashed border-[#0D3B66]/20 rounded-xl w-24 h-36 flex items-center justify-center text-[#0D3B66]/10 italic text-xs">
                    Pilha Vazia
                </div>
            )}
        </div>

        {/* Players Summary List */}
        <div className="w-full mt-8 overflow-x-auto py-2 flex gap-4 no-scrollbar">
            {gameState.players.map(p => (
                <div key={p.id} className={`flex-shrink-0 flex flex-col items-center ${p.id === currentPlayer.id ? 'opacity-100 scale-110' : 'opacity-40'} transition-all`}>
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold mb-1 ${p.id === currentUserId ? 'bg-[#F4D35E] border-[#0D3B66] text-[#0D3B66]' : 'bg-[#0D3B66] border-white text-white'}`}>
                        {p.name.charAt(0)}
                    </div>
                    <span className="text-[10px] font-bold text-[#0D3B66] truncate w-16 text-center">{p.name}</span>
                    <span className="text-[10px] text-[#EE964B] font-black">{p.hand.length} 🎴</span>
                </div>
            ))}
        </div>
      </main>

      {/* Footer / Player Controls */}
      <footer className="p-8 bg-white/50 backdrop-blur-md rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)] border-t border-white flex flex-col items-center">
        <div className="relative mb-6">
            <CardUI
                faceDown={!isMyTurn}
                card={me.hand[me.hand.length - 1]}
                className={`${!isMyTurn ? 'opacity-50 grayscale' : 'animate-bounce shadow-xl'}`}
                onClick={() => isMyTurn && onPlay()}
            />
            <div className="absolute -top-3 -right-3 bg-[#F95738] text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2 border-white shadow-lg">
                {me.hand.length}
            </div>
        </div>

        <p className="text-center text-[#0D3B66] font-semibold text-sm mb-4">
            {isMyTurn ? "Toque na carta para jogar!" : "Aguarde sua vez..."}
        </p>

        {/* Admin Controls */}
        {isHost && gameState.tablePile.length > 0 && (
          <button
            onClick={() => setShowLoserModal(true)}
            className="w-full bg-[#0D3B66] text-white py-4 rounded-2xl font-black tracking-widest shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            QUEM PERDEU? <i className="fa-solid fa-gavel"></i>
          </button>
        )}
      </footer>

      {/* Loser Selection Modal */}
      {showLoserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#FAF0CA] w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-black text-[#0D3B66] text-center mb-6 uppercase tracking-wider">Mão de Alguém!</h3>
            <p className="text-center text-[#0D3B66]/70 mb-8 text-sm italic font-medium">Selecione quem não bateu ou errou a rodada:</p>
            <div className="space-y-3">
              {gameState.players.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    onResolve(p.id);
                    setShowLoserModal(false);
                  }}
                  className="w-full p-4 bg-white border-2 border-[#0D3B66] rounded-2xl font-bold text-[#0D3B66] flex justify-between items-center transition-all active:bg-[#F4D35E]"
                >
                  {p.name}
                  <span className="text-xs opacity-50 font-normal">({p.hand.length} cartas)</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLoserModal(false)}
              className="mt-6 w-full text-center text-[#F95738] font-black text-xs uppercase"
            >
              Cancelar Decisão
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState.phase === GamePhase.GAME_OVER && (
          <div className="fixed inset-0 bg-[#0D3B66] z-[60] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
              <div className="text-8xl mb-6">💩</div>
              <h1 className="text-4xl font-black text-[#F4D35E] mb-2 uppercase italic">PERDEDOR FINAL!</h1>
              <p className="text-white text-xl font-bold mb-12">
                  {gameState.players.find(p => p.id === gameState.winnerId)?.name} ficou com o baralho inteiro!
              </p>

              <button
                  onClick={onQuit}
                  className="w-full max-w-xs p-5 bg-[#F95738] text-white rounded-2xl font-black text-xl shadow-2xl active:scale-95 transition-all"
              >
                  NOVA PARTIDA
              </button>
          </div>
      )}
    </div>
  );
};

export default GameBoard;
