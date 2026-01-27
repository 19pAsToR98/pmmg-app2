import React from 'react';
import { Screen } from '../types';

interface BottomNavProps {
  activeScreen: Screen;
  navigateTo: (screen: Screen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, navigateTo }) => {
  const tabs = [
    { id: 'dashboard', label: 'Início', icon: 'dashboard' },
    { id: 'map', label: 'Mapa', icon: 'map' }, // Usando 'map' para a segunda posição (Busca/Mapa Tático)
    { id: 'chatList', label: 'Tropa', icon: 'groups' }, // Usando 'groups' para a terceira posição (Comunicação)
    { id: 'aiTools', label: 'Assistente', icon: 'psychology' },
    { id: 'profileSettings', label: 'Perfil', icon: 'person' },
  ];
  
  // Mapeamento de ícones e rótulos para o novo estilo visual
  const visualTabs = [
    { id: 'dashboard', label: 'Início', icon: 'dashboard' },
    { id: 'map', label: 'Mapa', icon: 'map' },
    { id: 'chatList', label: 'Tropa', icon: 'groups' },
    { id: 'aiTools', label: 'Assistente', icon: 'psychology' },
    { id: 'profileSettings', label: 'Perfil', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-pmmg-khaki-light px-4 pt-3 pb-8 z-50 rounded-t-[2.5rem] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)] max-w-md mx-auto">
      <div className="flex items-center justify-between">
        {visualTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigateTo(tab.id as Screen)}
            className={`flex flex-col items-center gap-1 transition-colors flex-1 ${
              activeScreen === tab.id ? 'text-pmmg-navy' : 'text-slate-400'
            }`}
          >
            <div className="relative">
              <span className={`material-symbols-outlined text-[26px] ${activeScreen === tab.id ? 'fill-icon' : ''}`}>
                {tab.icon}
              </span>
              {/* Lógica de badge removida, mas pode ser reintroduzida via props se necessário */}
            </div>
            <span className="text-[8px] font-black uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;