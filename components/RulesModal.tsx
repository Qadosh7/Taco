
import React from 'react';
import { COLORS } from '../constants';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF0CA] w-full max-w-md max-h-[90vh] rounded-[2.5rem] flex flex-col shadow-2xl border-4 border-[#0D3B66] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b-2 border-[#0D3B66]/10 flex justify-between items-center bg-white/50">
          <h2 className="text-2xl font-black text-[#0D3B66] italic uppercase">Como Jogar? 🌮</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#0D3B66] text-white flex items-center justify-center active:scale-90 transition-transform">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-12">
          <section>
            <h3 className="text-lg font-black text-[#F95738] uppercase mb-2">1. O Fluxo do Jogo</h3>
            <p className="text-[#0D3B66] font-medium leading-relaxed">
              Os jogadores devem dizer as palavras na ordem: <br/>
              <span className="font-bold text-[#EE964B]">TACO</span> → 
              <span className="font-bold text-[#EE964B]"> GATO</span> → 
              <span className="font-bold text-[#EE964B]"> CABRA</span> → 
              <span className="font-bold text-[#EE964B]"> QUEIJO</span> → 
              <span className="font-bold text-[#EE964B]"> PIZZA</span>.
            </p>
            <p className="mt-2 text-[#0D3B66]/80 text-sm">
              Cada jogador joga uma carta enquanto fala a próxima palavra da sequência.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-black text-[#F95738] uppercase mb-2">2. O Tapa (Slap!)</h3>
            <p className="text-[#0D3B66] font-medium leading-relaxed">
              Quando a carta jogada for a mesma que a palavra dita, todos devem bater na mesa rapidamente!
            </p>
            <div className="mt-3 bg-white/50 p-4 rounded-2xl border-2 border-dashed border-[#0D3B66]/10">
              <p className="text-xs italic text-[#0D3B66]/60">Nesta versão digital, o Administrador (Host) decide quem foi o último a bater através do botão "Quem Perdeu?".</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-black text-[#F95738] uppercase mb-4">3. Cartas Especiais</h3>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="text-4xl">🦍</div>
                <div>
                  <h4 className="font-black text-[#0D3B66] uppercase text-sm">Gorila</h4>
                  <p className="text-xs text-[#0D3B66]/70">Bata no peito antes de bater na mesa.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="text-4xl">🐳</div>
                <div>
                  <h4 className="font-black text-[#0D3B66] uppercase text-sm">Narval</h4>
                  <p className="text-xs text-[#0D3B66]/70">Bata palmas acima da cabeça antes de bater na mesa.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="text-4xl">🐹</div>
                <div>
                  <h4 className="font-black text-[#0D3B66] uppercase text-sm">Marmota</h4>
                  <p className="text-xs text-[#0D3B66]/70">Bata com os nós dos dedos na mesa antes de bater com a palma.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-black text-[#F95738] uppercase mb-2">4. Penalidades</h3>
            <p className="text-[#0D3B66] text-sm leading-relaxed">
              Se você bater errado, se confundir com as palavras ou for o último a bater em uma combinação correta, você leva todas as cartas da mesa para sua mão.
            </p>
          </section>

          <section className="bg-[#0D3B66] p-6 rounded-3xl text-white text-center">
            <h3 className="font-black uppercase mb-1">Vencer</h3>
            <p className="text-xs opacity-80">
              Fique sem cartas na mão e seja o primeiro a bater corretamente no próximo tapa!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
