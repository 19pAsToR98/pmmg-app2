import React from 'react';
import { Screen, Suspect } from '../types';
import BottomNav from '../components/BottomNav';

interface DashboardProps {
  navigateTo: (screen: Screen) => void;
  navigateToSuspectsManagement: (status: Suspect['status'] | 'Todos') => void;
  onOpenProfile: (id: string) => void;
  suspects: Suspect[];
  startShareFlow: (suspectId: string) => void; // NOVO
}

const Dashboard: React.FC<DashboardProps> = ({ navigateTo, navigateToSuspectsManagement, onOpenProfile, suspects, startShareFlow }) => {
  
  // Quick filter for recent alerts on the dashboard (limited to top 5)
  const recentSuspects = suspects.slice(0, 5); 

  const stats = {
    foragidos: suspects.filter(s => s.status === 'Foragido').length,
    suspeitos: suspects.filter(s => s.status === 'Suspeito').length,
    presos: suspects.filter(s => s.status === 'Preso').length,
    total: suspects.length, // Novo: Contagem total
  };

  const handleCardClick = (status: Suspect['status'] | 'Todos') => {
    navigateToSuspectsManagement(status);
  };
  
  const handleViewOnMap = (suspect: Suspect) => {
    if (suspect.lat && suspect.lng) {
      navigateTo('map', [suspect.lat, suspect.lng]);
    } else {
      alert("Localização não registrada para este indivíduo.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 pt-4 pb-4 shadow-xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center p-1 border-2 border-pmmg-red shadow-inner">
              <span className="material-symbols-outlined text-primary-dark text-2xl">shield</span>
            </div>
            <div>
              <h1 className="font-bold text-sm leading-none text-white uppercase tracking-tight">PMMG OPERACIONAL</h1>
              <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Quartel General</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <div className="text-[9px] text-white/50 uppercase font-bold">Patrulha 402</div>
              <div className="text-[10px] text-green-400 font-bold uppercase flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online
              </div>
            </div>
            {/* Botão para Perfil */}
            <button 
              onClick={() => navigateTo('profileSettings')}
              className="bg-white/10 p-1.5 rounded-full border border-white/20 text-white"
            >
              <span className="material-symbols-outlined text-xl">person</span>
            </button>
          </div>
        </div>

        {/* Search Bar (Fixed in header) - NOW A BUTTON FOR NAVIGATION */}
        <button 
          onClick={() => navigateToSuspectsManagement('Todos')}
          className="w-full relative group text-left active:scale-[0.99] transition-transform"
        >
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-primary-dark text-xl">search</span>
          </div>
          <div 
            className="block w-full pl-10 pr-4 py-3 bg-white rounded-xl border-2 border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-0 text-sm font-bold placeholder-pmmg-navy/40 shadow-sm text-pmmg-navy/60 whitespace-nowrap overflow-hidden" 
          >
            BUSCAR INDIVÍDUO (NOME, CPF, ALCUNHA)
          </div>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        {/* Stats Grid */}
        <section className="px-4 pt-4 grid grid-cols-2 gap-3">
          <button onClick={() => handleCardClick('Foragido')} className="pmmg-card p-3 border-l-4 border-l-pmmg-red active:scale-[0.98] transition-transform text-left">
            <span className="text-[10px] font-bold uppercase text-secondary-light block mb-1">Foragidos</span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-black text-pmmg-red">{stats.foragidos}</span>
              <span className="material-symbols-outlined text-pmmg-red/30">release_alert</span>
            </div>
          </button>
          <button onClick={() => handleCardClick('Suspeito')} className="pmmg-card p-3 border-l-4 border-l-pmmg-yellow active:scale-[0.98] transition-transform text-left">
            <span className="text-[10px] font-bold uppercase text-secondary-light block mb-1">Suspeitos</span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-black text-primary-dark">{stats.suspeitos}</span>
              <span className="material-symbols-outlined text-pmmg-yellow">visibility</span>
            </div>
          </button>
          <button onClick={() => handleCardClick('Preso')} className="pmmg-card p-3 border-l-4 border-l-pmmg-blue active:scale-[0.98] transition-transform text-left">
            <span className="text-[10px] font-bold uppercase text-secondary-light block mb-1">Presos</span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-black text-pmmg-blue">{stats.presos}</span>
              <span className="material-symbols-outlined text-pmmg-blue/30">lock</span>
            </div>
          </button>
          {/* NOVO CARD: TODOS */}
          <button onClick={() => handleCardClick('Todos')} className="pmmg-card p-3 border-l-4 border-l-pmmg-navy active:scale-[0.98] transition-transform text-left">
            <span className="text-[10px] font-bold uppercase text-secondary-light block mb-1">Todos Registros</span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-black text-pmmg-navy">{stats.total}</span>
              <span className="material-symbols-outlined text-pmmg-navy/30">manage_search</span>
            </div>
          </button>
        </section>
        
        {/* New Registry Button */}
        <section className="px-4 pt-4">
          <button 
            onClick={() => navigateTo('registry')}
            className="w-full bg-pmmg-navy text-white text-xs font-bold py-3 rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-transform border border-pmmg-yellow/30"
          >
            <span className="material-symbols-outlined text-lg text-pmmg-yellow">person_add</span>
            Novo Registro
          </button>
        </section>

        {/* Recent Alerts */}
        <div className="px-4 pt-8 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1.5 bg-pmmg-red rounded-full"></div>
            <h3 className="font-bold text-xs text-primary-dark uppercase tracking-widest italic">
              Alertas e Registros Recentes
            </h3>
          </div>
        </div>

        <section className="px-4 space-y-4">
          {recentSuspects.length > 0 ? recentSuspects.map((s) => (
            <div 
              key={s.id} 
              onClick={() => onOpenProfile(s.id)}
              className="pmmg-card overflow-hidden transition-all active:scale-[0.98] cursor-pointer"
            >
              <div className="flex">
                <div className="w-32 h-44 relative bg-slate-200 shrink-0">
                  <img alt={s.name} className="w-full h-full object-cover" src={s.photoUrl} />
                  <div className={`absolute top-0 left-0 text-white text-[8px] font-bold px-2 py-1 uppercase rounded-br-lg shadow-md ${
                    s.status === 'Foragido' ? 'bg-pmmg-red' : 
                    s.status === 'Suspeito' ? 'bg-pmmg-yellow text-primary-dark' :
                    s.status === 'Preso' ? 'bg-pmmg-blue' : 'bg-slate-700'
                  }`}>
                    {s.status}
                  </div>
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-primary-dark uppercase leading-tight truncate pr-1">{s.name}</h4>
                      <span className={`material-symbols-outlined fill-icon text-lg ${
                        s.status === 'Foragido' ? 'text-pmmg-red' : 'text-pmmg-yellow'
                      }`}>
                        {s.status === 'Foragido' ? 'priority_high' : 'warning'}
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-500 mt-1">CPF: {s.cpf}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-primary-dark">location_on</span>
                        <span className="text-[10px] text-secondary-light truncate">Visto em: {s.lastSeen}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-primary-dark">history</span>
                        <span className="text-[10px] text-secondary-light">Há {s.timeAgo}</span>
                      </div>
                      {/* Link VER NO MAPA */}
                      {s.lat && s.lng && (
                        <div 
                          onClick={(e) => { e.stopPropagation(); handleViewOnMap(s); }}
                          className="flex items-center gap-1.5 cursor-pointer active:opacity-70 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-[14px] text-secondary-light fill-icon">map</span>
                          <span className="text-[10px] text-secondary-light font-bold uppercase tracking-wider">Ver no Mapa</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onOpenProfile(s.id); }}
                      className="flex-1 bg-pmmg-navy text-white text-[9px] font-bold py-2 rounded-lg uppercase tracking-wide"
                    >
                      Ficha Completa
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); startShareFlow(s.id); }} // USANDO NOVO FLUXO
                      className="px-3 border-2 border-pmmg-navy/20 rounded-lg flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-primary-dark text-lg">share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 opacity-40">
              <span className="material-symbols-outlined text-5xl">person_search</span>
              <p className="text-xs font-bold uppercase mt-2">Nenhum registro encontrado</p>
            </div>
          )}
        </section>
      </main>

      <BottomNav activeScreen="dashboard" navigateTo={navigateTo} />
    </div>
  );
};

export default Dashboard;