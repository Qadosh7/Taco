
import React, { useState } from 'react';
import { GameState } from '../types';
import { COLORS } from '../constants';
import RulesModal from './RulesModal';

interface LobbyProps {
  gameState: GameState;
  currentUserId: string;
  onStart: () => void;
  onQuit: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ gameState, currentUserId, onStart, onQuit }) => {
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const isHost = gameState.players.find(p => p.id === currentUserId)?.isHost;

  const shareUrl = `${window.location.origin}${window.location.pathname}?room=${gameState.roomCode}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}&bgcolor=FFFFFF&color=000000&margin=1`;

  const handleShare = async () => {
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
    <div className="h-screen flex flex-col p-4 bg-transparent relative overflow-hidden">
      <style>{`
        @keyframes pulse-orange {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(238, 150, 75, 0.4); }
          70% { transform: scale(1.02); box-shadow: 0 0 0 8px rgba(238, 150, 75, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(238, 150, 75, 0); }
        }
        .animate-pulse-custom {
          animation: pulse-orange 2.5s infinite;
        }
        .qr-card-shadow {
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
      `}</style>

      {/* Header Compacto */}
      <div className="flex justify-between items-center mb-2">
        <button 
          onClick={onQuit} 
          className="bg-white px-3 py-1.5 rounded-xl text-[#0D3B66] font-black text-[10px] uppercase shadow-sm border-2 border-[#0D3B66]/10 active:scale-90 transition-all"
        >
          <i className="fa-solid fa-arrow-left mr-1"></i> Sair
        </button>
        
        <button 
          onClick={() => setShowRules(true)}
          className="bg-[#F4D35E] px-3 py-1.5 rounded-xl text-[#0D3B66] font-black text-[10px] uppercase shadow-sm border-2 border-[#0D3B66] active:scale-90 transition-all"
        >
          <i className="fa-solid fa-circle-question mr-1"></i> REGRAS
        </button>
      </div>

      <div className="flex flex-col items-center text-center">
        <h2 className="text-xl font-black text-[#0D3B66] mb-2 italic">Convide Amigos! ✨</h2>
        
        {/* QR Code Section Compacta */}
        <div className="bg-white w-full max-w-[180px] rounded-xl p-3 qr-card-shadow border border-gray-100 mb-3">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[10px] font-medium text-gray-800">Escaneie o QR</span>
            <i className="fa-solid fa-circle-info text-gray-300 text-xs"></i>
          </div>

          <div className="bg-white flex justify-center items-center mb-2">
            <div className="relative w-full aspect-square max-w-[120px]">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-full h-full object-contain"
                onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                style={{ opacity: 0, transition: 'opacity 0.3s' }}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              className="w-full py-1 border border-gray-100 rounded-md text-gray-600 text-[10px] font-bold hover:bg-gray-50 active:bg-gray-100 transition-colors"
              onClick={handleShare}
            >
              Compartilhar
            </button>
          </div>
        </div>

        {/* Room Code Compacto */}
        <div 
          onClick={handleCopyCode}
          className="relative bg-white px-5 py-2 rounded-xl font-black text-[#0D3B66] border-2 border-[#0D3B66] shadow-[0_4px_0_#0D3B66] cursor-pointer active:shadow-none active:translate-y-1 transition-all mb-4"
        >
          <span className="text-[8px] opacity-40 block uppercase tracking-widest mb-[-2px]">CÓDIGO</span>
          <span className="text-xl tracking-tight">#{gameState.roomCode}</span>
          <div className="absolute -right-2 -top-2 w-6 h-6 flex items-center justify-center bg-[#F4D35E] border-2 border-[#0D3B66] rounded-full text-[#0D3B66]">
            {codeCopied ? <i className="fa-solid fa-check text-[10px]"></i> : <i className="fa-solid fa-copy text-[8px]"></i>}
          </div>
        </div>
      </div>

      {/* Lista de Jogadores Otimizada */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2 px-1">
           <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-[#0D3B66]/40 italic">Amigos na Sala</h3>
           <span className="text-[8px] font-black bg-[#0D3B66] text-white px-2 py-1 rounded-full">
             {gameState.players.length} JOGADORES
           </span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pb-2">
          {gameState.players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-2.5 bg-white/60 backdrop-blur-md rounded-2xl border-2 border-transparent hover:border-[#F4D35E] transition-all animate-in slide-in-from-bottom-1 fade-in shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#F4D35E] border-2 border-[#0D3B66] flex items-center justify-center text-[#0D3B66] font-black text-sm shadow-[0_2px_0_#0D3B66]">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-black text-[#0D3B66] text-xs leading-none">{player.name}</div>
                  {player.isHost && (
                    <div className="text-[7px] text-[#EE964B] font-black uppercase tracking-tighter mt-0.5">
                      <i className="fa-solid fa-crown mr-1"></i> Admin
                    </div>
                  )}
                </div>
              </div>
              {player.id === currentUserId && (
                <span className="text-[7px] bg-[#0D3B66] text-white px-2 py-1 rounded-lg font-black uppercase border border-white/20">Você</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Compacto */}
      <div className="mt-2 pt-2 border-t-2 border-dashed border-[#0D3B66]/5">
        {isHost ? (
          <button
            onClick={onStart}
            disabled={gameState.players.length < 2}
            className={`w-full p-4 rounded-2xl font-black text-xl shadow-lg transition-all flex flex-col items-center justify-center border-b-4 ${
              gameState.players.length < 2
                ? 'bg-gray-100 text-gray-300 border-gray-200'
                : 'bg-[#F95738] text-white border-[#A03E2A] active:translate-y-1 active:border-b-0'
            }`}
          >
            {gameState.players.length < 2 ? (
              <span className="text-[10px] font-bold opacity-60">ESPERANDO GALERA... 🕒</span>
            ) : (
              <>
                <span className="text-[8px] uppercase tracking-[0.3em] opacity-80 mb-[-2px]">Tudo Pronto!</span>
                <span>COMEÇAR! 🚀</span>
              </>
            )}
          </button>
        ) : (
          <div className="text-center p-4 bg-white/30 backdrop-blur-sm rounded-2xl border-2 border-dashed border-[#0D3B66]/10">
            <div className="flex items-center justify-center gap-2 text-[#0D3B66] font-black uppercase text-[9px] tracking-widest">
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-[#F95738] rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-[#F4D35E] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
               </div>
               O Admin vai começar...
            </div>
          </div>
        )}
      </div>

      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
};

export default Lobby;
