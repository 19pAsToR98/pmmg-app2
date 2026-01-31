import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Screen, Suspect, Officer, UserRank, Group } from '../types';

// Define the expected enriched types based on App.tsx logic
interface EnrichedGroupPost {
  id: string;
  suspectId: string;
  authorId: string;
  observation: string;
  timestamp: string; // Formatted string
  authorName: string;
  authorRank: UserRank;
  suspectName: string;
  suspectPhoto: string;
}

interface GroupParticipantDetail extends Officer {
  isAdmin: boolean;
  role: 'admin' | 'member';
}

interface EnrichedGroup extends Group {
  members: GroupParticipantDetail[];
  posts: EnrichedGroupPost[];
}

interface GroupDetailProps {
  navigateTo: (screen: Screen) => void;
  group: EnrichedGroup; // Using the enriched type
  allOfficers: Officer[]; 
  allSuspects: Suspect[]; 
  onOpenProfile: (id: string) => void;
  onShareSuspect: (groupId: string, suspectId: string, observation: string) => void;
  // Novas props para gerenciamento (simuladas no App.tsx)
  onUpdateGroup: (updatedGroup: Group) => void;
  onDeleteGroup: (groupId: string) => void;
}

type PostFilterStatus = Suspect['status'] | 'Todos';
const STATUS_OPTIONS: PostFilterStatus[] = ['Todos', 'Foragido', 'Suspeito', 'Preso', 'CPF Cancelado'];

// Mock User ID (assuming 'EU' is the current user)
const CURRENT_USER_ID = 'EU';


