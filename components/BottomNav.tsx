
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
    { id: 'registry', label: 'Alertas', icon: 'notifications', badge: 3 },
    { id: 'chatList', label: 'Tropa', icon: 'groups' },
    { id: 'profileSettings', label: 'Perfil', icon: 'person' },
  ];

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
              {tab.badge && (
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
