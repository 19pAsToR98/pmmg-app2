import React, { useState, useMemo } from 'react';
import { Screen, Officer, Group } from '../types';

interface GroupCreationProps {
  navigateTo: (screen: Screen) => void;
  allOfficers: Officer[];
  onCreateGroup: (group: Omit<Group, 'id' | 'posts' | 'inviteCode' | 'customMarkers'>) => void;
}

const GroupCreation: React.FC<GroupCreationProps> = ({ navigateTo, allOfficers, onCreateGroup }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]); // Officer IDs

  // Mock user ID is 'EU'
  const currentUserId = 'EU'; 

  const availableOfficers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allOfficers.filter(o => 
      o.id !== currentUserId && 
      (o.name.toLowerCase().includes(term) || o.unit.toLowerCase().includes(term))
    );
  }, [searchTerm, allOfficers]);

  const toggleMemberSelection = (officerId: string) => {
    setSelectedMembers(prev => 
      prev.includes(officerId) 
        ? prev.filter(id => id !== officerId) 
        : [...prev, officerId]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim() || !description.trim()) {
      alert("Preencha o nome e a descrição do grupo.");
      return;
    }
    
    const newGroupData: Omit<Group, 'id' | 'posts' | 'inviteCode' | 'customMarkers'> = {
      name: groupName.trim(),
      description: description.trim(),
      adminIds: [currentUserId], // Current user is the admin
      memberIds: [currentUserId], // Only the admin is a member initially
      pendingInviteIds: selectedMembers, // Selected members are pending invites
      groupPhotoUrl: 'https://picsum.photos/seed/' + groupName.replace(/\s/g, '') + '/100/100',
    };
    
    onCreateGroup(newGroupData);
    navigateTo('groupsList');
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki dark:bg-slate-900 overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button onClick={() => navigateTo('groupsList')} className="text-white">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div>
            <h1 className="font-bold text-sm leading-none text-white uppercase tracking-tight">Novo Grupo Tático</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Criação e Convite</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar px-4 pt-4">
        <div className="pmmg-card p-4 space-y-4 mb-6">
          <h3 className="text-[11px] font-bold text-pmmg-navy/60 dark:text-slate-400 uppercase tracking-wider">Detalhes do Grupo</h3>
          <div>
            <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 dark:text-slate-400 mb-1 ml-1 tracking-wider">Nome do Grupo</label>
            <input 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border border-pmmg-navy/20 dark:border-slate-600 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm dark:text-slate-200" 
              placeholder="Ex: Operação Cerco Fechado" 
              type="text" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 dark:text-slate-400 mb-1 ml-1 tracking-wider">Descrição Tática</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border border-pmmg-navy/20 dark:border-slate-600 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm dark:text-slate-200" 
              placeholder="Objetivo, área de atuação, etc." 
            />
          </div>
        </div>

        <div className="pmmg-card p-4 space-y-4">
          <h3 className="text-[11px] font-bold text-pmmg-navy/60 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
            Convidar Oficiais 
            <span className="text-[9px] font-black text-pmmg-red">({selectedMembers.length} Selecionado(s))</span>
          </h3>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-pmmg-navy/50 dark:text-slate-500 text-xl">search</span>
            </div>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 bg-white/60 dark:bg-slate-700 border border-pmmg-navy/10 dark:border-slate-600 focus:border-pmmg-navy focus:ring-0 rounded-2xl text-sm placeholder-pmmg-navy/40 dark:placeholder-slate-500 dark:text-slate-200" 
              placeholder="Buscar oficial para convite..." 
              type="text" 
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {availableOfficers.length > 0 ? availableOfficers.map(officer => (
              <div key={officer.id} className="flex items-center justify-between p-2 bg-pmmg-khaki/30 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-300">
                    <img src={officer.photoUrl} alt={officer.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-pmmg-navy dark:text-slate-200 leading-tight">{officer.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{officer.rank} • {officer.unit}</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleMemberSelection(officer.id)}
                  className={`text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase active:scale-95 transition-transform ${
                    selectedMembers.includes(officer.id) ? 'bg-pmmg-red text-white' : 'bg-pmmg-navy text-white'
                  }`}
                >
                  {selectedMembers.includes(officer.id) ? 'Remover' : 'Convidar'}
                </button>
              </div>
            )) : (
              <p className="text-xs text-slate-400 italic text-center py-2">Nenhum oficial disponível para convite.</p>
            )}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-900/95 border-t border-pmmg-navy/10 dark:border-slate-700 backdrop-blur-lg max-w-md mx-auto">
        <button 
          onClick={handleCreate}
          disabled={!groupName.trim() || !description.trim()}
          className="w-full bg-pmmg-navy text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 uppercase tracking-widest active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-pmmg-yellow">group_add</span>
          Criar Grupo Tático
        </button>
      </footer>
    </div>
  );
};

export default GroupCreation;