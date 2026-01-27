import React, { useState } from 'react';
import { Screen, Chat, Officer } from '../types';
import BottomNav from '../components/BottomNav';

interface TacticalChatListProps {
  navigateTo: (screen: Screen) => void;
  userChats: Chat[]; // Chats que o usuário participa (apenas individuais agora)
  officers: Officer[]; // Contatos aceitos e online
  openChat: (chatId: string) => void;
  pendingRequestsCount: number;
}

const TacticalChatList: React.FC<TacticalChatListProps> = ({ navigateTo, userChats, officers, openChat, pendingRequestsCount }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Função auxiliar para obter o nome e ícone correto para chats individuais
  const getChatDisplayInfo = (chat: Chat) => {
    // Para chat individual, assumimos que o outro participante é o primeiro na lista
    const otherParticipantId = chat.participants.find(id => id !== 'EU'); // 'EU' é o ID mockado do usuário atual
    const otherOfficer = officers.find(o => o.id === otherParticipantId);

    if (otherOfficer) {
      return { 
        name: `${otherOfficer.rank}. ${otherOfficer.name.split(' ')[1]} (${otherOfficer.unit})`, 
        icon: 'person',
      };
    }
    return { name: chat.name, icon: 'person' };
  };

  // Filtra chats individuais com base no termo de busca
  const filteredChats = userChats.filter(chat => {
    const { name } = getChatDisplayInfo(chat);
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const renderChatList = (chats: Chat[]) => {
    return chats.length > 0 ? chats.map((chat) => {
      const { name, icon } = getChatDisplayInfo(chat);
      
      // Determina a cor da borda lateral (sempre individual agora)
      const borderColor = 'border-pmmg-yellow';
      
      return (
        <div 
          key={chat.id} 
          onClick={() => openChat(chat.id)}
          className={`pmmg-card flex items-center p-3 gap-3 cursor-pointer active:scale-95 transition-transform border-l-4 ${borderColor}`}
        >
          <div className={`w-14 h-14 flex items-center justify-center rounded-xl shrink-0 bg-pmmg-navy/10 text-pmmg-navy/40 border border-pmmg-navy/20`}>
            <span className={`material-symbols-outlined text-3xl`}>
              {icon}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-0.5">
              <h3 className="font-bold text-sm truncate uppercase tracking-tight">{name}</h3>
              <span className="text-[10px] font-medium opacity-60">{chat.lastTime}</span>
            </div>
            <p className="text-xs text-slate-600 truncate leading-tight">{chat.lastMessage}</p>
          </div>
          {chat.unreadCount > 0 && (
            <div className="shrink-0">
              <span className="bg-pmmg-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {chat.unreadCount}
              </span>
            </div>
          )}
        </div>
      );
    }) : (
      <div className="text-center py-10 opacity-40">
        <span className="material-symbols-outlined text-5xl">chat_bubble_off</span>
        <p className="text-xs font-bold uppercase mt-2">Nenhuma conversa individual encontrada.</p>
        <button 
          onClick={() => navigateTo('contacts')}
          className="mt-4 bg-pmmg-navy text-white text-[10px] font-bold px-4 py-2 rounded-lg uppercase"
        >
          Adicionar Contatos
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden relative">
      <header className="sticky top-0 z-50 bg-pmmg-navy text-white shadow-xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center p-1.5 border-2 border-pmmg-red shadow-inner">
            <span className="material-symbols-outlined text-pmmg-navy text-xl">person_pin</span>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none uppercase tracking-widest">Contatos Táticos</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Comunicação Individual</p>
          </div>
        </div>
        <button 
          onClick={() => navigateTo('contacts')}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-pmmg-yellow border border-white/10 relative"
        >
          <span className="material-symbols-outlined text-xl">person_add</span>
          {pendingRequestsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-pmmg-red text-white text-[8px] flex items-center justify-center rounded-full border border-white">
              {pendingRequestsCount}
            </span>
          )}
        </button>
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
              placeholder={`Filtrar conversas...`} 
              type="text" 
            />
          </div>
        </div>

        {/* Chat List Content */}
        <section className="px-4 space-y-3">
          <h3 className="text-[11px] font-bold text-pmmg-navy/60 uppercase tracking-wider mb-3">
            Conversas Ativas ({filteredChats.length})
          </h3>
          {renderChatList(filteredChats)}
        </section>

        <div className="h-4"></div>
      </main>
      
      <BottomNav activeScreen="chatList" navigateTo={navigateTo} />
    </div>
  );
};

export default TacticalChatList;