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
    { id: 'groupsList', label: 'Grupos', icon: 'groups' },
    { id: 'store', label: 'Loja', icon: 'store' },
  ];

  return (
    <>
      {/* Mobile Bottom Nav (Default) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 border-t border-pmmg-navy/10 dark:border-slate-700 px-6 pt-3 pb-8 z-50 backdrop-blur-lg max-w-md mx-auto lg:hidden">
        <div className="flex items-center justify-between">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigateTo(tab.id as Screen)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeScreen === tab.id 
                  ? 'text-pmmg-navy dark:text-white' 
                  : 'text-pmmg-navy/40 dark:text-slate-500 hover:text-pmmg-navy/70 dark:hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <span className={`material-symbols-outlined text-[26px] ${activeScreen === tab.id ? 'fill-icon' : ''}`}>
                  {tab.icon}
                </span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-tight">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar Nav (lg: breakpoint) */}
      <nav className="hidden lg:flex fixed top-0 left-0 h-full w-20 bg-pmmg-navy dark:bg-slate-900 border-r border-pmmg-navy-dark dark:border-slate-800 z-50 flex-col items-center pt-6 pb-4 shadow-2xl">
        {/* Logo/Header Placeholder */}
        <div className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center p-1 border-2 border-pmmg-red shadow-inner mb-8">
          <span className="material-symbols-outlined text-pmmg-navy text-2xl">shield</span>
        </div>
        
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigateTo(tab.id as Screen)}
            className={`flex flex-col items-center gap-1 py-3 w-full transition-colors relative group ${
              activeScreen === tab.id 
                ? 'text-pmmg-yellow bg-pmmg-navy-dark dark:bg-slate-800 border-l-4 border-pmmg-yellow' 
                : 'text-white/60 hover:text-white hover:bg-pmmg-navy-dark/50 dark:hover:bg-slate-800/50'
            }`}
            title={tab.label}
          >
            <div className="relative">
              <span className={`material-symbols-outlined text-[26px] ${activeScreen === tab.id ? 'fill-icon' : ''}`}>
                {tab.icon}
              </span>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-tight">{tab.label}</span>
            
            {/* Tooltip/Label on hover */}
            <span className="absolute left-full ml-2 px-3 py-1 bg-pmmg-yellow text-pmmg-navy text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default BottomNav;