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
  
  // ============ MEMOIZAÇÃO ============
  const recentSuspects = useMemo(() => {
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

  // ============ COMPONENTES TÁTICOS ============
  
  // LED Status Indicator
  const LEDIndicator = ({ active = true, label }: { active: boolean; label: string }) => (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-pmmg-navy/50 rounded">
      <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} />
      <span className="font-mono text-[10px] font-bold text-white/80 uppercase tracking-widest">{label}</span>
    </div>
  );

  // Status Badge Tático
  const TacticalStatusBadge = ({ status }: { status: Suspect['status'] }) => {
    const config = {
      'Foragido': { bg: 'bg-red-900/90', border: 'border-red-700', text: 'text-red-300', icon: 'dangerous' },
      'Suspeito': { bg: 'bg-yellow-900/90', border: 'border-yellow-700', text: 'text-yellow-200', icon: 'warning' },
      'Preso': { bg: 'bg-blue-900/90', border: 'border-blue-700', text: 'text-blue-200', icon: 'verified' },
    }[status] || { bg: 'bg-gray-800', border: 'border-gray-600', text: 'text-gray-300', icon: 'help' };

    return (
      <div className={`${config.bg} ${config.border} ${config.text} border-2 flex items-center gap-1.5 px-3 py-1 rounded font-mono text-[10px] font-bold uppercase tracking-widest`}>
        <span className="material-symbols-outlined text-base">{config.icon}</span>
        <span>{status}</span>
      </div>
    );
  };

  // Card de Suspeito Tático
  const TacticalSuspectCard = ({ suspect }: { suspect: Suspect }) => (
    <div 
      onClick={() => onOpenProfile(suspect.id)}
      className="group cursor-pointer bg-black/30 backdrop-blur-sm border-2 border-pmmg-navy/40 hover:border-pmmg-yellow/60 transition-all duration-200 rounded-lg overflow-hidden relative"
    >
      {/* Grid overlay tático */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f20_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f20_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative z-10 p-4">
        <div className="flex gap-4">
          {/* Foto com borda tática */}
          <div className="w-24 h-32 relative bg-gray-800 border-2 border-pmmg-navy/50 rounded overflow-hidden shrink-0">
            <img 
              alt={suspect.name} 
              className="w-full h-full object-cover" 
              src={suspect.photoUrl} 
              onError={(e) => e.currentTarget.src = '/placeholder-avatar.png'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            
            {/* Badge de status no topo */}
            <div className="absolute top-2 left-2 z-10">
              <TacticalStatusBadge status={suspect.status} />
            </div>
          </div>

          {/* Informações táticas */}
          <div className="flex-1 space-y-3">
            {/* Header com nome e prioridade */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-mono text-sm font-bold text-white uppercase tracking-tight">
                  {suspect.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-[10px] text-pmmg-yellow/90 font-bold">ID:</span>
                  <span className="font-mono text-[10px] text-white/60">{suspect.cpf}</span>
                </div>
              </div>
              {suspect.status === 'Foragido' && (
                <div className="bg-red-900/90 border-2 border-red-600 px-2 py-1 rounded font-mono text-[9px] font-bold text-red-300 uppercase tracking-widest animate-pulse">
                  PRIORIDADE ALTA
                </div>
              )}
            </div>

            {/* Grid de informações táticas */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-pmmg-yellow/80">location_on</span>
                <div>
                  <div className="font-mono text-[10px] text-white/50 uppercase">ÚLTIMA POSIÇÃO</div>
                  <div className="font-mono text-xs font-bold text-white">{suspect.lastSeen}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-pmmg-yellow/80">schedule</span>
                <div>
                  <div className="font-mono text-[10px] text-white/50 uppercase">TEMPO DESDE CONTATO</div>
                  <div className="font-mono text-xs font-bold text-white">{suspect.timeAgo}</div>
                </div>
              </div>

              {suspect.lat && suspect.lng && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-pmmg-yellow/80">coordinate</span>
                  <div>
                    <div className="font-mono text-[10px] text-white/50 uppercase">COORDENADAS GPS</div>
                    <div className="font-mono text-[10px] font-bold text-pmmg-blue">
                      {suspect.lat.toFixed(4)}, {suspect.lng.toFixed(4)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Barra de ameaça/risco */}
            {suspect.status === 'Foragido' && (
              <div className="mt-2">
                <div className="font-mono text-[9px] text-red-400 font-bold uppercase mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">assessment</span>
                  NÍVEL DE AMEAÇA
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden border border-red-900/50">
                  <div className="h-full bg-gradient-to-r from-red-600 to-red-400 w-4/5 animate-pulse-slow" />
                </div>
              </div>
            )}

            {/* Ações táticas */}
            <div className="flex gap-2 pt-3 border-t border-pmmg-navy/30">
              <button 
                onClick={(e) => { e.stopPropagation(); onOpenProfile(suspect.id); }}
                className="flex-1 bg-pmmg-navy border-2 border-pmmg-yellow/30 text-white font-mono text-[10px] font-bold py-2 rounded hover:bg-pmmg-yellow hover:text-pmmg-navy transition-all duration-200"
              >
                <span className="material-symbols-outlined text-base mr-1 align-middle">folder</span>
                FICHA OPERACIONAL
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); startShareFlow(suspect.id); }}
                className="w-10 h-10 bg-black/50 border-2 border-pmmg-navy/50 text-pmmg-yellow hover:bg-pmmg-navy hover:border-pmmg-yellow transition-all duration-200 rounded flex items-center justify-center"
                title="Compartilhar Inteligência"
              >
                <span className="material-symbols-outlined text-lg">share</span>
              </button>
              
              {suspect.lat && suspect.lng && (
                <button 
                  onClick={(e) => handleViewOnMap(suspect, e)}
                  className="w-10 h-10 bg-black/50 border-2 border-pmmg-navy/50 text-pmmg-blue hover:bg-pmmg-navy hover:border-pmmg-blue transition-all duration-200 rounded flex items-center justify-center"
                  title="Rastrear no Mapa Tático"
                >
                  <span className="material-symbols-outlined text-lg">map</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Card de Estatística Tático
  const TacticalStatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    onClick,
    percentage 
  }: { 
    title: string; 
    value: number; 
    icon: string; 
    color: string; 
    onClick: () => void;
    percentage?: number;
  }) => (
    <button 
      onClick={onClick}
      className="bg-black/40 border-2 border-pmmg-navy/50 hover:border-pmmg-yellow/60 transition-all duration-200 rounded-lg p-5 w-full text-left relative group overflow-hidden"
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div className="font-mono text-[10px] text-white/60 uppercase tracking-widest">{title}</div>
          <span className={`material-symbols-outlined text-3xl ${color} opacity-30 group-hover:opacity-100 transition-opacity`}>
            {icon}
          </span>
        </div>
        
        <div className="font-mono text-3xl font-bold text-white mb-2">{value}</div>
        
        {percentage !== undefined && (
          <div className="mt-2">
            <div className="font-mono text-[9px] text-white/40 uppercase mb-1">PARTICIPAÇÃO</div>
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
              <div 
                className={`h-full ${color.replace('text', 'bg')} rounded-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="font-mono text-[10px] text-white/60 mt-1">{percentage.toFixed(1)}%</div>
          </div>
        )}
      </div>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-black/95 backdrop-blur-sm overflow-hidden font-sans">
      
      {/* ============ HEADER TÁTICO MILITAR ============ */}
      <header className="hidden lg:flex sticky top-0 z-50 bg-gradient-to-b from-black/95 to-black/80 backdrop-blur-xl border-b-2 border-pmmg-yellow/50 shadow-2xl">
        <div className="max-w-[1920px] mx-auto w-full px-6 py-3">
          <div className="flex items-center justify-between">
            
            {/* Logo Tático Esquerdo */}
            <div className="flex items-center gap-6">
              {/* Badge PMMG Tático */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-black border-2 border-pmmg-yellow rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:12px_12px]" />
                  <span className="material-symbols-outlined text-pmmg-yellow text-3xl font-bold relative z-10">shield</span>
                </div>
                <div className="space-y-0.5">
                  <div className="font-mono text-xs font-bold text-pmmg-yellow tracking-widest">PMMG</div>
                  <div className="font-mono text-[10px] text-white/60 uppercase">Polícia Militar</div>
                  <div className="font-mono text-[9px] text-pmmg-yellow/60 uppercase tracking-wider">Minas Gerais</div>
                </div>
              </div>

              {/* Separador Tático */}
              <div className="h-10 w-0.5 bg-gradient-to-b from-transparent via-pmmg-yellow/50 to-transparent" />

              {/* Título do Sistema */}
              <div>
                <div className="font-mono text-lg font-bold text-white tracking-widest">SISTEMA TÁTICO OPERACIONAL</div>
                <div className="font-mono text-[10px] text-pmmg-yellow/80 uppercase tracking-widest mt-0.5">
                  INTEGRADO DE MONITORAMENTO E INTELIGÊNCIA
                </div>
              </div>
            </div>

            {/* Controles Direita */}
            <div className="flex items-center gap-6">
              {/* Data e Hora Digital */}
              <div className="text-right">
                <div className="font-mono text-lg font-bold text-white">
                  {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="font-mono text-[10px] text-white/60 uppercase tracking-widest mt-0.5">
                  {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-3">
                <LEDIndicator active={true} label="ONLINE" />
                <LEDIndicator active={true} label="SISTEMA" />
                <LEDIndicator active={true} label="REDE" />
              </div>

              {/* Barra de Busca Tática */}
              <button 
                onClick={() => navigateToSuspectsManagement('Todos')}
                className="group relative w-80"
              >
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-pmmg-yellow/60 text-xl">search</span>
                </div>
                <div className="relative">
                  <div 
                    className="block w-full pl-12 pr-5 py-3 bg-black/60 border-2 border-pmmg-navy/50 hover:border-pmmg-yellow/60 transition-all duration-200 rounded font-mono text-sm font-bold text-white/80 placeholder-white/30"
                  >
                    BUSCAR ALVO (NOME, CPF, ID)
                  </div>
                </div>
              </button>

              {/* Botão de Ação Primária */}
              <button 
                onClick={() => navigateTo('registry')}
                className="bg-pmmg-navy border-2 border-pmmg-yellow text-white font-mono text-sm font-bold py-3 px-6 rounded hover:bg-pmmg-yellow hover:text-pmmg-navy transition-all duration-200 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">add</span>
                NOVO ALVO
              </button>
            </div>
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

      {/* ============ MAIN CONTENT - LAYOUT TÁTICO ============ */}
      <main className="flex-1 overflow-y-auto pb-8 no-scrollbar">
        <div className="max-w-[1920px] mx-auto px-6 py-8">
          
          {/* Grid Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* ============ COLUNA ESQUERDA: Estatísticas + Alertas ============ */}
            <div className="lg:col-span-3 space-y-8">
              
              {/* Seção de Estatísticas Táticas */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-1 bg-gradient-to-b from-pmmg-yellow to-yellow-400" />
                    <h2 className="font-mono text-xl font-bold text-white uppercase tracking-widest">
                      PAINEL DE SITUAÇÃO OPERACIONAL
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-white/40 uppercase">TOTAL DE ALVOS:</span>
                    <span className="font-mono text-lg font-bold text-pmmg-yellow">{stats.total}</span>
                  </div>
                </div>

                {/* Grid de Cards Táticos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <TacticalStatCard
                    title="FORAGIDOS ATIVOS"
                    value={stats.foragidos}
                    icon="dangerous"
                    color="text-red-400"
                    onClick={() => handleCardClick('Foragido')}
                    percentage={stats.total > 0 ? (stats.foragidos / stats.total) * 100 : 0}
                  />

                  <TacticalStatCard
                    title="SOB VIGILÂNCIA"
                    value={stats.suspeitos}
                    icon="visibility"
                    color="text-yellow-400"
                    onClick={() => handleCardClick('Suspeito')}
                    percentage={stats.total > 0 ? (stats.suspeitos / stats.total) * 100 : 0}
                  />

                  <TacticalStatCard
                    title="SOB CUSTÓDIA"
                    value={stats.presos}
                    icon="verified"
                    color="text-blue-400"
                    onClick={() => handleCardClick('Preso')}
                    percentage={stats.total > 0 ? (stats.presos / stats.total) * 100 : 0}
                  />

                  <TacticalStatCard
                    title="TOTAL REGISTRADO"
                    value={stats.total}
                    icon="database"
                    color="text-pmmg-yellow"
                    onClick={() => handleCardClick('Todos')}
                  />
                </div>
              </section>

              {/* Seção de Alertas Recentes */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-1 bg-gradient-to-b from-pmmg-yellow to-yellow-400" />
                    <h2 className="font-mono text-xl font-bold text-white uppercase tracking-widest">
                      INTELIGÊNCIA RECENTE
                    </h2>
                  </div>
                  <button 
                    onClick={() => navigateToSuspectsManagement('Todos')}
                    className="font-mono text-[11px] font-bold text-pmmg-yellow/80 uppercase hover:text-pmmg-yellow transition-colors flex items-center gap-1.5"
                  >
                    VER TODOS
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>

                {recentSuspects.length > 0 ? (
                  <div className="space-y-4">
                    {recentSuspects.map((s) => <TacticalSuspectCard key={s.id} suspect={s} />)}
                  </div>
                ) : (
                  <div className="bg-black/40 border-2 border-dashed border-pmmg-navy/50 rounded-lg p-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-pmmg-navy/30 mb-4">
                      inbox_zero
                    </span>
                    <p className="font-mono text-sm font-bold text-white/40 uppercase tracking-widest">
                      NENHUMA INTELIGÊNCIA RECENTE
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