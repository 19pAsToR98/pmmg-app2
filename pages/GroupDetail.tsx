
import React, { useState, useRef, useEffect } from 'react';
import { TacticalGroup, Suspect, GroupPost, Screen } from '../types';

interface TacticalGroupDetailProps {
  group: TacticalGroup;
  onBack: () => void;
  onOpenProfile: (id: string) => void;
  onSharePost: (groupId: string, suspectId: string, observation: string) => void;
  suspects: Suspect[];
}

const TacticalGroupDetail: React.FC<TacticalGroupDetailProps> = ({ group, onBack, onOpenProfile, onSharePost, suspects }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'members'>('timeline');
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list');
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchSuspect, setSearchSuspect] = useState('');
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [observation, setObservation] = useState('');

  // Estados para filtros da Timeline
  const [postSearchQuery, setPostSearchQuery] = useState('');
  const [postDateFilter, setPostDateFilter] = useState('');
  const [postAuthorFilter, setPostAuthorFilter] = useState<string | null>(null);
  const [showTimelineFilters, setShowTimelineFilters] = useState(false);
  const timelineFilterRef = useRef<HTMLDivElement>(null);

  // Extrair autores únicos que postaram no grupo
  const uniqueAuthors = Array.from(new Set(group.posts.map(p => p.authorName)));

  // Fechar menu de filtro ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timelineFilterRef.current && !timelineFilterRef.current.contains(event.target as Node)) {
        setShowTimelineFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSuspects = suspects.filter(s => 
    s.name.toLowerCase().includes(searchSuspect.toLowerCase()) || 
    s.cpf.includes(searchSuspect) ||
    (s.nickname && s.nickname.toLowerCase().includes(searchSuspect.toLowerCase()))
  );

  // Lógica de filtragem da Timeline (Busca + Data + Autor)
  const filteredPosts = group.posts.filter(post => {
    const query = postSearchQuery.toLowerCase();
    
    const matchesSearch = !postSearchQuery || 
      post.suspectName.toLowerCase().includes(query) ||
      post.authorName.toLowerCase().includes(query) ||
      post.observation.toLowerCase().includes(query);
    
    // Filtro de data simples comparando a string do timestamp
    const matchesDate = !postDateFilter || post.timestamp.includes(postDateFilter.split('-').reverse().join('/'));

    // Filtro de Autor
    const matchesAuthor = !postAuthorFilter || post.authorName === postAuthorFilter;

    return matchesSearch && matchesDate && matchesAuthor;
  });

  const handleShare = () => {
    if (selectedSuspectId) {
      onSharePost(group.id, selectedSuspectId, observation);
      setSearchSuspect('');
      setSelectedSuspectId(null);
      setObservation('');
      setShowShareModal(false);
    }
  };

  const clearAllFilters = () => {
    setPostDateFilter('');
    setPostSearchQuery('');
    setPostAuthorFilter(null);
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden relative">
      <header className="bg-pmmg-navy px-4 pt-6 pb-4 shadow-xl z-50 shrink-0">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="text-white active:scale-90 transition-transform shrink-0">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-sm text-white leading-tight uppercase tracking-tight truncate">{group.name}</h1>
            <p className="text-[10px] font-bold text-pmmg-yellow tracking-wider uppercase mt-0.5">Código: {group.inviteCode}</p>
          </div>
          <button 
            onClick={() => setShowShareModal(true)}
            className="bg-pmmg-yellow text-pmmg-navy px-3 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg flex items-center gap-2 active:scale-95 transition-transform shrink-0"
          >
            <span className="material-symbols-outlined text-sm font-bold">share</span>
            Postar
          </button>
        </div>

        <div className="flex gap-2 p-1 bg-black/20 rounded-2xl">
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'timeline' ? 'bg-white text-pmmg-navy shadow-md' : 'text-white/40'
            }`}
          >
            Compartilhamentos
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'members' ? 'bg-white text-pmmg-navy shadow-md' : 'text-white/40'
            }`}
          >
            Membros ({group.members.length})
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        {activeTab === 'timeline' ? (
          <div className="p-4 space-y-4">
            {/* Barra de Busca e Alternância de Visualização */}
            <div className="flex items-center gap-2 mb-2 relative">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-pmmg-navy/30 text-lg">search</span>
                <input 
                  value={postSearchQuery}
                  onChange={(e) => setPostSearchQuery(e.target.value)}
                  placeholder="BUSCAR NO GRUPO..."
                  className="w-full pl-9 pr-4 py-3 bg-white/60 border-none rounded-2xl text-[10px] font-black uppercase placeholder:text-slate-400 focus:ring-2 focus:ring-pmmg-navy/10 transition-all shadow-inner"
                />
              </div>
              
              <div className="flex bg-white/40 p-1 rounded-2xl border border-white/20 shadow-sm">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-pmmg-navy text-pmmg-yellow shadow-md' : 'text-pmmg-navy/40'}`}
                >
                  <span className="material-symbols-outlined text-xl">view_day</span>
                </button>
                <button 
                  onClick={() => setViewMode('gallery')}
                  className={`p-2 rounded-xl transition-all ${viewMode === 'gallery' ? 'bg-pmmg-navy text-pmmg-yellow shadow-md' : 'text-pmmg-navy/40'}`}
                >
                  <span className="material-symbols-outlined text-xl">grid_view</span>
                </button>
              </div>

              <button 
                onClick={() => setShowTimelineFilters(!showTimelineFilters)}
                className={`p-3 rounded-2xl flex items-center justify-center transition-all ${showTimelineFilters || postDateFilter || postAuthorFilter ? 'bg-pmmg-yellow text-pmmg-navy shadow-md' : 'bg-white/40 text-pmmg-navy border border-white/20'}`}
              >
                <span className={`material-symbols-outlined text-xl ${showTimelineFilters ? 'fill-icon' : ''}`}>tune</span>
              </button>

              {/* Menu de Filtro da Timeline */}
              {showTimelineFilters && (
                <div 
                  ref={timelineFilterRef}
                  className="absolute top-full right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-pmmg-navy/10 z-[100] p-5 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-pmmg-navy/60">Filtros Operacionais</h4>
                    <button 
                      onClick={clearAllFilters}
                      className="text-[8px] font-black text-pmmg-red uppercase"
                    >
                      Limpar
                    </button>
                  </div>
                  
                  <div className="space-y-5">
                    {/* Filtro por Data */}
                    <div>
                      <label className="block text-[8px] font-black uppercase text-pmmg-navy/40 mb-2 tracking-wider">Filtrar por Data</label>
                      <input 
                        type="date"
                        value={postDateFilter}
                        onChange={(e) => setPostDateFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-pmmg-navy focus:ring-2 focus:ring-pmmg-navy/10"
                      />
                    </div>

                    {/* Filtro por Autor */}
                    <div>
                      <label className="block text-[8px] font-black uppercase text-pmmg-navy/40 mb-2 tracking-wider">Filtrar por Integrante</label>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto no-scrollbar p-1">
                        <button 
                          onClick={() => setPostAuthorFilter(null)}
                          className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all ${!postAuthorFilter ? 'bg-pmmg-navy text-white border-pmmg-navy' : 'bg-slate-50 text-pmmg-navy/40 border-slate-200'}`}
                        >
                          Todos
                        </button>
                        {uniqueAuthors.map(author => (
                          <button 
                            key={author}
                            onClick={() => setPostAuthorFilter(author)}
                            className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all ${postAuthorFilter === author ? 'bg-pmmg-navy text-white border-pmmg-navy' : 'bg-slate-50 text-pmmg-navy/40 border-slate-200'}`}
                          >
                            {author}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowTimelineFilters(false)}
                    className="w-full mt-6 bg-pmmg-navy text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              )}
            </div>

            {/* Chips de filtros ativos */}
            {(postSearchQuery || postDateFilter || postAuthorFilter) && (
              <div className="flex flex-wrap gap-2 mb-2">
                {postSearchQuery && (
                  <div className="bg-pmmg-navy/10 text-pmmg-navy px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1 border border-pmmg-navy/10">
                    Busca: {postSearchQuery}
                    <button onClick={() => setPostSearchQuery('')} className="material-symbols-outlined text-xs">close</button>
                  </div>
                )}
                {postDateFilter && (
                  <div className="bg-pmmg-navy/10 text-pmmg-navy px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1 border border-pmmg-navy/10">
                    Data: {postDateFilter.split('-').reverse().join('/')}
                    <button onClick={() => setPostDateFilter('')} className="material-symbols-outlined text-xs">close</button>
                  </div>
                )}
                {postAuthorFilter && (
                  <div className="bg-pmmg-navy/10 text-pmmg-navy px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1 border border-pmmg-navy/10">
                    Autor: {postAuthorFilter}
                    <button onClick={() => setPostAuthorFilter(null)} className="material-symbols-outlined text-xs">close</button>
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
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-pmmg-navy/10 rounded-full"></div>
                      <div className="absolute left-[-4px] top-4 w-3 h-3 bg-pmmg-navy border-2 border-white rounded-full shadow-sm"></div>

                      <div className="pmmg-card overflow-hidden shadow-md">
                        <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-pmmg-navy text-pmmg-yellow text-[9px] font-black flex items-center justify-center uppercase border-2 border-white shadow-sm">
                              {post.authorName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-pmmg-navy uppercase leading-none">{post.authorRank} {post.authorName}</p>
                              <p className="text-[8px] font-bold text-slate-400 mt-0.5">{post.timestamp}</p>
                            </div>
                          </div>
                        </div>

                        <div 
                          onClick={() => onOpenProfile(post.suspectId)}
                          className="flex p-3 gap-3 active:bg-slate-50 transition-colors"
                        >
                          <div className="w-20 h-24 bg-slate-200 rounded-lg overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                            <img src={post.suspectPhoto} alt={post.suspectName} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="text-[11px] font-black text-pmmg-navy uppercase tracking-tight line-clamp-2 leading-tight mb-1">{post.suspectName}</h4>
                            <p className="text-[9px] font-bold text-pmmg-red italic uppercase">Visualizar Ficha Técnica</p>
                          </div>
                          <span className="material-symbols-outlined text-slate-200 self-center">chevron_right</span>
                        </div>

                        {post.observation && (
                          <div className="px-4 pb-4">
                            <div className="bg-pmmg-navy/5 p-3 rounded-xl border border-pmmg-navy/5">
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
                      className="relative aspect-[3/4] pmmg-card overflow-hidden shadow-lg border-2 border-pmmg-navy/10 active:scale-95 transition-all"
                    >
                      <img src={post.suspectPhoto} alt={post.suspectName} className="w-full h-full object-cover" />
                      
                      {/* Autor Badge */}
                      <div className="absolute top-1 left-1 bg-pmmg-navy/70 backdrop-blur-sm text-[6px] font-black text-white px-1.5 py-0.5 rounded uppercase tracking-tighter z-10">
                        {post.authorName.split(' ')[0]}
                      </div>

                      {/* Info Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-1.5 pt-4">
                        <p className="text-[8px] font-black text-white uppercase truncate text-center drop-shadow-md">
                          {post.suspectName.split(' ')[0]}
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
            <div className="bg-white/40 p-4 rounded-3xl border border-white/20 mb-6 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-pmmg-navy/40 uppercase tracking-widest mb-1">Convite para Oficiais</p>
                <p className="text-sm font-black text-pmmg-navy tracking-widest">{group.inviteCode}</p>
              </div>
              <button 
                onClick={() => alert('Código de convite copiado!')}
                className="w-10 h-10 bg-pmmg-navy text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90"
              >
                <span className="material-symbols-outlined text-lg">content_copy</span>
              </button>
            </div>

            {group.members.map(member => (
              <div key={member.id} className="pmmg-card p-3 flex items-center justify-between shadow-sm border-l-4 border-l-pmmg-navy">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pmmg-navy text-pmmg-yellow flex items-center justify-center text-xs font-black uppercase shadow-inner">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-pmmg-navy uppercase leading-none">{member.rank} {member.name}</h4>
                    <span className={`text-[8px] font-black uppercase tracking-tighter ${member.role === 'admin' ? 'text-pmmg-red' : 'text-slate-400'}`}>
                      {member.role === 'admin' ? 'Responsável Técnico' : 'Agente Operacional'}
                    </span>
                  </div>
                </div>
                {member.role !== 'admin' && (
                  <button className="text-pmmg-red/40 hover:text-pmmg-red">
                    <span className="material-symbols-outlined text-xl">person_remove</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Share Suspect Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center p-4 bg-pmmg-navy/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-10 duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
               <div>
                  <h3 className="text-lg font-black text-pmmg-navy uppercase leading-none">Compartilhar Ficha</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Alimentar Rede de Inteligência</p>
               </div>
               <button onClick={() => setShowShareModal(false)} className="w-10 h-10 bg-slate-100 rounded-full text-slate-400 flex items-center justify-center">
                  <span className="material-symbols-outlined">close</span>
               </button>
            </div>

            {!selectedSuspectId ? (
              <>
                <div className="relative mb-4 shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-pmmg-navy/30">search</span>
                  <input 
                    value={searchSuspect}
                    onChange={(e) => setSearchSuspect(e.target.value)}
                    placeholder="BUSCAR NOME OU CPF..."
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase placeholder:text-slate-300 shadow-inner"
                  />
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 mb-4">
                  {filteredSuspects.map(s => (
                    <div 
                      key={s.id}
                      onClick={() => setSelectedSuspectId(s.id)}
                      className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100 active:bg-slate-100 transition-colors"
                    >
                      <img src={s.photoUrl} className="w-12 h-14 rounded-lg object-cover shadow-sm" />
                      <div>
                        <p className="text-[10px] font-black text-pmmg-navy uppercase leading-tight">{s.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">{s.cpf}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 bg-pmmg-navy/5 p-4 rounded-3xl border border-pmmg-navy/5">
                  <img src={suspects.find(s => s.id === selectedSuspectId)?.photoUrl} className="w-16 h-20 rounded-xl object-cover shadow-lg" />
                  <div>
                    <p className="text-[9px] font-black text-pmmg-navy/40 uppercase tracking-widest">Alvo Selecionado</p>
                    <h4 className="text-sm font-black text-pmmg-navy uppercase mt-1">{suspects.find(s => s.id === selectedSuspectId)?.name}</h4>
                    <button onClick={() => setSelectedSuspectId(null)} className="text-[9px] font-black text-pmmg-red uppercase mt-2">Alterar Alvo</button>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-black uppercase text-pmmg-navy/40 mb-2 ml-2 tracking-widest">Observação Tática</label>
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
                  className="w-full bg-pmmg-navy text-white py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-transform"
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

export default TacticalGroupDetail;
