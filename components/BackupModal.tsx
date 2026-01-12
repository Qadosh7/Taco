
import React from 'react';
import { getProjectSource, downloadBackup } from '../services/backupService';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const projectInfo = getProjectSource();

  return (
    <div className="fixed inset-0 bg-[#0D3B66]/95 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl border-4 border-white overflow-hidden relative">
        {/* Padrão de Grid de Engenharia */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ 
          backgroundImage: 'linear-gradient(#0D3B66 1px, transparent 1px), linear-gradient(90deg, #0D3B66 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>

        <div className="relative p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-black text-[#0D3B66] leading-none mb-2">BACKUP DO PROJETO</h2>
              <p className="text-[10px] font-black text-[#F95738] uppercase tracking-[0.3em]">Cópia de Restauração de Segurança</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 text-[#0D3B66] flex items-center justify-center active:scale-90 transition-transform">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="bg-gray-50 rounded-3xl p-6 border-2 border-dashed border-gray-200 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#0D3B66] rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">
                <i className="fa-solid fa-file-export"></i>
              </div>
              <div>
                <h3 className="font-black text-[#0D3B66] uppercase text-sm">Snapshot Completo</h3>
                <p className="text-[10px] text-gray-500 font-medium">Contém a estrutura de todos os arquivos (.tsx, .ts, .html, .json)</p>
              </div>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 no-scrollbar">
              {projectInfo.files.map((file, idx) => (
                <div key={idx} className="flex justify-between items-center text-[10px] py-1 border-b border-gray-100 last:border-0">
                  <span className="font-black text-gray-400">{file.path}</span>
                  <span className="text-gray-300 italic">{file.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => downloadBackup(projectInfo)}
              className="w-full py-5 bg-[#0D3B66] text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_6px_0_#06213D] active:shadow-none active:translate-y-1 transition-all"
            >
              <i className="fa-solid fa-cloud-arrow-down"></i> BAIXAR BACKUP .JSON
            </button>
            
            <p className="text-[9px] text-center text-gray-400 font-medium px-4 mt-2">
              Este arquivo contém a arquitetura completa. Para restaurar, basta fornecer o conteúdo deste arquivo para o assistente em uma nova sessão.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupModal;
