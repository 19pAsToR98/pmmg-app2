import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Screen, Group, Officer, Suspect, GroupPost } from '../types';

interface GroupDetailProps {
  navigateTo: (screen: Screen) => void;
  group: Group;
  allOfficers: Officer[];
  allSuspects: Suspect[];
  onOpenProfile: (id: string) => void;
  onShareSuspect: (groupId: string, suspectId: string, observation: string) => void;
}

type PostFilterStatus = Suspect['status'] | 'Todos';

const STATUS_OPTIONS: PostFilterStatus[] = ['Todos', 'Foragido', 'Suspeito', 'Preso', 'CPF Cancelado'];

// Objeto estático para oficial desconhecido (evita recriação)
const UNKNOWN_OFFICER = {
  name: 'Oficial Desconhecido',
  rank: 'N/D',
  unit: 'N/D',
  photoUrl: 'https://i.pravatar.cc/150?img=5',
  isOnline: false,
  id: 'unknown'
};

const GroupDetail: React.FC<GroupDetailProps> = ({
  navigateTo,
  group,
  allOfficers,
  allSuspects,
  onOpenProfile,
  onShareSuspect
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuspectId, setShareSuspectId] = useState<string | null>(null);
  const [shareObservation, setShareObservation] = useState('');
  const [suspectSearchTerm, setSuspectSearchTerm] = useState('');
  const [isSharingLoading, setIsSharingLoading] = useState(false);
  
  // Filtros da Linha do Tempo
  const [timelineSearchTerm, setTimelineSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PostFilterStatus>('Todos');
  const [authorFilterId, setAuthorFilterId] = useState<string>('Todos');
  const [showEmptyState, setShowEmptyState] = useState(false);

  // Debounce para busca
  const [debouncedTimelineSearch, setDebouncedTimelineSearch] = useState(timelineSearchTerm);
  const [debouncedSuspectSearch, setDebouncedSuspectSearch] = useState(suspectSearchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTimelineSearch(timelineSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [timelineSearchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSuspectSearch(suspectSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [suspectSearchTerm]);

  const getOfficer = useCallback((id: string) => {
    return allOfficers.find(o => o.id === id) || UNKNOWN_OFFICER;
  }, [allOfficers]);

  const getSuspect = useCallback((id: string) => {
    return allSuspects.find(s => s.id === id);
  }, [allSuspects]);

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const filteredSuspects = useMemo(() => {
    if (!debouncedSuspectSearch.trim()) return [];
    const term = debouncedSuspectSearch.toLowerCase();
    return allSuspects
      .filter(s => 
        s.name.toLowerCase().includes(term) || 
        s.cpf.replace(/\D/g, '').includes(term.replace(/\D/g, ''))
      )
      .slice(0, 5);
  }, [debouncedSuspectSearch, allSuspects]);

  // Membros do grupo para o filtro de autor
  const groupMembers = useMemo(() => {
    return allOfficers.filter(o => group.memberIds.includes(o.id));
  }, [group.memberIds, allOfficers]);

  // Lógica de Filtragem da Linha do Tempo
  const filteredPosts = useMemo(() => {
    const searchLower = debouncedTimelineSearch.toLowerCase().trim();
    
    // 1. Ordena os posts por data (mais recente primeiro)
    const sorted = [...group.posts].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return sorted.filter(post => {
      const suspect = getSuspect(post.suspectId);
      if (!suspect) return false;

      // 2. Filtro por Autor
      if (authorFilterId !== 'Todos' && post.authorId !== authorFilterId) {
        return false;
      }

      // 3. Filtro por Status
      if (statusFilter !== 'Todos' && suspect.status !== statusFilter) {
        return false;
      }

      // 4. Pesquisa por Termo (Nome, CPF, Observação)
      if (searchLower) {
        const cpfClean = suspect.cpf.replace(/\D/g, '');
        const matchesSearch = 
          suspect.name.toLowerCase().includes(searchLower) ||
          cpfClean.includes(searchLower.replace(/\D/g, '')) ||
          post.observation.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [group.posts, debouncedTimelineSearch, statusFilter, authorFilterId, getSuspect]);

  const handleShare = async () => {
    if (!shareSuspectId || !shareObservation.trim()) {
      alert("⚠️ Selecione uma ficha e adicione uma observação tática.");
      return;
    }

    try {
      setIsSharingLoading(true);
      await onShareSuspect(group.id, shareSuspectId, shareObservation.trim());
      
      // Reset form
      setIsSharing(false);
      setShareSuspectId(null);
      setShareObservation('');
      setSuspectSearchTerm('');
      
      // Feedback positivo
      setTimeout(() => {
        alert("✅ Ficha compartilhada com sucesso!");
      }, 100);
    } catch (error) {
      alert("❌ Erro ao compartilhar ficha. Tente novamente.");
    } finally {
      setIsSharingLoading(false);
    }
  };

  const formatTimestamp = useCallback((isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (date.toDateString() === today.toDateString()) {
      return `Hoje às ${time}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem às ${time}`;
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }) + ` às ${time}`;
    }
  }, []);

  const getStatusColor = (status: Suspect['status']) => {
    const colors = {
      'Foragido': 'bg-red-100 text-red-700 border-red-300',
      'Suspeito': 'bg-orange-100 text-orange-700 border-orange-300',
      'Preso': 'bg-green-100 text-green-700 border-green-300',
      'CPF Cancelado': 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return colors[status] || 'bg-blue-100 text-blue-700 border-blue-300';
  };

  const getStatusIcon = (status: Suspect['status']) => {
    const icons = {
      'Foragido': 'dangerous',
      'Suspeito': 'warning',
      'Preso': 'check_circle',
      'CPF Cancelado': 'cancel',
    };
    return icons[status] || 'person';
  };

  useEffect(() => {
    if (filteredPosts.length === 0 && debouncedTimelineSearch) {
      const timer = setTimeout(() => setShowEmptyState(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowEmptyState(false);
    }
  }, [filteredPosts.length, debouncedTimelineSearch]);

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      {/* Header Moderno */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-pmmg-navy to-pmmg-navy-dark px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigateTo('groupsList')} 
              className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
              aria-label="Voltar para lista de grupos"
            >
              <span className="material-symbols-outlined text-xl">arrow_back_ios</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pmmg-khaki-light to-pmmg-yellow flex items-center justify-center overflow-hidden shadow-md">
                <span className="material-symbols-outlined text-pmmg-navy text-xl">groups</span>
              </div>
              <div className="hidden md:block">
                <h1 className="font-bold text-base text-white leading-tight">{group.name}</h1>
                <p className="text-xs font-medium text-pmmg-yellow/90 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">badge</span>
                  {group.memberIds.length} Membros
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSharing(true)}
              className="bg-pmmg-red hover:bg-pmmg-red-dark text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition-all hover:shadow-lg"
              aria-label="Compartilhar ficha"
            >
              <span className="material-symbols-outlined text-base">share</span>
              <span className="hidden sm:inline">Compartilhar</span>
            </button>
            <button 
              className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
              onClick={() => alert('Gerenciar membros')}
              aria-label="Opções do grupo"
            >
              <span className="material-symbols-outlined text-xl">more_vert</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        
        {/* Cards de Estatísticas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="pmmg-card p-3 rounded-xl bg-white/95 border-l-4 border-pmmg-red">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-pmmg-navy/60 uppercase tracking-wider">Total de Posts</p>
                <p className="text-2xl font-black text-pmmg-navy mt-1">{group.posts.length}</p>
              </div>
              <span className="material-symbols-outlined text-3xl text-pmmg-red opacity-30">description</span>
            </div>
          </div>
          
          <div className="pmmg-card p-3 rounded-xl bg-white/95 border-l-4 border-pmmg-yellow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-pmmg-navy/60 uppercase tracking-wider">Filtrados</p>
                <p className="text-2xl font-black text-pmmg-navy mt-1">{filteredPosts.length}</p>
              </div>
              <span className="material-symbols-outlined text-3xl text-pmmg-yellow opacity-30">filter_alt</span>
            </div>
          </div>
          
          <div className="pmmg-card p-3 rounded-xl bg-white/95 border-l-4 border-pmmg-navy">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-pmmg-navy/60 uppercase tracking-wider">Membros</p>
                <p className="text-2xl font-black text-pmmg-navy mt-1">{group.memberIds.length}</p>
              </div>
              <span className="material-symbols-outlined text-3xl text-pmmg-navy opacity-30">people</span>
            </div>
          </div>
          
          <div className="pmmg-card p-3 rounded-xl bg-white/95 border-l-4 border-pmmg-green">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-pmmg-navy/60 uppercase tracking-wider">Ativo Hoje</p>
                <p className="text-2xl font-black text-pmmg-navy mt-1">
                  {group.posts.filter(p => 
                    new Date(p.timestamp).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <span className="material-symbols-outlined text-3xl text-pmmg-green opacity-30">today</span>
            </div>
          </div>
        </div>

        {/* Painel de Filtros Colapsável */}
        <section className="pmmg-card rounded-xl overflow-hidden">
          <div 
            className="bg-gradient-to-r from-pmmg-navy to-pmmg-navy-dark px-4 py-3 cursor-pointer"
            onClick={() => setShowEmptyState(!showEmptyState)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white text-lg">tune</span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Filtros Avançados</h3>
              </div>
              <span className="material-symbols-outlined text-white text-sm">
                {showEmptyState ? 'expand_less' : 'expand_more'}
              </span>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Barra de Pesquisa Moderna */}
            <div className="relative">
              <label htmlFor="timeline-search" className="sr-only">Buscar na linha do tempo</label>
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-pmmg-navy/50 text-xl">search</span>
              </div>
              <input 
                id="timeline-search"
                value={timelineSearchTerm}
                onChange={(e) => setTimelineSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-white/80 border-2 border-pmmg-navy/10 focus:border-pmmg-yellow focus:ring-2 focus:ring-pmmg-yellow/30 rounded-xl text-sm placeholder-pmmg-navy/40 transition-all" 
                placeholder="🔍 Buscar por nome, CPF ou observação..." 
                type="text" 
              />
            </div>

            {/* Grid de Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtro de Status */}
              <div>
                <label className="block text-xs font-bold text-pmmg-navy/80 mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">flag</span>
                  Status do Indivíduo
                </label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setStatusFilter(opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 ${
                        statusFilter === opt 
                        ? 'bg-pmmg-navy text-white border-pmmg-yellow shadow-md scale-105' 
                        : 'bg-white/70 text-pmmg-navy/70 border-pmmg-navy/20 hover:bg-pmmg-khaki/30'
                      }`}
                      aria-pressed={statusFilter === opt}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Filtro de Autor */}
              <div>
                <label htmlFor="author-filter" className="block text-xs font-bold text-pmmg-navy/80 mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">person</span>
                  Autor do Post
                </label>
                <select
                  id="author-filter"
                  value={authorFilterId}
                  onChange={(e) => setAuthorFilterId(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/80 border-2 border-pmmg-navy/20 focus:border-pmmg-yellow focus:ring-2 focus:ring-pmmg-yellow/30 rounded-xl text-sm font-medium transition-all"
                >
                  <option value="Todos">📋 Todos os Oficiais</option>
                  {groupMembers.map(officer => (
                    <option key={officer.id} value={officer.id}>
                      {officer.rank}. {officer.name} - {officer.unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resumo dos Filtros Ativos */}
            <div className="pt-2 border-t border-pmmg-navy/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-pmmg-navy">info</span>
                  <span className="text-xs font-bold text-pmmg-navy/80">
                    {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} encontrados
                  </span>
                </div>
                {(timelineSearchTerm || statusFilter !== 'Todos' || authorFilterId !== 'Todos') && (
                  <button
                    onClick={() => {
                      setTimelineSearchTerm('');
                      setStatusFilter('Todos');
                      setAuthorFilterId('Todos');
                    }}
                    className="text-xs font-bold text-pmmg-red hover:text-pmmg-red-dark flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">restart_alt</span>
                    Limpar Filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Linha do Tempo de Posts - Layout Aprimorado */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-pmmg-navy uppercase tracking-wide flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">timeline</span>
              Linha do Tempo
            </h3>
            {filteredPosts.length > 0 && (
              <span className="text-xs font-bold text-pmmg-yellow bg-pmmg-navy px-3 py-1 rounded-full">
                {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {showEmptyState && filteredPosts.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-pmmg-navy/20">
              <div className="animate-bounce mb-4">
                <span className="material-symbols-outlined text-6xl text-pmmg-navy/30">search_off</span>
              </div>
              <h4 className="text-lg font-bold text-pmmg-navy mb-2">Nenhum resultado encontrado</h4>
              <p className="text-sm text-pmmg-navy/60 mb-4">
                Tente ajustar os filtros ou buscar por outro termo.
              </p>
              <button
                onClick={() => {
                  setTimelineSearchTerm('');
                  setStatusFilter('Todos');
                  setAuthorFilterId('Todos');
                }}
                className="bg-pmmg-yellow text-pmmg-navy font-bold px-6 py-2 rounded-lg hover:bg-pmmg-yellow-dark transition-colors flex items-center gap-2 mx-auto"
              >
                <span className="material-symbols-outlined">restart_alt</span>
                Limpar Filtros
              </button>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map((post) => {
                const author = getOfficer(post.authorId);
                const suspect = getSuspect(post.suspectId);
                
                return (
                  <div 
                    key={post.id} 
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-pmmg-navy/5 overflow-hidden group"
                  >
                    {/* Header do Post */}
                    <div className="bg-gradient-to-r from-pmmg-navy to-pmmg-navy-dark px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                          <span className="material-symbols-outlined text-pmmg-navy text-sm">person</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{author.rank}. {author.name}</p>
                          <p className="text-[10px] text-pmmg-yellow/90">{author.unit}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-white/80">
                        {formatTimestamp(post.timestamp)}
                      </span>
                    </div>

                    {/* Corpo do Post */}
                    <div className="p-4 space-y-4">
                      {/* Observação */}
                      <div className="bg-pmmg-khaki/20 border-l-4 border-pmmg-yellow p-3 rounded-r-lg">
                        <p className="text-sm text-pmmg-navy italic leading-relaxed">
                          "{post.observation}"
                        </p>
                      </div>

                      {/* Ficha Compartilhada */}
                      <div 
                        onClick={() => onOpenProfile(suspect!.id)}
                        className="flex items-center gap-4 p-3 bg-gradient-to-r from-pmmg-khaki/30 to-white rounded-lg border border-pmmg-navy/10 cursor-pointer hover:bg-pmmg-khaki/50 transition-colors"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 border-pmmg-navy/20">
                          <img 
                            src={suspect!.photoUrl} 
                            alt={suspect!.name} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase mb-1 ${getStatusColor(suspect!.status)}`}>
                            <span className="material-symbols-outlined text-sm">{getStatusIcon(suspect!.status)}</span>
                            {suspect!.status}
                          </div>
                          <h4 className="text-base font-bold text-pmmg-navy truncate">{suspect!.name}</h4>
                          <p className="text-xs text-pmmg-navy/70">CPF: {formatCPF(suspect!.cpf)}</p>
                        </div>
                        
                        <div className="shrink-0 text-pmmg-navy/60 group-hover:text-pmmg-yellow transition-colors">
                          <span className="material-symbols-outlined text-xl">arrow_forward_ios</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-pmmg-navy/20">
              <span className="material-symbols-outlined text-6xl text-pmmg-navy/20 mb-4 block">description</span>
              <h4 className="text-lg font-bold text-pmmg-navy mb-2">Nenhum post compartilhado ainda</h4>
              <p className="text-sm text-pmmg-navy/60">
                Este grupo ainda não possui posts na linha do tempo.
              </p>
              <button
                onClick={() => setIsSharing(true)}
                className="mt-4 bg-pmmg-red text-white font-bold px-6 py-2 rounded-lg hover:bg-pmmg-red-dark transition-colors flex items-center gap-2 mx-auto"
              >
                <span className="material-symbols-outlined">share</span>
                Compartilhar Primeira Ficha
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Modal de Compartilhamento Aprimorado */}
      {isSharing && (
        <div 
          className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsSharing(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-pmmg-navy to-pmmg-navy-dark px-6 py-4 flex items-center justify-between border-b border-white/20">
              <h3 className="text-lg font-bold text-white uppercase flex items-center gap-2">
                <span className="material-symbols-outlined">share</span>
                Compartilhar Ficha
              </h3>
              <button
                onClick={() => setIsSharing(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                aria-label="Fechar"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* 1. Busca de Suspeito com Autocomplete Aprimorado */}
              <div className="relative">
                <label htmlFor="suspect-search" className="block text-xs font-bold text-pmmg-navy/80 mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">search</span>
                  Buscar Indivíduo
                </label>
                <input 
                  id="suspect-search"
                  value={suspectSearchTerm}
                  onChange={(e) => setSuspectSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-pmmg-navy/20 rounded-xl text-sm focus:border-pmmg-yellow focus:ring-2 focus:ring-pmmg-yellow/30 transition-all"
                  placeholder="Digite nome ou CPF do suspeito..."
                  autoFocus
                />
                
                {filteredSuspects.length > 0 && (
                  <div className="absolute z-20 w-full bg-white border-2 border-pmmg-navy/20 rounded-xl mt-1 shadow-xl max-h-60 overflow-y-auto animate-fade-in">
                    {filteredSuspects.map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setShareSuspectId(s.id);
                          setSuspectSearchTerm(s.name);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-pmmg-navy hover:bg-pmmg-khaki/50 transition-colors border-b border-pmmg-navy/5 last:border-b-0 flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-bold">{s.name}</p>
                          <p className="text-xs text-pmmg-navy/60">{formatCPF(s.cpf)}</p>
                        </div>
                        <span className="material-symbols-outlined text-pmmg-navy/40 group-hover:text-pmmg-yellow transition-colors">
                          arrow_forward_ios
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 2. Ficha Selecionada com Preview Visual */}
              {shareSuspectId && getSuspect(shareSuspectId) && (
                <div className="p-4 bg-gradient-to-r from-pmmg-yellow/10 to-white border-2 border-pmmg-yellow/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-pmmg-yellow">
                      <img 
                        src={getSuspect(shareSuspectId)!.photoUrl} 
                        alt={getSuspect(shareSuspectId)!.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase mb-1 ${getStatusColor(getSuspect(shareSuspectId)!.status)}`}>
                        <span className="material-symbols-outlined text-sm">{getStatusIcon(getSuspect(shareSuspectId)!.status)}</span>
                        {getSuspect(shareSuspectId)!.status}
                      </div>
                      <h4 className="text-sm font-bold text-pmmg-navy">{getSuspect(shareSuspectId)!.name}</h4>
                      <p className="text-xs text-pmmg-navy/70">CPF: {formatCPF(getSuspect(shareSuspectId)!.cpf)}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShareSuspectId(null);
                        setSuspectSearchTerm('');
                      }}
                      className="text-pmmg-red hover:text-pmmg-red-dark transition-colors"
                      aria-label="Remover seleção"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Observação com Contador de Caracteres */}
              <div>
                <label htmlFor="observation" className="block text-xs font-bold text-pmmg-navy/80 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">description</span>
                    Observação Tática
                  </span>
                  <span className={`text-xs font-bold ${shareObservation.length > 200 ? 'text-pmmg-red' : 'text-pmmg-navy/60'}`}>
                    {shareObservation.length}/300
                  </span>
                </label>
                <textarea 
                  id="observation"
                  value={shareObservation}
                  onChange={(e) => setShareObservation(e.target.value.slice(0, 300))}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-pmmg-navy/20 rounded-xl text-sm focus:border-pmmg-yellow focus:ring-2 focus:ring-pmmg-yellow/30 transition-all resize-none"
                  placeholder="Ex: Visto em área de risco com veículo novo. Comportamento suspeito durante abordagem."
                />
                <p className="text-xs text-pmmg-navy/50 mt-1 italic">
                  Forneça detalhes relevantes para a operação
                </p>
              </div>
            </div>

            {/* Footer do Modal com Ações */}
            <div className="sticky bottom-0 bg-white border-t border-pmmg-navy/10 px-6 py-4 flex gap-3">
              <button 
                onClick={() => setIsSharing(false)}
                className="flex-1 bg-slate-200 text-pmmg-navy font-bold py-3 rounded-xl text-sm uppercase hover:bg-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleShare}
                disabled={!shareSuspectId || !shareObservation.trim() || isSharingLoading}
                className={`flex-1 font-bold py-3 rounded-xl text-sm uppercase transition-all ${
                  !shareSuspectId || !shareObservation.trim() || isSharingLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-pmmg-navy text-white hover:bg-pmmg-navy-dark'
                }`}
              >
                {isSharingLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Enviando...
                  </span>
                ) : (
                  <>
                    <span className="material-symbols-outlined mr-2">send</span>
                    Compartilhar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;