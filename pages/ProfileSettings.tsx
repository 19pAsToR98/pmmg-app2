import React, { useState } from 'react';
import { Screen, UserRank, UserAvatar } from '../types';
import BottomNav from '../components/BottomNav';
import ThemeToggle from '../components/ThemeToggle';

interface ProfileSettingsProps {
  navigateTo: (screen: Screen) => void;
  onBack: () => void;
  currentRank: UserRank;
  onRankChange: (rank: UserRank) => void;
  userAvatar: UserAvatar;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  userName: string;
  userEmail: string; // NOVO: Email do usuário
  suspectCount: number; // NOVO: Contagem real de suspeitos
}

// Helper function to map UserRank to a display string (e.g., "Sargento de Polícia • 1ª Classe")
const getRankDisplay = (rank: UserRank) => {
  if (rank.includes('Sargento')) return `Sargento de Polícia • ${rank.split(' ')[0]}`;
  if (rank === 'Subtenente') return 'Subtenente de Polícia';
  return `${rank} de Polícia`;
};

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ 
  navigateTo, 
  onBack, 
  currentRank, 
  userAvatar, 
  isDarkMode, 
  toggleDarkMode,
  userName,
  userEmail,
  suspectCount, // Usando a contagem real
}) => {
  
  // Mock state for biometric switch (since we don't have Capacitor Biometric API implemented yet)
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(true);
  
  // Helper classes based on the provided HTML styles
  const iosListItemClasses = "flex items-center justify-between py-4 border-b border-pmmg-navy/5 dark:border-slate-700 last:border-0 px-4";
  const iconContainerClasses = "w-10 h-10 bg-pmmg-navy/5 dark:bg-slate-700 flex items-center justify-center border border-pmmg-navy/10 dark:border-slate-600 rounded-lg shrink-0";

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki dark:bg-slate-900 overflow-hidden">
      
      {/* Header Section */}
      <header className="bg-pmmg-navy px-6 pt-12 pb-10 rounded-b-[2rem] shadow-2xl relative overflow-hidden shrink-0">
        {/* Back Button */}
        <button 
          onClick={onBack} 
          className="absolute top-4 left-4 text-white z-20 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-pmmg-yellow/10 rounded-full -mr-16 -mt-16 z-0"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 z-0"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl border-2 border-pmmg-yellow/80 p-1 bg-white/10 mb-4 overflow-hidden shadow-xl">
              <img 
                alt="Officer Photo" 
                className="w-full h-full object-cover rounded-xl" 
                src={userAvatar.url} 
              />
            </div>
            <div className="absolute bottom-4 -right-1 bg-pmmg-red text-white p-1 rounded-lg border border-pmmg-navy shadow-lg">
              <span className="material-symbols-outlined text-[12px]">verified</span>
            </div>
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-tight text-center">{currentRank}. {userName}</h2>
          <p className="text-pmmg-yellow font-semibold text-[10px] tracking-[0.2em] uppercase mt-1">{getRankDisplay(currentRank)}</p>
        </div>
      </header>
      
      <main className="flex-1 px-4 -mt-6 lg:pb-4 space-y-6 overflow-y-auto no-scrollbar">
        <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:max-w-7xl lg:mx-auto">
          
          {/* Coluna 1: Stats e Dados da Conta */}
          <div className="lg:col-span-1">
            {/* Stats Card */}
            <div className="pmmg-card p-4 flex items-center justify-between">
              <div>
                <h4 className="text-[10px] font-bold text-pmmg-navy/50 dark:text-slate-400 uppercase tracking-widest mb-1">Meus Registros</h4>
                <p className="text-xl font-black text-pmmg-navy dark:text-slate-200 uppercase">{suspectCount} <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 ml-1 tracking-normal italic">Suspeitos Identificados</span></p>
              </div>
              <div className={iconContainerClasses}>
                <span className="material-symbols-outlined text-pmmg-navy dark:text-pmmg-yellow">person_search</span>
              </div>
            </div>
            
            {/* Dados da Conta */}
            <section className="mt-6">
              <h3 className="px-4 mb-2 text-[11px] font-bold text-pmmg-navy/80 dark:text-slate-400 uppercase tracking-widest">Dados da Conta</h3>
              <div className="pmmg-card">
                {/* E-mail Funcional */}
                <div className={iosListItemClasses}>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-pmmg-navy/50 dark:text-slate-500 font-bold uppercase tracking-tighter">E-mail Funcional</span>
                    <span className="text-sm font-semibold text-pmmg-navy dark:text-slate-200">{userEmail}</span>
                  </div>
                  <button onClick={() => alert('Simulação: Abrir edição de e-mail')} className="p-2 text-pmmg-navy/40 dark:text-slate-500 hover:text-pmmg-navy dark:hover:text-slate-300">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                </div>
                
                <div className={iosListItemClasses}>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-pmmg-navy/50 dark:text-slate-500 font-bold uppercase tracking-tighter">Nome Completo</span>
                    <span className="text-sm font-semibold text-pmmg-navy dark:text-slate-200">{userName}</span>
                  </div>
                  <button onClick={() => alert('Simulação: Abrir edição de nome')} className="p-2 text-pmmg-navy/40 dark:text-slate-500 hover:text-pmmg-navy dark:hover:text-slate-300">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                </div>
                <div className={iosListItemClasses}>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-pmmg-navy/50 dark:text-slate-500 font-bold uppercase tracking-tighter">Graduação</span>
                    <span className="text-sm font-semibold text-pmmg-navy dark:text-slate-200">{currentRank}</span>
                  </div>
                  <button onClick={() => alert('Simulação: Abrir edição de graduação')} className="p-2 text-pmmg-navy/40 dark:text-slate-500 hover:text-pmmg-navy dark:hover:text-slate-300">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                </div>
                <div className={iosListItemClasses}>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-pmmg-navy/50 dark:text-slate-500 font-bold uppercase tracking-tighter">Senha de Acesso</span>
                    <span className="text-sm font-semibold text-pmmg-navy dark:text-slate-200 tracking-widest">••••••••••••</span>
                  </div>
                  <button onClick={() => alert('Simulação: Abrir edição de senha')} className="p-2 text-pmmg-navy/40 dark:text-slate-500 hover:text-pmmg-navy dark:hover:text-slate-300">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
          
          {/* Coluna 2: Configurações e Segurança */}
          <div className="lg:col-span-1 lg:mt-0 mt-6">
            <section>
              <h3 className="px-4 mb-2 text-[11px] font-bold text-pmmg-navy/80 dark:text-slate-400 uppercase tracking-widest">Configurações e Segurança</h3>
              <div className="pmmg-card">
                
                {/* Modo Escuro (Usando ThemeToggle Component) - Agora ocupa a largura total do item da lista */}
                <div className={iosListItemClasses + ' !p-0'}>
                  <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
                </div>
                
                {/* Biometria (Simulada) - Corrigido o toggle */}
                <div className={iosListItemClasses}>
                  <div className="flex items-center gap-3">
                    <div className={iconContainerClasses + ' !w-8 !h-8'}>
                      <span className="material-symbols-outlined text-pmmg-navy dark:text-pmmg-yellow text-xl">fingerprint</span>
                    </div>
                    <span className="text-sm font-semibold text-pmmg-navy dark:text-slate-200">Habilitar Biometria</span>
                  </div>
                  <button 
                    onClick={() => setIsBiometricEnabled(prev => !prev)}
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${isBiometricEnabled ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <span className={`absolute left-0.5 top-0.5 inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${isBiometricEnabled ? 'translate-x-5' : 'translate-x-0'}`}></span>
                  </button>
                </div>
                
                {/* Configurações de Alerta */}
                <button onClick={() => alert('Simulação: Configurações de Alerta')} className={iosListItemClasses + ' w-full active:bg-slate-50 dark:active:bg-slate-700 transition-colors text-left'}>
                  <div className="flex items-center gap-3">
                    <div className={iconContainerClasses + ' !w-8 !h-8'}>
                      <span className="material-symbols-outlined text-pmmg-navy dark:text-pmmg-yellow text-xl">notifications_active</span>
                    </div>
                    <span className="text-sm font-semibold text-pmmg-navy dark:text-slate-200">Configurações de Alerta</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 dark:text-slate-600">chevron_right</span>
                </button>
                
                {/* Sair do Sistema */}
                <button onClick={() => alert('Simulação: Sair do Sistema')} className={iosListItemClasses + ' w-full active:bg-slate-50 dark:active:bg-slate-700 transition-colors text-left'}>
                  <div className="flex items-center gap-3">
                    <div className={iconContainerClasses + ' !w-8 !h-8 bg-slate-100 dark:bg-slate-700'}>
                      <span className="material-symbols-outlined text-slate-400 text-xl">logout</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sair do Sistema</span>
                  </div>
                </button>
                
                {/* Excluir Conta */}
                <button onClick={() => alert('Simulação: Excluir Conta')} className={iosListItemClasses + ' w-full active:bg-red-50/50 transition-colors text-left bg-red-50/30 dark:bg-pmmg-red/10'}>
                  <div className="flex items-center gap-3">
                    <div className={iconContainerClasses + ' !w-8 !h-8 bg-pmmg-red/10 border-pmmg-red/20'}>
                      <span className="material-symbols-outlined text-pmmg-red text-xl">delete_forever</span>
                    </div>
                    <span className="text-sm font-bold text-pmmg-red uppercase tracking-tight">Excluir Conta</span>
                  </div>
                </button>
              </div>
            </section>
          </div>
        </div>
        
        {/* Footer Info */}
        <div className="flex flex-col items-center justify-center opacity-40 py-8">
          {/* Mocked PMMG Brasão (using a placeholder image URL) */}
          <img 
            alt="PMMG Brasão" 
            className="h-12 grayscale" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_LyCX8IqovjAUxXNBgCPmE1zHPl9QsCOlj1a8U10XFTSPbqFooJ00jvHiDGevYqUd7ETqJsz_RyJEFXwUTFu1NlDY187NwWdysQPPDi8cqUP5sLGbpxMfi7ZW9ilvOH1TSPvA08oVDzfOAWrMXN-I-_i05nfSr7aQ3Hka7Jpd45QzlPB8QMGuk1VeArNff4VebCg1BT73ch247Hik10dA1ke5-ckYyrMauOeLyvMYn8zzNwjHDhpP1Rk9pWaHN-3TC8wy-KcRIBI"
          />
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] mt-3 text-pmmg-navy dark:text-slate-500">PMMG • Versão 2.5.0</p>
        </div>
      </main>
      
      {/* BottomNav is now handled by App.tsx and hidden on desktop */}
    </div>
  );
};

export default ProfileSettings;