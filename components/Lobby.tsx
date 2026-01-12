
import React, { useState } from 'react';
import { GameState } from '../types';
import { COLORS } from '../constants';
import RulesModal from './RulesModal';
import ReactionSystem from './ReactionSystem';
import AvatarCharacter from './AvatarCharacter';

interface LobbyProps {
  gameState: GameState;
  currentUserId: string;
  onStart: () => void;
  onQuit: () => void;
  onSendReaction: (emoji: string) => void;
  onSendMessage: (text: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ gameState, currentUserId, onStart, onQuit, onSendReaction, onSendMessage }) => {
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

      {/* Sistema de Interação Flutuante */}
      <ReactionSystem 
        players={gameState.players} 
        reactions={gameState.reactions} 
        messages={gameState.chat}
        onSendReaction={onSendReaction}
        onSendMessage={onSendMessage}
        isCompact={true}
      />

      {/* Header Compacto */}
      <div className="flex justify-between items-center mb-1 shrink-0">
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

      <div className="flex flex-col items-center text-center shrink-0">
        <h2 className="text-xl font-black text-[#0D3B66] mb-1 tracking-tight">Vem jogar! ✨</h2>
        
        {/* QR Code Section */}
        <div className="bg-white w-full max-w-[150px] rounded-2xl p-2 qr-container-shadow border border-gray-100 mb-2 animate-float-card">
          <div className="relative bg-white flex justify-center items-center mb-1.5 overflow-hidden rounded-lg">
            <div className="scan-line"></div>
            <div className="relative w-full aspect-square max-w-[90px] p-1">
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
              className="w-full py-1 bg-gray-50 border border-gray-100 rounded-lg text-gray-600 text-[8px] font-black uppercase tracking-wider hover:bg-white hover:border-[#F4D35E] active:scale-95 transition-all"
              onClick={handleShare}
            >
              {copied ? 'Link Copiado!' : 'Compartilhar'}
            </button>
          </div>
        </div>

        {/* Room Code */}
        <div 
          onClick={handleCopyCode}
          className="group relative bg-white px-4 py-1.5 rounded-xl font-black text-[#0D3B66] border border-[#0D3B66]/10 shadow-sm cursor-pointer active:scale-95 transition-all mb-2 overflow-hidden"
        >
          <span className="text-[14px] tracking-tight font-black">SALA #{gameState.roomCode}</span>
          <div className={`absolute inset-0 bg-[#F4D35E]/10 transition-opacity ${codeCopied ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>
      </div>

      {/* Lista de Jogadores com visual Fall Guys */}
      <div className="flex-1 flex flex-col min-h-0 px-2 mt-1">
        <div className="flex items-center justify-between mb-2 px-1 shrink-0">
           <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
             <h3 className="text-[9px] font-black uppercase tracking-widest text-[#0D3B66]/50">Aguardando Galera</h3>
           </div>
           <span className="text-[9px] font-black text-[#0D3B66]/60">
             {gameState.players.length} online
           </span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pb-4 pr-1">
          {gameState.players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-[2.5rem] border-2 border-white shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300"
            >
              <div className="flex items-center gap-5">
                <AvatarCharacter avatar={player.avatar} size="md" isFloating={player.id === currentUserId} />
                <div>
                  <div className="font-black text-[#0D3B66] text-lg leading-tight truncate max-w-[120px]">{player.name}</div>
                  {player.isHost && (
                    <div className="text-[9px] text-[#EE964B] font-black uppercase tracking-widest mt-1">
                      <i className="fa-solid fa-crown mr-1"></i> Dono da Sala
                    </div>
                  )}
                  {player.id === currentUserId && (
                    <div className="mt-1">
                        <span className="text-[8px] bg-[#0D3B66] text-white px-3 py-1 rounded-full font-black uppercase tracking-tighter">É Você!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-[#0D3B66]/5 shrink-0">
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
                <span className="text-[8px] uppercase tracking-[0.4em] opacity-80 mb-[-2px]">Tudo pronto?</span>
                <span className="tracking-tighter">COMEÇAR! 🚀</span>
              </>
            )}
          </button>
        ) : (
          <div className="text-center p-4 bg-white/30 backdrop-blur rounded-2xl border border-dashed border-[#0D3B66]/20">
            <div className="flex items-center justify-center gap-3 text-[#0D3B66] font-black uppercase text-[9px] tracking-widest opacity-80">
               O dono vai começar...
            </div>
          </div>
        )}
      </div>

      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
};

export default Lobby;
