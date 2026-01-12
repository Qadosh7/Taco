
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
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shareUrl)}&bgcolor=FFFFFF&color=000000&margin=1`;

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
    <div className="h-screen flex flex-col p-4 bg-transparent relative overflow-hidden select-none">
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          50% { top: 100%; opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .scan-line {
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #F95738, transparent);
          box-shadow: 0 0 8px #F95738;
          animation: scan 3s infinite linear;
          z-index: 10;
        }
        .qr-container-shadow {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
        }
        @keyframes float-card {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .animate-float-card {
          animation: float-card 4s infinite ease-in-out;
        }
      `}</style>

      {/* Header Compacto */}
      <div className="flex justify-between items-center mb-1">
        <button 
          onClick={onQuit} 
          className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-xl text-[#0D3B66] font-black text-[10px] uppercase shadow-sm border border-[#0D3B66]/10 active:scale-90 transition-all"
        >
          <i className="fa-solid fa-chevron-left mr-1"></i> Sair
        </button>
        
        <button 
          onClick={() => setShowRules(true)}
          className="bg-[#F4D35E] px-3 py-1.5 rounded-xl text-[#0D3B66] font-black text-[10px] uppercase shadow-sm border border-[#0D3B66]/20 active:scale-90 transition-all"
        >
          <i className="fa-solid fa-book mr-1 text-[8px]"></i> REGRAS
        </button>
      </div>

      <div className="flex flex-col items-center text-center">
        <h2 className="text-xl font-black text-[#0D3B66] mb-2 tracking-tight">Vem jogar! ✨</h2>
        
        {/* QR Code Section: Estilo Premium/Referência */}
        <div className="bg-white w-full max-w-[170px] rounded-2xl p-3 qr-container-shadow border border-gray-100 mb-3 animate-float-card">
          <div className="flex justify-between items-center mb-2 px-0.5">
            <span className="text-[10px] font-bold text-gray-800 tracking-tight">Digitalizar código QR</span>
            <i className="fa-solid fa-circle-info text-gray-300 text-[10px] hover:text-[#0D3B66] transition-colors cursor-pointer"></i>
          </div>

          <div className="relative bg-white flex justify-center items-center mb-2 overflow-hidden rounded-lg">
            {/* Linha de Scanner Animada */}
            <div className="scan-line"></div>
            
            <div className="relative w-full aspect-square max-w-[110px] p-1">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-full h-full object-contain mix-blend-multiply"
                onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                style={{ opacity: 0, transition: 'opacity 0.5s ease-out' }}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              className="w-full py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-600 text-[9px] font-black uppercase tracking-wider hover:bg-white hover:border-[#F4D35E] active:scale-95 transition-all"
              onClick={handleShare}
            >
              {copied ? 'Link Copiado!' : 'Compartilhar'}
            </button>
          </div>
        </div>

        {/* Room Code Minimalista */}
        <div 
          onClick={handleCopyCode}
          className="group relative bg-white px-5 py-2 rounded-xl font-black text-[#0D3B66] border border-[#0D3B66]/10 shadow-sm cursor-pointer active:scale-95 transition-all mb-3 overflow-hidden"
        >
          <span className="text-[8px] opacity-40 block uppercase tracking-widest mb-[-2px]">CÓDIGO DA SALA</span>
          <span className="text-xl tracking-tight font-black">#{gameState.roomCode}</span>
          
          {/* Efeito de hover/click */}
          <div className={`absolute inset-0 bg-[#F4D35E]/10 transition-opacity ${codeCopied ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className="absolute top-1 right-2 text-[8px] text-[#EE964B]">
             {codeCopied ? <i className="fa-solid fa-check scale-125 transition-transform"></i> : <i className="fa-solid fa-copy opacity-20 group-hover:opacity-100 transition-opacity"></i>}
          </div>
        </div>
      </div>

      {/* Lista de Jogadores - Flexível para ocupar o resto da tela */}
      <div className="flex-1 flex flex-col min-h-0 px-2 mt-1">
        <div className="flex items-center justify-between mb-2 px-1">
           <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
             <h3 className="text-[9px] font-black uppercase tracking-widest text-[#0D3B66]/50">Na sala agora</h3>
           </div>
           <span className="text-[9px] font-black text-[#0D3B66]/60">
             {gameState.players.length} online
           </span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pb-2">
          {gameState.players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-2.5 bg-white/40 backdrop-blur-sm rounded-2xl border border-white shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F4D35E] border-2 border-[#0D3B66] flex items-center justify-center text-[#0D3B66] font-black text-sm shadow-sm">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-black text-[#0D3B66] text-xs leading-none">{player.name}</div>
                  {player.isHost && (
                    <div className="text-[7px] text-[#EE964B] font-black uppercase tracking-tighter mt-0.5">
                      <i className="fa-solid fa-crown mr-1"></i> Dono
                    </div>
                  )}
                </div>
              </div>
              {player.id === currentUserId && (
                <span className="text-[7px] bg-[#0D3B66] text-white px-2 py-1 rounded-lg font-black uppercase">Você</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Fixo e Compacto */}
      <div className="mt-2 pt-2 border-t border-[#0D3B66]/5">
        {isHost ? (
          <button
            onClick={onStart}
            disabled={gameState.players.length < 2}
            className={`w-full p-4 rounded-2xl font-black text-xl shadow-lg transition-all flex flex-col items-center justify-center border-b-4 ${
              gameState.players.length < 2
                ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed grayscale'
                : 'bg-[#F95738] text-white border-[#A03E2A] active:translate-y-1 active:border-b-0 hover:brightness-110'
            }`}
          >
            {gameState.players.length < 2 ? (
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Chamando reforços... 🕒</span>
            ) : (
              <>
                <span className="text-[8px] uppercase tracking-[0.4em] opacity-80 mb-[-2px]">Bora lá!</span>
                <span className="tracking-tighter">COMEÇAR JOGO! 🚀</span>
              </>
            )}
          </button>
        ) : (
          <div className="text-center p-4 bg-white/30 backdrop-blur rounded-2xl border border-dashed border-[#0D3B66]/20">
            <div className="flex items-center justify-center gap-3 text-[#0D3B66] font-black uppercase text-[9px] tracking-widest opacity-80">
               <span className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-[#F95738] rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-[#F4D35E] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                 <div className="w-1.5 h-1.5 bg-[#EE964B] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
               </span>
               Aguardando início...
            </div>
          </div>
        )}
      </div>

      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
};

export default Lobby;
