
import React, { useState } from 'react';
import { Screen, TacticalGroup } from '../types';
import BottomNav from '../components/BottomNav';

interface TacticalGroupListProps {
  navigateTo: (screen: Screen) => void;
  groups: TacticalGroup[];
  onOpenGroup: (id: string) => void;
  onCreateGroup: (name: string, description: string) => void;
}

const TacticalGroupList: React.FC<TacticalGroupListProps> = ({ navigateTo, groups, onOpenGroup, onCreateGroup }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleCreate = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName, newGroupDesc);
      setNewGroupName('');
      setNewGroupDesc('');
      setShowCreateModal(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy text-white shadow-xl px-4 py-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center p-1.5 border-2 border-pmmg-red shadow-inner">
              <span className="material-symbols-outlined text-pmmg-navy text-xl">folder_shared</span>
            </div>
            <div>
              <h1 className="font-bold text-sm leading-none uppercase tracking-widest">Inteligência</h1>
              <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Grupos de Monitoramento</p>
            </div>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-pmmg-yellow text-pmmg-navy shadow-lg active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-2xl font-bold">add</span>
          </button>
        </div>

        <div className="flex gap-2 bg-black/20 p-1.5 rounded-2xl">
           <div className="flex-1 relative">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-white/40">key</span>
             <input 
               value={inviteCode}
               onChange={(e) => setInviteCode(e.target.value)}
               placeholder="CÓDIGO DE CONVITE"
               className="w-full bg-white/5 border-none rounded-xl py-2 pl-9 pr-3 text-[10px] font-black text-white placeholder:text-white/20 focus:ring-1 focus:ring-pmmg-yellow"
             />
           </div>
           <button className="bg-pmmg-yellow text-pmmg-navy px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-md active:scale-95 transition-transform">Entrar</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-40 no-scrollbar px-4 pt-4">
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="h-4 w-1 bg-pmmg-navy rounded-full"></div>
          <h3 className="text-[10px] font-black text-pmmg-navy/60 uppercase tracking-widest">Meus Grupos de Operação</h3>
        </div>

        <div className="space-y-4">
          {groups.map(group => (
            <div 
              key={group.id}
              onClick={() => onOpenGroup(group.id)}
              className="pmmg-card p-4 flex flex-col gap-3 active:scale-[0.98] transition-all shadow-md border-l-4 border-l-pmmg-navy"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-pmmg-navy/5 flex items-center justify-center text-pmmg-navy">
                    <span className="material-symbols-outlined text-3xl">folder_shared</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-pmmg-navy uppercase leading-none">{group.name}</h4>
                    <p className="text-[9px] text-pmmg-navy/40 font-bold uppercase mt-1 tracking-wider">{group.members.length} membros ativos</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300">chevron_right</span>
              </div>
              
              <p className="text-[11px] text-slate-600 font-medium line-clamp-2 italic">
                {group.description || "Nenhuma descrição definida para este grupo tático."}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex -space-x-2">
                  {group.members.slice(0, 3).map((m, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-pmmg-navy text-pmmg-yellow text-[8px] font-black flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-black/5 uppercase">
                      {m.name.charAt(0)}
                    </div>
                  ))}
                  {group.members.length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 text-[8px] font-black flex items-center justify-center border-2 border-white shadow-sm">
                      +{group.members.length - 3}
                    </div>
                  )}
                </div>
                <div className="bg-pmmg-navy/5 px-2 py-1 rounded text-[8px] font-black text-pmmg-navy/60 uppercase tracking-widest border border-pmmg-navy/5">
                  {group.posts.length} FICHAS COMPARTILHADAS
                </div>
              </div>
            </div>
          ))}

          {groups.length === 0 && (
            <div className="text-center py-20 opacity-30">
              <span className="material-symbols-outlined text-7xl">folder_off</span>
              <p className="text-sm font-black uppercase mt-4 tracking-[0.2em]">Nenhum grupo ativo</p>
              <p className="text-[10px] font-bold uppercase mt-1">Crie um grupo ou entre com um código</p>
            </div>
          )}
        </div>
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-pmmg-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-6 border-2 border-pmmg-navy/10">
            <h3 className="text-lg font-black text-pmmg-navy uppercase mb-1 leading-none">Novo Grupo Tático</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Defina os parâmetros da pasta compartilhada</p>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-1 rounded-2xl border border-slate-200">
                <label className="block text-[9px] font-black uppercase text-pmmg-navy/40 ml-4 mt-2">Nome do Grupo</label>
                <input 
                  autoFocus
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold px-4 py-2 uppercase"
                  placeholder="EX: TÁTICO MÓVEL 402"
                />
              </div>
              <div className="bg-slate-50 p-1 rounded-2xl border border-slate-200">
                <label className="block text-[9px] font-black uppercase text-pmmg-navy/40 ml-4 mt-2">Descrição (Opcional)</label>
                <textarea 
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium px-4 py-2"
                  placeholder="Finalidade do monitoramento..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-pmmg-navy/40"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreate}
                className="flex-1 bg-pmmg-navy text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
              >
                Criar Pasta
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeScreen="groupList" navigateTo={navigateTo} />
    </div>
  );
};

export default TacticalGroupList;
