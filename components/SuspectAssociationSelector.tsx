import React, { useState, useMemo } from 'react';
import { Suspect } from '../types';

interface SuspectAssociationSelectorProps {
  existingSuspects: Suspect[];
  onSelect: (suspectId: string) => void;
  currentAssociationId: string;
}

const SuspectAssociationSelector: React.FC<SuspectAssociationSelectorProps> = ({ existingSuspects, onSelect, currentAssociationId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredSuspects = useMemo(() => {
    if (!searchTerm) return existingSuspects;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return existingSuspects.filter(s => 
      s.name.toLowerCase().includes(lowerCaseSearch) ||
      s.cpf.includes(searchTerm) ||
      (s.nickname && s.nickname.toLowerCase().includes(lowerCaseSearch))
    );
  }, [searchTerm, existingSuspects]);

  const selectedSuspect = existingSuspects.find(s => s.id === currentAssociationId);

  const handleSelect = (suspect: Suspect) => {
    onSelect(suspect.id);
    setSearchTerm(suspect.name); // Exibe o nome do selecionado no campo de busca
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1 ml-1 tracking-wider">Indivíduo Associado</label>
      <div className="relative">
        <input 
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownOpen(true);
            if (currentAssociationId) onSelect(''); // Limpa a seleção se o usuário começar a digitar
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} // Pequeno delay para permitir cliques
          className="block w-full px-4 py-3 bg-white border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
          placeholder="Buscar por Nome, CPF ou Vulgo..." 
          type="text" 
        />
        <span className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-pmmg-navy/40 text-xl">search</span>
      </div>

      {isDropdownOpen && filteredSuspects.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-pmmg-navy/20 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filteredSuspects.map(suspect => (
            <div
              key={suspect.id}
              onMouseDown={() => handleSelect(suspect)} // Usar onMouseDown para capturar o clique antes do onBlur
              className={`flex items-center p-3 gap-3 cursor-pointer hover:bg-pmmg-khaki/50 transition-colors ${suspect.id === currentAssociationId ? 'bg-pmmg-navy/10' : ''}`}
            >
              <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-slate-300 border border-pmmg-navy/10">
                <img src={suspect.photoUrl} alt={suspect.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-pmmg-navy truncate">{suspect.name}</p>
                <p className="text-[10px] text-slate-600 truncate">CPF: {suspect.cpf}</p>
              </div>
              {suspect.id === currentAssociationId && (
                <span className="material-symbols-outlined text-pmmg-blue text-lg fill-icon">check_circle</span>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedSuspect && (
        <div className="mt-2 p-2 bg-pmmg-blue/10 border border-pmmg-blue/20 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-pmmg-blue text-lg">link</span>
          <p className="text-[10px] font-bold text-pmmg-blue uppercase">Selecionado: {selectedSuspect.name}</p>
        </div>
      )}
    </div>
  );
};

export default SuspectAssociationSelector;