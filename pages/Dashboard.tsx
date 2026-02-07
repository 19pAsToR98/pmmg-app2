import React, { useMemo } from 'react';
import { Screen, Suspect, UserAvatar } from '../types';
import AdImageSlider from '../components/AdImageSlider';
import InstagramPostSlider from '../components/InstagramPostSlider';

interface DashboardProps {
  navigateTo: (screen: Screen) => void;
  navigateToSuspectsManagement: (status: Suspect['status'] | 'Todos') => void;
  onOpenProfile: (id: string) => void;
  suspects: Suspect[];
  startShareFlow: (suspectId: string) => void;
  aiAvatar: UserAvatar;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  navigateTo, 
  navigateToSuspectsManagement, 
  onOpenProfile, 
  suspects, 
  startShareFlow 
}) => {
  
  // ============ MEMOIZAÇÃO PARA PERFORMANCE ============
  const recentSuspects = useMemo(() => {
    // Ordenar por data de atualização antes de pegar os 5 mais recentes
    return [...suspects]
      .sort((a, b) => new Date(b.lastSeenDate || 0).getTime() - new Date(a.lastSeenDate || 0).getTime())
      .slice(0, 5);
  }, [suspects]);

  const stats = useMemo(() => ({
    foragidos: suspects.filter(s => s.status === 'Foragido').length,
    suspeitos: suspects.filter(s => s.status === 'Suspeito').length,
    presos: suspects.filter(s => s.status === 'Preso').length,
    total: suspects.length,
  }), [suspects]);

  // ============ HANDLERS ============
  const handleCardClick = (status: Suspect['status'] | 'Todos') => {
    navigateToSuspectsManagement(status);
  };
  
  const handleViewOnMap = (suspect: Suspect, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof suspect.lat === 'number' && typeof suspect.lng === 'number') {
      navigateTo('map');
    } else {
      alert("Localização não registrada para este indivíduo.");
    }
  };

  // ============ COMPONENTES ============
  
  // Status Badge Moderno
  const StatusBadge = ({ status }: { status: Suspect['status'] }) => {
    const config = {
      'Foragido': { bg: 'bg-gradient-to-r from-pmmg-red to-red-700', text: 'text-white', icon: 'priority_high' },
      'Suspeito': { bg: 'bg-gradient-to-r from-pmmg-yellow to-yellow-500', text: 'text-primary-dark', icon: 'warning' },
      'Preso': { bg: 'bg-gradient-to-r from-pmmg-blue to-blue-700', text: 'text-white', icon: 'lock' },
    }[status] || { bg: 'bg-slate-600', text: 'text-white', icon: 'help' };

    return (
      <div className={`${config.bg} ${config.text} flex items-center gap-1.5 px-2.5 py-1 rounded-lg shadow-lg border border-white/20`}>
        <span className="material-symbols-outlined text-base font-bold">{config.icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
      </div>
    );
  };

  // Card de Suspeito Redesign
  const SuspectCard = ({ suspect }: { suspect: Suspect }) => (
    <div 
      onClick={() => onOpenProfile(suspect.id)}
      className="group cursor-pointer bg-white/50 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-pmmg-navy/10 dark:border-slate-700 hover:border-pmmg-navy/30 dark:hover:border-slate-600 hover:shadow-xl dark:hover:shadow-slate-900/50 transition-all duration-300 overflow-hidden relative"
    >
      {/* Efeito de destaque no hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-pmmg-navy/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex">
        {/* Imagem com overlay elegante */}
        <div className="w-32 h-40 relative bg-slate-200 dark:bg-slate-700/50 overflow-hidden shrink-0">
          <img 
            alt={suspect.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            src={suspect.photoUrl} 
            onError={(e) => e.currentTarget.src = '/placeholder-avatar.png'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badge de status no canto superior esquerdo */}
          <div className="absolute top-2 left-2 z-10">
            <StatusBadge status={suspect.status} />
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Header com nome e ícone de alerta */}
            <div className="flex items-start justify-between">
              <h4 className="font-black text-sm text-pmmg-navy dark:text-white uppercase tracking-tight leading-tight line-clamp-1">
                {suspect.name}
              </h4>
              {suspect.status === 'Foragido' && (
                <span className="material-symbols-outlined text-xl text-pmmg-red animate-pulse">
                  emergency
                </span>
              )}
            </div>

            {/* CPF */}
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px] text-pmmg-navy/60 dark:text-slate-400">badge</span>
              <span className="text-[11px] font-medium text-pmmg-navy/70 dark:text-slate-300">{suspect.cpf}</span>
            </div>

            {/* Localização */}
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px] text-pmmg-navy/60 dark:text-slate-400">location_on</span>
              <span className="text-[11px] font-medium text-pmmg-navy/70 dark:text-slate-300 line-clamp-1">
                {suspect.lastSeen}
              </span>
            </div>

            {/* Tempo desde último avistamento */}
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px] text-pmmg-navy/60 dark:text-slate-400">schedule</span>
              <span className="text-[11px] font-bold text-pmmg-navy/80 dark:text-slate-200">
                Atualizado: {suspect.timeAgo}
              </span>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-2 border-t border-pmmg-navy/10 dark:border-slate-700">
            <button 
              onClick={(e) => { e.stopPropagation(); onOpenProfile(suspect.id); }}
              className="flex-1 bg-gradient-to-r from-pmmg-navy to-blue-900 text-white text-[10px] font-bold py-2 rounded-xl uppercase tracking-wide hover:from-blue-900 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-base mr-1 align-middle">folder_special</span>
              Ficha
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); startShareFlow(suspect.id); }}
              className="w-10 h-10 bg-white/80 dark:bg-slate-700 border-2 border-pmmg-navy/20 dark:border-slate-600 rounded-xl flex items-center justify-center hover:bg-pmmg-yellow hover:border-pmmg-yellow transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.95]"
              title="Compartilhar"
            >
              <span className="material-symbols-outlined text-pmmg-navy dark:text-white text-lg">share</span>
            </button>
            
            {suspect.lat && suspect.lng && (
              <button 
                onClick={(e) => handleViewOnMap(suspect, e)}
                className="w-10 h-10 bg-white/80 dark:bg-slate-700 border-2 border-pmmg-navy/20 dark:border-slate-600 rounded-xl flex items-center justify-center hover:bg-pmmg-blue hover:border-pmmg-blue transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.95]"
                title="Ver no Mapa"
              >
                <span className="material-symbols-outlined text-pmmg-navy dark:text-white text-lg">map</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-pmmg-khaki/30 to-pmmg-khaki/10 dark:from-slate-900 dark:to-slate-900/80 overflow-hidden">
      
      {/* ============ HEADER DESKTOP REFORMULADO ============ */}
      <header className="hidden lg:flex sticky top-0 z-50 bg-gradient-to-r from-pmmg-navy/95 to-blue-900/95 backdrop-blur-xl px-8 py-3 shadow-2xl border-b border-pmmg-yellow/30">
        <div className="flex items-center justify-between w-full max-w-[1920px] mx-auto">
          
          {/* Logo e Título */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pmmg-yellow to-yellow-400 rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
              <span className="material-symbols-outlined text-pmmg-navy text-2xl font-bold">shield</span>
            </div>
            <div>
              <h1 className="font-black text-xl text-white uppercase tracking-tighter">
                Painel Tático Operacional
              </h1>
              <p className="text-[10px] font-medium text-pmmg-yellow/90 uppercase tracking-widest mt-0.5">
                Sistema Integrado de Inteligência
              </p>
            </div>
          </div>

          {/* Controles e Busca */}
          <div className="flex items-center gap-6">
            {/* Status da Patrulha */}
            <div className="text-right">
              <div className="text-[10px] font-bold text-white/80 uppercase">Patrulha 402</div>
              <div className="mt-1 flex items-center justify-end gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[11px] font-bold text-green-400 uppercase">Online</span>
                </div>
                <span className="text-[11px] font-bold text-white/60">|</span>
                <span className="text-[11px] font-bold text-white/80">12 Agentes</span>
              </div>
            </div>

            {/* Barra de Busca Moderna */}
            <button 
              onClick={() => navigateToSuspectsManagement('Todos')}
              className="group relative w-96"
            >
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-white/70 text-xl">search</span>
              </div>
              <div className="relative">
                <div 
                  className="block w-full pl-12 pr-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 text-sm font-bold text-white/90 placeholder-white/50 shadow-lg hover:shadow-xl cursor-text"
                >
                  BUSCAR INDIVÍDUO (NOME, CPF, ALCUNHA)
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              </div>
            </button>

            {/* Botão de Novo Registro */}
            <button 
              onClick={() => navigateTo('registry')}
              className="bg-gradient-to-r from-pmmg-yellow to-yellow-400 text-pmmg-navy font-black py-3 px-6 rounded-2xl uppercase tracking-wider text-sm shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] border-2 border-white"
            >
              <span className="material-symbols-outlined text-xl mr-2 align-middle">person_add</span>
              Novo Registro
            </button>
          </div>
        </div>
      </header>

      {/* ============ MOBILE HEADER (MANTIDO) ============ */}
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 pt-4 pb-4 shadow-xl lg:hidden">
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
            <button 
              onClick={() => navigateTo('profileSettings')}
              className="bg-white/10 p-1.5 rounded-full border border-white/20 text-white"
            >
              <span className="material-symbols-outlined text-xl">person</span>
            </button>
          </div>
        </div>

        <button 
          onClick={() => navigateToSuspectsManagement('Todos')}
          className="w-full relative group text-left active:scale-[0.99] transition-transform"
        >
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-primary-dark text-xl">search</span>
          </div>
          <div 
            className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 rounded-xl border-2 border-pmmg-navy/20 dark:border-slate-600 focus:border-pmmg-navy focus:ring-0 text-sm font-bold placeholder-pmmg-navy/40 shadow-sm text-pmmg-navy/60 dark:text-slate-300 dark:placeholder-slate-500 whitespace-nowrap overflow-hidden" 
          >
            BUSCAR INDIVÍDUO (NOME, CPF, ALCUNHA)
          </div>
        </button>
      </header>

      {/* ============ MAIN CONTENT - NOVO LAYOUT ============ */}
      <main className="flex-1 overflow-y-auto pb-8 no-scrollbar">
        <div className="max-w-[1920px] mx-auto px-6 py-8">
          
          {/* Grid Principal: 2 colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* ============ COLUNA ESQUERDA: Estatísticas + Alertas ============ */}
            <div className="lg:col-span-3 space-y-8">
              
              {/* Seção de Estatísticas com Design Moderno */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-1 bg-gradient-to-b from-pmmg-red to-red-700 rounded-full" />
                    <h2 className="font-black text-lg text-pmmg-navy dark:text-white uppercase tracking-wider">
                      Visão Geral do Sistema
                    </h2>
                  </div>
                  <span className="text-[11px] font-bold text-pmmg-navy/40 dark:text-slate-500 uppercase">
                    {new Date().toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>

                {/* Grid de Cards de Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Card Foragidos */}
                  <button 
                    onClick={() => handleCardClick('Foragido')}
                    className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/10 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 hover:border-red-400 dark:hover:border-red-700 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold uppercase text-red-700 dark:text-red-300 tracking-wider">
                          Foragidos Ativos
                        </span>
                        <span className="material-symbols-outlined text-3xl text-red-400 dark:text-red-600/70">
                          emergency
                        </span>
                      </div>
                      <div className="text-4xl font-black text-red-800 dark:text-red-200 mb-1">
                        {stats.foragidos}
                      </div>
                      <div className="h-1 w-full bg-red-200 dark:bg-red-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-red-700 rounded-full transition-all duration-500"
                          style={{ width: `${(stats.foragidos / stats.total) * 100 || 0}%` }}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Card Suspeitos */}
                  <button 
                    onClick={() => handleCardClick('Suspeito')}
                    className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-900/10 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 hover:border-yellow-400 dark:hover:border-yellow-700 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold uppercase text-yellow-800 dark:text-yellow-300 tracking-wider">
                          Sob Vigilância
                        </span>
                        <span className="material-symbols-outlined text-3xl text-yellow-400 dark:text-yellow-600/70">
                          visibility
                        </span>
                      </div>
                      <div className="text-4xl font-black text-yellow-900 dark:text-yellow-200 mb-1">
                        {stats.suspeitos}
                      </div>
                      <div className="h-1 w-full bg-yellow-200 dark:bg-yellow-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-full transition-all duration-500"
                          style={{ width: `${(stats.suspeitos / stats.total) * 100 || 0}%` }}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Card Presos */}
                  <button 
                    onClick={() => handleCardClick('Preso')}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-300 tracking-wider">
                          Sob Custódia
                        </span>
                        <span className="material-symbols-outlined text-3xl text-blue-400 dark:text-blue-600/70">
                          lock
                        </span>
                      </div>
                      <div className="text-4xl font-black text-blue-800 dark:text-blue-200 mb-1">
                        {stats.presos}
                      </div>
                      <div className="h-1 w-full bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-500"
                          style={{ width: `${(stats.presos / stats.total) * 100 || 0}%` }}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Card Total */}
                  <button 
                    onClick={() => handleCardClick('Todos')}
                    className="bg-gradient-to-br from-pmmg-navy to-blue-900 border-2 border-blue-900/50 rounded-2xl p-6 hover:border-blue-700 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold uppercase text-white/80 tracking-wider">
                          Total de Registros
                        </span>
                        <span className="material-symbols-outlined text-3xl text-white/40">
                          database
                        </span>
                      </div>
                      <div className="text-4xl font-black text-white mb-1">
                        {stats.total}
                      </div>
                      <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-pmmg-yellow to-yellow-400 rounded-full transition-all duration-500"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </button>
                </div>
              </section>

              {/* Seção de Alertas Recentes */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-1 bg-gradient-to-b from-pmmg-red to-red-700 rounded-full" />
                    <h2 className="font-black text-lg text-pmmg-navy dark:text-white uppercase tracking-wider">
                      Alertas e Registros Recentes
                    </h2>
                  </div>
                  <button 
                    onClick={() => navigateToSuspectsManagement('Todos')}
                    className="text-[11px] font-black text-pmmg-navy/60 dark:text-slate-400 uppercase hover:text-pmmg-navy dark:hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    Ver Todos
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>

                {recentSuspects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {recentSuspects.map((s) => <SuspectCard key={s.id} suspect={s} />)}
                  </div>
                ) : (
                  <div className="bg-white/50 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-pmmg-navy/20 dark:border-slate-700 p-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-pmmg-navy/30 dark:text-slate-600 mb-4">
                      inbox_zero
                    </span>
                    <p className="text-sm font-bold text-pmmg-navy/60 dark:text-slate-400 uppercase tracking-widest">
                      Nenhum registro recente encontrado
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* ============ COLUNA DIREITA: Sliders ============ */}
            <div className="lg:col-span-1 space-y-6">
              <AdImageSlider />
              <InstagramPostSlider />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;