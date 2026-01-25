
import React, { useState, useRef, useEffect } from 'react';
import { Suspect, Screen } from '../types';
import BottomNav from '../components/BottomNav';

interface SuspectListProps {
  onBack: () => void;
  suspects: Suspect[];
  onOpenProfile: (id: string) => void;
  navigateTo: (screen: Screen) => void;
}

const SuspectList: React.FC<SuspectListProps> = ({ onBack, suspects, onOpenProfile, navigateTo }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  // States para filtros
  const [globalSearch, setGlobalSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSuspects = suspects.filter(s => {
    const searchLower = globalSearch.toLowerCase();
    
    // Busca Unificada (Nome, Apelido, Status, Endereço, Veículo)
    const matchesGlobal = !globalSearch || 
      s.name.toLowerCase().includes(searchLower) ||
      (s.nickname || '').toLowerCase().includes(searchLower) ||
      s.status.toLowerCase().includes(searchLower) ||
      s.lastSeen.toLowerCase().includes(searchLower) ||
      (s.vehicle || '').toLowerCase().includes(searchLower) ||
      s.cpf.includes(globalSearch);

    // Filtro de Data
    const matchesDate = !dateFilter || (s.registryDate && s.registryDate.includes(dateFilter));
    
    // Filtro de Status
    const matchesStatus = statusFilter === 'Todos' || s.status === statusFilter;
    
    return matchesGlobal && matchesDate && matchesStatus;
  });

  const statusOptions = ['Todos', 'Foragido', 'Suspeito', 'Preso', 'CPF Cancelado'];

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-[100] bg-pmmg-navy px-4 pt-6 pb-4 shadow-xl shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-white active:scale-90 transition-transform">
              <span className="material-symbols-outlined">arrow_back_ios</span>
            </button>
            <div>
              <h1 className="font-bold text-sm leading-none text-white uppercase tracking-tight">Banco de Dados</h1>
              <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Consulta Unificada SISP</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="bg-white/10 p-2 rounded-lg text-white border border-white/20 active:bg-white/20 transition-all"
              title="Alternar Visualização"
            >
              <span className="material-symbols-outlined text-lg">
                {viewMode === 'grid' ? 'list' : 'grid_view'}
              </span>
            </button>
          </div>
        </div>

        {/* Barra de Pesquisa Única com Ícone de Filtro */}
        <div className="relative group mb-2">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-pmmg-navy text-xl group-focus-within:text-pmmg-yellow transition-colors">manage_search</span>
          </div>
          <input 
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="NOME, VULGO, PLACA OU LOCAL..."
            className="w-full pl-12 pr-24 py-4 bg-white rounded-2xl border-none focus:ring-4 focus:ring-pmmg-yellow/20 text-xs font-black uppercase shadow-inner placeholder:text-slate-400"
          />
          <div className="absolute inset-y-0 right-2 flex items-center gap-1">
            {globalSearch && (
              <button 
                onClick={() => setGlobalSearch('')}
                className="p-1 text-slate-400 hover:text-pmmg-navy transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`p-2 rounded-xl flex items-center justify-center transition-all ${showFilterMenu || statusFilter !== 'Todos' || dateFilter ? 'bg-pmmg-yellow text-pmmg-navy shadow-md' : 'text-pmmg-navy hover:bg-pmmg-navy/5'}`}
            >
              <span className={`material-symbols-outlined text-xl ${showFilterMenu ? 'fill-icon' : ''}`}>tune</span>
            </button>
          </div>

          {/* Menu de Filtro Flutuante */}
          {showFilterMenu && (
            <div 
              ref={filterMenuRef}
              className="absolute top-full right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-pmmg-navy/10 z-[200] p-5 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-pmmg-navy/60">Filtros Avançados</h4>
                <button 
                  onClick={() => { setStatusFilter('Todos'); setDateFilter(''); }}
                  className="text-[9px] font-black text-pmmg-red uppercase"
                >
                  Limpar
                </button>
              </div>

              {/* Status Section */}
              <div className="mb-5">
                <label className="block text-[9px] font-black uppercase text-pmmg-navy/40 mb-2 tracking-wider">Status Operacional</label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setStatusFilter(opt)}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all border ${
                        statusFilter === opt 
                        ? 'bg-pmmg-navy text-white border-pmmg-navy shadow-md' 
                        : 'bg-slate-50 text-pmmg-navy/60 border-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Section */}
              <div>
                <label className="block text-[9px] font-black uppercase text-pmmg-navy/40 mb-2 tracking-wider">Data de Registro</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-pmmg-navy/30">calendar_today</span>
                  <input 
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-pmmg-navy focus:ring-2 focus:ring-pmmg-navy/10 transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={() => setShowFilterMenu(false)}
                className="w-full mt-6 bg-pmmg-navy text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
              >
                Aplicar Filtros
              </button>
            </div>
          )}
        </div>

        {/* Resumo de Filtros Ativos (Chips) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {statusFilter !== 'Todos' && (
            <div className="bg-pmmg-navy/10 text-pmmg-navy px-3 py-1.5 rounded-full text-[8px] font-black uppercase flex items-center gap-1.5 border border-pmmg-navy/10 shrink-0">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter('Todos')} className="material-symbols-outlined text-xs">close</button>
            </div>
          )}
          {dateFilter && (
            <div className="bg-pmmg-navy/10 text-pmmg-navy px-3 py-1.5 rounded-full text-[8px] font-black uppercase flex items-center gap-1.5 border border-pmmg-navy/10 shrink-0">
              Data: {dateFilter.split('-').reverse().join('/')}
              <button onClick={() => setDateFilter('')} className="material-symbols-outlined text-xs">close</button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-40 px-4 pt-4 no-scrollbar">
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-[10px] font-black text-pmmg-navy/50 uppercase tracking-widest italic">
            Exibindo {filteredSuspects.length} resultados táticos
          </span>
          <div className="flex items-center gap-1.5 bg-pmmg-navy/5 px-2 py-1 rounded-full border border-pmmg-navy/5">
             <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
             <span className="text-[8px] font-bold text-pmmg-navy uppercase tracking-tighter">Sincronizado</span>
          </div>
        </div>

        {filteredSuspects.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredSuspects.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => onOpenProfile(s.id)}
                  className="pmmg-card group active:scale-95 transition-all shadow-md flex flex-col h-full"
                >
                  <div className="relative h-44 bg-slate-200 overflow-hidden">
                    <img src={s.photoUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={s.name} />
                    <div className={`absolute top-0 left-0 px-2 py-1 text-[8px] font-black uppercase shadow-lg rounded-br-lg ${
                      s.status === 'Foragido' ? 'bg-pmmg-red text-white' : 
                      s.status === 'Suspeito' ? 'bg-pmmg-yellow text-pmmg-navy' : 
                      s.status === 'Preso' ? 'bg-pmmg-blue text-white' : 'bg-slate-700 text-white'
                    }`}>
                      {s.status}
                    </div>
                  </div>
                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-[11px] font-black text-pmmg-navy uppercase leading-tight mb-1 line-clamp-2">{s.name}</h3>
                      <p className="text-[9px] font-bold text-pmmg-red italic truncate mb-2">
                        {s.nickname ? `Vulgo: ${s.nickname}` : "Sem alcunha registrada"}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                       <div className="flex items-center gap-1 text-[8px] text-slate-500 font-bold">
                          <span className="material-symbols-outlined text-[10px]">location_on</span>
                          <span className="truncate">{s.lastSeen}</span>
                       </div>
                       {s.vehicle && (
                         <div className="flex items-center gap-1 text-[8px] text-pmmg-navy/70 font-black">
                            <span className="material-symbols-outlined text-[10px]">directions_car</span>
                            <span className="truncate">{s.vehicle}</span>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSuspects.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => onOpenProfile(s.id)}
                  className="pmmg-card flex p-3 gap-4 items-center active:scale-[0.98] transition-all shadow-sm border-l-4 border-l-pmmg-navy"
                >
                  <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden border-2 border-white shadow-md shrink-0">
                    <img src={s.photoUrl} className="w-full h-full object-cover" alt={s.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                       <h3 className="text-[11px] font-black text-pmmg-navy uppercase truncate pr-2">{s.name}</h3>
                       <span className={`text-[7px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase ${
                          s.status === 'Foragido' ? 'bg-pmmg-red text-white' : 
                          s.status === 'Suspeito' ? 'bg-pmmg-yellow text-pmmg-navy' : 'bg-pmmg-navy text-white'
                       }`}>
                          {s.status}
                       </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.cpf}</p>
                      {s.nickname && <span className="text-[9px] font-black text-pmmg-red italic">"{s.nickname}"</span>}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                       {s.vehicle && (
                         <div className="flex items-center gap-1 text-[8px] bg-white px-2 py-0.5 rounded border border-pmmg-navy/5 text-slate-600 font-bold">
                            <span className="material-symbols-outlined text-[10px]">directions_car</span>
                            {s.vehicle}
                         </div>
                       )}
                       <div className="flex items-center gap-1 text-[8px] bg-white px-2 py-0.5 rounded border border-pmmg-navy/5 text-slate-600 font-bold">
                          <span className="material-symbols-outlined text-[10px]">location_on</span>
                          {s.lastSeen}
                       </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-pmmg-navy/20 shrink-0">chevron_right</span>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-24 opacity-30 text-center">
            <span className="material-symbols-outlined text-7xl mb-4 animate-pulse">person_search</span>
            <h4 className="text-sm font-black uppercase tracking-[0.2em]">Varredura sem Resultados</h4>
            <p className="text-[10px] font-bold uppercase mt-2 px-10">Não encontramos alvos com estes parâmetros na base de dados atual.</p>
          </div>
        )}
      </main>

      <BottomNav activeScreen="dashboard" navigateTo={navigateTo} />
    </div>
  );
};

export default SuspectList;
