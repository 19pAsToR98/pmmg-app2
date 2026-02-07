import React from 'react';
import { Screen, UserAvatar } from '../types';

interface AIToolsWidgetProps {
  navigateTo: (screen: Screen) => void;
  aiAvatar: UserAvatar; // NOVO: Avatar do Assistente de IA
}

const AIToolsWidget: React.FC<AIToolsWidgetProps> = ({ navigateTo, aiAvatar }) => {
  return (
    <div className="pmmg-card p-4 space-y-4">
      <div className="flex items-center gap-3 border-b border-pmmg-navy/10 dark:border-slate-700 pb-3">
        <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden relative shadow-md border-2 border-pmmg-yellow/50">
            <img 
                alt={aiAvatar.name} 
                className="w-full h-full object-cover" 
                src={aiAvatar.url} 
            />
        </div>
        <div>
            <h3 className="font-bold text-xs text-primary-dark uppercase tracking-widest leading-none">Assistente Tático IA</h3>
            <p className="text-[9px] text-secondary-light mt-1">Sgt. {aiAvatar.name.split(' ')[1]}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Consultar Placa', icon: 'photo_camera', screen: 'plateConsultation' },
          { label: 'Boletim por Voz', icon: 'mic', screen: 'voiceReport' },
        ].map((tool) => (
          <button 
            key={tool.label}
            onClick={() => navigateTo(tool.screen as Screen)}
            className="relative overflow-hidden bg-pmmg-navy text-white p-3 rounded-xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform border-b-2 border-black/30 shadow-lg"
          >
            <span className="material-symbols-outlined text-pmmg-yellow text-2xl">{tool.icon}</span>
            <span className="text-[9px] font-black uppercase text-center leading-tight tracking-wide">{tool.label}</span>
          </button>
        ))}
      </div>
      
      <button 
        onClick={() => navigateTo('aiTools')}
        className="w-full bg-pmmg-khaki/50 dark:bg-slate-700 text-pmmg-navy dark:text-slate-300 text-[10px] font-bold py-2 rounded-lg uppercase tracking-widest active:scale-[0.98] transition-transform border border-pmmg-navy/10 dark:border-slate-600"
      >
        Ver Central Completa
      </button>
    </div>
  );
};

export default AIToolsWidget;