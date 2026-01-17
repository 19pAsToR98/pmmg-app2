import React from 'react';
import { Chat } from '../types';

interface GroupCardProps {
  group: Chat;
  isMember: boolean;
  onAction: (chatId: string) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, isMember, onAction }) => {
  const actionLabel = isMember ? 'Ver Grupo' : 'Entrar no Grupo';
  const actionIcon = isMember ? 'visibility' : 'group_add';
  const actionColor = isMember ? 'bg-pmmg-navy' : 'bg-pmmg-yellow text-pmmg-navy';

  return (
    <div className="pmmg-card flex items-center p-3 gap-3 border-l-4 border-pmmg-navy/50">
      <div className="w-14 h-14 flex items-center justify-center rounded-xl shrink-0 bg-pmmg-navy text-pmmg-yellow">
        <span className="material-symbols-outlined text-3xl fill-icon">
          {group.icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm truncate uppercase tracking-tight text-pmmg-navy">{group.name}</h3>
        <p className="text-xs text-slate-600 truncate leading-tight mt-0.5">
          {group.participants.length} Membros • Última atividade: {group.lastTime}
        </p>
      </div>
      <button 
        onClick={() => onAction(group.id)}
        className={`shrink-0 text-[9px] font-bold px-3 py-2 rounded-lg uppercase tracking-wider active:scale-95 transition-transform flex items-center gap-1 ${actionColor}`}
      >
        <span className="material-symbols-outlined text-sm">{actionIcon}</span>
        {actionLabel}
      </button>
    </div>
  );
};

export default GroupCard;