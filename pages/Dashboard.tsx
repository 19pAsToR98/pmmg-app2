import React, { useState } from 'react';
import { Screen, Suspect } from '../types';
import BottomNav from '../components/BottomNav';

interface DashboardProps {
  navigateTo: (screen: Screen) => void;
  navigateToSuspectsManagement: (status: Suspect['status'] | 'Todos') => void;
  onOpenProfile: (id: string) => void;
  suspects: Suspect[];
}

const Dashboard: React.FC<DashboardProps> = ({ navigateTo, navigateToSuspectsManagement, onOpenProfile, suspects }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Quick filter for recent alerts on the dashboard (limited to top 5 if no search term)
  const filteredSuspects = suspects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cpf.includes(searchTerm) ||
    (s.nickname && s.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, searchTerm ? suspects.length : 5); 

  // Stats calculation, including a mock value for 'Abordados'
  const stats = {
    abordados: 215, // Mock value based on image
    foragidos: suspects.filter(s => s.status === 'Foragido').length,
    suspeitos: suspects.filter(s => s.status === 'Suspeito').length,
    cancelados: suspects.filter(s => s.status === 'CPF Cancelado').length,
  };

  const STAT_CARDS = [
    { label: 'ABORDADOS', value: stats.abordados, color: 'text-pmmg-navy', action: () => navigateToSuspectsManagement('Todos') },
    { label: 'SUSPEITOS', value: stats.suspeitos, color: 'text-pmmg-navy', action: () => navigateToSuspectsManagement('Suspeito') },
    { label: 'FORAGIDOS', value: stats.foragidos, color: 'text-pmmg-red', action: () => navigateToSuspectsManagement('Foragido') },
    { label: 'CPF CANCELADO', value: stats.cancelados, color: 'text-pmmg-navy', action: () => navigateToSuspectsManagement('CPF Cancelado') },
  ];

  const handleSearchSubmit = () => {
    // If the user presses enter, we can navigate to the full management page.
    if (searchTerm.trim()) {
      navigateToSuspectsManagement('Todos');
    }
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      
      {/* Header Section (Redesigned) */}
      <header className="sticky top-0 z-50 bg-pmmg-navy px-6 pt-12 pb-20 rounded-b-[40px] shadow-2xl relative shrink-0">
        <div className="flex items-center justify-between relative z-10 mb-6">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center p-1 border-2 border-pmmg-yellow/50 shadow-inner">
              <span className="material-symbols-outlined text-pmmg-navy text-xl">shield</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none text-white uppercase tracking-tight">TACTICAL DB</h1>
              <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-0.5">Personal Manager</p>
            </div>
          </div>
          {/* Profile Button */}
          <button 
            onClick={() => navigateTo('profileSettings')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white border border-white/10"
          >
            <span className="material-symbols-outlined text-2xl">person</span>
          </button>
        </div>

        {/* Search Bar (Prominent) */}
        <div className="absolute left-4 right-4 -bottom-8 z-20">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-pmmg-navy/50 text-xl">search</span>
            </div>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              className="block w-full pl-12 pr-4 py-4 bg-white border-none focus:ring-4 focus:ring-pmmg-yellow/20 rounded-2xl text-sm font-bold placeholder-pmmg-navy/40 shadow-xl" 
              placeholder="Pesquisar Nome ou CPF" 
              type="text" 
            />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar px-4 pt-12">
        
        {/* Stats Grid (2x2) */}
        <section className="grid grid-cols-2 gap-3 mb-6">
          {STAT_CARDS.map((card, index) => (
            <button 
              key={index} 
              onClick={card.action} 
              className="bg-white p-4 rounded-xl shadow-md active:scale-[0.98] transition-transform text-left border border-pmmg-navy/5"
            >
              <span className="text-[10px] font-bold uppercase text-pmmg-navy/60 block mb-1">{card.label}</span>
              <span className={`text-3xl font-black ${card.color}`}>{card.value.toString().padStart(2, '0')}</span>
            </button>
          ))}
        </section>

        {/* Novo Cadastro Button */}
        <button 
          onClick={() => navigateTo('registry')}
          className="w-full bg-pmmg-navy text-pmmg-yellow font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 uppercase tracking-widest active:scale-[0.98] transition-transform mb-8"
        >
          <span className="material-symbols-outlined text-2xl fill-icon">person_add</span>
          Novo Cadastro
        </button>

        {/* Ferramentas de IA Section */}
        <section className="mb-8">
          <h3 className="text-[11px] font-bold text-pmmg-navy/60 uppercase tracking-wider mb-3">Ferramentas de IA</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Consultar Placa */}
            <button 
              onClick={() => navigateTo('aiTools')}
              className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-transform border border-pmmg-navy/5"
            >
              <div className="w-12 h-12 rounded-full bg-pmmg-navy/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-pmmg-blue text-2xl fill-icon">directions_car</span>
              </div>
              <span className="text-[10px] font-bold text-pmmg-navy uppercase text-center leading-tight">Consultar Placa</span>
            </button>
            {/* Assistente de Relatos */}
            <button 
              onClick={() => navigateTo('aiTools')}
              className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-transform border border-pmmg-navy/5"
            >
              <div className="w-12 h-12 rounded-full bg-pmmg-navy/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-pmmg-blue text-2xl fill-icon">psychology</span>
              </div>
              <span className="text-[10px] font-bold text-pmmg-navy uppercase text-center leading-tight">Assistente de Relatos</span>
            </button>
          </div>
        </section>

        {/* Registros Recentes */}
        <div className="pt-4 pb-3 flex items-center justify-between">
          <h3 className="font-bold text-xs text-pmmg-navy uppercase tracking-widest">Registros Recentes</h3>
          <button 
            onClick={() => navigateToSuspectsManagement('Todos')}
            className="text-[10px] font-bold text-pmmg-navy/60 uppercase hover:text-pmmg-navy"
          >
            Ver Todos
          </button>
        </div>

        <section className="space-y-3">
          {filteredSuspects.length > 0 ? filteredSuspects.map((alert) => (
            <div 
              key={alert.id} 
              onClick={() => onOpenProfile(alert.id)}
              className="bg-white p-3 rounded-xl shadow-md flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform border border-pmmg-navy/5"
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                <img alt={alert.name} className="w-full h-full object-cover" src={alert.photoUrl} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-pmmg-navy uppercase leading-tight truncate pr-1">{alert.name}</h4>
                  <span className={`text-white text-[8px] font-black px-2 py-0.5 rounded shadow-sm uppercase shrink-0 ${
                    alert.status === 'Foragido' ? 'bg-pmmg-red' : 
                    alert.status === 'Suspeito' ? 'bg-pmmg-yellow text-pmmg-navy' :
                    alert.status === 'Preso' ? 'bg-pmmg-blue' : 'bg-slate-700'
                  }`}>
                    {alert.status}
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-slate-500 mt-1">CPF: {alert.cpf.substring(0, 4)}***.***-{alert.cpf.substring(alert.cpf.length - 2)}</p>
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