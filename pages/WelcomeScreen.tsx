import React from 'react';
import { Screen } from '../types';
import BiometricAuthButton from '../components/BiometricAuthButton';

interface WelcomeScreenProps {
  onEnter: () => void;
  onRequest: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter, onRequest }) => {
  return (
    <div className="h-full flex flex-col lg:grid lg:grid-cols-2 overflow-hidden">
      
      {/* Lado Esquerdo: Branding (Fixo no Desktop) */}
      <div className="relative hidden lg:flex flex-col items-center justify-center p-16 bg-pmmg-navy-dark overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Background" 
            className="w-full h-full object-cover opacity-20" 
            src="https://picsum.photos/seed/pmmg/1200/1200" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-pmmg-navy/70 to-pmmg-navy/95"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-sm">
          <div className="w-48 h-48 mb-8 p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center shadow-2xl">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center p-2">
               <span className="material-symbols-outlined text-pmmg-navy text-8xl">shield</span>
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-3 leading-tight uppercase">
            Sistema Operacional PMMG
          </h1>
          <div className="h-1.5 w-20 bg-pmmg-yellow mb-6"></div>
          <p className="text-lg font-medium text-slate-300 tracking-wide uppercase">
            Inteligência e Integração Tática
          </p>
        </div>
        
        <footer className="absolute bottom-8 z-10 flex flex-col items-center gap-2">
          <span className="text-sm font-bold text-white/60 uppercase tracking-[0.2em]">Governo de Minas Gerais</span>
          <div className="w-40 h-1 bg-white/20 rounded-full"></div>
        </footer>
      </div>

      {/* Lado Direito: Login/Ações (Mobile e Desktop) */}
      <div className="relative z-10 flex flex-col items-center justify-center px-8 py-16 lg:py-0 lg:px-16 bg-pmmg-khaki dark:bg-slate-900">
        
        {/* Conteúdo do Login (Centralizado) */}
        <div className="w-full max-w-sm space-y-4">
          
          {/* Título Mobile (Visível apenas em telas pequenas) */}
          <div className="lg:hidden flex flex-col items-center text-center mb-12">
            <div className="w-24 h-24 mb-4 p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center shadow-xl">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center p-1">
                 <span className="material-symbols-outlined text-pmmg-navy text-4xl">shield</span>
              </div>
            </div>
            <h1 className="text-xl font-bold tracking-tighter text-primary-dark mb-1 leading-tight uppercase">
              Acesso ao Sistema
            </h1>
            <p className="text-sm font-medium text-secondary-light tracking-wide uppercase">
              PMMG Operacional
            </p>
          </div>
          
          {/* Botões de Ação */}
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
            className="w-full bg-pmmg-navy/5 backdrop-blur-sm border border-pmmg-navy/10 dark:bg-slate-800/50 dark:border-slate-700 py-4 rounded-xl active:scale-[0.98] transition-all"
          >
            <span className="text-pmmg-navy/80 dark:text-white/80 font-semibold tracking-widest text-sm uppercase">Solicitar Acesso</span>
          </button>
          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-pmmg-navy/40 dark:text-slate-500 uppercase font-bold tracking-widest">Servidor Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;