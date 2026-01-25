import React, { useState, useMemo, useEffect } from 'react';
import { Screen, Suspect } from '../types';
import BottomNav from '../components/BottomNav';
import SuspectGridCard from '../components/SuspectGridCard';

type SuspectStatusFilter = Suspect['status'] | 'Todos';
type ViewMode = 'list' | 'grid';

interface SuspectsManagementProps {
  navigateTo: (screen: Screen) => void;
  onOpenProfile: (id: string) => void;
  suspects: Suspect[];
  initialStatusFilter: SuspectStatusFilter;
}

const STATUS_OPTIONS: SuspectStatusFilter[] = ['Todos', 'Foragido', 'Suspeito', 'Preso', 'CPF Cancelado'];

const SuspectsManagement: React.FC<SuspectsManagementProps> = ({ navigateTo, onOpenProfile, suspects, initialStatusFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SuspectStatusFilter>(initialStatusFilter);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  // Atualiza o filtro de status se um filtro inicial for passado
  useEffect(() => {
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  const filteredSuspects = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return suspects.filter(s => {
      // 1. Status Filter
      if (statusFilter !== 'Todos' && s.status !== statusFilter) {
        return false;
      }

      // 2. Unified Search Term (Name, Nickname, CPF, Last Seen Address, Vehicle details)
      if (term) {
        const matchesName = s.name.toLowerCase().includes(term);
        const matchesNickname = s.nickname?.toLowerCase().includes(term);
        const matchesCpf = s.cpf.includes(term);
        const matchesAddress = s.lastSeen.toLowerCase().includes(term);
        const matchesVehicle = s.vehicles?.some(v => 
          v.plate.toLowerCase().includes(term) || 
          v.model.toLowerCase().includes(term) || 
          v.color.toLowerCase().includes(term)
        );
        
        if (!matchesName && !matchesNickname && !matchesCpf && !matchesAddress && !matchesVehicle) {
          return false;
        }
      }

      return true;
    });
  }, [suspects, searchTerm, statusFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('Todos');
  };

  const renderSuspectListCard = (alert: Suspect) => {
    const statusColor = alert.status === 'Foragido' ? 'bg-pmmg-red' : 
                        alert.status === 'Suspeito' ? 'bg-pmmg-yellow text-pmmg-navy' :
                        alert.status === 'Preso' ? 'bg-pmmg-blue' : 'bg-slate-700';
    const borderColor = alert.status === 'Foragido' ? 'border-l-pmmg-red' : 
                        alert.status === 'Suspeito' ? 'border-l-pmmg-yellow' :
                        alert.status === 'Preso' ? 'border-l-pmmg-blue' : 'border-l-slate-600';
    
    return (
      <div 
        key={alert.id} 
        className={`pmmg-card overflow-hidden transition-all active:scale-[0.98] border-l-4 ${borderColor} cursor-pointer`}
        onClick={() => onOpenProfile(alert.id)}
      >
        <div className="flex">
          <div className="w-24 h-32 relative bg-slate-200 shrink-0">
            <img alt={alert.name} className="w-full h-full object-cover" src={alert.photoUrl} />
            <div className={`absolute top-0 left-0 text-white text-[8px] font-bold px-2 py-1 uppercase rounded-br-lg shadow-md ${statusColor}`}>
              {alert.status}
            </div>
          </div>
          <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm text-pmmg-navy uppercase leading-tight truncate pr-1">{alert.name}</h4>
                <span className={`material-symbols-outlined fill-icon text-lg ${
                  alert.status === 'Foragido' ? 'text-pmmg-red' : 'text-pmmg-yellow'
                }`}>
                  {alert.status === 'Foragido' ? 'priority_high' : 'warning'}
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 mt-1">CPF: {alert.cpf}</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-pmmg-navy">location_on</span>
                  <span className="text-[10px] text-slate-700 truncate">Visto em: {alert.lastSeen}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button 
                className="flex-1 bg-pmmg-navy text-white text-[9px] font-bold py-2 rounded-lg uppercase tracking-wide"
              >
                Ficha Completa
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button onClick={() => navigateTo('dashboard')} className="text-white active:scale-90 transition-transform">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div>
            <h1 className="font-bold text-sm leading-none text-white uppercase tracking-tight">Gestão de Indivíduos</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Consulta Completa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle View Mode */}
          <button 
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="bg-white/10 p-1.5 rounded-full border border-white/20 text-white"
          >
            <span className="material-symbols-outlined text-xl">
              {viewMode === 'list' ? 'grid_view' : 'view_list'}
            </span>
          </button>
          {/* Clear Filters */}
          <button 
            onClick={handleClearFilters}
            className="bg-white/10 p-1.5 rounded-full border border-white/20 text-white text-[10px] font-bold uppercase"
          >
            <span className="material-symbols-outlined text-xl">filter_alt_off</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        
        {/* Search and Filters Section */}
        <section className="sticky top-[68px] z-40 bg-pmmg-khaki/95 backdrop-blur-sm px-4 pt-4 pb-3 shadow-md border-b border-pmmg-navy/10">
          
          {/* Main Search (Unified) */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-pmmg-navy/50 text-xl">search</span>
            </div>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 bg-white border-2 border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-0 rounded-xl text-sm font-medium placeholder-pmmg-navy/40 shadow-sm" 
              placeholder="Buscar: Nome, CPF, Endereço, Placa, etc." 
              type="text" 
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {STATUS_OPTIONS.map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase transition-colors border ${
                  statusFilter === status 
                    ? 'bg-pmmg-navy text-pmmg-yellow border-pmmg-yellow' 
                    : 'bg-white/50 text-pmmg-navy/70 border-pmmg-navy/10'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </section>

        {/* Results List */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1.5 bg-pmmg-navy rounded-full"></div>
            <h3 className="font-bold text-xs text-pmmg-navy uppercase tracking-widest italic">Resultados da Consulta</h3>
          </div>
          <span className="text-[10px] font-bold text-pmmg-navy/40 uppercase">{filteredSuspects.length} Registros</span>
        </div>

        <section className="px-4 space-y-4">
          {filteredSuspects.length > 0 ? (
            viewMode === 'list' ? (
              <div className="space-y-4">
                {filteredSuspects.map(renderSuspectListCard)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredSuspects.map(suspect => (
                  <SuspectGridCard key={suspect.id} suspect={suspect} onOpenProfile={onOpenProfile} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-10 opacity-40">
              <span className="material-symbols-outlined text-5xl">person_search</span>
              <p className="text-xs font-bold uppercase mt-2">Nenhum registro encontrado com os filtros aplicados.</p>
            </div>
          )}
        </section>
      </main>

      <BottomNav activeScreen="dashboard" navigateTo={navigateTo} />
    </div>
  );
};

export default SuspectsManagement;