const GroupDetail: React.FC<GroupDetailProps> = ({ navigateTo, group, allSuspects, onOpenProfile, onShareSuspect, onUpdateGroup, onDeleteGroup }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'members'>('timeline');
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list');
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchSuspect, setSearchSuspect] = useState('');
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [observation, setObservation] = useState('');
  
  // Gerenciamento de Grupo
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [editDescription, setEditDescription] = useState(group.description);
  
  // Estados para filtros
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [postSearchQuery, setPostSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PostFilterStatus>('Todos');
  const [selectedMemberFilterId, setSelectedMemberFilterId] = useState<string | null>(null); 
  const [showTimelineFilters, setShowTimelineFilters] = useState(false);
  const timelineFilterRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCurrentUserAdmin = group.adminIds.includes(CURRENT_USER_ID);

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timelineFilterRef.current && !timelineFilterRef.current.contains(event.target as Node)) {
        setShowTimelineFilters(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Suspects filtering for the Share Modal
  const suspectsForShare = useMemo(() => {
    const term = searchSuspect.toLowerCase();
    return allSuspects.filter(s => 
      s.name.toLowerCase().includes(term) || 
      s.cpf.includes(searchSuspect) ||
      (s.nickname && s.nickname.toLowerCase().includes(term))
    );
  }, [searchSuspect, allSuspects]);

  // Lógica de filtragem da Timeline
  const filteredPosts = useMemo(() => {
    const query = postSearchQuery.toLowerCase();
    
    return group.posts.filter(post => {
      // 1. Busca Unificada
      const matchesSearch = !query || 
        post.suspectName.toLowerCase().includes(query) ||
        post.authorName.toLowerCase().includes(query) ||
        post.observation.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;

      // 2. Filtro de Membro
      const matchesAuthor = !selectedMemberFilterId || post.authorId === selectedMemberFilterId;
      if (!matchesAuthor) return false;
      
      // 3. Filtro de Status
      const suspect = allSuspects.find(s => s.id === post.suspectId);
      const matchesStatus = statusFilter === 'Todos' || (suspect && suspect.status === statusFilter);
      
      return matchesStatus;
    });
  }, [group.posts, postSearchQuery, selectedMemberFilterId, statusFilter, allSuspects]);
  
  // Lógica de filtragem de Membros
  const filteredMembers = useMemo(() => {
    const query = memberSearchQuery.toLowerCase();
    if (!query) return group.members;
    
    return group.members.filter(member => 
      member.name.toLowerCase().includes(query) ||
      member.unit.toLowerCase().includes(query) ||
      member.rank.toLowerCase().includes(query)
    );
  }, [memberSearchQuery, group.members]);


  const handleShare = () => {
    if (selectedSuspectId && observation.trim()) {
      onShareSuspect(group.id, selectedSuspectId, observation.trim());
      setSearchSuspect('');
      setSelectedSuspectId(null);
      setObservation('');
      setShowShareModal(false);
    } else {
      alert("Selecione um alvo e adicione uma observação.");
    }
  };

  const handleClearFilters = () => {
    setPostSearchQuery('');
    setStatusFilter('Todos');
    setSelectedMemberFilterId(null); // Limpa o filtro de membro
    setShowTimelineFilters(false);
  };
  
  const handleFilterByMember = (memberId: string) => {
    setSelectedMemberFilterId(memberId);
    setActiveTab('timeline');
  };
  
  const isFilterActive = postSearchQuery || statusFilter !== 'Todos' || selectedMemberFilterId !== null;
  const activeMemberFilter = group.members.find(m => m.id === selectedMemberFilterId);
  
  // --- Gerenciamento de Grupo Handlers ---
  
  const handleSaveGroupEdit = () => {
    if (!editName.trim() || !editDescription.trim()) {
      alert("Nome e descrição são obrigatórios.");
      return;
    }
    
    const updatedGroup: Group = {
      ...group,
      name: editName.trim(),
      description: editDescription.trim(),
      // Mantemos posts, members, etc., pois a edição é apenas de metadados
    };
    
    onUpdateGroup(updatedGroup);
    setShowEditModal(false);
    alert("Grupo atualizado com sucesso!");
  };
  
  const handleDeleteGroup = () => {
    onDeleteGroup(group.id);
    setShowDeleteConfirm(false);
    navigateTo('groupsList');
    alert(`Grupo ${group.name} excluído.`);
  };
  
  const handlePromoteMember = (memberId: string, memberName: string) => {
    if (!isCurrentUserAdmin) return;
    
    if (window.confirm(`Tem certeza que deseja promover ${memberName} a Administrador?`)) {
      const updatedGroup: Group = {
        ...group,
        adminIds: [...new Set([...group.adminIds, memberId])], // Adiciona o ID se ainda não estiver lá
      };
      onUpdateGroup(updatedGroup);
      alert(`${memberName} promovido a administrador.`);
    }
  };
  
  const handleDemoteMember = (memberId: string, memberName: string) => {
    if (!isCurrentUserAdmin) return;
    
    if (group.adminIds.length === 1) {
      alert("Não é possível remover o único administrador do grupo.");
      return;
    }
    
    if (window.confirm(`Tem certeza que deseja rebaixar ${memberName} para Membro?`)) {
      const updatedGroup: Group = {
        ...group,
        adminIds: group.adminIds.filter(id => id !== memberId),
      };
      onUpdateGroup(updatedGroup);
      alert(`${memberName} rebaixado para membro.`);
    }
  };
  
  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (!isCurrentUserAdmin) return;
    
    if (memberId === CURRENT_USER_ID) {
      alert("Você não pode se remover desta tela. Use a opção 'Sair do Grupo'.");
      return;
    }
    
    if (window.confirm(`Tem certeza que deseja remover ${memberName} do grupo?`)) {
      const updatedGroup: Group = {
        ...group,
        memberIds: group.memberIds.filter(id => id !== memberId),
        adminIds: group.adminIds.filter(id => id !== memberId), // Remove de admin também
      };
      onUpdateGroup(updatedGroup);
      alert(`${memberName} removido do grupo.`);
    }
  };


  return (
    <div className="flex flex-col h-full bg-theme-khaki overflow-hidden relative">
      <header className="bg-theme-navy px-4 pt-6 pb-4 shadow-xl z-50 shrink-0">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigateTo('groupsList')} className="text-white active:scale-90 transition-transform shrink-0">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-sm text-white leading-tight uppercase tracking-tight truncate">{group.name}</h1>
            <p className="text-[10px] font-bold text-theme-yellow tracking-wider uppercase mt-0.5">Código: {group.inviteCode}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Botão de Postar */}
            <button 
              onClick={() => {
                setSelectedSuspectId(null); // Reset selection
                setObservation('');
                setShowShareModal(true);
              }}
              className="bg-theme-yellow text-theme-navy px-3 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg flex items-center gap-2 active:scale-95 transition-transform shrink-0"
            >
              <span className="material-symbols-outlined text-sm font-bold">share</span>
              Postar
            </button>
            
            {/* Menu de Opções (Apenas para Admins) */}
            {isCurrentUserAdmin && (
              <div className="relative shrink-0">
                <button 
                  onClick={() => setShowMenu(prev => !prev)}
                  className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-xl">more_vert</span>
                </button>
                
                {showMenu && (
                  <div 
                    ref={menuRef}
                    className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-theme-navy/10 z-[100] p-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <button 
                      onClick={() => { setShowEditModal(true); setShowMenu(false); }}
                      className="flex items-center gap-2 w-full p-2 text-sm text-theme-navy hover:bg-slate-100 rounded-lg"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span> Editar Grupo
                    </button>
                    <button 
                      onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                      className="flex items-center gap-2 w-full p-2 text-sm text-theme-red hover:bg-red-50 rounded-lg"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span> Excluir Grupo
                    </button>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <button 
                      onClick={() => { alert('Saindo do grupo...'); navigateTo('groupsList'); }}
                      className="flex items-center gap-2 w-full p-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span> Sair do Grupo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-black/20 rounded-2xl">
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'timeline' ? 'bg-white text-theme-navy shadow-md' : 'text-white/40'
            }`}
          >
            Compartilhamentos
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'members' ? 'bg-white text-theme-navy shadow-md' : 'text-white/40'
            }`}
          >
            Membros ({group.members.length})
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-4 no-scrollbar">
        {activeTab === 'timeline' ? (
          <div className="p-4 space-y-4">
            {/* Barra de Busca e Alternância de Visualização */}
            <div className="flex items-center gap-2 mb-2 relative">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-theme-navy/30 text-lg">search</span>
                <input 
                  value={postSearchQuery}
                  onChange={(e) => setPostSearchQuery(e.target.value)}
                  placeholder="BUSCAR NOME, CPF OU OBSERVAÇÃO..."
                  className="w-full pl-9 pr-4 py-3 bg-white/60 border-none rounded-2xl text-[10px] font-black uppercase placeholder:text-slate-400 focus:ring-2 focus:ring-theme-navy/10 transition-all shadow-inner"
                />
              </div>
              
              <div className="flex bg-white/40 p-1 rounded-2xl border border-white/20 shadow-sm shrink-0">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-theme-navy text-theme-yellow shadow-md' : 'text-theme-navy/40'}`}
                >
                  <span className="material-symbols-outlined text-xl">view_day</span>
                </button>
                <button 
                  onClick={() => setViewMode('gallery')}
                  className={`p-2 rounded-xl transition-all ${viewMode === 'gallery' ? 'bg-theme-navy text-theme-yellow shadow-md' : 'text-theme-navy/40'}`}
                >
                  <span className="material-symbols-outlined text-xl">grid_view</span>
                </button>
              </div>

              <button 
                onClick={() => setShowTimelineFilters(prev => !prev)}
                className={`p-3 rounded-2xl flex items-center justify-center transition-all shrink-0 ${isFilterActive ? 'bg-theme-yellow text-theme-navy shadow-md' : 'bg-white/40 text-theme-navy border border-white/20'}`}
              >
                <span className={`material-symbols-outlined text-xl ${isFilterActive ? 'fill-icon' : ''}`}>tune</span>
              </button>

              {/* Menu de Filtro da Timeline */}
              {showTimelineFilters && (
                <div 
                  ref={timelineFilterRef}
                  className="absolute top-full right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-theme-navy/10 z-[100] p-5 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-theme-navy/60">Filtros Operacionais</h4>
                    {isFilterActive && (
                      <button 
                        onClick={handleClearFilters}
                        className="text-[8px] font-black text-theme-red uppercase"
                      >
                        Limpar Tudo
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-5">
                    {/* Filtro por Status */}
                    <div>
                      <label className="block text-[8px] font-black uppercase text-theme-navy/40 mb-2 tracking-wider">Status do Indivíduo</label>
                      <div className="flex flex-wrap gap-2 pb-1 no-scrollbar">
                        {STATUS_OPTIONS.map(opt => (
                          <button
                            key={opt}
                            onClick={() => setStatusFilter(opt)}
                            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all border shrink-0 ${
                              statusFilter === opt 
                              ? 'bg-theme-navy text-white border-theme-navy shadow-md' 
                              : 'bg-slate-50 text-theme-navy/60 border-slate-200'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowTimelineFilters(false)}
                    className="w-full mt-6 bg-theme-navy text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
                  >
                    Aplicar Filtros ({filteredPosts.length})
                  </button>
                </div>
              )}
            </div>

            {/* Chips de filtros ativos */}
            {isFilterActive && (
              <div className="flex flex-wrap gap-2 mb-2">
                {postSearchQuery && (
                  <div className="bg-theme-navy/10 text-theme-navy px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1 border border-theme-navy/10">
                    Busca: {postSearchQuery}
                    <button onClick={() => setPostSearchQuery('')} className="material-symbols-outlined text-xs">close</button>
                  </div>
                )}
                {statusFilter !== 'Todos' && (
                  <div className="bg-theme-navy/10 text-theme-navy px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1 border border-theme-navy/10">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter('Todos')} className="material-symbols-outlined text-xs">close</button>
                  </div>
                )}
                {selectedMemberFilterId && activeMemberFilter && (
                  <div className="bg-theme-navy/10 text-theme-navy px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1 border border-theme-navy/10">
                    Autor: {activeMemberFilter.name.split(' ')[0]}
                    <button onClick={() => setSelectedMemberFilterId(null)} className="material-symbols-outlined text-xs">close</button>
                  </div>
                )}
              </div>
            )}

            {filteredPosts.length > 0 ? (
              viewMode === 'list' ? (
                <div className="space-y-6 mt-4 animate-in fade-in duration-300">
                  {filteredPosts.map((post) => (
                    <div key={post.id} className="relative pl-6">
                      {/* Timeline Connector */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-theme-navy/10 rounded-full"></div>
                      <div className="absolute left-[-4px] top-4 w-3 h-3 bg-theme-navy border-2 border-white rounded-full shadow-sm"></div>

                      <div className="pmmg-card overflow-hidden shadow-md">
                        <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-theme-navy text-theme-yellow text-[9px] font-black flex items-center justify-center uppercase border-2 border-white shadow-sm">
                              {post.authorName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-theme-navy uppercase leading-none">{post.authorRank} {post.authorName}</p>
                              <p className="text-[8px] font-bold text-slate-400 mt-0.5">{post.timestamp}</p>
                            </div>
                          </div>
                        </div>

                        <div 
                          onClick={() => onOpenProfile(post.suspectId)}
                          className="flex p-3 gap-3 active:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div className="w-20 h-24 bg-slate-200 rounded-lg overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                            <img src={post.suspectPhoto} alt={post.suspectName} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="text-[11px] font-black text-theme-navy uppercase tracking-tight line-clamp-2 leading-tight mb-1">{post.suspectName}</h4>
                            <p className="text-[9px] font-bold text-theme-red italic uppercase">Visualizar Ficha Técnica</p>
                          </div>
                          <span className="material-symbols-outlined text-slate-200 self-center">chevron_right</span>
                        </div>

                        {post.observation && (
                          <div className="px-4 pb-4">
                            <div className="bg-theme-navy/5 p-3 rounded-xl border border-theme-navy/5">
                              <p className="text-[11px] text-slate-600 font-medium italic leading-relaxed">
                                "{post.observation}"
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* MODO GALERIA PARA O GRUPO */
                <div className="grid grid-cols-3 gap-3 mt-4 animate-in zoom-in-95 duration-300">
                  {filteredPosts.map((post) => (
                    <div 
                      key={post.id}
                      onClick={() => onOpenProfile(post.suspectId)}
                      className="relative aspect-[3/4] pmmg-card overflow-hidden shadow-lg border-2 border-theme-navy/10 active:scale-95 transition-all cursor-pointer"
                    >
                      <img src={post.suspectPhoto} alt={post.suspectName} className="w-full h-full object-cover" />
                      
                      {/* Autor Badge */}
                      <div className="absolute top-1 left-1 bg-theme-navy/70 backdrop-blur-sm text-[6px] font-black text-white px-1.5 py-0.5 rounded uppercase tracking-tighter z-10">
                        {post.authorName.split(' ')[0]}
                      </div>

                      {/* Info Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-1.5 pt-4">
                        <p className="text-[8px] font-black text-white uppercase truncate text-center drop-shadow-md">
                          {post.suspectName.split(' ')[0]}
                        </p>
                        <p className="text-[6px] text-theme-yellow/80 font-bold uppercase text-center tracking-tighter mt-0.5">
                          {post.timestamp.split(' ')[0]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-32 opacity-20">
                <span className="material-symbols-outlined text-7xl">post_add</span>
                <p className="text-sm font-black uppercase mt-4 tracking-[0.2em]">
                  {group.posts.length > 0 ? 'Nenhum resultado para os filtros' : 'Sem publicações ainda'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div className="bg-white/40 p-4 rounded-3xl border border-white/20 mb-6 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-theme-navy/40 uppercase tracking-widest mb-1">Convite para Oficiais</p>
                <p className="text-sm font-black text-theme-navy tracking-widest">{group.inviteCode}</p>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(group.inviteCode);
                  alert('Código de convite copiado para a área de transferência!');
                }}
                className="w-10 h-10 bg-theme-navy text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-lg">content_copy</span>
              </button>
            </div>
            
            {/* Campo de Pesquisa de Membros */}
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-theme-navy/30 text-lg">search</span>
              <input 
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="BUSCAR MEMBRO (NOME, UNIDADE, POSTO)..."
                className="w-full pl-10 pr-4 py-3 bg-white/60 border-none rounded-2xl text-[10px] font-black uppercase placeholder:text-slate-400 focus:ring-2 focus:ring-theme-navy/10 transition-all shadow-inner"
              />
            </div>

            {filteredMembers.length > 0 ? filteredMembers.map(member => (
              <div 
                key={member.id} 
                className="pmmg-card p-3 flex items-center justify-between shadow-sm border-l-4 border-l-theme-navy"
              >
                <div 
                  onClick={() => handleFilterByMember(member.id)}
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer active:scale-[0.99] transition-transform"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-300 shrink-0">
                    <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-theme-navy uppercase leading-none">{member.rank} {member.name}</h4>
                    <span className={`text-[8px] font-black uppercase tracking-tighter ${member.role === 'admin' ? 'text-theme-red' : 'text-slate-400'}`}>
                      {member.role === 'admin' ? 'Responsável Técnico' : 'Agente Operacional'}
                    </span>
                  </div>
                </div>
                
                {/* Ações de Gerenciamento (Apenas para Admins) */}
                {isCurrentUserAdmin && member.id !== CURRENT_USER_ID && (
                  <div className="flex items-center gap-2 shrink-0">
                    {member.isAdmin ? (
                      <button 
                        onClick={() => handleDemoteMember(member.id, member.name)}
                        className="text-theme-yellow/80 hover:text-theme-yellow active:scale-90 transition-transform p-1"
                        title="Rebaixar para Membro"
                      >
                        <span className="material-symbols-outlined text-xl fill-icon">star_half</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => handlePromoteMember(member.id, member.name)}
                        className="text-green-600/80 hover:text-green-600 active:scale-90 transition-transform p-1"
                        title="Promover a Admin"
                      >
                        <span className="material-symbols-outlined text-xl">star</span>
                      </button>
                    )}
                    <button 
                      onClick={() => handleRemoveMember(member.id, member.name)}
                      className="text-theme-red/40 hover:text-theme-red active:scale-90 transition-transform p-1"
                      title="Remover do Grupo"
                    >
                      <span className="material-symbols-outlined text-xl">person_remove</span>
                    </button>
                  </div>
                )}
                
                {/* Ícone de navegação (se não for admin ou se for o próprio usuário) */}
                {(!isCurrentUserAdmin || member.id === CURRENT_USER_ID) && (
                    <span className="material-symbols-outlined text-theme-navy/40 text-lg shrink-0">arrow_forward_ios</span>
                )}
              </div>
            )) : (
              <div className="text-center py-10 opacity-40">
                <span className="material-symbols-outlined text-5xl">person_search</span>
                <p className="text-xs font-bold uppercase mt-2">Nenhum membro encontrado</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: Editar Grupo */}
      {showEditModal && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-theme-navy/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6">
            <h3 className="text-lg font-black text-theme-navy uppercase mb-4 border-b pb-2">Editar Grupo</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-theme-navy/70 mb-1 ml-1 tracking-wider">Nome do Grupo</label>
                <input 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/80 border border-theme-navy/20 focus:border-theme-navy focus:ring-1 focus:ring-theme-navy rounded-lg text-sm" 
                  type="text" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-theme-navy/70 mb-1 ml-1 tracking-wider">Descrição Tática</label>
                <textarea 
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="block w-full px-4 py-3 bg-white/80 border border-theme-navy/20 focus:border-theme-navy focus:ring-1 focus:ring-theme-navy rounded-lg text-sm" 
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-slate-200 text-theme-navy font-bold py-3 rounded-xl text-xs uppercase"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveGroupEdit}
                className="flex-1 bg-theme-navy text-white font-bold py-3 rounded-xl text-xs uppercase"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* MODAL: Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-theme-navy/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center">
            <span className="material-symbols-outlined text-theme-red text-5xl mb-4 fill-icon">warning</span>
            <h3 className="text-lg font-black text-theme-navy uppercase mb-2">Excluir Grupo?</h3>
            <p className="text-sm text-slate-600 mb-6">Esta ação é irreversível e removerá todos os dados e posts do grupo "{group.name}".</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-slate-200 text-theme-navy font-bold py-3 rounded-xl text-xs uppercase"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteGroup}
                className="flex-1 bg-theme-red text-white font-bold py-3 rounded-xl text-xs uppercase"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Suspect Modal (Mantido) */}
      {showShareModal && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center p-4 bg-theme-navy/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-10 duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-6 shrink-0">
               <div>
                  <h3 className="text-lg font-black text-theme-navy uppercase leading-none">Compartilhar Ficha</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Alimentar Rede de Inteligência</p>
               </div>
               <button onClick={() => setShowShareModal(false)} className="w-10 h-10 bg-slate-100 rounded-full text-slate-400 flex items-center justify-center active:scale-90 transition-transform shrink-0">
                  <span className="material-symbols-outlined">close</span>
               </button>
            </div>

            {!selectedSuspectId ? (
              <>
                <div className="relative mb-4 shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-theme-navy/30">search</span>
                  <input 
                    value={searchSuspect}
                    onChange={(e) => setSearchSuspect(e.target.value)}
                    placeholder="BUSCAR NOME OU CPF..."
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase placeholder:text-slate-300 shadow-inner"
                  />
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 mb-4">
                  {suspectsForShare.length > 0 ? suspectsForShare.map(s => (
                    <div 
                      key={s.id}
                      onClick={() => setSelectedSuspectId(s.id)}
                      className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100 active:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <img src={s.photoUrl} className="w-12 h-14 rounded-lg object-cover shadow-sm" />
                      <div>
                        <p className="text-[10px] font-black text-theme-navy uppercase leading-tight">{s.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">{s.cpf}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-[10px] text-theme-navy/50 mt-4">Nenhum suspeito encontrado.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 bg-theme-navy/5 p-4 rounded-3xl border border-theme-navy/5 shrink-0">
                  <img 
                    src={allSuspects.find(s => s.id === selectedSuspectId)?.photoUrl} 
                    className="w-16 h-20 rounded-xl object-cover shadow-lg" 
                    alt="Suspect"
                  />
                  <div>
                    <p className="text-[9px] font-black text-theme-navy/40 uppercase tracking-widest">Alvo Selecionado</p>
                    <h4 className="text-sm font-black text-theme-navy uppercase mt-1">{allSuspects.find(s => s.id === selectedSuspectId)?.name}</h4>
                    <button onClick={() => setSelectedSuspectId(null)} className="text-[9px] font-black text-theme-red uppercase mt-2 active:opacity-70 transition-opacity">Alterar Alvo</button>
                  </div>
                </div>

                <div className="flex-1 min-h-[150px]">
                  <label className="block text-[10px] font-black uppercase text-theme-navy/40 mb-2 ml-2 tracking-widest">Observação Tática</label>
                  <textarea 
                    autoFocus
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-medium italic h-full min-h-[150px] shadow-inner"
                    placeholder="Descreva a movimentação, novas evidências ou local de avistamento..."
                  />
                </div>

                <button 
                  onClick={handleShare}
                  disabled={!observation.trim()}
                  className="w-full bg-theme-navy text-white py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-transform disabled:opacity-50 shrink-0"
                >
                  Confirmar Postagem
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;