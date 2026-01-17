import React, { useState, useRef } from 'react';
import { Screen, Chat, Officer } from '../types';
import BottomNav from '../components/BottomNav';

interface GroupManagementProps {
  navigateTo: (screen: Screen) => void;
  onBack: () => void;
  onSaveGroup: (newGroup: Omit<Chat, 'messages' | 'lastMessage' | 'lastTime' | 'unreadCount' | 'active'>) => void;
  allOfficers: Officer[];
  currentChat?: Chat; // Se estiver editando um grupo existente
}

const GroupManagement: React.FC<GroupManagementProps> = ({ navigateTo, onBack, onSaveGroup, allOfficers, currentChat }) => {
  const isEditing = !!currentChat;
  
  const [name, setName] = useState(currentChat?.name || '');
  const [description, setDescription] = useState(currentChat?.description || '');
  const [groupPhotoUrl, setGroupPhotoUrl] = useState(currentChat?.groupPhotoUrl || 'https://picsum.photos/seed/group/100/100');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(currentChat?.participants.filter(id => id !== 'EU') || []);
  const [admins, setAdmins] = useState<string[]>(currentChat?.admins || ['EU']); // O criador é sempre admin
  const [searchTerm, setSearchTerm] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleParticipant = (officerId: string) => {
    if (selectedParticipants.includes(officerId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== officerId));
      // Remove admin status if removed from participants
      setAdmins(prev => prev.filter(id => id !== officerId));
    } else {
      setSelectedParticipants([...selectedParticipants, officerId]);
    }
  };

  const handleToggleAdmin = (officerId: string) => {
    if (admins.includes(officerId)) {
      setAdmins(admins.filter(id => id !== officerId));
    } else {
      setAdmins([...admins, officerId]);
    }
  };

  const handleSave = () => {
    if (!name.trim() || selectedParticipants.length === 0) {
      alert("O grupo precisa de um nome e pelo menos um participante além de você.");
      return;
    }

    const newGroupData: Omit<Chat, 'messages' | 'lastMessage' | 'lastTime' | 'unreadCount' | 'active'> = {
      id: currentChat?.id || Date.now().toString(),
      type: 'group',
      name: name.trim(),
      participants: ['EU', ...selectedParticipants],
      icon: 'groups', // Ícone padrão
      description: description.trim(),
      groupPhotoUrl,
      admins: admins.includes('EU') ? admins : [...admins, 'EU'], // Garante que 'EU' é admin
    };

    onSaveGroup(newGroupData);
    onBack();
  };

  const availableOfficers = allOfficers.filter(o => 
    o.id !== 'EU' && 
    (o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.unit.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getOfficer = (id: string) => allOfficers.find(o => o.id === id);

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white active:scale-90 transition-transform">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div>
            <h1 className="font-bold text-sm leading-none text-white uppercase tracking-tight">
              {isEditing ? 'Gerenciar Grupo' : 'Novo Grupo Tático'}
            </h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">
              {isEditing ? currentChat?.name : 'Definir Estrutura'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="bg-pmmg-yellow text-pmmg-navy font-bold px-3 py-1.5 rounded-lg text-xs uppercase active:scale-95 transition-transform"
        >
          {isEditing ? 'Salvar' : 'Criar Grupo'}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar px-4 pt-6">
        
        {/* Configurações Básicas */}
        <section className="pmmg-card p-4 space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div 
                className="w-20 h-20 rounded-xl overflow-hidden bg-pmmg-navy/10 border-2 border-pmmg-navy/20 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <img src={groupPhotoUrl} alt="Group Photo" className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-pmmg-navy text-pmmg-yellow p-1 rounded-full border border-white shadow-md"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1">Nome do Grupo</label>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Ex: Patrulha Tática Alfa"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1">Descrição Tática</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="Objetivo, área de atuação, regras."
            />
          </div>
        </section>

        {/* Gestão de Participantes */}
        <section className="mb-6">
          <h3 className="text-[11px] font-bold text-pmmg-navy/60 uppercase tracking-wider mb-3">
            Participantes ({selectedParticipants.length + 1})
          </h3>
          
          {/* Lista de Participantes Atuais */}
          <div className="pmmg-card p-4 space-y-3 mb-4">
            {/* Usuário Atual (Sempre presente e Admin) */}
            <div className="flex items-center justify-between p-2 bg-pmmg-navy/5 rounded-lg border border-pmmg-navy/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-pmmg-blue/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-pmmg-blue">person</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-pmmg-navy">Você (EU)</p>
                  <p className="text-[10px] text-slate-500">Criador/Administrador</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-pmmg-yellow uppercase bg-pmmg-navy px-2 py-0.5 rounded-full">Admin</span>
            </div>

            {/* Outros Participantes */}
            {selectedParticipants.map(id => {
              const officer = getOfficer(id);
              if (!officer) return null;
              const isAdmin = admins.includes(id);

              return (
                <div key={id} className="flex items-center justify-between p-2 bg-pmmg-navy/5 rounded-lg border border-pmmg-navy/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-300">
                      <img src={officer.photoUrl} alt={officer.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-pmmg-navy">{officer.name}</p>
                      <p className="text-[10px] text-slate-500">{officer.rank} • {officer.unit}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button 
                      onClick={() => handleToggleAdmin(id)}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase transition-colors ${
                        isAdmin ? 'bg-pmmg-yellow text-pmmg-navy' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isAdmin ? 'Admin' : 'Tornar Admin'}
                    </button>
                    <button 
                      onClick={() => handleToggleParticipant(id)}
                      className="text-pmmg-red p-1"
                    >
                      <span className="material-symbols-outlined text-lg">person_remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Adicionar Participantes */}
          <h4 className="text-[10px] font-bold uppercase text-pmmg-navy/70 mb-2 ml-1">Adicionar Oficiais</h4>
          <div className="relative">
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full px-4 py-3 bg-white/80 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
              placeholder="Buscar oficial por nome ou matrícula..." 
              type="text" 
            />
            
            {searchTerm.length > 0 && (
              <div className="mt-2 pmmg-card p-3 space-y-2 max-h-60 overflow-y-auto">
                {availableOfficers
                  .filter(o => !selectedParticipants.includes(o.id))
                  .filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(officer => (
                    <div key={officer.id} className="flex items-center justify-between p-2 bg-pmmg-khaki/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-300">
                          <img src={officer.photoUrl} alt={officer.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-pmmg-navy leading-tight">{officer.name}</p>
                          <p className="text-[10px] text-slate-500">{officer.rank} • {officer.unit}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleToggleParticipant(officer.id)}
                        className="bg-pmmg-navy text-white text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase active:scale-95 transition-transform"
                      >
                        Adicionar
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNav activeScreen="chatList" navigateTo={navigateTo} />
    </div>
  );
};

export default GroupManagement;