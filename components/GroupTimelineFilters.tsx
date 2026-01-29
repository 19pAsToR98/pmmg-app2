import React, { useState } from 'react';
import { Suspect, Officer } from '../types';

type PostFilterStatus = Suspect['status'] | 'Todos';
const STATUS_OPTIONS: PostFilterStatus[] = ['Todos', 'Foragido', 'Suspeito', 'Preso', 'CPF Cancelado'];

interface GroupTimelineFiltersProps {
  timelineSearchTerm: string;
  setTimelineSearchTerm: (term: string) => void;
  statusFilter: PostFilterStatus;
  setStatusFilter: (status: PostFilterStatus) => void;
  authorFilterId: string;
  setAuthorFilterId: (id: string) => void;
  groupMembers: Officer[];
  filteredPostsCount: number;
}

const GroupTimelineFilters: React.FC<GroupTimelineFiltersProps> = ({
  timelineSearchTerm,
  setTimelineSearchTerm,
  statusFilter,
  setStatusFilter,
  authorFilterId,
  setAuthorFilterId,
  groupMembers,
  filteredPostsCount,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleClearFilters = () => {
    setTimelineSearchTerm('');
    setStatusFilter('Todos');
    setAuthorFilterId('Todos');
    setShowAdvancedFilters(false);
  };

  const isFilterActive = timelineSearchTerm || statusFilter !== 'Todos' || authorFilterId !== 'Todos';

  return (
    <div className="pmmg-card p-4 space-y-3">
      {/* Barra de Pesquisa Principal */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-pmmg-navy/50 text-xl">search</span>
        </div>
        <input 
          value={timelineSearchTerm}
          onChange={(e) => setTimelineSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 bg-white/60 border border-pmmg-navy/10 focus:border-pmmg-navy focus:ring-0 rounded-2xl text-sm placeholder-pmmg-navy/40" 
          placeholder="Buscar nome, CPF ou observação..." 
          type="text" 
        />
      </div>

      {/* Botão de Toggle de Filtros Avançados */}
      <div className="flex justify-between items-center pt-1">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="text-[10px] font-bold uppercase tracking-wider text-pmmg-navy/70 flex items-center gap-1 active:opacity-70 transition-opacity"
        >
          <span className={`material-symbols-outlined text-lg ${isFilterActive ? 'text-pmmg-red fill-icon' : 'text-pmmg-navy/50'}`}>
            tune
          </span>
          {showAdvancedFilters ? 'Ocultar Filtros' : 'Filtros Avançados'}
          {isFilterActive && <span className="w-2 h-2 bg-pmmg-red rounded-full animate-pulse"></span>}
        </button>
        
        {isFilterActive && (
          <button 
            onClick={handleClearFilters}
            className="text-[9px] font-black text-pmmg-red uppercase active:opacity-70"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Conteúdo dos Filtros Avançados (Recolhível) */}
      {showAdvancedFilters && (
        <div className="space-y-4 pt-3 border-t border-pmmg-navy/10 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Filtro de Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1 ml-1 tracking-wider">Status do Indivíduo</label>
            <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setStatusFilter(opt)}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all border shrink-0 ${
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
          
          {/* Filtro de Autor */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1 ml-1 tracking-wider">Autor do Post</label>
            <select
              value={authorFilterId}
              onChange={(e) => setAuthorFilterId(e.target.value)}
              className="block w-full px-4 py-3 bg-white/80 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm"
            >
              <option value="Todos">Todos os Oficiais</option>
              {groupMembers.map(officer => (
                <option key={officer.id} value={officer.id}>
                  {officer.rank}. {officer.name} ({officer.unit})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      <div className="text-center pt-2">
        <span className="text-[10px] font-black text-pmmg-red uppercase tracking-widest italic">
          {filteredPostsCount} posts encontrados
        </span>
      </div>
    </div>
  );
};

export default GroupTimelineFilters;