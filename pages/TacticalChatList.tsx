
import React from 'react';
import { Screen } from '../types';
import BottomNav from '../components/BottomNav';

interface TacticalChatListProps {
  navigateTo: (screen: Screen) => void;
}

const MOCK_GROUPS = [
  { id: '1', name: 'Tático Móvel - 1º BPM', msg: 'QAP. Viatura 24190 em deslocamento para o setor delta.', time: '12:45', badge: 3, icon: 'shield', active: true },
  { id: '2', name: 'ROCCA - Inteligência', msg: 'Relatório de averiguação K9 concluído no Ponto Central.', time: '12:30', badge: 1, icon: 'pets', active: false },
  { id: '3', name: 'GEPAR - Setor 7', msg: 'Patrulhamento preventivo iniciado na comunidade.', time: '11:15', icon: 'diversity_3', active: true },
  { id: '4', name: 'GER - Comando 4ª CIA', msg: 'Atenção para o alerta de veículo roubado (Hilux Branca).', time: 'Ontem', icon: 'visibility', active: true },
  { id: '5', name: 'Btl ROTAM - Operações', msg: 'Escala de plantão para o próximo feriado atualizada.', time: 'Ontem', badge: 8, icon: 'bolt', active: false },
];

const TacticalChatList: React.FC<TacticalChatListProps> = ({ navigateTo }) => {
  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy text-white shadow-xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center p-1.5 border-2 border-pmmg-red shadow-inner">
            <span className="material-symbols-outlined text-pmmg-navy text-xl">groups</span>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none uppercase tracking-widest">Grupos Táticos</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Comunicação Operacional</p>
          </div>
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-pmmg-yellow border border-white/10">
          <span className="material-symbols-outlined text-xl">add_comment</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        <div className="px-4 pt-4 sticky top-0 z-40 bg-pmmg-khaki/90 backdrop-blur-md pb-2">
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
          {MOCK_GROUPS.map((group) => (
            <div 
              key={group.id} 
              onClick={() => navigateTo('chatRoom')}
              className="pmmg-card flex items-center p-3 gap-3 cursor-pointer active:scale-95 transition-transform"
            >
              <div className={`w-14 h-14 flex items-center justify-center rounded-xl shrink-0 ${
                group.active ? 'bg-pmmg-navy text-pmmg-yellow' : 'bg-pmmg-navy/10 text-pmmg-navy/40 border border-pmmg-navy/20'
              }`}>
                <span className={`material-symbols-outlined text-3xl ${group.active ? 'fill-icon' : ''}`}>
                  {group.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="font-bold text-sm truncate uppercase tracking-tight">{group.name}</h3>
                  <span className="text-[10px] font-medium opacity-60">{group.time}</span>
                </div>
                <p className="text-xs text-slate-600 truncate leading-tight">{group.msg}</p>
              </div>
              {group.badge && (
                <div className="shrink-0">
                  <span className="bg-pmmg-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {group.badge}
                  </span>
                </div>
              )}
            </div>
          ))}
        </section>

        <div className="px-4 py-6 flex gap-2 overflow-x-auto no-scrollbar">
          {['Todos', 'Favoritos', 'Batalhão', 'Urgentes'].map((filter, i) => (
            <button 
              key={filter} 
              className={`text-[10px] font-bold px-4 py-2 rounded-full uppercase whitespace-nowrap shadow-sm border ${
                i === 0 ? 'bg-pmmg-navy text-white' : 'bg-white/50 text-pmmg-navy border-pmmg-navy/10'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </main>

      <BottomNav activeScreen="chatList" navigateTo={navigateTo} />
    </div>
  );
};

export default TacticalChatList;
