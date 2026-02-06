import React from 'react';

interface ThemeToggleProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-slate-800/50 rounded-xl border border-pmmg-navy/10 dark:border-slate-700 shadow-sm transition-colors">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-pmmg-navy dark:text-pmmg-yellow fill-icon">
          {isDarkMode ? 'dark_mode' : 'light_mode'}
        </span>
        <div>
          <p className="text-sm font-bold text-primary-dark uppercase leading-none">Modo {isDarkMode ? 'Escuro' : 'Claro'}</p>
          <p className="text-[10px] text-secondary-light mt-1">Preferência de Visualização</p>
        </div>
      </div>
      <button 
        onClick={toggleDarkMode}
        className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${isDarkMode ? 'bg-pmmg-yellow' : 'bg-pmmg-navy'}`}
      >
        <span className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></span>
      </button>
    </div>
  );
};

export default ThemeToggle;