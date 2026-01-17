import React, { useState } from 'react';
import { Screen, Chat, Officer } from '../types';
import BottomNav from '../components/BottomNav';

interface TacticalChatListProps {
  navigateTo: (screen: Screen) => void;
  chats: Chat[];
  officers: Officer[]; // Contatos aceitos e online
  openChat: (chatId: string) => void;
  startIndividualChat: (officerId: string) => void;
  pendingRequestsCount: number;
}

type ChatTab = 'individual' | 'group';

const TacticalChatList: React.FC<TacticalChatListProps> = ({ navigateTo, chats, officers, openChat, startIndividualChat, pendingRequestsCount }) => {
  const [activeTab, setActiveTab] = useState<ChatTab>('individual');
  
  // Função auxiliar para obter o nome e ícone correto para chats individuais
  const getChatDisplayInfo = (chat: Chat) => {
    if (chat.type === 'group') {
      return { name: chat.name, icon: chat.icon, isGroup: true };
    }
    
    // Para chat individual, assumimos que o outro participante é o primeiro na lista
    const otherParticipantId = chat.participants.find(id => id !== 'EU'); // 'EU' é o ID mockado do usuário atual
    const otherOfficer = officers.find(o => o.id === otherParticipantId);

    if (otherOfficer) {
      return { 
        name: `${otherOfficer.rank}. ${otherOfficer.name.split(' ')[1]} (${otherOfficer.unit})`, 
        icon: 'person',
        isGroup: false
      };
    }
    return { name: chat.name, icon: 'person', isGroup: false };
  };

  // Separa chats individuais de grupos
  const individualChats = chats.filter(c => c.type === 'individual');
  const groupChats = chats.filter(c => c.type === 'group');

  const displayedChats = activeTab === 'individual' ? individualChats : groupChats;
  const activeTabLabel = activeTab === 'individual' ? 'Chats Individuais' : 'Grupos Táticos';
  const activeTabCount = displayedChats.length;

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy text-white shadow-xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center p-1.5 border-2 border-pmmg-red shadow-inner">
            <span className="material-symbols-outlined text-pmmg-navy text-xl">groups</span>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none uppercase tracking-widest">Tropa Operacional</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Comunicação e Contatos</p>
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
        
        {/* Tabs Navigation */}
        <section className="sticky top-0 z-40 bg-pmmg-navy/95 backdrop-blur-sm px-4 pt-3 pb-3 shadow-md">
          <div className="flex bg-pmmg-navy/80 rounded-xl p-1 border border-pmmg-yellow/20">
            <button
              onClick={() => setActiveTab('individual')}
              className={`flex-1 py-2 text-center text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${
                activeTab === 'individual' ? 'bg-pmmg-yellow text-pmmg-navy shadow-lg' : 'text-white/60 hover:bg-pmmg-navy/50'
              }`}
            >
              Individuais ({individualChats.length})
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={`flex-1 py-2 text-center text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${
                activeTab === 'group' ? 'bg-pmmg-yellow text-pmmg-navy shadow-lg' : 'text-white/60 hover:bg-pmmg-navy/50'
              }`}
            >
              Grupos ({groupChats.length})
            </button>
          </div>
        </section>

        {/* Search Bar (Moved below tabs) */}
        <div className="px-4 pt-4 pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-pmmg-navy/50 text-xl">search</span>
            </div>
            <input 
              className="block w-full pl-10 pr-3 py-3 bg-white/60 border border-pmmg-navy/10 focus:border-pmmg-navy focus:ring-0 rounded-2xl text-sm placeholder-pmmg-navy/40" 
              placeholder={`Filtrar ${activeTab === 'individual' ? 'contatos...' : 'grupos...'}`} 
              type="text" 
            />
          </div>
        </div>

        {/* Chat List Content */}
        <section className="px-4 space-y-3">
          <h3 className="text-[11px] font-bold text-pmmg-navy/60 uppercase tracking-wider mb-3">
            {activeTabLabel} ({activeTabCount})
          </h3>
          
          {displayedChats.length > 0 ? displayedChats.map((chat) => {
            const { name, icon, isGroup } = getChatDisplayInfo(chat);
            
            // Determina a cor da borda lateral
            const borderColor = isGroup ? 'border-pmmg-navy' : 'border-pmmg-yellow';
            
            return (
              <div 
                key={chat.id} 
                onClick={() => openChat(chat.id)}
                className={`pmmg-card flex items-center p-3 gap-3 cursor-pointer active:scale-95 transition-transform border-l-4 ${borderColor}`}
              >
                <div className={`w-14 h-14 flex items-center justify-center rounded-xl shrink-0 ${
                  isGroup ? 'bg-pmmg-navy text-pmmg-yellow' : 'bg-pmmg-navy/10 text-pmmg-navy/40 border border-pmmg-navy/20'
                }`}>
                  <span className={`material-symbols-outlined text-3xl ${isGroup ? 'fill-icon' : ''}`}>
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
              <p className="text-xs font-bold uppercase mt-2">Nenhuma conversa encontrada nesta categoria.</p>
              {activeTab === 'individual' && (
                <button 
                  onClick={() => navigateTo('contacts')}
                  className="mt-4 bg-pmmg-navy text-white text-[10px] font-bold px-4 py-2 rounded-lg uppercase"
                >
                  Adicionar Contatos
                </button>
              )}
            </div>
          )}
        </section>

        <div className="h-4"></div>
      </main>

      <BottomNav activeScreen="chatList" navigateTo={navigateTo} />
    </div>
  );
};

export default TacticalChatList;