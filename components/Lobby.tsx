
import React, { useState } from 'react';
import { GameState } from '../types';
import { COLORS } from '../constants.tsx';

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
      text: `Vem jogar Taco comigo! Código da sala: ${gameState.roomCode}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
        // Fallback if user cancels or share fails
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Não foi possível copiar o link.');
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
          70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(238, 150, 75, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(238, 150, 75, 0); }
        }
        .animate-pulse-custom {
          animation: pulse-orange 2s infinite;
        }
      `}</style>

      <div className="flex justify-between items-center mb-8">
        <button onClick={onQuit} className="text-[#0D3B66] flex items-center gap-1 font-bold active:opacity-60 transition-opacity">
          <i className="fa-solid fa-chevron-left"></i> Sair
        </button>
        <div 
          onClick={handleCopyCode}
          className="relative bg-[#F4D35E] pl-4 pr-10 py-2 rounded-full font-black text-[#0D3B66] border-2 border-[#0D3B66] shadow-sm cursor-pointer active:scale-95 transition-transform"
        >
          #{gameState.roomCode}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-[#0D3B66] rounded-full text-white text-[10px]">
            {codeCopied ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-copy"></i>}
          </div>
          {codeCopied && (
            <span className="absolute -bottom-6 right-0 text-[10px] text-[#0D3B66] font-bold whitespace-nowrap">Código copiado!</span>
          )}
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#0D3B66]">Sala de Espera</h2>
        <p className="text-sm text-[#0D3B66]/70 mt-1">Compartilhe o link para começar</p>
      </div>

      <button
        onClick={handleShare}
        className={`mb-10 w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
          copied ? 'bg-green-500 text-white' : 'bg-[#EE964B] text-white active:scale-95'
        } ${gameState.players.length < 2 && !copied ? 'animate-pulse-custom' : ''}`}
      >
        {copied ? (
          <><i className="fa-solid fa-check-double text-xl"></i> LINK COPIADO!</>
        ) : (
          <><i className="fa-solid fa-share-nodes text-xl"></i> CONVIDAR AMIGOS</>
        )}
      </button>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        <div className="flex items-center justify-between mb-2">
           <p className="text-[10px] font-black uppercase text-[#0D3B66]/40">Jogadores na Sala</p>
           <span className="text-[10px] font-black bg-[#0D3B66]/10 text-[#0D3B66] px-2 py-0.5 rounded-full">{gameState.players.length} / 10</span>
        </div>
        
        {gameState.players.map((player, index) => (
          <div
            key={player.id}
            style={{ animationDelay: `${index * 100}ms` }}
            className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border-l-8 border-[#F95738] animate-in slide-in-from-left duration-300 fill-mode-both"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0D3B66] flex items-center justify-center text-white font-bold shadow-inner">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-[#0D3B66]">{player.name}</span>
                {player.isHost && (
                  <span className="ml-2 text-[9px] bg-[#F4D35E] text-[#0D3B66] px-1.5 py-0.5 rounded-sm uppercase font-black">
                    Dono
                  </span>
                )}
              </div>
            </div>
            {player.id === currentUserId && (
              <span className="text-[9px] bg-[#0D3B66] text-white px-2 py-1 rounded-full font-bold uppercase tracking-wider">Você</span>
            )}
          </div>
        ))}

        {gameState.players.length < 2 && (
            <div className="p-10 border-2 border-dashed border-[#0D3B66]/10 rounded-3xl flex flex-col items-center justify-center text-[#0D3B66]/20 text-center gap-3">
                <div className="relative">
                  <i className="fa-solid fa-user-plus text-4xl"></i>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#F95738] rounded-full animate-ping"></div>
                </div>
                <p className="text-xs font-bold leading-relaxed max-w-[200px]">Mande o link para alguém entrar e começar a diversão!</p>
            </div>
        )}
      </div>

      <div className="mt-8">
        {isHost ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={onStart}
              disabled={gameState.players.length < 2}
              className={`w-full p-5 rounded-2xl font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-3 ${
                gameState.players.length < 2
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-[#F95738] text-white active:scale-95 active:shadow-inner'
              }`}
            >
              {gameState.players.length < 2 ? 'MÍNIMO 2 JOGADORES' : <>JOGAR AGORA <i className="fa-solid fa-play"></i></>}
            </button>
            {gameState.players.length < 2 && (
              <p className="text-[10px] text-center text-[#0D3B66]/50 font-bold uppercase tracking-tighter">O botão será liberado quando entrar mais alguém</p>
            )}
          </div>
        ) : (
          <div className="text-center p-8 bg-white rounded-2xl border-2 border-[#0D3B66]/5 shadow-inner">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-2 h-2 bg-[#F95738] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#F95738] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-[#F95738] rounded-full animate-bounce [animation-delay:-0.5s]"></div>
            </div>
            <p className="text-[#0D3B66] font-black italic uppercase text-xs tracking-widest">Aguardando o Host iniciar...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
