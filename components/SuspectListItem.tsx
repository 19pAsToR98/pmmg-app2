import React from 'react';
import { Suspect } from '../types';
import { useLongPress } from '../hooks/useLongPress';

interface SuspectListItemProps {
  suspect: Suspect;
  isSelectionMode: boolean;
  isSelected: boolean;
  handleCardClick: (id: string) => void;
  handleLongPress: (id: string) => void;
}

const SuspectListItem: React.FC<SuspectListItemProps> = ({
  suspect: s,
  isSelectionMode,
  isSelected,
  handleCardClick,
  handleLongPress,
}) => {
  // Hook call is now safely at the top level of this component
  const longPressProps = useLongPress(() => handleLongPress(s.id));

  const statusColor = s.status === 'Foragido' ? 'bg-pmmg-red' : 
                        s.status === 'Suspeito' ? 'bg-pmmg-yellow text-pmmg-navy' :
                        s.status === 'Preso' ? 'bg-pmmg-blue' : 'bg-slate-700';
    
  const primaryVehicle = s.vehicles && s.vehicles.length > 0 ? `${s.vehicles[0].plate} (${s.vehicles[0].model})` : null;

  return (
    <div 
      onClick={() => handleCardClick(s.id)}
      {...longPressProps}
      // Removendo fundo branco e sombra. Mantendo apenas a borda lateral e a transição.
      className={`flex p-3 gap-4 items-center transition-all rounded-xl border border-transparent border-l-4 border-l-pmmg-navy relative ${
        isSelectionMode ? (isSelected ? 'bg-pmmg-red/10 border-l-pmmg-red ring-1 ring-pmmg-red' : 'opacity-70') : 'active:scale-[0.98]'
      }`}
    >
      {isSelectionMode && (
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
          isSelected ? 'bg-pmmg-red border-white shadow-lg' : 'bg-white/70 border-pmmg-navy/30'
        }`}>
          {isSelected && <span className="material-symbols-outlined text-white text-sm fill-icon">check</span>}
        </div>
      )}
      
      <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden border-2 border-white shadow-md shrink-0">
        <img src={s.photoUrl} className="w-full h-full object-cover" alt={s.name} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
           <h3 className="text-[11px] font-black text-pmmg-navy uppercase truncate pr-2">{s.name}</h3>
           <span className={`text-[7px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase ${statusColor}`}>
              {s.status}
           </span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.cpf}</p>
          {s.nickname && <span className="text-[9px] font-black text-pmmg-red italic">"{s.nickname}"</span>}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-2">
           {primaryVehicle && (
             <div className="flex items-center gap-1 text-[8px] bg-white px-2 py-0.5 rounded border border-pmmg-navy/5 text-slate-600 font-bold">
                <span className="material-symbols-outlined text-[10px]">directions_car</span>
                {primaryVehicle}
             </div>
           )}
           <div className="flex items-center gap-1 text-[8px] bg-white px-2 py-0.5 rounded border border-pmmg-navy/5 text-slate-600 font-bold">
              <span className="material-symbols-outlined text-[10px]">location_on</span>
              {s.lastSeen}
           </div>
        </div>
      </div>
      <span className="material-symbols-outlined text-pmmg-navy/20 shrink-0">chevron_right</span>
    </div>
  );
};

export default SuspectListItem;