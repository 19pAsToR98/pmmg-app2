import React from 'react';
import { Screen, UserRank } from '../types';
import BottomNav from '../components/BottomNav';

interface AIToolsProps {
  navigateTo: (screen: Screen) => void;
  userRank: UserRank;
}

const AITools: React.FC<AIToolsProps> = ({ navigateTo, userRank }) => {
  const rankLabel = userRank === 'Subtenente' ? 'Subtenente' : 
                   userRank.includes('Sargento') ? 'Sargento' : 
                   userRank;

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center p-1 border-2 border-pmmg-red">
            <span className="material-symbols-outlined text-pmmg-navy text-2xl">shield</span>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none text-white uppercase tracking-tight">Central de Inteligência</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">PMMG Tactical AI Tools</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-pmmg-yellow animate-pulse">psychology</span>
          <span className="text-[10px] font-bold text-white uppercase">IA Ativa</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        <div className="flex flex-col items-center pt-8 px-6">
          <div className="relative w-48 h-48 mb-6">
            <div className="w-full h-full rounded-full bg-pmmg-navy/10 flex items-center justify-center border-4 border-pmmg-navy shadow-2xl relative">
               <img 
                alt="AI Mascot" 
                className="w-full h-full object-cover rounded-full" 
                src="avatar/ai_mascot.gif" 
              />
              <div className="absolute inset-0 bg-pmmg-navy/20 rounded-full"></div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-pmmg-khaki"></div>
          </div>
          <div className="relative bg-white rounded-[1.5rem] p-4 px-6 shadow-lg mb-8 text-center border-2 border-pmmg-navy/5 after:content-[''] after:absolute after:top-0 after:left-1/2 after:w-0 after:h-0 after:border-[20px] after:border-transparent after:border-b-white after:mt-[-20px] after:ml-[-20px] after:border-t-0">
            <p className="text-pmmg-navy font-semibold text-sm">
              Como posso apoiar sua guarnição hoje, <span className="font-bold text-pmmg-red">{rankLabel}?</span>
            </p>
          </div>
        </div>

        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Analisar Comportamento', icon: 'visibility' },
              { label: 'Previsão de Crime', icon: 'query_stats' },
              { label: 'Leitura de Placa IA', icon: 'photo_camera' },
              { label: 'Relatório por Voz', icon: 'mic' },
            ].map((tool) => (
              <button 
                key={tool.label}
                className="relative overflow-hidden bg-pmmg-navy text-white p-4 rounded-xl flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform border-b-4 border-black/30 shadow-lg"
              >
                <div className="bg-white/10 p-3 rounded-lg mb-1">
                  <span className="material-symbols-outlined text-pmmg-yellow text-3xl">{tool.icon}</span>
                </div>
                <span className="text-[11px] font-black uppercase text-center leading-tight tracking-wide">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mx-6 mt-4 pmg-card bg-pmmg-navy/5 border border-pmmg-navy/20 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-pmmg-navy fill-icon">memory</span>
            <div>
              <div className="text-[10px] font-bold text-pmmg-navy uppercase">Rede Neural Operacional</div>
              <div className="text-[9px] text-pmmg-navy/60">Sessão Segura: {rankLabel} Rodrigo</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded">ESTÁVEL</span>
        </div>
      </main>

      <BottomNav activeScreen="profileSettings" navigateTo={navigateTo} />
    </div>
  );
};

export default AITools;