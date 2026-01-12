
import React, { useState, useEffect } from 'react';
import { Player, Reaction, ChatMessage } from '../types';

interface FloatingOverlayProps {
  players: Player[];
  reactions: Reaction[];
  messages: ChatMessage[];
  onSendReaction: (emoji: string) => void;
  onSendMessage: (text: string) => void;
  isCompact?: boolean;
}

const EMOJIS = [
  '😂', '🔥', '❤️', '😡', '😭', '🤔', '🤦', '🎉', 
  '🤫', '😱', '👊', '👎', '🤡', '🌮'
];

const ReactionSystem: React.FC<FloatingOverlayProps> = ({ 
  players, 
  reactions, 
  messages, 
  onSendReaction, 
  onSendMessage, 
  isCompact 
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatInput, setShowChatInput] = useState(false);
  const [inputText, setInputText] = useState('');
  const [visibleItems, setVisibleItems] = useState<{ id: string; playerId: string; content: string; type: 'reaction' | 'chat'; timestamp: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const combined = [
        ...reactions.map(r => ({ id: r.id, playerId: r.playerId, content: r.emoji, type: 'reaction' as const, timestamp: r.timestamp })),
        ...messages.map(m => ({ id: m.id, playerId: m.playerId, content: m.text, type: 'chat' as const, timestamp: m.timestamp }))
      ];
      
      setVisibleItems(combined.filter(item => now - item.timestamp < 4000));
    }, 200);
    return () => clearInterval(interval);
  }, [reactions, messages]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
      setShowChatInput(false);
    }
  };

  return (
    <>
      {/* Camada de Exibição Flutuante */}
      <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
        {visibleItems.map((item) => {
          const player = players.find(p => p.id === item.playerId);
          if (!player) return null;

          const playerIndex = players.indexOf(player);
          const leftPos = (playerIndex + 1) * (100 / (players.length + 1));

          return (
            <div
              key={item.id}
              className="absolute bottom-32 flex justify-center animate-bubble-float"
              style={{
                left: `${leftPos}%`,
                animation: 'bubble-float 4s ease-out forwards',
                zIndex: item.type === 'chat' ? 70 : 60
              }}
            >
              <div className={`
                px-4 py-2 rounded-[1.5rem] shadow-xl border-[3px] flex items-center justify-center max-w-[150px]
                ${item.type === 'reaction' 
                  ? 'bg-white border-[#FF69B4] text-2xl' 
                  : 'bg-[#4CC9F0] border-white text-white text-xs font-black text-center break-words shadow-lg'}
              `}>
                {item.content}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes bubble-float {
          0% { transform: translate(-50%, 0) scale(0.5); opacity: 0; }
          10% { transform: translate(-50%, -20px) scale(1.1); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate(-50%, -180px) scale(1); opacity: 0; }
        }
      `}</style>

      {/* Interface de Botões Coloridos */}
      <div className={`fixed ${isCompact ? 'bottom-20 right-4' : 'bottom-6 right-6'} z-[80] flex flex-col items-end gap-3`}>
        
        {/* Painel de Emoji (Rosa) */}
        {showEmojiPicker && (
          <div className="bg-white p-3 rounded-[2.5rem] shadow-2xl border-[6px] border-[#FF69B4] flex flex-wrap gap-2 justify-center animate-in zoom-in duration-300 w-56 mb-1">
            {EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  onSendReaction(emoji);
                  setShowEmojiPicker(false);
                }}
                className="text-2xl hover:scale-125 transition-transform active:scale-90 p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Painel de Chat (Azul) */}
        {showChatInput && (
          <form 
            onSubmit={handleChatSubmit} 
            className="bg-white p-3 rounded-[2.5rem] shadow-2xl border-[6px] border-[#4CC9F0] flex gap-2 animate-in zoom-in duration-300 w-64 mb-1"
          >
            <input
              autoFocus
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Eai..."
              className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-100 focus:border-[#4CC9F0] outline-none font-black text-[#0D3B66] text-sm"
            />
            <button 
              type="submit"
              className="bg-[#4CC9F0] text-white w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 shadow-md border-b-4 border-[#3BB8DE]"
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </form>
        )}

        <div className="flex gap-4">
          {/* Botão de Chat - Azul Piscina */}
          <button
            onClick={() => {
              setShowChatInput(!showChatInput);
              setShowEmojiPicker(false);
            }}
            className={`w-16 h-16 rounded-full border-[6px] shadow-xl flex items-center justify-center text-2xl transition-all active:scale-90 ${
              showChatInput 
                ? 'bg-[#4CC9F0] text-white border-white scale-110' 
                : 'bg-white text-[#4CC9F0] border-[#4CC9F0]'
            }`}
          >
            <i className={`fa-solid ${showChatInput ? 'fa-xmark' : 'fa-comment-dots'}`}></i>
          </button>

          {/* Botão de Reações - Rosa Chiclete */}
          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowChatInput(false);
            }}
            className={`w-16 h-16 rounded-full border-[6px] shadow-xl flex items-center justify-center text-2xl transition-all active:scale-90 ${
              showEmojiPicker 
                ? 'bg-[#FF69B4] text-white border-white scale-110' 
                : 'bg-white text-[#FF69B4] border-[#FF69B4]'
            }`}
          >
            <i className={`fa-solid ${showEmojiPicker ? 'fa-xmark' : 'fa-face-laugh-squint'}`}></i>
          </button>
        </div>
      </div>
    </>
  );
};

export default ReactionSystem;
