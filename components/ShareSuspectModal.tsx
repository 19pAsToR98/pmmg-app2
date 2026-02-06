import React, { useState, useMemo } from 'react';
import { Suspect, Group } from '../types';

interface ShareSuspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (groupId: string, suspectId: string, observation: string) => void;
  allSuspects: Suspect[];
  userGroups: Group[];
  initialSuspectId?: string | null;
}

const ShareSuspectModal: React.FC<ShareSuspectModalProps> = ({
  isOpen,
  onClose,
  onShare,
  allSuspects,
  userGroups,
  initialSuspectId,
}) => {
  if (!isOpen) return null;

  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(initialSuspectId || null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [observation, setObservation] = useState('');
  const [searchSuspect, setSearchSuspect] = useState('');

  const selectedSuspect = useMemo(() => 
    allSuspects.find(s => s.id === selectedSuspectId)
  , [allSuspects, selectedSuspectId]);

  const suspectsForSelection = useMemo(() => {
    const term = searchSuspect.toLowerCase();
    return allSuspects.filter(s => 
      s.name.toLowerCase().includes(term) || 
      s.cpf.includes(searchSuspect) ||
      (s.nickname && s.nickname.toLowerCase().includes(term))
    );
  }, [searchSuspect, allSuspects]);

  const handleShare = () => {
    if (selectedSuspectId && selectedGroupId && observation.trim()) {
      onShare(selectedGroupId, selectedSuspectId, observation.trim());
      // Reset states and close
      setSelectedSuspectId(initialSuspectId || null);
      setSelectedGroupId(null);
      setObservation('');
      setSearchSuspect('');
      onClose();
    } else {
      alert("Selecione um alvo, um grupo e adicione uma observação.");
    }
  };
  
  const handleClose = () => {
    // Reset state to initial values on close
    setSelectedSuspectId(initialSuspectId || null);
    setSelectedGroupId(null);
    setObservation('');
    setSearchSuspect('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center p-4 bg-pmmg-navy/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-10 duration-300">
      <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-6 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-6 shrink-0">
           <div>
              <h3 className="text-lg font-black text-pmmg-navy uppercase leading-none">Compartilhar Ficha</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Alimentar Rede de Inteligência</p>
           </div>
           <button onClick={handleClose} className="w-10 h-10 bg-slate-100 rounded-full text-slate-400 flex items-center justify-center active:scale-90 transition-transform shrink-0">
              <span className="material-symbols-outlined">close</span>
           </button>
        </div>

        {/* Passo 1: Seleção do Suspeito (se não for inicializado) */}
        {!selectedSuspectId ? (
          <>
            <div className="relative mb-4 shrink-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-pmmg-navy/30">search</span>
              <input 
                value={searchSuspect}
                onChange={(e) => setSearchSuspect(e.target.value)}
                placeholder="BUSCAR NOME OU CPF..."
                className="w-full pl-10 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase placeholder:text-slate-300 shadow-inner"
              />
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 mb-4">
              {suspectsForSelection.length > 0 ? suspectsForSelection.map(s => (
                <div 
                  key={s.id}
                  onClick={() => setSelectedSuspectId(s.id)}
                  className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100 active:bg-slate-100 transition-colors cursor-pointer"
                >
                  <img src={s.photoUrl} className="w-12 h-14 rounded-lg object-cover shadow-sm" alt={s.name} />
                  <div>
                    <p className="text-[10px] font-black text-pmmg-navy uppercase leading-tight">{s.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">{s.cpf}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-[10px] text-pmmg-navy/50 mt-4">Nenhum suspeito encontrado.</p>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-6 flex-1 flex flex-col">
            {/* Suspeito Selecionado */}
            <div className="flex items-center gap-4 bg-pmmg-navy/5 p-4 rounded-3xl border border-pmmg-navy/5 shrink-0">
              <img 
                src={selectedSuspect?.photoUrl} 
                className="w-16 h-20 rounded-xl object-cover shadow-lg" 
                alt="Suspect"
              />
              <div>
                <p className="text-[9px] font-black text-pmmg-navy/40 uppercase tracking-widest">Alvo Selecionado</p>
                <h4 className="text-sm font-black text-pmmg-navy uppercase mt-1">{selectedSuspect?.name}</h4>
                {!initialSuspectId && (
                  <button onClick={() => setSelectedSuspectId(null)} className="text-[9px] font-black text-pmmg-red uppercase mt-2 active:opacity-70 transition-opacity">Alterar Alvo</button>
                )}
              </div>
            </div>
            
            {/* Seleção de Grupo */}
            <div className="shrink-0">
              <label className="block text-[10px] font-black uppercase text-pmmg-navy/40 mb-2 ml-2 tracking-widest">Compartilhar no Grupo</label>
              <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
                {userGroups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all border shrink-0 ${
                      selectedGroupId === group.id 
                      ? 'bg-pmmg-navy text-white border-pmmg-navy shadow-md' 
                      : 'bg-slate-50 text-pmmg-navy/60 border-slate-200'
                    }`}
                  >
                    {group.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Observação Tática */}
            <div className="flex-1 min-h-[100px]">
              <label className="block text-[10px] font-black uppercase text-pmmg-navy/40 mb-2 ml-2 tracking-widest">Observação Tática</label>
              <textarea 
                autoFocus
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-medium italic h-full min-h-[100px] shadow-inner"
                placeholder="Descreva a movimentação, novas evidências ou local de avistamento..."
              />
            </div>

            <button 
              onClick={handleShare}
              disabled={!observation.trim() || !selectedGroupId}
              className="w-full bg-pmmg-navy text-white py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-transform disabled:opacity-50 shrink-0"
            >
              Confirmar Postagem
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareSuspectModal;