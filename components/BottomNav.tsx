import React from 'react';
import { Screen } from '../types';

interface BottomNavProps {
  activeScreen: Screen;
  navigateTo: (screen: Screen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, navigateTo }) => {
  const tabs = [
    { id: 'dashboard', label: 'Painel', icon: 'dashboard' },
    { id: 'map', label: 'Mapa', icon: 'map' },
    { id: 'aiTools', label: 'Assistente', icon: 'psychology' }, 
    { id: 'groupsList', label: 'Grupos', icon: 'groups' }, // Renomeado de chatList para groupsList
    { id: 'store', label: 'Loja', icon: 'store' },
  ];

  // Nota: O badge de alertas (registry) foi removido, mas mantive a estrutura para o caso de futuros badges.
  // Se o badge for necessário para 'Assistente', ele deve ser passado via props. Por enquanto, setei para 0.

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-pmmg-navy/10 px-6 pt-3 pb-8 z-50 backdrop-blur-lg max-w-md mx-auto">
      <div className="flex items-center justify-between">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigateTo(tab.id as Screen)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeScreen === tab.id ? 'text-pmmg-navy' : 'text-pmmg-navy/40'
            }`}
          >
            <div className="relative">
              <span className={`material-symbols-outlined text-[26px] ${activeScreen === tab.id ? 'fill-icon' : ''}`}>
                {tab.icon}
              </span>
              {/* A lógica de exibição do badge só é executada se tab.badge existir e for > 0 */}
              {('badge' in tab) && tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-pmmg-red text-white text-[8px] flex items-center justify-center rounded-full border border-white">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-tight">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;