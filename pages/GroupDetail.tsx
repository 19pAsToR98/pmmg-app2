import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Screen, Suspect, Officer, UserRank, Group } from '../types';
import GroupTimelineFilters from '../components/GroupTimelineFilters';

// Define the expected enriched types based on App.tsx logic
interface EnrichedGroupPost {
  id: string;
  type: 'suspect' | 'event'; // NEW
  suspectId?: string;
  authorId: string;
  observation?: string;
  eventType?: 'member_joined' | 'member_removed' | 'group_created'; // NEW
  eventTargetId?: string; // NEW
  timestamp: string; // Formatted string
  authorName: string;
  authorRank: UserRank;
  suspectName?: string;
  suspectPhoto?: string;
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
  onJoinGroup: () => void; // NOVO: Função de teste para entrada de membro
  shareTarget: { suspectId: string, groupId: string } | null; // NOVO: Alvo de compartilhamento pré-selecionado
}

type ActiveTab = 'timeline' | 'members'; // Revertido para 2 tabs
type PostFilterStatus = Suspect['status'] | 'Todos';
const STATUS_OPTIONS: PostFilterStatus[] = ['Todos', 'Foragido', 'Suspeito', 'Preso', 'CPF Cancelado'];

// Mock User ID (assuming 'EU' is the current user)
const CURRENT_USER_ID = 'EU';


