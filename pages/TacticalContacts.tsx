import React, { useState } from 'react';
import { Screen, Officer, Contact, ContactStatus } from '../types';
import BottomNav from '../components/BottomNav';

interface TacticalContactsProps {
  navigateTo: (screen: Screen) => void;
  officers: Officer[];
  contacts: Contact[];
  onSendRequest: (officerId: string) => void;
  onAcceptRequest: (officerId: string) => void;
  onRejectRequest: (officerId: string) => void;
}

const TacticalContacts: React.FC<TacticalContactsProps> = ({ navigateTo, officers, contacts, onSendRequest, onAcceptRequest, onRejectRequest }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock de todos os oficiais disponíveis para busca (excluindo o usuário atual, que é 'EU')
  const availableOfficers = officers.filter(o => 
    o.id !== 'EU' && 
    !contacts.some(c => c.officerId === o.id && c.status === 'Accepted') && // Não mostra contatos já aceitos
    !contacts.some(c => c.officerId === o.id && c.status === 'Pending' && c.isRequester) && // Não mostra solicitações enviadas
    (o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.unit.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendingRequests = contacts.filter(c => c.status === 'Pending' && !c.isRequester);
  const sentRequests = contacts.filter(c => c.status === 'Pending' && c.isRequester);
  const acceptedContacts = contacts.filter(c => c.status === 'Accepted');

  const getOfficer = (id: string) => officers.find(o => o.id === id);

  return (
    <div className="flex flex-col h-full bg-theme-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-theme-navy text-white shadow-xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigateTo('groupsList')} className="text-white">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div>
            <h1 className="font-bold text-sm leading-none uppercase tracking-widest">Gestão de Contatos</h1>
            <p className="text-[10px] font-medium text-theme-yellow tracking-wider uppercase mt-1">Oficiais para Grupos Táticos</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar px-4 pt-4">
        
        {/* Busca de Oficiais */}
        <section className="mb-6">
          <h3 className="text-[11px] font-bold text-theme-navy/60 uppercase tracking-wider mb-3">Buscar Oficial (Matrícula/Nome)</h3>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-theme-navy/50 text-xl">search</span>
            </div>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 bg-white/60 border border-theme-navy/10 focus:border-theme-navy focus:ring-0 rounded-2xl text-sm placeholder-theme-navy/40" 
              placeholder="Buscar por nome ou unidade..." 
              type="text" 
            />
          </div>
          
          {searchTerm.length > 0 && availableOfficers.length > 0 && (
            <div className="mt-3 pmmg-card p-3 space-y-2">
              {availableOfficers.map(officer => (
                <div key={officer.id} className="flex items-center justify-between p-2 bg-theme-khaki/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-300">
                      <img src={officer.photoUrl} alt={officer.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-theme-navy leading-tight">{officer.name}</p>
                      <p className="text-[10px] text-slate-500">{officer.rank} • {officer.unit}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onSendRequest(officer.id)}
                    className="bg-theme-navy text-white text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase active:scale-95 transition-transform"
                  >
                    Solicitar Contato
                  </button>
                </div>
              ))}
            </div>
          )}
          {searchTerm.length > 0 && availableOfficers.length === 0 && (
            <p className="text-center text-[10px] text-theme-navy/50 mt-4">Nenhum oficial encontrado ou já é seu contato.</p>
          )}
        </section>

        {/* Contatos Aceitos */}
        <section className="mb-6">
          <h3 className="text-[11px] font-bold text-theme-navy/60 uppercase tracking-wider mb-3 flex items-center gap-2">
            Contatos Aceitos ({acceptedContacts.length})
          </h3>
          <div className="pmmg-card p-4 space-y-3">
            {acceptedContacts.length > 0 ? acceptedContacts.map(contact => {
              const officer = getOfficer(contact.officerId);
              if (!officer) return null;
              return (
                <div key={officer.id} className="flex items-center justify-between border-b border-theme-navy/5 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-300">
                      <img src={officer.photoUrl} alt={officer.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-theme-navy leading-tight">{officer.name}</p>
                      <p className="text-[10px] text-slate-500">{officer.rank} • {officer.unit}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-green-600 uppercase">Aceito</span>
                </div>
              );
            }) : (
              <p className="text-xs text-slate-400 italic text-center py-2">Nenhum contato aceito.</p>
            )}
          </div>
        </section>

        {/* Solicitações Pendentes */}
        <section className="mb-6">
          <h3 className="text-[11px] font-bold text-theme-navy/60 uppercase tracking-wider mb-3 flex items-center gap-2">
            Solicitações Recebidas 
            {pendingRequests.length > 0 && (
              <span className="bg-theme-red text-white text-[8px] font-bold px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
            )}
          </h3>
          <div className="pmmg-card p-4 space-y-3">
            {pendingRequests.length > 0 ? pendingRequests.map(contact => {
              const officer = getOfficer(contact.officerId);
              if (!officer) return null;
              return (
                <div key={officer.id} className="flex items-center justify-between border-b border-theme-navy/5 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-300">
                      <img src={officer.photoUrl} alt={officer.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-theme-navy leading-tight">{officer.name}</p>
                      <p className="text-[10px] text-slate-500">{officer.rank} • {officer.unit}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => onAcceptRequest(officer.id)}
                      className="bg-green-600 text-white p-2 rounded-lg active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-lg">check</span>
                    </button>
                    <button 
                      onClick={() => onRejectRequest(officer.id)}
                      className="bg-theme-red text-white p-2 rounded-lg active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                </div>
              );
            }) : (
              <p className="text-xs text-slate-400 italic text-center py-2">Nenhuma solicitação pendente.</p>
            )}
          </div>
        </section>

        {/* Solicitações Enviadas */}
        <section className="mb-6">
          <h3 className="text-[11px] font-bold text-theme-navy/60 uppercase tracking-wider mb-3">Solicitações Enviadas ({sentRequests.length})</h3>
          <div className="pmmg-card p-4 space-y-3">
            {sentRequests.length > 0 ? sentRequests.map(contact => {
              const officer = getOfficer(contact.officerId);
              if (!officer) return null;
              return (
                <div key={officer.id} className="flex items-center justify-between border-b border-theme-navy/5 pb-3 last:border-b-0 last:pb-0 opacity-70">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-300">
                      <img src={officer.photoUrl} alt={officer.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-theme-navy leading-tight">{officer.name}</p>
                      <p className="text-[10px] text-slate-500">{officer.rank} • {officer.unit}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-theme-yellow uppercase">Pendente</span>
                </div>
              );
            }) : (
              <p className="text-xs text-slate-400 italic text-center py-2">Nenhuma solicitação enviada.</p>
            )}
          </div>
        </section>
      </main>

      <BottomNav activeScreen="groupsList" navigateTo={navigateTo} />
    </div>
  );
};

export default TacticalContacts;