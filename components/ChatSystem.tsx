
import React, { useState, useEffect, useRef } from 'react';
import { Player, ChatMessage } from '../types';

interface ChatSystemProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (text: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ChatSystem: React.FC<ChatSystemProps> = ({ messages, currentUserId, onSendMessage, isOpen, onClose }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Overlay de fundo para fechar */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white w-full max-w-md h-[70vh] rounded-[2.5rem] border-4 border-[#0D3B66] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
        {/* Header */}
        <div className="p-5 border-b-2 border-[#0D3B66]/10 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0D3B66] rounded-xl flex items-center justify-center text-white">
              <i className="fa-solid fa-comments"></i>
            </div>
            <h3 className="font-black text-[#0D3B66] uppercase italic tracking-tight text-lg">Chat da Sala</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 text-[#0D3B66] flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-90"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Lista de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-[#0D3B66] text-center p-10">
              <i className="fa-solid fa-ghost text-5xl mb-4"></i>
              <p className="font-black uppercase text-xs tracking-widest leading-relaxed">Silêncio total...<br/>Seja o primeiro a falar!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.playerId === currentUserId;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <span className="text-[9px] font-black uppercase text-[#0D3B66]/40 mb-1 ml-3 tracking-widest">
                      {msg.playerName}
                    </span>
                  )}
                  <div 
                    className={`max-w-[80%] p-4 rounded-3xl text-sm font-semibold shadow-sm border-2 ${
                      isMe 
                        ? 'bg-[#0D3B66] text-white border-[#0D3B66] rounded-tr-none' 
                        : 'bg-white text-[#0D3B66] border-gray-100 rounded-tl-none'
                    }`}
                    style={!isMe ? { borderColor: `${msg.color}40` } : {}}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t-2 border-[#0D3B66]/10 bg-gray-50/50 flex gap-2">
          <input
            autoFocus
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Diga algo..."
            className="flex-1 p-4 rounded-2xl border-2 border-gray-200 focus:border-[#0D3B66] outline-none font-bold text-[#0D3B66] transition-colors"
          />
          <button 
            type="submit"
            className="w-14 h-14 bg-[#F95738] text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-transform border-b-4 border-[#A03E2A]"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatSystem;
