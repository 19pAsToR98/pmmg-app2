import React from 'react';
import { Suspect } from '../types';

interface SuspectGridCardProps {
  suspect: Suspect;
  onOpenProfile: (id: string) => void;
}

const SuspectGridCard: React.FC<SuspectGridCardProps> = ({ suspect, onOpenProfile }) => {
  const statusColor = suspect.status === 'Foragido' ? 'bg-pmmg-red' : 
                        suspect.status === 'Suspeito' ? 'bg-pmmg-yellow text-pmmg-navy' :
                        suspect.status === 'Preso' ? 'bg-pmmg-blue' : 'bg-slate-700';
  
  return (
    <div 
      onClick={() => onOpenProfile(suspect.id)}
      className="pmmg-card overflow-hidden transition-all active:scale-[0.98] cursor-pointer flex flex-col h-full"
    >
      <div className="w-full aspect-[3/4] relative bg-slate-200 shrink-0">
        <img alt={suspect.name} className="w-full h-full object-cover" src={suspect.photoUrl} />
        <div className={`absolute top-0 left-0 text-white text-[8px] font-bold px-2 py-1 uppercase rounded-br-lg shadow-md ${statusColor}`}>
          {suspect.status}
        </div>
      </div>
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-xs text-pmmg-navy uppercase leading-tight truncate">{suspect.name}</h4>
          <p className="text-[9px] font-semibold text-slate-500 mt-1">CPF: {suspect.cpf}</p>
        </div>
        <div className="mt-2">
          <button 
            className="w-full bg-pmmg-navy text-white text-[8px] font-bold py-1.5 rounded-lg uppercase tracking-wide"
          >
            Ver Ficha
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuspectGridCard;