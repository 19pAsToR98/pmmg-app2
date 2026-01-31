import React, { useState } from 'react';
import { Screen, Group, Officer, GroupParticipant } from '../types';
import BottomNav from '../components/BottomNav';

// Define a interface para os grupos que chegam (usando a estrutura Group do types.ts)
interface GroupsListProps {
  navigateTo: (screen: Screen) => void;
  userGroups: Group[];
  officers: Officer[]; // Lista de todos os oficiais para buscar detalhes dos membros
  allSuspects: any[]; // Não usado diretamente, mas mantido para consistência se necessário
  openGroup: (id: string) => void;
  pendingRequestsCount: number; // Contagem de solicitações de contato pendentes
}

const GroupsList: React.FC<GroupsListProps> = ({ navigateTo, userGroups, officers, openGroup, pendingRequestsCount }) => {
  const [inviteCode, setInviteCode] = useState('');

  // Função auxiliar para encontrar o oficial (incluindo o usuário 'EU')
  const findOfficer = (id: string): Officer | undefined => {
    if (id === 'EU') {
      // Mock do usuário atual (assumindo que o App.tsx lida com o perfil 'EU')
      return { id: 'EU', name: 'Você', rank: 'Subtenente', unit: '05º BPM', photoUrl: 'https://i.pravatar.cc/150?img=5', isOnline: true };
    }
    return officers.find(o => o.id === id);
  };

  const getGroupMembers = (group: Group): GroupParticipant[] => {
    return group.memberIds.map(memberId => {
      const officer = findOfficer(memberId);
      if (!officer) return null;
      const isAdmin = group.adminIds.includes(memberId);
      return {
        ...officer,
        isAdmin,
        role: isAdmin ? 'admin' : 'member',
      } as GroupParticipant;
    }).filter((m): m is GroupParticipant => m !== null);
  };

  return (
    <div className="flex flex-col h-full bg-theme-background overflow-hidden">
      <header className="sticky top-0 z-50 bg-theme-primary text-white shadow-xl px-4 py-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center p-1.5 border-2 border-theme-critical shadow-inner">
              <span className="material-symbols-outlined text-theme-primary text-xl">folder_shared</span>
            </div>
            <div>
              <h1 className="font-bold text-sm leading-none uppercase tracking-widest">Inteligência</h1>
              <p className="text-[10px] font-medium text-theme-accent tracking-wider uppercase mt-1">Grupos de Monitoramento</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Botão para Contatos (com badge de pendentes) */}
            <button 
              onClick={() => navigateTo('contacts')}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white shadow-lg active:scale-95 transition-transform"
              title="Gerenciar Contatos"
            >
              <span className="material-symbols-outlined text-2xl">person_add</span>
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-theme-critical text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-theme-primary">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
            {/* Botão para Criar Grupo */}
            <button 
              onClick={() => navigateTo('groupCreation')}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-theme-accent text-theme-primary shadow-lg active:scale-95 transition-transform"
              title="Criar Novo Grupo"
            >
              <span className="material-symbols-outlined text-2xl font-bold">add</span>
            </button>
          </div>
        </div>

        <div className="flex gap-2 bg-black/20 p-1.5 rounded-2xl">
           <div className="flex-1 relative">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-white/40">key</span>
             <input 
               value={inviteCode}
               onChange={(e) => setInviteCode(e.target.value)}
               placeholder="CÓDIGO DE CONVITE"
               className="w-full bg-white/5 border-none rounded-xl py-2 pl-9 pr-3 text-[10px] font-black text-white placeholder:text-white/20 focus:ring-1 focus:ring-theme-accent"
             />
           </div>
           <button 
             onClick={() => alert(`Tentando entrar no grupo com código: ${inviteCode}`)}
             className="bg-theme-accent text-theme-primary px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-md active:scale-95 transition-transform"
           >
             Entrar
           </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-40 no-scrollbar px-4 pt-4">
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="h-4 w-1 bg-theme-primary rounded-full"></div>
          <h3 className="text-[10px] font-black text-theme-primary/60 uppercase tracking-widest">Meus Grupos de Operação</h3>
        </div>

        <div className="space-y-4">
          {userGroups.map(group => {
            const members = getGroupMembers(group);
            return (
              <div 
                key={group.id}
                onClick={() => openGroup(group.id)}
                className="pmmg-card p-4 flex flex-col gap-3 active:scale-[0.98] transition-all shadow-md border-l-4 border-l-theme-primary"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-theme-primary/5 flex items-center justify-center text-theme-primary">
                      <span className="material-symbols-outlined text-3xl">folder_shared</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-theme-primary uppercase leading-none">{group.name}</h4>
                      <p className="text-[9px] text-theme-primary/40 font-bold uppercase mt-1 tracking-wider">{members.length} membros ativos</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                </div>
                
                <p className="text-[11px] text-slate-600 font-medium line-clamp-2 italic">
                  {group.description || "Nenhuma descrição definida para este grupo tático."}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex -space-x-2">
                    {members.slice(0, 3).map((m, i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-theme-primary text-theme-accent text-[8px] font-black flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-black/5 uppercase">
                        {m.name.charAt(0)}
                      </div>
                    ))}
                    {members.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 text-[8px] font-black flex items-center justify-center border-2 border-white shadow-sm">
                        +{members.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="bg-theme-primary/5 px-2 py-1 rounded text-[8px] font-black text-theme-primary/60 uppercase tracking-widest border border-theme-primary/5">
                    {group.posts.length} FICHAS COMPARTILHADAS
                  </div>
                </div>
              </div>
            );
          })}

          {userGroups.length === 0 && (
            <div className="text-center py-20 opacity-30">
              <span className="material-symbols-outlined text-7xl">folder_off</span>
              <p className="text-sm font-black uppercase mt-4 tracking-[0.2em]">Nenhum grupo ativo</p>
              <p className="text-[10px] font-bold uppercase mt-1">Crie um grupo ou entre com um código</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav activeScreen="groupsList" navigateTo={navigateTo} />
    </div>
  );
};

export default GroupsList;