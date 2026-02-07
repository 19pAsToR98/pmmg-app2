import React from 'react';
import { Screen } from '../types';

interface AIToolsWidgetProps {
  navigateTo: (screen: Screen) => void;
}

const AIToolsWidget: React.FC<AIToolsWidgetProps> = ({ navigateTo }) => {
  return (
    <div className="pmmg-card p-4 space-y-4">
      <div className="flex items-center gap-2 border-b border-pmmg-navy/10 dark:border-slate-700 pb-3">
        <span className="material-symbols-outlined text-pmmg-navy dark:text-pmmg-yellow fill-icon text-xl">psychology</span>
        <h3 className="font-bold text-xs text-primary-dark uppercase tracking-widest">Assistente Tático IA</h3>
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