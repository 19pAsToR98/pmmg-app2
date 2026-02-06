import React from 'react';
import { Suspect, Group } from '../types';

interface ShareGroupSelectorProps {
  suspect: Suspect;
  userGroups: Group[];
  onSelectGroup: (groupId: string, suspectId: string) => void;
  onClose: () => void;
}

const ShareGroupSelector: React.FC<ShareGroupSelectorProps> = ({ suspect, userGroups, onSelectGroup, onClose }) => {
  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center p-4 bg-pmmg-navy/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-10 duration-300">
      <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h3 className="text-lg font-black text-pmmg-navy uppercase leading-none">Compartilhar Ficha</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Alvo: {suspect.name}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-100 rounded-full text-slate-400 flex items-center justify-center active:scale-90 transition-transform shrink-0">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Suspect Preview */}
        <div className="flex items-center gap-4 bg-pmmg-navy/5 p-4 rounded-2xl border border-pmmg-navy/5 shrink-0 mb-4">
          <img 
            src={suspect.photoUrl} 
            className="w-12 h-16 rounded-lg object-cover shadow-md" 
            alt="Suspect"
          />
          <div>
            <p className="text-[9px] font-black text-pmmg-navy/40 uppercase tracking-widest">Compartilhar com:</p>
            <h4 className="text-sm font-black text-pmmg-navy uppercase mt-1">{suspect.name}</h4>
          </div>
        </div>

        {/* Group List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
          <p className="text-[10px] font-bold uppercase text-pmmg-navy/70 mb-3 ml-1 tracking-wider">Selecione o Grupo Tático</p>
          
          {userGroups.length > 0 ? userGroups.map(group => (
            <button
              key={group.id}
              onClick={() => onSelectGroup(group.id, suspect.id)}
              className="w-full p-3 bg-white rounded-xl flex items-center gap-3 border border-pmmg-navy/10 shadow-sm active:bg-pmmg-khaki/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-pmmg-navy/5 flex items-center justify-center text-pmmg-navy shrink-0">
                <span className="material-symbols-outlined text-2xl">folder_shared</span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h4 className="text-sm font-black text-pmmg-navy uppercase leading-none truncate">{group.name}</h4>
                <p className="text-[10px] text-slate-500 truncate">{group.memberIds.length} membros</p>
              </div>
              <span className="material-symbols-outlined text-pmmg-navy/40 text-lg shrink-0">arrow_forward_ios</span>
            </button>
          )) : (
            <div className="text-center py-10 opacity-50">
              <span className="material-symbols-outlined text-5xl">group_off</span>
              <p className="text-xs font-bold uppercase mt-2">Nenhum grupo ativo</p>
            </div>
          )}
        </div>
        
        <button 
          onClick={onClose}
          className="w-full mt-6 bg-slate-200 text-pmmg-navy font-bold py-4 rounded-[2rem] text-sm uppercase tracking-[0.2em] active:scale-95 transition-transform shrink-0"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default ShareGroupSelector;