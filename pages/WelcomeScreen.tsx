import React from 'react';
import { Screen } from '../types';
import BiometricAuthButton from '../components/BiometricAuthButton';

interface WelcomeScreenProps {
  onEnter: () => void;
  onRequest: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter, onRequest }) => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          alt="Background" 
          className="w-full h-full object-cover scale-110" 
          src="https://picsum.photos/seed/pmmg/800/1200" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-pmmg-navy/70 to-pmmg-navy/95"></div>
      </div>

      {/* Main Content Wrapper (Centered on Desktop) */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
        
        {/* Login Card/Panel (Wider for desktop, max-w-lg) */}
        <div className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-white/20 w-full max-w-lg flex flex-col items-center text-center">
          
          {/* Branding Section */}
          <div className="flex flex-col items-center text-center w-full mb-8">
            <div className="w-32 h-32 mb-6 p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center shadow-2xl">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center p-2">
                 <span className="material-symbols-outlined text-pmmg-navy text-6xl">shield</span>
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white mb-2 leading-tight uppercase">
              Sistema Operacional PMMG
            </h1>
            <div className="h-1 w-16 bg-pmmg-yellow mb-4"></div>
            <p className="text-base font-medium text-slate-300 tracking-wide uppercase">
              Inteligência e Integração na Palma da Mão
            </p>
          </div>

          {/* Buttons Section (Max width for buttons inside the card) */}
          <div className="w-full space-y-4 max-w-sm">
            <BiometricAuthButton onSuccess={onEnter} />
            
            <button 
              onClick={onEnter}
              className="w-full bg-pmmg-navy border-2 border-pmmg-gold py-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <span className="text-pmmg-gold font-bold tracking-widest text-sm uppercase">Entrar com Senha</span>
              <span className="material-symbols-outlined text-pmmg-gold text-xl">login</span>
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
        </div>
      </div>
      
      {/* Footer (Fixed at bottom) */}
      <footer className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-2">
        <span className="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em]">Governo de Minas Gerais</span>
        <div className="w-32 h-1 bg-white/20 rounded-full"></div>
      </footer>
    </div>
  );
};

export default WelcomeScreen;