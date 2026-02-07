import React from 'react';
import { Screen, UserAvatar } from '../types';

interface AIToolsWidgetProps {
  navigateTo: (screen: Screen) => void;
  aiAvatar: UserAvatar; // NOVO: Avatar do Assistente de IA
}

const AIToolsWidget: React.FC<AIToolsWidgetProps> = ({ navigateTo, aiAvatar }) => {
  return (
    <div className="pmmg-card p-4 space-y-4 flex flex-col items-center">
      
      {/* Avatar em Destaque */}
      <div className="flex flex-col items-center w-full mb-4">
        <div className="relative w-24 h-24 mb-4">
          <div className="w-full h-full rounded-full overflow-hidden relative shadow-xl border-2 border-pmmg-navy/10 dark:border-slate-700">
             <img 
              alt={aiAvatar.name} 
              className="w-full h-full object-contain rounded-full" 
              src={aiAvatar.url} 
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800"></div>
        </div>
        
        {/* Bolha de Fala Simplificada */}
        <div className="relative bg-pmmg-navy/5 dark:bg-slate-700 rounded-xl p-3 text-center border border-pmmg-navy/10 dark:border-slate-600">
          <p className="text-pmmg-navy dark:text-slate-200 font-semibold text-[10px] uppercase">
            Sgt. {aiAvatar.name.split(' ')[1]} pronto para apoiar.
          </p>
        </div>
      </div>
      
      {/* Título e Ferramentas */}
      <div className="w-full border-t border-pmmg-navy/10 dark:border-slate-700 pt-4 space-y-4">
        <h3 className="font-bold text-xs text-primary-dark uppercase tracking-widest text-center">Ferramentas de Acesso Rápido</h3>
        
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
    </div>
  );
};

export default AIToolsWidget;