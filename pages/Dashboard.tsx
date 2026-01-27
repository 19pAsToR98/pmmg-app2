import React, { useState, useMemo } from 'react';
import { Screen, Suspect } from '../types';
import BottomNav from '../components/BottomNav';

interface DashboardProps {
  navigateTo: (screen: Screen) => void;
  navigateToSuspectsManagement: (statusFilter: Suspect['status'] | 'Todos') => void;
  onOpenProfile: (id: string) => void;
  suspects: Suspect[];
}

const statusMap = {
  'Foragido': { label: 'Foragido', color: 'pmmg-red', icon: 'warning' },
  'Suspeito': { label: 'Suspeito', color: 'pmmg-yellow', icon: 'visibility' },
  'Preso': { label: 'Preso', color: 'pmmg-dark-grey', icon: 'lock' },
  'CPF Cancelado': { label: 'CPF Cancelado', color: 'pmmg-dark-grey', icon: 'person_off' },
};

const Dashboard: React.FC<DashboardProps> = ({ navigateTo, navigateToSuspectsManagement, onOpenProfile, suspects }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { totalCount, statusCounts, recentSuspects } = useMemo(() => {
    const counts = {
      'Suspeito': 0,
      'Foragido': 0,
      'Preso': 0,
      'CPF Cancelado': 0,
    };

    suspects.forEach(s => {
      if (s.status in counts) {
        counts[s.status as keyof typeof counts]++;
      }
    });

    // Mocking 'Abordados' count as total - Preso - CPF Cancelado
    const total = suspects.length;
    const abordados = total - counts['Preso'] - counts['CPF Cancelado'];

    // Filter and sort recent suspects (top 2, excluding 'Preso' or 'CPF Cancelado')
    const recent = suspects
      .filter(s => s.status !== 'Preso' && s.status !== 'CPF Cancelado')
      .slice(0, 2);

    return {
      totalCount: total,
      statusCounts: {
        ...counts,
        'Abordados': Math.max(0, abordados)
      },
      recentSuspects: recent
    };
  }, [suspects]);

  const filteredSuspects = useMemo(() => {
    if (!searchTerm) return [];
    const termLower = searchTerm.toLowerCase();
    return suspects.filter(s => 
      s.name.toLowerCase().includes(termLower) || 
      s.cpf.includes(searchTerm)
    ).slice(0, 5);
  }, [suspects, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden relative">
      <header className="bg-pmmg-navy px-5 pt-10 pb-8 rounded-b-[2.5rem] shadow-2xl relative z-10 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-inner">
              <span className="material-symbols-outlined text-pmmg-navy text-2xl">shield</span>
            </div>
            <div>
              <h1 className="font-black text-lg text-white leading-tight tracking-tight">TACTICAL DB</h1>
              <p className="text-[10px] text-pmmg-khaki font-bold uppercase tracking-widest">Personal Manager</p>
            </div>
          </div>
          <button 
            onClick={() => navigateTo('profileSettings')}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-white">person</span>
          </button>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-pmmg-navy/50 text-2xl">search</span>
          </div>
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 bg-white border-0 focus:ring-4 focus:ring-pmmg-yellow rounded-2xl text-base font-medium placeholder-pmmg-navy/40 shadow-lg" 
            placeholder="Pesquisar Nome ou CPF" 
            type="text" 
          />
        </div>
      </header>

      <main className="flex-1 px-5 -mt-4 space-y-6 relative z-0 overflow-y-auto pb-32 no-scrollbar">
        
        {/* Search Results Overlay */}
        {searchTerm && (
          <div className="absolute top-20 left-0 right-0 z-20 px-5">
            <div className="pmmg-card p-3 space-y-2">
              <p className="text-[10px] font-bold text-pmmg-navy/60 uppercase tracking-widest">
                Resultados da Busca ({filteredSuspects.length})
              </p>
              {filteredSuspects.length > 0 ? filteredSuspects.map(s => {
                const statusInfo = statusMap[s.status as keyof typeof statusMap];
                if (!statusInfo) return null;
                
                return (
                  <button 
                    key={s.id}
                    onClick={() => {
                      onOpenProfile(s.id);
                      setSearchTerm('');
                    }}
                    className="flex items-center p-2 gap-3 bg-pmmg-khaki-light/50 rounded-lg w-full text-left active:bg-pmmg-khaki/70 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 shrink-0">
                      <img alt="Photo" className="w-full h-full object-cover" src={s.photoUrl}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-pmmg-navy uppercase truncate">{s.name}</h4>
                      <p className="text-[9px] font-medium text-slate-500">CPF: {s.cpf.substring(0, 3)}.***.***-{s.cpf.substring(s.cpf.length - 2)}</p>
                    </div>
                    <div className={`px-2 py-0.5 rounded-md bg-${statusInfo.color}/10 text-${statusInfo.color} text-[7px] font-black uppercase shrink-0`}>
                      {s.status}
                    </div>
                  </button>
                );
              }) : (
                <p className="text-[10px] text-pmmg-navy/50 mt-2 text-center italic">Nenhum resultado encontrado.</p>
              )}
              {filteredSuspects.length === 5 && (
                <button 
                  onClick={() => {
                    navigateToSuspectsManagement('Todos');
                    setSearchTerm('');
                  }}
                  className="w-full text-center text-[9px] font-bold text-pmmg-blue uppercase pt-2 border-t border-pmmg-navy/5 hover:underline"
                >
                  Ver mais resultados...
                </button>
              )}
            </div>
          </div>
        )}

        {/* Only show main content if search is inactive */}
        {!searchTerm && (
          <>
            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[11px] font-black text-pmmg-navy uppercase tracking-widest">Meu Banco de Dados</h3>
                <span className="text-[10px] font-bold text-pmmg-navy/70">Total: {totalCount}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Abordados */}
                <button 
                  onClick={() => navigateToSuspectsManagement('Todos')}
                  className="pmmg-card p-4 flex flex-col transition-transform active:scale-95"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Abordados</span>
                  <span className="text-2xl font-black text-pmmg-navy mt-1">{statusCounts.Abordados}</span>
                </button>
                
                {/* Suspeitos */}
                <button 
                  onClick={() => navigateToSuspectsManagement('Suspeito')}
                  className="pmmg-card p-4 flex flex-col border-l-4 border-pmmg-yellow transition-transform active:scale-95"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Suspeitos</span>
                  <span className="text-2xl font-black text-pmmg-navy mt-1">{statusCounts.Suspeito}</span>
                </button>
                
                {/* Foragidos */}
                <button 
                  onClick={() => navigateToSuspectsManagement('Foragido')}
                  className="pmmg-card p-4 flex flex-col border-l-4 border-pmmg-red transition-transform active:scale-95"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Foragidos</span>
                  <span className="text-2xl font-black text-pmmg-red mt-1">{statusCounts.Foragido}</span>
                </button>
                
                {/* CPF Cancelado */}
                <button 
                  onClick={() => navigateToSuspectsManagement('CPF Cancelado')}
                  className="pmmg-card p-4 flex flex-col border-l-4 border-pmmg-dark-grey transition-transform active:scale-95"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase">CPF Cancelado</span>
                  <span className="text-2xl font-black text-pmmg-dark-grey mt-1">{statusCounts['CPF Cancelado']}</span>
                </button>
              </div>
            </section>
            
            <section className="flex justify-center">
              <button 
                onClick={() => navigateTo('registry')}
                className="w-full bg-pmmg-navy hover:bg-pmmg-navy/90 text-white py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined fill-icon text-pmmg-yellow text-2xl">person_add</span>
                <span className="font-extrabold uppercase tracking-tight">Novo Cadastro</span>
              </button>
            </section>
            
            <section className="space-y-3">
              <h3 className="text-[11px] font-black text-pmmg-navy uppercase tracking-widest px-1">Ferramentas de IA</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => navigateTo('aiTools')}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-pmmg-navy/5 flex flex-col items-center gap-2 active:bg-slate-50 active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-pmmg-blue/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-pmmg-blue text-2xl">minor_crash</span>
                  </div>
                  <span className="text-[10px] font-bold text-pmmg-navy uppercase text-center">Consultar Placa</span>
                </button>
                <button 
                  onClick={() => navigateTo('aiTools')}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-pmmg-navy/5 flex flex-col items-center gap-2 active:bg-slate-50 active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-pmmg-yellow/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-pmmg-yellow text-2xl">psychology</span>
                  </div>
                  <span className="text-[10px] font-bold text-pmmg-navy uppercase text-center">Assistente de Relatos</span>
                </button>
              </div>
            </section>
            
            <section className="space-y-3 pb-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[11px] font-black text-pmmg-navy uppercase tracking-widest">Registros Recentes</h3>
                <button 
                  onClick={() => navigateToSuspectsManagement('Todos')}
                  className="text-[10px] font-bold text-pmmg-blue uppercase hover:underline"
                >
                  Ver Todos ({totalCount})
                </button>
              </div>
              <div className="space-y-2">
                {recentSuspects.map(s => {
                  const statusInfo = statusMap[s.status as keyof typeof statusMap];
                  if (!statusInfo) return null;
                  
                  return (
                    <button 
                      key={s.id}
                      onClick={() => onOpenProfile(s.id)}
                      className="pmmg-card flex items-center p-3 gap-3 active:bg-slate-50 transition-colors w-full text-left"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                        <img alt="Photo" className="w-full h-full object-cover" src={s.photoUrl}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-pmmg-navy uppercase truncate">{s.name}</h4>
                        <p className="text-[10px] font-medium text-slate-400">CPF: {s.cpf.substring(0, 3)}.***.***-{s.cpf.substring(s.cpf.length - 2)}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-md bg-${statusInfo.color}/10 text-${statusInfo.color} text-[8px] font-black uppercase`}>
                        {s.status}
                      </div>
                    </button>
                  );
                })}
                {recentSuspects.length === 0 && (
                  <p className="text-center text-xs text-slate-400 italic py-4">Nenhum registro recente para exibir.</p>
                )}
              </div>
            </section>
          </>
        )}
      </main>
      
      <BottomNav activeScreen="dashboard" navigateTo={navigateTo} />
    </div>
  );
};

export default Dashboard;