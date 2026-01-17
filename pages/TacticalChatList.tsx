import React from 'react';
import { Screen, Chat, Officer } from '../types';
import BottomNav from '../components/BottomNav';

interface TacticalChatListProps {
  navigateTo: (screen: Screen) => void;
  chats: Chat[];
  officers: Officer[];
  openChat: (chatId: string) => void;
  startIndividualChat: (officerId: string) => void;
}

const TacticalChatList: React.FC<TacticalChatListProps> = ({ navigateTo, chats, officers, openChat, startIndividualChat }) => {
  
  const onlineOfficers = officers.filter(o => o.isOnline);

  // Função auxiliar para obter o nome e ícone correto para chats individuais
  const getChatDisplayInfo = (chat: Chat) => {
    if (chat.type === 'group') {
      return { name: chat.name, icon: chat.icon };
    }
    
    // Para chat individual, assumimos que o outro participante é o primeiro na lista
    const otherParticipantId = chat.participants.find(id => id !== 'EU'); // 'EU' é o ID mockado do usuário atual
    const otherOfficer = officers.find(o => o.id === otherParticipantId);

    if (otherOfficer) {
      return { 
        name: `${otherOfficer.rank}. ${otherOfficer.name.split(' ')[1]} (${otherOfficer.unit})`, 
        icon: 'person' 
      };
    }
    return { name: chat.name, icon: 'person' };
  };

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
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-pmmg-yellow border border-white/10">
          <span className="material-symbols-outlined text-xl">add_comment</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        
        {/* Oficiais Online (Amigos) */}
        <section className="px-4 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold text-pmmg-navy/60 uppercase tracking-wider">Oficiais Online ({onlineOfficers.length})</h3>
            <span className="text-[10px] font-bold text-green-600 uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Ativos
            </span>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {onlineOfficers.map(officer => (
              <button 
                key={officer.id}
                onClick={() => startIndividualChat(officer.id)}
                className="flex flex-col items-center shrink-0 w-16 active:scale-95 transition-transform"
              >
                <div className="relative w-14 h-14 mb-1">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-pmmg-navy/20 bg-slate-200">
                    <img src={officer.photoUrl} alt={officer.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-pmmg-khaki"></div>
                </div>
                <span className="text-[10px] font-bold text-pmmg-navy uppercase truncate w-full text-center leading-tight">{officer.name.split(' ')[1]}</span>
                <span className="text-[8px] text-slate-500 uppercase">{officer.rank.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="px-4 pt-2 sticky top-0 z-40 bg-pmmg-khaki/90 backdrop-blur-md pb-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold text-pmmg-navy/60 uppercase tracking-wider">Conversas e Grupos ({chats.length})</h3>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-pmmg-navy/50 text-xl">search</span>
            </div>
            <input 
              className="block w-full pl-10 pr-3 py-3 bg-white/60 border border-pmmg-navy/10 focus:border-pmmg-navy focus:ring-0 rounded-2xl text-sm placeholder-pmmg-navy/40" 
              placeholder="Filtrar grupos, batalhões ou setores..." 
              type="text" 
            />
          </div>
        </div>

        <section className="px-4 mt-4 space-y-3">
          {chats.map((chat) => {
            const { name, icon } = getChatDisplayInfo(chat);
            return (
              <div 
                key={chat.id} 
                onClick={() => openChat(chat.id)}
                className="pmmg-card flex items-center p-3 gap-3 cursor-pointer active:scale-95 transition-transform"
              >
                <div className={`w-14 h-14 flex items-center justify-center rounded-xl shrink-0 ${
                  chat.active ? 'bg-pmmg-navy text-pmmg-yellow' : 'bg-pmmg-navy/10 text-pmmg-navy/40 border border-pmmg-navy/20'
                }`}>
                  <span className={`material-symbols-outlined text-3xl ${chat.active ? 'fill-icon' : ''}`}>
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
          })}
        </section>

        <div className="px-4 py-6 flex gap-2 overflow-x-auto no-scrollbar">
          {/* Filtros de chat */}
        </div>
      </main>

      <BottomNav activeScreen="chatList" navigateTo={navigateTo} />
    </div>
  );
};

export default TacticalChatList;