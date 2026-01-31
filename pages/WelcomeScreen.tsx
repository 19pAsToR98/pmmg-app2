import React from 'react';
import { Screen } from '../types';

interface WelcomeScreenProps {
  onEnter: () => void;
  onRequest: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter, onRequest }) => {
  return (
    <div className="relative h-full flex flex-col items-center justify-between px-8 py-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          alt="Background" 
          className="w-full h-full object-cover scale-110" 
          src="https://picsum.photos/seed/pmmg/800/1200" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-theme-primary/70 to-theme-primary/95"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-xs mt-12">
        <div className="w-40 h-40 mb-8 p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center shadow-2xl">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center p-2">
             <span className="material-symbols-outlined text-theme-primary text-6xl">shield</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tighter text-white mb-2 leading-tight uppercase">
          Sistema Operacional PMMG
        </h1>
        <div className="h-1 w-12 bg-theme-accent mb-4"></div>
        <p className="text-sm font-medium text-slate-300 tracking-wide uppercase">
          Inteligência e Integração<br />na Palma da Mão
        </p>
      </div>

      <div className="relative z-10 w-full space-y-4 max-w-sm mb-8">
        <button 
          onClick={onEnter}
          className="w-full bg-theme-primary border-2 border-theme-secondary py-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <span className="text-theme-secondary font-bold tracking-widest text-sm uppercase">Entrar no Sistema</span>
          <span className="material-symbols-outlined text-theme-secondary text-xl">login</span>
        </button>
        <button 
          onClick={onRequest}
          className="w-full bg-white/5 backdrop-blur-sm border border-white/10 py-4 rounded-xl active:scale-[0.98] transition-all"
        >
          <span className="text-white/80 font-semibold tracking-widest text-sm uppercase">Solicitar Acesso</span>
        </button>
        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Servidor Online</span>
          </div>
        </div>
      </div>
      
      <footer className="relative z-10 flex flex-col items-center gap-2">
        <span className="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em]">Governo de Minas Gerais</span>
        <div className="w-32 h-1 bg-white/20 rounded-full"></div>
      </footer>
    </div>
  );
};

export default WelcomeScreen;