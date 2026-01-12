
import React, { useState } from 'react';
import { GameState } from '../types';
import { COLORS } from '../constants';

interface LobbyProps {
  gameState: GameState;
  currentUserId: string;
  onStart: () => void;
  onQuit: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ gameState, currentUserId, onStart, onQuit }) => {
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const isHost = gameState.players.find(p => p.id === currentUserId)?.isHost;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${gameState.roomCode}`;
    const shareData = {
      title: 'Taco Online',
      text: `Jogue Taco comigo! Sala: ${gameState.roomCode}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        throw new Error('Share not supported');
      }
    } catch (err) {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(gameState.roomCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code');
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-[#FAF0CA]">
      <style>{`
        @keyframes pulse-orange {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(238, 150, 75, 0.7); }
          70% { transform: scale(1.03); box-shadow: 0 0 0 12px rgba(238, 150, 75, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(238, 150, 75, 0); }
        }
        .animate-pulse-custom {
          animation: pulse-orange 2.5s infinite;
        }
      `}</style>

      <div className="flex justify-between items-center mb-10">
        <button 
          onClick={onQuit} 
          className="text-[#0D3B66] flex items-center gap-2 font-bold active:opacity-60 transition-opacity p-2 -ml-2"
        >
          <i className="fa-solid fa-arrow-left"></i> Sair
        </button>
        
        <div 
          onClick={handleCopyCode}
          className="relative group bg-white px-4 py-2 rounded-2xl font-black text-[#0D3B66] border-2 border-[#0D3B66] shadow-sm cursor-pointer active:scale-95 transition-all"
        >
          <span className="text-xs opacity-50 block text-[8px] uppercase tracking-tighter mb-[-4px]">Código</span>
          <span className="text-lg">#{gameState.roomCode}</span>
          <div className="absolute -right-2 -top-2 w-6 h-6 flex items-center justify-center bg-[#F4D35E] border-2 border-[#0D3B66] rounded-full text-[#0D3B66] text-[10px]">
            {codeCopied ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-copy"></i>}
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-[#0D3B66] leading-tight">Sua sala está<br/>pronta!</h2>
        <p className="text-sm text-[#1A1A1A] opacity-70 mt-2 font-medium">Convide a galera para bater Taco</p>
      </div>

      {/* Alerta de Sincronização Local */}
      <div className="bg-[#0D3B66]/5 border border-[#0D3B66]/10 p-4 rounded-2xl mb-8 text-center">
        <p className="text-[10px] font-bold text-[#0D3B66]/60 uppercase tracking-widest">
          <i className="fa-solid fa-circle-info mr-1"></i> Modo de Demonstração
        </p>
        <p className="text-[9px] text-[#0D3B66]/40 leading-tight mt-1">
          Atualmente, a sincronização funciona entre abas do mesmo navegador. Para jogar em celulares diferentes, integre com um banco de dados real.
        </p>
      </div>

      <div className="relative mb-12">
        <button
          onClick={handleShare}
          className={`w-full py-6 rounded-[2rem] font-black text-xl flex flex-col items-center justify-center gap-1 transition-all shadow-2xl ${
            copied ? 'bg-green-600 text-white' : 'bg-[#EE964B] text-white active:scale-95'
          } ${gameState.players.length < 2 && !copied ? 'animate-pulse-custom' : ''}`}
        >
          <div className="flex items-center gap-3">
            <i className={`fa-solid ${copied ? 'fa-check-circle' : 'fa-share-nodes'} text-2xl`}></i>
            <span>{copied ? 'LINK NA MÃO!' : 'CONVIDAR GALERA'}</span>
          </div>
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-1">
        <div className="flex items-center justify-between mb-2">
           <h3 className="text-xs font-black uppercase tracking-widest text-[#0D3B66]/60">Participantes</h3>
           <span className="text-[10px] font-black bg-[#0D3B66] text-white px-2.5 py-1 rounded-full">{gameState.players.length} online</span>
        </div>
        
        <div className="space-y-3">
          {gameState.players.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-5 bg-white rounded-3xl shadow-sm border-2 border-transparent transition-all animate-in slide-in-from-bottom-2 fade-in"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F4D35E] border-2 border-[#0D3B66] flex items-center justify-center text-[#0D3B66] font-black text-xl shadow-sm">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-black text-[#0D3B66] text-lg">{player.name}</div>
                  {player.isHost && (
                    <div className="flex items-center gap-1 text-[9px] text-[#EE964B] font-black uppercase tracking-tighter">
                      <i className="fa-solid fa-crown"></i> Administrador
                    </div>
                  )}
                </div>
              </div>
              {player.id === currentUserId && (
                <span className="text-[10px] bg-[#0D3B66]/5 text-[#0D3B66] px-3 py-1.5 rounded-xl font-black border border-[#0D3B66]/10">VOCÊ</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-[#0D3B66]/5">
        {isHost ? (
          <button
            onClick={onStart}
            disabled={gameState.players.length < 2}
            className={`w-full p-6 rounded-[2rem] font-black text-2xl shadow-2xl transition-all flex items-center justify-center gap-4 border-b-8 ${
              gameState.players.length < 2
                ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed shadow-none'
                : 'bg-[#F95738] text-white border-black/20 active:translate-y-1 active:border-b-4'
            }`}
          >
            {gameState.players.length < 2 ? (
              <span className="text-lg">AGUARDANDO PLAYERS...</span>
            ) : (
              <>COMEÇAR JOGO <i className="fa-solid fa-bolt"></i></>
            )}
          </button>
        ) : (
          <div className="text-center p-8 bg-white/50 rounded-[2rem] border-2 border-dashed border-[#0D3B66]/10">
            <p className="text-[#0D3B66] font-black uppercase text-xs tracking-[0.2em] opacity-60 italic">Esperando o Admin começar...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
