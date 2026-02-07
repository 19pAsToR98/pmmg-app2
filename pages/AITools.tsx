import React from 'react';
import { Screen, UserRank, UserAvatar } from '../types';
import BottomNav from '../components/BottomNav';

interface AIToolsProps {
  navigateTo: (screen: Screen) => void;
  userRank: UserRank;
  aiAvatar: UserAvatar; // NOVO: Avatar do Assistente de IA
}

const AITools: React.FC<AIToolsProps> = ({ navigateTo, userRank, aiAvatar }) => {
  const rankLabel = userRank === 'Subtenente' ? 'Subtenente' : 
                   userRank.includes('Sargento') ? 'Sargento' : 
                   userRank;

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki dark:bg-slate-900 overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-4 flex items-center justify-between shadow-xl shrink-0">
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

      <main className="flex-1 overflow-y-auto lg:pb-4 no-scrollbar">
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:p-6 lg:max-w-7xl lg:mx-auto">
          
          {/* Coluna 1: Avatar e Chat Bubble */}
          <div className="lg:col-span-1 flex flex-col items-center pt-8 px-6 lg:p-0">
            <div className="relative w-64 h-64 mb-6">
              <div className="w-full h-full rounded-full overflow-hidden relative shadow-2xl border-4 border-pmmg-navy/10 dark:border-slate-700">
                 <img 
                  alt={aiAvatar.name} 
                  className="w-full h-full object-contain rounded-full" 
                  src={aiAvatar.url} 
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-pmmg-khaki dark:border-slate-900"></div>
            </div>
            <div className="relative bg-white dark:bg-slate-800 rounded-[1.5rem] p-4 px-6 shadow-lg mb-8 text-center border-2 border-pmmg-navy/5 dark:border-slate-700 after:content-[''] after:absolute after:top-0 after:left-1/2 after:w-0 after:h-0 after:border-[20px] after:border-transparent after:border-b-white dark:after:border-b-slate-800 after:mt-[-20px] after:ml-[-20px] after:border-t-0">
              <p className="text-pmmg-navy dark:text-slate-200 font-semibold text-sm">
                Como posso apoiar sua guarnição hoje, <span className="font-bold text-pmmg-red">{rankLabel}?</span>
              </p>
            </div>
            <div className="w-full mx-6 mt-4 pmg-card bg-pmmg-navy/5 dark:bg-slate-800 border border-pmmg-navy/20 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-pmmg-navy dark:text-pmmg-yellow fill-icon">memory</span>
                <div>
                  <div className="text-[10px] font-bold text-pmmg-navy dark:text-slate-200 uppercase">Rede Neural Operacional</div>
                  <div className="text-[9px] text-pmmg-navy/60 dark:text-slate-400">Sessão Segura: {aiAvatar.name}</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-400 px-2 py-1 rounded">ESTÁVEL</span>
            </div>
          </div>
          
          {/* Coluna 2/3: Ferramentas */}
          <div className="lg:col-span-2 px-6 lg:p-0 pt-8 lg:pt-0">
            <h3 className="text-[11px] font-bold text-pmmg-navy/60 dark:text-slate-400 uppercase tracking-wider mb-4">Ferramentas de Inteligência Rápida</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Consultar Placa', icon: 'photo_camera', screen: 'plateConsultation' },
                { label: 'Boletim por Voz', icon: 'mic', screen: 'voiceReport' },
                { label: 'Análise de Risco', icon: 'shield_with_house', screen: 'riskAnalysis' },
                { label: 'Reconhecimento Facial', icon: 'face_recognition', screen: 'faceRecognition' },
                { label: 'Previsão de Ocorrência', icon: 'timeline', screen: 'occurrencePrediction' },
                { label: 'Consulta de CPF/RG', icon: 'badge', screen: 'cpfRgConsultation' },
              ].map((tool) => (
                <button 
                  key={tool.label}
                  onClick={() => navigateTo(tool.screen as Screen)}
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
        </div>
      </main>

      {/* BottomNav is now handled by App.tsx and hidden on desktop */}
    </div>
  );
};

export default AITools;