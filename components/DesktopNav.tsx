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
    <nav className="hidden lg:flex flex-col w-64 bg-pmmg-navy-dark h-full fixed left-0 top-0 z-40 shadow-2xl p-4 shrink-0">
      
      {/* Logo/Branding */}
      <div className="flex items-center gap-3 p-2 mb-6 border-b border-white/10 pb-4">
        <div className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center p-1 border-2 border-pmmg-yellow shadow-inner">
          <span className="material-symbols-outlined text-pmmg-navy text-2xl fill-icon">shield</span>
        </div>
        <div>
          <h1 className="font-black text-sm leading-none text-white uppercase tracking-tight">PMMG OP</h1>
          <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-0.5">Inteligência</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigateTo(tab.id as Screen)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
              isActive(tab.id)
                ? 'bg-pmmg-navy text-pmmg-yellow shadow-lg'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined text-xl ${isActive(tab.id) ? 'fill-icon' : ''}`}>
              {tab.icon}
            </span>
            <span className="text-sm font-bold uppercase tracking-wide">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* User Profile Link at Bottom */}
      <button 
        onClick={() => navigateTo('profileSettings')}
        className="w-full flex items-center gap-3 p-3 mt-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border border-pmmg-yellow/50 shrink-0">
          <img src={userAvatarUrl} alt={userName} className="w-full h-full object-cover" />
        </div>
        <div className="text-left min-w-0">
          <p className="text-xs font-bold text-white truncate">{userName}</p>
          <p className="text-[10px] text-pmmg-yellow/80 uppercase">{userRank}</p>
        </div>
      </button>
    </nav>
  );
};

export default DesktopNav;