import React from 'react';
import { Screen } from '../types';

interface DesktopNavProps {
  activeScreen: Screen;
  navigateTo: (screen: Screen) => void;
  userName: string;
  userRank: string;
  userAvatarUrl: string;
}

const DesktopNav: React.FC<DesktopNavProps> = ({ activeScreen, navigateTo, userName, userRank, userAvatarUrl }) => {
  const tabs = [
    { id: 'dashboard', label: 'Painel', icon: 'dashboard' },
    { id: 'map', label: 'Mapa Tático', icon: 'map' },
    { id: 'aiTools', label: 'Assistente IA', icon: 'psychology' }, 
    { id: 'groupsList', label: 'Grupos', icon: 'groups' },
    { id: 'store', label: 'Loja Tática', icon: 'store' },
  ];

  const isActive = (id: string) => activeScreen === id;

  return (
    <nav className="hidden lg:flex flex-col w-20 bg-pmmg-navy-dark h-full fixed left-0 top-0 z-40 shadow-2xl p-2 shrink-0 items-center">
      
      {/* Logo/Branding (Apenas Ícone) */}
      <div className="w-12 h-12 shrink-0 bg-white rounded-xl flex items-center justify-center p-1 border-2 border-pmmg-yellow shadow-inner mb-6 mt-2">
        <span className="material-symbols-outlined text-pmmg-navy text-3xl fill-icon">shield</span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 space-y-3 w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigateTo(tab.id as Screen)}
            className={`w-full flex flex-col items-center justify-center p-2 rounded-xl transition-colors text-center group relative ${
              isActive(tab.id)
                ? 'bg-pmmg-navy text-pmmg-yellow shadow-lg'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined text-2xl ${isActive(tab.id) ? 'fill-icon' : ''}`}>
              {tab.icon}
            </span>
            {/* Tooltip/Label on hover */}
            <span className="absolute left-full ml-3 px-3 py-1 bg-pmmg-navy text-white text-[10px] font-bold uppercase rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
      
      {/* User Profile Link at Bottom (Apenas Avatar) */}
      <button 
        onClick={() => navigateTo('profileSettings')}
        className="w-12 h-12 flex items-center justify-center mt-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors p-1"
        title={`${userRank}. ${userName}`}
      >
        <div className="w-full h-full rounded-lg overflow-hidden border border-pmmg-yellow/50 shrink-0">
          <img src={userAvatarUrl} alt={userName} className="w-full h-full object-cover" />
        </div>
      </button>
    </nav>
  );
};

export default DesktopNav;