const GroupDetail: React.FC<GroupDetailProps> = ({ navigateTo, group, allSuspects, onOpenProfile, onShareSuspect, onUpdateGroup, onDeleteGroup, onJoinGroup, shareTarget }) => {
  // Em desktop, a aba 'members' é renderizada na lateral, mas o estado ainda controla a visualização mobile
  const [activeTab, setActiveTab] = useState<ActiveTab>('timeline');
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

  // EFEITO: Abrir modal de compartilhamento se houver um alvo pré-selecionado
  useEffect(() => {
    if (shareTarget && shareTarget.suspectId) {
      setSelectedSuspectId(shareTarget.suspectId);
      setShowShareModal(true);
      // Limpar a observação para forçar o usuário a digitar
      setObservation(''); 
    }
  }, [shareTarget]);


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
      // Filtros de status e busca só se aplicam a posts de suspeito
      if (post.type === 'event') {
        return true; // Eventos sempre aparecem, a menos que a busca seja muito específica
      }
      
      // 1. Busca Unificada (apenas para posts de suspeito)
      const matchesSearch = !query || 
        (post.suspectName && post.suspectName.toLowerCase().includes(query)) ||
        post.authorName.toLowerCase().includes(query) ||
        (post.observation && post.observation.toLowerCase().includes(query));
      
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
  
  // Função auxiliar para renderizar um post da timeline
  const renderTimelinePost = (post: EnrichedGroupPost) => {
    const baseClasses = "relative pl-6";
    const connectorClasses = "absolute left-0 top-0 bottom-0 w-1 bg-pmmg-navy/10 dark:bg-slate-700 rounded-full";
    
    if (post.type === 'event') {
      const targetMember = group.members.find(m => m.id === post.eventTargetId);
      
      let message = '';
      let icon = 'info';
      let color = 'text-pmmg-blue';
      
      if (post.eventType === 'member_joined' && targetMember) {
        message = `${targetMember.rank} ${targetMember.name} entrou no grupo.`;
        icon = 'person_add';
        color = 'text-green-600';
      } else if (post.eventType === 'group_created') {
        message = `Grupo criado por ${post.authorName}.`;
        icon = 'group_add';
        color = 'text-pmmg-yellow';
      } else {
        message = `Evento administrativo: ${post.eventType}`;
      }
      
      return (
        <div key={post.id} className={baseClasses}>
          <div className={connectorClasses}></div>
          <div className={`absolute left-[-4px] top-4 w-3 h-3 ${color.replace('text-', 'bg-')} border-2 border-white dark:border-slate-900 rounded-full shadow-sm`}></div>
          
          <div className="pmmg-card p-3 bg-white/80 dark:bg-slate-800 border-l-4 border-l-pmmg-navy/20 dark:border-l-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined text-xl ${color} fill-icon`}>{icon}</span>
              <p className="text-[11px] font-bold text-pmmg-navy dark:text-slate-200 uppercase leading-tight">{message}</p>
            </div>
            <p className="text-[8px] font-bold text-slate-400 mt-1 ml-8">{post.timestamp}</p>
          </div>
        </div>
      );
    }
    
    // Renderização de posts de suspeito (existente)
    const suspectPost = post as EnrichedGroupPost;
    
    return (
      <div key={suspectPost.id} className={baseClasses}>
        {/* Timeline Connector */}
        <div className={connectorClasses}></div>
        <div className="absolute left-[-4px] top-4 w-3 h-3 bg-pmmg-navy border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></div>

        <div className="pmmg-card overflow-hidden shadow-md">
          <div className="p-3 bg-slate-50 dark:bg-slate-700 border-b border-slate-100 dark:border-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-pmmg-navy text-pmmg-yellow text-[9px] font-black flex items-center justify-center uppercase border-2 border-white dark:border-slate-800 shadow-sm">
                {suspectPost.authorName.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] font-black text-pmmg-navy dark:text-slate-200 uppercase leading-none">{suspectPost.authorRank} {suspectPost.authorName}</p>
                <p className="text-[8px] font-bold text-slate-400 mt-0.5">{suspectPost.timestamp}</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => suspectPost.suspectId && onOpenProfile(suspectPost.suspectId)}
            className="flex p-3 gap-3 active:bg-slate-50 dark:active:bg-slate-700 transition-colors cursor-pointer"
          >
            <div className="w-20 h-24 bg-slate-200 rounded-lg overflow-hidden border border-slate-200 shrink-0 shadow-sm">
              <img src={suspectPost.suspectPhoto} alt={suspectPost.suspectName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="text-[11px] font-black text-pmmg-navy dark:text-slate-200 uppercase tracking-tight line-clamp-2 leading-tight mb-1">{suspectPost.suspectName}</h4>
              <p className="text-[9px] font-bold text-pmmg-red italic uppercase">Visualizar Ficha Técnica</p>
            </div>
            <span className="material-symbols-outlined text-slate-200 dark:text-slate-600 self-center">chevron_right</span>
          </div>

          {suspectPost.observation && (
            <div className="px-4 pb-4">
              <div className="bg-pmmg-navy/5 dark:bg-slate-700 p-3 rounded-xl border border-pmmg-navy/5 dark:border-slate-600">
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium italic leading-relaxed">
                  "{suspectPost.observation}"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Componente para renderizar a lista de membros (usado na aba mobile e na sidebar desktop)
  const MemberList = () => (
    <div className="space-y-3">
      {/* Campo de Pesquisa de Membros */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-pmmg-navy/30 dark:text-slate-500 text-lg">search</span>
        <input 
          value={memberSearchQuery}
          onChange={(e) => setMemberSearchQuery(e.target.value)}
          placeholder="BUSCAR MEMBRO (NOME, UNIDADE, POSTO)..."
          className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-slate-700 border-none rounded-2xl text-[10px] font-black uppercase placeholder:text-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-pmmg-navy/10 transition-all shadow-inner dark:text-slate-200"
        />
      </div>

      {filteredMembers.length > 0 ? filteredMembers.map(member => (
        <div 
          key={member.id} 
          className="pmmg-card p-3 flex items-center justify-between shadow-sm border-l-4 border-l-pmmg-navy dark:border-l-pmmg-yellow"
        >
          <div 
            onClick={() => handleFilterByMember(member.id)}
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer active:scale-[0.99] transition-transform"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-300 shrink-0">
              <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-pmmg-navy dark:text-slate-200 uppercase leading-none">{member.rank} {member.name}</h4>
              <span className={`text-[8px] font-black uppercase tracking-tighter ${member.role === 'admin' ? 'text-pmmg-red' : 'text-slate-400 dark:text-slate-500'}`}>
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
                  className="text-pmmg-yellow/80 hover:text-pmmg-yellow active:scale-90 transition-transform p-1"
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
                className="text-pmmg-red/40 hover:text-pmmg-red active:scale-90 transition-transform p-1"
                title="Remover do Grupo"
              >
                <span className="material-symbols-outlined text-xl">person_remove</span>
              </button>
            </div>
          )}
          
          {/* Ícone de navegação (se não for admin ou se for o próprio usuário) */}
          {(!isCurrentUserAdmin || member.id === CURRENT_USER_ID) && (
              <span className="material-symbols-outlined text-pmmg-navy/40 dark:text-slate-600 text-lg shrink-0">arrow_forward_ios</span>
          )}
        </div>
      )) : (
        <div className="text-center py-10 opacity-40">
          <span className="material-symbols-outlined text-5xl">person_search</span>
          <p className="text-xs font-bold uppercase mt-2">Nenhum membro encontrado</p>
        </div>
      )}
    </div>
  );


  return (
    <div className="flex flex-col h-full bg-pmmg-khaki dark:bg-slate-900 overflow-hidden relative">
      
      {/* ==================================================================================================== */}
      {/* MOBILE HEADER & TABS */}
      {/* ==================================================================================================== */}
      <div className="lg:hidden">
        <header className="bg-pmmg-navy px-4 pt-6 pb-4 shadow-xl z-50 shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigateTo('groupsList')} className="text-white active:scale-90 transition-transform shrink-0">
              <span className="material-symbols-outlined">arrow_back_ios</span>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-black text-sm text-white leading-tight uppercase tracking-tight truncate">{group.name}</h1>
              <p className="text-[10px] font-bold text-pmmg-yellow tracking-wider uppercase mt-0.5">Código: {group.inviteCode}</p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* NOVO: Botão de Mapa Tático */}
              <button 
                onClick={() => navigateTo('groupMap')}
                className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center active:scale-95 transition-transform shrink-0"
                title="Ver Mapa Tático do Grupo"
              >
                <span className="material-symbols-outlined text-xl">map</span>
              </button>
              
              {/* Botão de Postar */}
              <button 
                onClick={() => {
                  setSelectedSuspectId(null); // Reset selection
                  setObservation('');
                  setShowShareModal(true);
                }}
                className="bg-pmmg-yellow text-pmmg-navy px-3 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg flex items-center gap-2 active:scale-95 transition-transform shrink-0"
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
                      className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-pmmg-navy/10 dark:border-slate-700 z-[100] p-2 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      <button 
                        onClick={() => { setShowEditModal(true); setShowMenu(false); }}
                        className="flex items-center gap-2 w-full p-2 text-sm text-pmmg-navy dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span> Editar Grupo
                      </button>
                      <button 
                        onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                        className="flex items-center gap-2 w-full p-2 text-sm text-pmmg-red hover:bg-red-50 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span> Excluir Grupo
                      </button>
                      <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                      <button 
                        onClick={() => { alert('Saindo do grupo...'); navigateTo('groupsList'); }}
                        className="flex items-center gap-2 w-full p-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
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
                activeTab === 'timeline' ? 'bg-white dark:bg-slate-800 text-pmmg-navy dark:text-pmmg-yellow shadow-md' : 'text-white/40'
              }`}
            >
              Compartilhamentos
            </button>
            <button 
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'members' ? 'bg-white dark:bg-slate-800 text-pmmg-navy dark:text-pmmg-yellow shadow-md' : 'text-white/40'
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-pmmg-navy/30 dark:text-slate-500 text-lg">search</span>
                  <input 
                    value={postSearchQuery}
                    onChange={(e) => setPostSearchQuery(e.target.value)}
                    placeholder="BUSCAR NOME, CPF OU OBSERVAÇÃO..."
                    className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-slate-700 border-none rounded-2xl text-[10px] font-black uppercase placeholder:text-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-pmmg-navy/10 transition-all shadow-inner dark:text-slate-200"
                  />
                </div>
                
                <div className="flex bg-white/40 dark:bg-slate-700 p-1 rounded-2xl border border-white/20 dark:border-slate-600 shadow-sm shrink-0">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-pmmg-navy text-pmmg-yellow shadow-md' : 'text-pmmg-navy/40 dark:text-slate-400'}`}
                  >
                    <span className="material-symbols-outlined text-xl">view_day</span>
                  </button>
                  <button 
                    onClick={() => setViewMode('gallery')}
                    className={`p-2 rounded-xl transition-all ${viewMode === 'gallery' ? 'bg-pmmg-navy text-pmmg-yellow shadow-md' : 'text-pmmg-navy/40 dark:text-slate-400'}`}
                  >
                    <span className="material-symbols-outlined text-xl">grid_view</span>
                  </button>
                </div>

                <button 
                  onClick={() => setShowTimelineFilters(prev => !prev)}
                  className={`p-3 rounded-2xl flex items-center justify-center transition-all shrink-0 ${isFilterActive ? 'bg-pmmg-yellow text-primary-dark shadow-md' : 'bg-white/40 dark:bg-slate-700 text-pmmg-navy dark:text-slate-200 border border-white/20 dark:border-slate-600'}`}
                >
                  <span className={`material-symbols-outlined text-xl ${isFilterActive ? 'fill-icon' : ''}`}>tune</span>
                </button>

                {/* Menu de Filtro da Timeline */}
                {showTimelineFilters && (
                  <div 
                    ref={timelineFilterRef}
                    className="absolute top-full right-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-pmmg-navy/10 dark:border-slate-700 z-[100] p-5 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-pmmg-navy/60 dark:text-slate-400">Filtros Operacionais</h4>
                      {isFilterActive && (
                        <button 
                          onClick={handleClearFilters}
                          className="text-[8px] font-black text-pmmg-red uppercase"
                        >
                          Limpar Tudo
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-5">
                      {/* Filtro por Status */}
                      <div>
                        <label className="block text-[8px] font-black uppercase text-pmmg-navy/40 dark:text-slate-500 mb-2 tracking-wider">Status do Indivíduo</label>
                        <div className="flex flex-wrap gap-2 pb-1 no-scrollbar">
                          {STATUS_OPTIONS.map(opt => (
                            <button
                              key={opt}
                              onClick={() => setStatusFilter(opt)}
                              className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all border shrink-0 ${
                                statusFilter === opt 
                                ? 'bg-pmmg-navy text-white border-pmmg-navy shadow-md' 
                                : 'bg-slate-50 dark:bg-slate-700 text-pmmg-navy/60 dark:text-slate-300 border-slate-200 dark:border-slate-600'
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
                      className="w-full mt-6 bg-pmmg-navy text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
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
                    <div className="bg-pmmg-navy/10 dark:bg-slate-700 text-pmmg-navy dark:text-slate-300 px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1 border border-pmmg-navy/10 dark:border-slate-600">
                      Busca: {postSearchQuery}
                      <button onClick={() => setPostSearchQuery('')} className="material-symbols-outlined text-xs">close</button>
                    </div>
                  )}
                  {statusFilter !== 'Todos' && (
                    <div className="bg-pmmg-navy/10 dark:bg-slate-700 text-pmmg-navy dark:text-slate-300 px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1 border border-pmmg-navy/10 dark:border-slate-600">
                      Status: {statusFilter}
                      <button onClick={() => setStatusFilter('Todos')} className="material-symbols-outlined text-xs">close</button>
                    </div>
                  )}
                  {selectedMemberFilterId && activeMemberFilter && (
                    <div className="bg-pmmg-navy/10 dark:bg-slate-700 text-pmmg-navy dark:text-slate-300 px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1 border border-pmmg-navy/10 dark:border-slate-600">
                      Autor: {activeMemberFilter.name.split(' ')[0]}
                      <button onClick={() => setSelectedMemberFilterId(null)} className="material-symbols-outlined text-xs">close</button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Botão de teste para entrada de membro */}
              <button 
                onClick={onJoinGroup}
                className="w-full bg-green-500 text-white text-[10px] font-bold py-2 rounded-xl uppercase tracking-widest active:scale-[0.98] transition-transform"
              >
                [TESTE] Adicionar Cap. Pereira (o2)
              </button>

              {filteredPosts.length > 0 ? (
                viewMode === 'list' ? (
                  <div className="space-y-6 mt-4 animate-in fade-in duration-300">
                    {filteredPosts.map(renderTimelinePost)}
                  </div>
                ) : (
                  /* MODO GALERIA PARA O GRUPO */
                  <div className="grid grid-cols-3 gap-3 mt-4 animate-in zoom-in-95 duration-300">
                    {filteredPosts.filter(p => p.type === 'suspect').map((post) => (
                      <div 
                        key={post.id}
                        onClick={() => post.suspectId && onOpenProfile(post.suspectId)}
                        className="relative aspect-[3/4] pmmg-card overflow-hidden shadow-lg border-2 border-pmmg-navy/10 dark:border-slate-700 active:scale-95 transition-all cursor-pointer"
                      >
                        <img src={post.suspectPhoto} alt={post.suspectName} className="w-full h-full object-cover" />
                        
                        {/* Autor Badge */}
                        <div className="absolute top-1 left-1 bg-pmmg-navy/70 backdrop-blur-sm text-[6px] font-black text-white px-1.5 py-0.5 rounded uppercase tracking-tighter z-10">
                          {post.authorName.charAt(0)}
                        </div>

                        {/* Info Overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-1.5 pt-4">
                          <p className="text-[8px] font-black text-white uppercase truncate text-center drop-shadow-md">
                            {post.suspectName?.split(' ')[0]}
                          </p>
                          <p className="text-[6px] text-pmmg-yellow/80 font-bold uppercase text-center tracking-tighter mt-0.5">
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
              <div className="bg-white/40 dark:bg-slate-700 p-4 rounded-3xl border border-white/20 dark:border-slate-600 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-pmmg-navy/40 dark:text-slate-400 uppercase tracking-widest mb-1">Convite para Oficiais</p>
                  <p className="text-sm font-black text-pmmg-navy dark:text-slate-200 tracking-widest">{group.inviteCode}</p>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(group.inviteCode);
                    alert('Código de convite copiado para a área de transferência!');
                  }}
                  className="w-10 h-10 bg-pmmg-navy text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined text-lg">content_copy</span>
                </button>
              </div>
              
              <MemberList />
            </div>
          )}
        </main>
      </div>
      
      {/* ==================================================================================================== */}
      {/* DESKTOP VIEW (New) */}
      {/* ==================================================================================================== */}
      <div className="hidden lg:flex flex-col h-full">
        
        {/* Desktop Header */}
        <header className="sticky top-0 z-50 bg-pmmg-navy px-8 pt-6 pb-4 shadow-xl shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigateTo('groupsList')} className="text-white active:scale-90 transition-transform shrink-0">
                <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="font-black text-xl text-white leading-tight uppercase tracking-tight truncate">{group.name}</h1>
                <p className="text-[11px] font-bold text-pmmg-yellow tracking-wider uppercase mt-1">Grupo Tático • {group.members.length} Membros</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Botão de Mapa Tático */}
              <button 
                onClick={() => navigateTo('groupMap')}
                className="bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 active:scale-95 transition-transform"
                title="Ver Mapa Tático do Grupo"
              >
                <span className="material-symbols-outlined text-xl">map</span>
                Mapa Tático
              </button>
              
              {/* Botão de Postar */}
              <button 
                onClick={() => {
                  setSelectedSuspectId(null); 
                  setObservation('');
                  setShowShareModal(true);
                }}
                className="bg-pmmg-yellow text-pmmg-navy px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg flex items-center gap-2 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-lg font-bold">share</span>
                Postar Ficha
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
                      className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-pmmg-navy/10 dark:border-slate-700 z-[100] p-2 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      <button 
                        onClick={() => { setShowEditModal(true); setShowMenu(false); }}
                        className="flex items-center gap-2 w-full p-2 text-sm text-pmmg-navy dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span> Editar Grupo
                      </button>
                      <button 
                        onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                        className="flex items-center gap-2 w-full p-2 text-sm text-pmmg-red hover:bg-red-50 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span> Excluir Grupo
                      </button>
                      <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                      <button 
                        onClick={() => { alert('Saindo do grupo...'); navigateTo('groupsList'); }}
                        className="flex items-center gap-2 w-full p-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-lg">logout</span> Sair do Grupo
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Desktop Main Content: Two Columns */}
        <main className="flex-1 overflow-y-auto p-8 no-scrollbar grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna 1 & 2: Timeline (Ocupa 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-5 w-1.5 bg-pmmg-navy rounded-full"></div>
              <h3 className="text-sm font-black text-pmmg-navy/80 dark:text-slate-400 uppercase tracking-widest">Timeline de Compartilhamentos</h3>
            </div>
            
            {/* Barra de Busca e Alternância de Visualização (Desktop) */}
            <div className="flex items-center gap-4 mb-4 relative">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-pmmg-navy/30 dark:text-slate-500 text-lg">search</span>
                <input 
                  value={postSearchQuery}
                  onChange={(e) => setPostSearchQuery(e.target.value)}
                  placeholder="BUSCAR NOME, CPF OU OBSERVAÇÃO..."
                  className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-slate-700 border border-pmmg-navy/10 dark:border-slate-600 rounded-xl text-xs font-black uppercase placeholder:text-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-pmmg-navy/10 transition-all shadow-inner dark:text-slate-200"
                />
              </div>
              
              <div className="flex bg-white/40 dark:bg-slate-700 p-1 rounded-xl border border-white/20 dark:border-slate-600 shadow-sm shrink-0">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-pmmg-navy text-pmmg-yellow shadow-md' : 'text-pmmg-navy/40 dark:text-slate-400'}`}
                >
                  <span className="material-symbols-outlined text-xl">view_day</span>
                </button>
                <button 
                  onClick={() => setViewMode('gallery')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'gallery' ? 'bg-pmmg-navy text-pmmg-yellow shadow-md' : 'text-pmmg-navy/40 dark:text-slate-400'}`}
                >
                  <span className="material-symbols-outlined text-xl">grid_view</span>
                </button>
              </div>

              <div className="relative shrink-0">
                <button 
                  onClick={() => setShowTimelineFilters(prev => !prev)}
                  className={`p-3 rounded-xl flex items-center justify-center transition-all shrink-0 ${isFilterActive ? 'bg-pmmg-yellow text-primary-dark shadow-md' : 'bg-white/40 dark:bg-slate-700 text-pmmg-navy dark:text-slate-200 border border-white/20 dark:border-slate-600'}`}
                >
                  <span className={`material-symbols-outlined text-xl ${isFilterActive ? 'fill-icon' : ''}`}>tune</span>
                </button>
                
                {/* Menu de Filtro da Timeline (Desktop) */}
                {showTimelineFilters && (
                  <div 
                    ref={timelineFilterRef}
                    className="absolute top-full right-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-pmmg-navy/10 dark:border-slate-700 z-[100] p-5 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-pmmg-navy/60 dark:text-slate-400">Filtros Operacionais</h4>
                      {isFilterActive && (
                        <button 
                          onClick={handleClearFilters}
                          className="text-[8px] font-black text-pmmg-red uppercase"
                        >
                          Limpar Tudo
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-5">
                      {/* Filtro por Status */}
                      <div>
                        <label className="block text-[8px] font-black uppercase text-pmmg-navy/40 dark:text-slate-500 mb-2 tracking-wider">Status do Indivíduo</label>
                        <div className="flex flex-wrap gap-2 pb-1 no-scrollbar">
                          {STATUS_OPTIONS.map(opt => (
                            <button
                              key={opt}
                              onClick={() => setStatusFilter(opt)}
                              className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all border shrink-0 ${
                                statusFilter === opt 
                                ? 'bg-pmmg-navy text-white border-pmmg-navy shadow-md' 
                                : 'bg-slate-50 dark:bg-slate-700 text-pmmg-navy/60 dark:text-slate-300 border-slate-200 dark:border-slate-600'
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
                      className="w-full mt-6 bg-pmmg-navy text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
                    >
                      Aplicar Filtros ({filteredPosts.length})
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Chips de filtros ativos */}
            {isFilterActive && (
              <div className="flex flex-wrap gap-2 mb-4">
                {postSearchQuery && (
                  <div className="bg-pmmg-navy/10 dark:bg-slate-700 text-pmmg-navy dark:text-slate-300 px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1 border border-pmmg-navy/10 dark:border-slate-600">
                    Busca: {postSearchQuery}
                    <button onClick={() => setPostSearchQuery('')} className="material-symbols-outlined text-xs">close</button>
                  </div>
                )}
                {statusFilter !== 'Todos' && (
                  <div className="bg-pmmg-navy/10 dark:bg-slate-700 text-pmmg-navy dark:text-slate-300 px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1 border border-pmmg-navy/10 dark:border-slate-600">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter('Todos')} className="material-symbols-outlined text-xs">close</button>
                  </div>
                )}
                {selectedMemberFilterId && activeMemberFilter && (
                  <div className="bg-pmmg-navy/10 dark:bg-slate-700 text-pmmg-navy dark:text-slate-300 px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1 border border-pmmg-navy/10 dark:border-slate-600">
                    Autor: {activeMemberFilter.name.split(' ')[0]}
                    <button onClick={() => setSelectedMemberFilterId(null)} className="material-symbols-outlined text-xs">close</button>
                  </div>
                )}
              </div>
            )}

            {filteredPosts.length > 0 ? (
              viewMode === 'list' ? (
                <div className="space-y-6 mt-4 animate-in fade-in duration-300">
                  {filteredPosts.map(renderTimelinePost)}
                </div>
              ) : (
                /* MODO GALERIA PARA O GRUPO */
                <div className="grid grid-cols-4 gap-4 mt-4 animate-in zoom-in-95 duration-300">
                  {filteredPosts.filter(p => p.type === 'suspect').map((post) => (
                    <div 
                      key={post.id}
                      onClick={() => post.suspectId && onOpenProfile(post.suspectId)}
                      className="relative aspect-[3/4] pmmg-card overflow-hidden shadow-lg border-2 border-pmmg-navy/10 dark:border-slate-700 active:scale-95 transition-all cursor-pointer"
                    >
                      <img src={post.suspectPhoto} alt={post.suspectName} className="w-full h-full object-cover" />
                      
                      {/* Autor Badge */}
                      <div className="absolute top-1 left-1 bg-pmmg-navy/70 backdrop-blur-sm text-[6px] font-black text-white px-1.5 py-0.5 rounded uppercase tracking-tighter z-10">
                        {post.authorName.charAt(0)}
                      </div>

                      {/* Info Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-1.5 pt-4">
                        <p className="text-[8px] font-black text-white uppercase truncate text-center drop-shadow-md">
                          {post.suspectName?.split(' ')[0]}
                        </p>
                        <p className="text-[6px] text-pmmg-yellow/80 font-bold uppercase text-center tracking-tighter mt-0.5">
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
          
          {/* Coluna 3: Membros e Detalhes do Grupo (Ocupa 1/3) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Detalhes do Grupo */}
            <div className="pmmg-card p-5 space-y-4">
              <div className="flex items-center gap-3 border-b border-pmmg-navy/10 dark:border-slate-700 pb-3">
                <span className="material-symbols-outlined text-pmmg-navy dark:text-pmmg-yellow text-2xl">info</span>
                <h3 className="text-sm font-black text-pmmg-navy dark:text-slate-200 uppercase tracking-widest">Informações</h3>
              </div>
              
              <div>
                <p className="text-[9px] font-black text-pmmg-navy/40 dark:text-slate-400 uppercase tracking-widest mb-1">Descrição</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 italic">{group.description}</p>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-pmmg-navy/5 dark:border-slate-700">
                <div>
                  <p className="text-[9px] font-black text-pmmg-navy/40 dark:text-slate-400 uppercase tracking-widest mb-1">Código de Convite</p>
                  <p className="text-sm font-black text-pmmg-navy dark:text-slate-200 tracking-widest">{group.inviteCode}</p>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(group.inviteCode);
                    alert('Código de convite copiado para a área de transferência!');
                  }}
                  className="w-10 h-10 bg-pmmg-navy text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform shrink-0"
                >
                  <span className="material-symbols-outlined text-lg">content_copy</span>
                </button>
              </div>
            </div>
            
            {/* Lista de Membros */}
            <div className="pmmg-card p-5 space-y-4">
              <div className="flex items-center gap-3 border-b border-pmmg-navy/10 dark:border-slate-700 pb-3">
                <span className="material-symbols-outlined text-pmmg-navy dark:text-pmmg-yellow text-2xl">groups</span>
                <h3 className="text-sm font-black text-pmmg-navy dark:text-slate-200 uppercase tracking-widest">Membros Ativos ({group.members.length})</h3>
              </div>
              
              <MemberList />
              
              {/* Botão de teste para entrada de membro */}
              <button 
                onClick={onJoinGroup}
                className="w-full bg-green-500 text-white text-[10px] font-bold py-2 rounded-xl uppercase tracking-widest active:scale-[0.98] transition-transform mt-4"
              >
                [TESTE] Adicionar Cap. Pereira (o2)
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL: Editar Grupo */}
      {showEditModal && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-pmmg-navy/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl p-6">
            <h3 className="text-lg font-black text-pmmg-navy dark:text-slate-200 uppercase mb-4 border-b dark:border-slate-700 pb-2">Editar Grupo</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 dark:text-slate-400 mb-1 ml-1 tracking-wider">Nome do Grupo</label>
                <input 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border border-pmmg-navy/20 dark:border-slate-600 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm dark:text-slate-200" 
                  type="text" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 dark:text-slate-400 mb-1 ml-1 tracking-wider">Descrição Tática</label>
                <textarea 
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border border-pmmg-navy/20 dark:border-slate-600 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm dark:text-slate-200" 
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-slate-200 dark:bg-slate-700 text-pmmg-navy dark:text-slate-200 font-bold py-3 rounded-xl text-xs uppercase"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveGroupEdit}
                className="flex-1 bg-pmmg-navy text-white font-bold py-3 rounded-xl text-xs uppercase"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* MODAL: Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-pmmg-navy/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center">
            <span className="material-symbols-outlined text-pmmg-red text-5xl mb-4 fill-icon">warning</span>
            <h3 className="text-lg font-black text-pmmg-navy dark:text-slate-200 uppercase mb-2">Excluir Grupo?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Esta ação é irreversível e removerá todos os dados e posts do grupo "{group.name}".</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-slate-200 dark:bg-slate-700 text-pmmg-navy dark:text-slate-200 font-bold py-3 rounded-xl text-xs uppercase"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteGroup}
                className="flex-1 bg-pmmg-red text-white font-bold py-3 rounded-xl text-xs uppercase"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Suspect Modal (Mantido) */}
      {showShareModal && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center p-4 bg-pmmg-navy/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-10 duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[3rem] shadow-2xl p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-6 shrink-0">
               <div>
                  <h3 className="text-lg font-black text-pmmg-navy dark:text-slate-200 uppercase leading-none">Compartilhar Ficha</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Alimentar Rede de Inteligência</p>
               </div>
               <button onClick={() => { setShowShareModal(false); setSelectedSuspectId(null); }} className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-400 flex items-center justify-center active:scale-90 transition-transform shrink-0">
                  <span className="material-symbols-outlined">close</span>
               </button>
            </div>

            {!selectedSuspectId ? (
              <>
                <div className="relative mb-4 shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-pmmg-navy/30 dark:text-slate-500">search</span>
                  <input 
                    value={searchSuspect}
                    onChange={(e) => setSearchSuspect(e.target.value)}
                    placeholder="BUSCAR NOME OU CPF..."
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl text-xs font-black uppercase placeholder:text-slate-300 dark:placeholder-slate-500 shadow-inner dark:text-slate-200"
                  />
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 mb-4">
                  {suspectsForShare.length > 0 ? suspectsForShare.map(s => (
                    <div 
                      key={s.id}
                      onClick={() => setSelectedSuspectId(s.id)}
                      className="p-3 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-600 active:bg-slate-100 dark:active:bg-slate-600 transition-colors cursor-pointer"
                    >
                      <img src={s.photoUrl} className="w-12 h-14 rounded-lg object-cover shadow-sm" />
                      <div>
                        <p className="text-[10px] font-black text-pmmg-navy dark:text-slate-200 uppercase leading-tight">{s.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">{s.cpf}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-[10px] text-pmmg-navy/50 dark:text-slate-400 mt-4">Nenhum suspeito encontrado.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 bg-pmmg-navy/5 dark:bg-slate-700 p-4 rounded-3xl border border-pmmg-navy/5 dark:border-slate-600 shrink-0">
                  <img 
                    src={allSuspects.find(s => s.id === selectedSuspectId)?.photoUrl} 
                    className="w-16 h-20 rounded-xl object-cover shadow-lg" 
                    alt="Suspect"
                  />
                  <div>
                    <p className="text-[9px] font-black text-pmmg-navy/40 dark:text-slate-400 uppercase tracking-widest">Alvo Selecionado</p>
                    <h4 className="text-sm font-black text-pmmg-navy dark:text-slate-200 uppercase mt-1">{allSuspects.find(s => s.id === selectedSuspectId)?.name}</h4>
                    <button onClick={() => setSelectedSuspectId(null)} className="text-[9px] font-black text-pmmg-red uppercase mt-2 active:opacity-70 transition-opacity">Alterar Alvo</button>
                  </div>
                </div>

                <div className="flex-1 min-h-[150px]">
                  <label className="block text-[10px] font-black uppercase text-pmmg-navy/40 dark:text-slate-400 mb-2 ml-2 tracking-widest">Observação Tática</label>
                  <textarea 
                    autoFocus
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-3xl p-5 text-sm font-medium italic h-full min-h-[150px] shadow-inner dark:text-slate-200"
                    placeholder="Descreva a movimentação, novas evidências ou local de avistamento..."
                  />
                </div>

                <button 
                  onClick={handleShare}
                  disabled={!observation.trim()}
                  className="w-full bg-pmmg-navy text-white py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-transform disabled:opacity-50 shrink-0"
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