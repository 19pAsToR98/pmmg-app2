import React, { useState, useMemo } from 'react';
import { Screen, Group, Officer, Suspect, GroupPost } from '../types';

interface GroupDetailProps {
  navigateTo: (screen: Screen) => void;
  group: Group;
  allOfficers: Officer[];
  allSuspects: Suspect[];
  onOpenProfile: (id: string) => void;
  onShareSuspect: (groupId: string, suspectId: string, observation: string) => void;
}

const GroupDetail: React.FC<GroupDetailProps> = ({ navigateTo, group, allOfficers, allSuspects, onOpenProfile, onShareSuspect }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuspectId, setShareSuspectId] = useState<string | null>(null);
  const [shareObservation, setShareObservation] = useState('');
  const [suspectSearchTerm, setSuspectSearchTerm] = useState('');

  const getOfficer = (id: string) => allOfficers.find(o => o.id === id) || { name: 'Oficial Desconhecido', rank: 'N/D', unit: 'N/D', photoUrl: 'https://i.pravatar.cc/150?img=5', isOnline: false };
  const getSuspect = (id: string) => allSuspects.find(s => s.id === id);

  const filteredSuspects = useMemo(() => {
    if (!suspectSearchTerm) return [];
    const term = suspectSearchTerm.toLowerCase();
    return allSuspects.filter(s => 
      s.name.toLowerCase().includes(term) || s.cpf.includes(term)
    ).slice(0, 5);
  }, [suspectSearchTerm, allSuspects]);

  const handleShare = () => {
    if (shareSuspectId && shareObservation.trim()) {
      onShareSuspect(group.id, shareSuspectId, shareObservation.trim());
      setIsSharing(false);
      setShareSuspectId(null);
      setShareObservation('');
      setSuspectSearchTerm('');
    } else {
      alert("Selecione uma ficha e adicione uma observação tática.");
    }
  };
  
  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (date.toDateString() === today.toDateString()) {
      return `Hoje, ${time}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem, ${time}`;
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) + ` ${time}`;
    }
  };

  // Ordena os posts por data (mais recente primeiro)
  const sortedPosts = useMemo(() => {
    return [...group.posts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [group.posts]);

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-3 flex items-center gap-3 shadow-lg">
        <button onClick={() => navigateTo('groupsList')} className="text-white">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <div className="flex-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pmmg-khaki-light border-2 border-pmmg-yellow flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-pmmg-navy">groups</span>
          </div>
          <div>
            <h1 className="font-bold text-sm text-white leading-tight uppercase tracking-tight">{group.name}</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase">{group.memberIds.length} Membros</p>
          </div>
        </div>
        <button className="text-white" onClick={() => alert('Gerenciar membros')}>
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
        
        {/* Botão de Compartilhamento */}
        <div className="flex justify-center">
          <button 
            onClick={() => setIsSharing(true)}
            className="bg-pmmg-red text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-lg">share</span>
            Compartilhar Ficha
          </button>
        </div>

        {/* Linha do Tempo de Posts */}
        <section className="space-y-6">
          <h3 className="text-[11px] font-bold text-pmmg-navy/60 uppercase tracking-wider border-b border-pmmg-navy/10 pb-2">Linha do Tempo Tática</h3>
          
          {sortedPosts.length > 0 ? sortedPosts.map((post) => {
            const author = getOfficer(post.authorId);
            const suspect = getSuspect(post.suspectId);
            
            if (!suspect) return null;

            return (
              <div key={post.id} className="relative flex gap-3">
                {/* Linha do Tempo Vertical */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-8 h-8 rounded-full bg-pmmg-navy border-2 border-pmmg-yellow flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-white text-sm">person</span>
                  </div>
                  <div className="flex-1 w-0.5 bg-pmmg-navy/20 my-1"></div>
                </div>
                
                {/* Conteúdo do Post */}
                <div className="pmmg-card p-4 flex-1 rounded-xl rounded-tl-none shadow-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[10px] font-bold text-pmmg-navy/70 uppercase leading-tight">{author.rank}. {author.name}</p>
                      <p className="text-[9px] text-slate-500">{author.unit}</p>
                    </div>
                    <span className="text-[9px] font-medium text-slate-400">{formatTimestamp(post.timestamp)}</span>
                  </div>
                  
                  {/* Observação */}
                  <p className="text-sm text-pmmg-navy italic mb-3 border-b border-pmmg-navy/10 pb-2">
                    "{post.observation}"
                  </p>

                  {/* Ficha Compartilhada */}
                  <div 
                    onClick={() => onOpenProfile(suspect.id)}
                    className="flex items-center gap-3 p-2 bg-pmmg-khaki/50 rounded-lg border border-pmmg-navy/10 cursor-pointer active:bg-pmmg-khaki/70 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden shrink-0">
                      <img src={suspect.photoUrl} alt={suspect.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-pmmg-red uppercase leading-tight">{suspect.status}</p>
                      <h4 className="text-sm font-bold text-pmmg-navy truncate">{suspect.name}</h4>
                      <p className="text-[9px] text-slate-500">CPF: {suspect.cpf}</p>
                    </div>
                    <span className="material-symbols-outlined text-pmmg-navy/40 text-lg shrink-0">arrow_forward_ios</span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-10 opacity-40">
              <span className="material-symbols-outlined text-5xl">folder_open</span>
              <p className="text-xs font-bold uppercase mt-2">Nenhuma ficha compartilhada neste grupo.</p>
            </div>
          )}
        </section>
      </main>

      {/* Modal de Compartilhamento */}
      {isSharing && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-5 rounded-xl shadow-2xl w-full max-w-sm">
            <h3 className="text-lg font-bold text-pmmg-navy uppercase mb-4 border-b pb-2">Compartilhar Ficha</h3>
            
            <div className="space-y-4">
              {/* 1. Busca de Suspeito */}
              <div className="relative">
                <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1">Buscar Indivíduo</label>
                <input 
                  value={suspectSearchTerm}
                  onChange={(e) => setSuspectSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Nome ou CPF do suspeito"
                />
                
                {filteredSuspects.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-pmmg-navy/20 rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
                    {filteredSuspects.map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setShareSuspectId(s.id);
                          setSuspectSearchTerm(s.name); // Preenche o input com o nome
                          setFilteredSuspects([]); // Limpa sugestões
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-pmmg-navy hover:bg-pmmg-khaki/50 transition-colors border-b border-pmmg-navy/5 last:border-b-0"
                      >
                        {s.name} ({s.cpf})
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 2. Ficha Selecionada */}
              {shareSuspectId && getSuspect(shareSuspectId) && (
                <div className="p-3 bg-pmmg-yellow/10 border border-pmmg-yellow/50 rounded-lg flex items-center gap-3">
                  <span className="material-symbols-outlined text-pmmg-yellow fill-icon">check_circle</span>
                  <p className="text-xs font-bold text-pmmg-navy">Ficha Selecionada: {getSuspect(shareSuspectId)?.name}</p>
                </div>
              )}

              {/* 3. Observação */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1">Observação Tática</label>
                <textarea 
                  value={shareObservation}
                  onChange={(e) => setShareObservation(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Ex: Visto em área de risco com veículo novo."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setIsSharing(false)}
                className="flex-1 bg-slate-200 text-pmmg-navy font-bold py-3 rounded-xl text-xs uppercase"
              >
                Cancelar
              </button>
              <button 
                onClick={handleShare}
                disabled={!shareSuspectId || !shareObservation.trim()}
                className="flex-1 bg-pmmg-navy text-white font-bold py-3 rounded-xl text-xs uppercase disabled:opacity-50"
              >
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BottomNav is not needed here as this is a detail screen, but we must ensure the parent component handles navigation back to a screen that has BottomNav. */}
    </div>
  );
};

export default GroupDetail;