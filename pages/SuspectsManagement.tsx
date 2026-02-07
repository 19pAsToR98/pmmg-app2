import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Suspect, Screen } from '../types';
import BottomNav from '../components/BottomNav';
import SuspectGridItem from '../components/SuspectGridItem';
import SuspectListItem from '../components/SuspectListItem';

type SuspectStatusFilter = Suspect['status'] | 'Todos';
type ViewMode = 'list' | 'grid';

interface SuspectsManagementProps {
  navigateTo: (screen: Screen) => void;
  onOpenProfile: (id: string) => void;
  suspects: Suspect[];
  initialStatusFilter: SuspectStatusFilter;
  deleteSuspects: (ids: string[]) => void; // Nova prop
}

const STATUS_OPTIONS: SuspectStatusFilter[] = ['Todos', 'Foragido', 'Suspeito', 'Preso', 'CPF Cancelado'];

const SuspectsManagement: React.FC<SuspectsManagementProps> = ({ navigateTo, onOpenProfile, suspects, initialStatusFilter, deleteSuspects }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedSuspectIds, setSelectedSuspectIds] = useState<string[]>([]);
  
  // States para filtros
  const [globalSearch, setGlobalSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<SuspectStatusFilter>(initialStatusFilter);

  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Atualiza o filtro de status se um filtro inicial for passado (ex: ao clicar no card do Dashboard)
  useEffect(() => {
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // CORREÇÃO: Usando filterMenuRef em vez de filterMenuMenuRef
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSuspects = useMemo(() => {
    const searchLower = globalSearch.toLowerCase().trim();
    
    return suspects.filter(s => {
      // Filtro de Status
      const matchesStatus = statusFilter === 'Todos' || s.status === statusFilter;
      if (!matchesStatus) return false;

      // Busca Unificada (Nome, Apelido, CPF, Endereço, Veículo)
      if (searchLower) {
        const matchesGlobal = 
          s.name.toLowerCase().includes(searchLower) ||
          (s.nickname || '').toLowerCase().includes(searchLower) ||
          s.cpf.includes(globalSearch) ||
          s.lastSeen.toLowerCase().includes(searchLower) ||
          s.vehicles?.some(v => 
            v.plate.toLowerCase().includes(searchLower) || 
            v.model.toLowerCase().includes(searchLower) || 
            v.color.toLowerCase().includes(searchLower)
          );
        
        if (!matchesGlobal) return false;
      }
      
      return true;
    });
  }, [suspects, globalSearch, statusFilter]);

  const handleClearFilters = () => {
    setGlobalSearch('');
    setDateFilter('');
    setStatusFilter('Todos');
  };

  // --- Lógica de Seleção ---

  const toggleSelection = (id: string) => {
    setSelectedSuspectIds(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleLongPress = (id: string) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedSuspectIds([id]);
    }
  };

  const handleCardClick = (id: string) => {
    if (isSelectionMode) {
      toggleSelection(id);
    } else {
      onOpenProfile(id);
    }
  };

  const handleExitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedSuspectIds([]);
  };

  const handleDeleteSelected = () => {
    if (selectedSuspectIds.length > 0 && window.confirm(`Tem certeza que deseja excluir ${selectedSuspectIds.length} registro(s)?`)) {
      deleteSuspects(selectedSuspectIds);
      handleExitSelectionMode();
    }
  };
  
  // Componente de Filtros Avançados (Reutilizável)
  const AdvancedFilters = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-pmmg-navy/60 dark:text-slate-400">Filtros Avançados</h4>
        <button 
          onClick={handleClearFilters}
          className="text-[9px] font-black text-pmmg-red uppercase"
        >
          Limpar Tudo
        </button>
      </div>

      {/* Status Section */}
      <div className="mb-5">
        <label className="block text-[9px] font-black uppercase text-pmmg-navy/40 dark:text-slate-500 mb-2 tracking-wider">Status Operacional</label>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all border shrink-0 ${
                statusFilter === opt 
                ? 'bg-pmmg-navy text-white border-pmmg-navy shadow-md' 
                : 'bg-slate-50 text-pmmg-navy/60 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Date Section (Mocked) */}
      <div>
        <label className="block text-[9px] font-black uppercase text-pmmg-navy/40 dark:text-slate-500 mb-2 tracking-wider">Data de Registro (Mock)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-pmmg-navy/30 dark:text-slate-500">calendar_today</span>
          <input 
            type="text" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-primary-dark focus:ring-2 focus:ring-pmmg-navy/10 transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            placeholder="DD/MM/AAAA"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki dark:bg-slate-900 overflow-hidden">
      
      {/* ==================================================================================================== */}
      {/* MOBILE VIEW (Existing) */}
      {/* ==================================================================================================== */}
      <div className="lg:hidden flex flex-col h-full">
        <header className={`sticky top-0 z-[100] px-4 pt-6 pb-4 shadow-xl shrink-0 transition-colors ${isSelectionMode ? 'bg-pmmg-red' : 'bg-pmmg-navy'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={isSelectionMode ? handleExitSelectionMode : () => navigateTo('dashboard')} className="text-white active:scale-90 transition-transform">
                <span className="material-symbols-outlined">{isSelectionMode ? 'close' : 'arrow_back_ios'}</span>
              </button>
              <div>
                <h1 className="font-bold text-sm leading-none text-white uppercase tracking-tight">
                  {isSelectionMode ? `${selectedSuspectIds.length} Selecionado(s)` : 'Banco de Dados'}
                </h1>
                <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">
                  {isSelectionMode ? 'Modo de Seleção Ativo' : 'Consulta Unificada SISP'}
                </p>
              </div>
            </div>
            
            {!isSelectionMode && (
              <div className="flex items-center gap-2">
                {/* Novo Registro Button */}
                <button 
                  onClick={() => navigateTo('registry')}
                  className="bg-pmmg-red/20 p-2 rounded-lg text-pmmg-red border border-pmmg-red/50 active:bg-pmmg-red/30 transition-all dark:bg-pmmg-red/30 dark:border-pmmg-red/70 dark:text-white"
                  title="Novo Registro de Indivíduo"
                >
                  <span className="material-symbols-outlined text-lg fill-icon">person_add</span>
                </button>
                {/* Toggle View Mode */}
                <button 
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="bg-white/10 p-2 rounded-lg text-white border border-white/20 active:bg-white/20 transition-all"
                  title="Alternar Visualização"
                >
                  <span className="material-symbols-outlined text-lg">
                    {viewMode === 'grid' ? 'view_list' : 'grid_view'}
                  </span>
                </button>
                {/* Toggle Filter Menu */}
                <button 
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`p-2 rounded-lg flex items-center justify-center transition-all shrink-0 ${showFilterMenu || statusFilter !== 'Todos' || dateFilter ? 'bg-pmmg-yellow text-primary-dark shadow-md' : 'text-white hover:bg-white/10'}`}
                >
                  <span className={`material-symbols-outlined text-xl ${showFilterMenu ? 'fill-icon' : ''}`}>tune</span>
                </button>
              </div>
            )}
          </div>

          {/* Barra de Pesquisa Única com Ícone de Filtro */}
          {!isSelectionMode && (
            <div className="relative group mb-2">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-primary-dark text-xl group-focus-within:text-pmmg-yellow transition-colors dark:text-slate-400">manage_search</span>
              </div>
              <input 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="NOME, VULGO, PLACA, ENDEREÇO..."
                className="w-full pl-12 pr-24 py-4 bg-white rounded-2xl border-none focus:ring-4 focus:ring-pmmg-yellow/20 text-xs font-black uppercase shadow-inner placeholder:text-slate-400 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-pmmg-yellow/30"
              />
              <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                {globalSearch && (
                  <button 
                    onClick={() => setGlobalSearch('')}
                    className="p-1 text-slate-400 hover:text-primary-dark transition-colors dark:text-slate-500 dark:hover:text-pmmg-yellow"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>

              {/* Menu de Filtro Flutuante (Mobile) */}
              {showFilterMenu && (
                <div 
                  ref={filterMenuRef}
                  className="absolute top-full right-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-pmmg-navy/10 dark:border-slate-700 z-[200] p-5 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <AdvancedFilters />
                  <button 
                    onClick={() => setShowFilterMenu(false)}
                    className="w-full mt-6 bg-pmmg-navy text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto pb-40 px-4 pt-4 no-scrollbar bg-pmmg-khaki dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-[10px] font-black text-pmmg-navy/50 dark:text-slate-400 uppercase tracking-widest italic">
              Exibindo {filteredSuspects.length} resultados táticos
            </span>
            <div className="flex items-center gap-1.5 bg-pmmg-navy/5 dark:bg-slate-700 px-2 py-1 rounded-full border border-pmmg-navy/5 dark:border-slate-600">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[8px] font-bold text-primary-dark uppercase tracking-tighter dark:text-slate-300">Sincronizado</span>
            </div>
          </div>

          <section className="space-y-4">
            {filteredSuspects.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-4">
                  {filteredSuspects.map(suspect => (
                    <SuspectGridItem
                      key={suspect.id}
                      suspect={suspect}
                      isSelectionMode={isSelectionMode}
                      isSelected={selectedSuspectIds.includes(suspect.id)}
                      handleCardClick={handleCardClick}
                      handleLongPress={handleLongPress}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSuspects.map(suspect => (
                    <SuspectListItem
                      key={suspect.id}
                      suspect={suspect}
                      isSelectionMode={isSelectionMode}
                      isSelected={selectedSuspectIds.includes(suspect.id)}
                      handleCardClick={handleCardClick}
                      handleLongPress={handleLongPress}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-24 opacity-30 text-center">
                <span className="material-symbols-outlined text-7xl mb-4 animate-pulse text-pmmg-navy/30 dark:text-slate-600">person_search</span>
                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary-dark dark:text-slate-400">Varredura sem Resultados</h4>
                <p className="text-[10px] font-bold uppercase mt-2 px-10 text-secondary-light dark:text-slate-500">Não encontramos alvos com estes parâmetros na base de dados atual.</p>
              </div>
            )}
          </section>
        </main>
        
        {/* Floating Action Bar for Deletion */}
        {isSelectionMode && (
          <div className="fixed bottom-[80px] left-0 right-0 z-50 max-w-md mx-auto px-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-pmmg-red text-white p-3 rounded-xl shadow-2xl flex items-center justify-between border-2 border-white">
              <span className="text-sm font-bold uppercase">{selectedSuspectIds.length} Selecionado(s)</span>
              <button 
                onClick={handleDeleteSelected}
                disabled={selectedSuspectIds.length === 0}
                className="bg-white text-pmmg-red font-bold px-4 py-2 rounded-lg text-xs uppercase flex items-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
                Excluir
              </button>
            </div>
          </div>
        )}

        <BottomNav activeScreen="dashboard" navigateTo={navigateTo} />
      </div>
      
      {/* ==================================================================================================== */}
      {/* DESKTOP VIEW (New) */}
      {/* ==================================================================================================== */}
      <div className="hidden lg:flex flex-col h-full">
        
        {/* Desktop Header/Controls */}
        <header className={`sticky top-0 z-[100] px-8 pt-6 pb-4 shadow-xl shrink-0 transition-colors ${isSelectionMode ? 'bg-pmmg-red' : 'bg-pmmg-navy'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={isSelectionMode ? handleExitSelectionMode : () => navigateTo('dashboard')} className="text-white active:scale-90 transition-transform">
                <span className="material-symbols-outlined text-2xl">{isSelectionMode ? 'close' : 'arrow_back_ios'}</span>
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="font-black text-xl leading-none text-white uppercase tracking-tight">
                  {isSelectionMode ? `MODO DE SELEÇÃO (${selectedSuspectIds.length})` : 'BANCO DE DADOS TÁTICO'}
                </h1>
                <p className="text-[11px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">
                  {isSelectionMode ? 'Excluir ou Gerenciar Registros' : 'Consulta Unificada SISP'}
                </p>
              </div>
            </div>
            
            {!isSelectionMode && (
              <div className="flex items-center gap-4">
                {/* Novo Registro Button */}
                <button 
                  onClick={() => navigateTo('registry')}
                  className="bg-pmmg-yellow text-pmmg-navy px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg flex items-center gap-2 active:scale-95 transition-transform"
                  title="Novo Registro de Indivíduo"
                >
                  <span className="material-symbols-outlined text-lg fill-icon">person_add</span>
                  Novo Registro
                </button>
                {/* Toggle View Mode */}
                <button 
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="bg-white/10 p-2 rounded-xl text-white border border-white/20 active:bg-white/20 transition-all"
                  title="Alternar Visualização"
                >
                  <span className="material-symbols-outlined text-xl">
                    {viewMode === 'grid' ? 'view_list' : 'grid_view'}
                  </span>
                </button>
              </div>
            )}
            
            {isSelectionMode && (
              <button 
                onClick={handleDeleteSelected}
                disabled={selectedSuspectIds.length === 0}
                className="bg-white text-pmmg-red font-bold px-6 py-2 rounded-xl text-sm uppercase flex items-center gap-2 active:scale-95 transition-transform disabled:opacity-50 shadow-lg"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
                Excluir Selecionados
              </button>
            )}
          </div>
        </header>

        {/* Desktop Main Content: Two Columns (Filters and Results) */}
        <main className="flex-1 overflow-y-auto p-8 no-scrollbar grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          
          {/* Coluna 1: Filtros Avançados (Ocupa 1/4 ou 1/5) */}
          <div className="lg:col-span-1">
            <div className="pmmg-card p-5 sticky top-8">
              <AdvancedFilters />
              <button 
                onClick={() => alert('Filtros aplicados (Simulação)')}
                className="w-full mt-6 bg-pmmg-navy text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
          
          {/* Coluna 2: Resultados (Ocupa 3/4 ou 4/5) */}
          <div className="lg:col-span-3 xl:col-span-4 space-y-6">
            
            {/* Barra de Pesquisa Principal (Desktop) */}
            <div className="relative group mb-4">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-primary-dark text-xl group-focus-within:text-pmmg-yellow transition-colors dark:text-slate-400">manage_search</span>
              </div>
              <input 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="BUSCAR NOME, VULGO, PLACA, ENDEREÇO..."
                className="w-full pl-12 pr-24 py-4 bg-white/80 dark:bg-slate-700 rounded-2xl border border-pmmg-navy/10 dark:border-slate-600 focus:ring-4 focus:ring-pmmg-yellow/20 text-sm font-black uppercase shadow-inner placeholder:text-slate-400 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-pmmg-yellow/30"
              />
              <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                {globalSearch && (
                  <button 
                    onClick={() => setGlobalSearch('')}
                    className="p-1 text-slate-400 hover:text-primary-dark transition-colors dark:text-slate-500 dark:hover:text-pmmg-yellow"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-[11px] font-black text-pmmg-navy/50 dark:text-slate-400 uppercase tracking-widest italic">
                Exibindo {filteredSuspects.length} resultados táticos
              </span>
              <div className="flex items-center gap-1.5 bg-pmmg-navy/5 dark:bg-slate-700 px-2 py-1 rounded-full border border-pmmg-navy/5 dark:border-slate-600">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-bold text-primary-dark uppercase tracking-tighter dark:text-slate-300">Sincronizado em Tempo Real</span>
              </div>
            </div>

            <section className="space-y-4">
              {filteredSuspects.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSuspects.map(suspect => (
                      <SuspectGridItem
                        key={suspect.id}
                        suspect={suspect}
                        isSelectionMode={isSelectionMode}
                        isSelected={selectedSuspectIds.includes(suspect.id)}
                        handleCardClick={handleCardClick}
                        handleLongPress={handleLongPress}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSuspects.map(suspect => (
                      <SuspectListItem
                        key={suspect.id}
                        suspect={suspect}
                        isSelectionMode={isSelectionMode}
                        isSelected={selectedSuspectIds.includes(suspect.id)}
                        handleCardClick={handleCardClick}
                        handleLongPress={handleLongPress}
                      />
                    ))}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-24 opacity-30 text-center">
                  <span className="material-symbols-outlined text-7xl mb-4 animate-pulse text-pmmg-navy/30 dark:text-slate-600">person_search</span>
                  <h4 className="text-lg font-black uppercase tracking-[0.2em] text-primary-dark dark:text-slate-400">Varredura sem Resultados</h4>
                  <p className="text-sm font-bold uppercase mt-2 px-10 text-secondary-light dark:text-slate-500">Não encontramos alvos com estes parâmetros na base de dados atual.</p>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuspectsManagement;