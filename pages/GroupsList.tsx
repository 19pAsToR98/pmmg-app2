import React, { useState } from 'react';
import { Screen, Group, Officer, Chat, Suspect } from '../types';
import BottomNav from '../components/BottomNav';

interface GroupsListProps {
  navigateTo: (screen: Screen) => void;
  userGroups: Group[];
  userChats: Chat[]; // Chats individuais
  officers: Officer[]; // Contatos aceitos e online
  allSuspects: Suspect[]; // Adicionado para exibir o resumo do último post
  openGroup: (groupId: string) => void;
  openChat: (chatId: string) => void;
  pendingRequestsCount: number;
}

const GroupsList: React.FC<GroupsListProps> = ({ navigateTo, userGroups, userChats, officers, allSuspects, openGroup, openChat, pendingRequestsCount }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtra grupos com base no termo de busca
  const filteredGroups = userGroups.filter(group => {
    return group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           group.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filtra chats individuais (para exibição opcional ou contagem)
  const getChatDisplayInfo = (chat: Chat) => {
    const otherParticipantId = chat.participants.find(id => id !== 'EU');
    const otherOfficer = officers.find(o => o.id === otherParticipantId);

    if (otherOfficer) {
      return { 
        name: `${otherOfficer.rank}. ${otherOfficer.name.split(' ')[1]} (${otherOfficer.unit})`, 
        icon: 'person',
      };
    }
    return { name: chat.name, icon: 'person' };
  };
  
  const totalUnreadChats = userChats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  const renderGroupList = (groups: Group[]) => {
    return groups.length > 0 ? groups.map((group) => {
      // Pega o post mais recente (assumindo que o array de posts está ordenado ou que o último é o mais recente)
      const lastPost = group.posts.length > 0 ? group.posts[group.posts.length - 1] : null;
      const lastPostSuspect = lastPost ? allSuspects.find(s => s.id === lastPost.suspectId) : null;
      const lastPostAuthor = lastPost ? officers.find(o => o.id === lastPost.authorId) : null;
      
      const lastActivity = lastPost 
        ? `Ficha de ${lastPostSuspect?.name || 'Indivíduo'} por ${lastPostAuthor?.rank || ''} ${lastPostAuthor?.name.split(' ')[1] || 'Oficial'}`
        : group.description;

      return (
        <div 
          key={group.id} 
          onClick={() => openGroup(group.id)}
          className={`pmmg-card flex items-center p-3 gap-3 cursor-pointer active:scale-95 transition-transform border-l-4 border-l-pmmg-navy`}
        >
          <div className={`w-14 h-14 flex items-center justify-center rounded-xl shrink-0 bg-pmmg-navy/10 text-pmmg-navy/40 border border-pmmg-navy/20`}>
            <span className={`material-symbols-outlined text-3xl`}>
              groups
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-0.5">
              <h3 className="font-bold text-sm truncate uppercase tracking-tight">{group.name}</h3>
              <span className="text-[10px] font-medium opacity-60">{group.memberIds.length} Membros</span>
            </div>
            <p className="text-xs text-slate-600 truncate leading-tight">{lastActivity}</p>
          </div>
          {/* Não usamos unreadCount para grupos de posts por enquanto */}
        </div>
      );
    }) : (
      <div className="text-center py-10 opacity-40">
        <span className="material-symbols-outlined text-5xl">folder_open</span>
        <p className="text-xs font-bold uppercase mt-2">Nenhum grupo tático ativo.</p>
        <button 
          onClick={() => navigateTo('groupCreation')}
          className="mt-4 bg-pmmg-navy text-white text-[10px] font-bold px-4 py-2 rounded-lg uppercase"
        >
          Criar Novo Grupo
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden relative">
      <header className="sticky top-0 z-50 bg-pmmg-navy text-white shadow-xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center p-1.5 border-2 border-pmmg-red shadow-inner">
            <span className="material-symbols-outlined text-pmmg-navy text-xl">groups</span>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none uppercase tracking-widest">Grupos Táticos</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Coordenação e Inteligência</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigateTo('groupCreation')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-pmmg-yellow border border-white/10 relative"
            title="Criar Novo Grupo"
          >
            <span className="material-symbols-outlined text-xl">add</span>
          </button>
          <button 
            onClick={() => navigateTo('contacts')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white border border-white/10 relative"
            title="Gerenciar Contatos e Chats Individuais"
          >
            <span className="material-symbols-outlined text-xl">person_pin</span>
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-pmmg-red text-white text-[8px] flex items-center justify-center rounded-full border border-white">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        
        {/* Search Bar */}
        <div className="px-4 pt-4 pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-pmmg-navy/50 text-xl">search</span>
            </div>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 bg-white/60 border border-pmmg-navy/10 focus:border-pmmg-navy focus:ring-0 rounded-2xl text-sm placeholder-pmmg-navy/40" 
              placeholder={`Filtrar grupos...`} 
              type="text" 
            />
          </div>
        </div>
        
        {/* Link para Chats Individuais */}
        <section className="px-4 mb-4">
          <button 
            onClick={() => navigateTo('contacts')}
            className="w-full pmmg-card p-3 flex items-center justify-between border-l-4 border-l-pmmg-yellow active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-pmmg-navy text-xl fill-icon">chat</span>
              <span className="text-sm font-bold text-pmmg-navy uppercase">Chats Individuais</span>
            </div>
            <div className="flex items-center gap-2">
              {totalUnreadChats > 0 && (
                <span className="bg-pmmg-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {totalUnreadChats}
                </span>
              )}
              <span className="text-[10px] font-medium text-slate-500">{userChats.length} Ativos</span>
              <span className="material-symbols-outlined text-pmmg-navy/40 text-lg">chevron_right</span>
            </div>
          </button>
        </section>

        {/* Group List Content */}
        <section className="px-4 space-y-3">
          <h3 className="text-[11px] font-bold text-pmmg-navy/60 uppercase tracking-wider mb-3">
            Grupos Ativos ({filteredGroups.length})
          </h3>
          {renderGroupList(filteredGroups)}
        </section>

        <div className="h-4"></div>
      </main>
      
      <BottomNav activeScreen="groupsList" navigateTo={navigateTo} />
    </div>
  );
};

export default GroupsList;