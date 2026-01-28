import React, { useState } from 'react';
import { Screen, Suspect, UserRank, CustomMarker, Officer, Chat, ChatMessage, Contact, ContactStatus } from './types';
import WelcomeScreen from './pages/WelcomeScreen'; // Renomeado
import Dashboard from './pages/Dashboard';
import SuspectRegistry from './pages/SuspectRegistry';
import SuspectProfile from './pages/SuspectProfile';
import TacticalChatList from './pages/TacticalChatList';
import TacticalChatRoom from './pages/TacticalChatRoom';
import AITools from './pages/AITools';
import RequestAccess from './pages/RequestAccess';
import ProfileSettings from './pages/ProfileSettings';
import TacticalMap from './pages/TacticalMap';
import TacticalContacts from './pages/TacticalContacts';
import OnboardingSetup from './pages/OnboardingSetup'; // Novo componente
import SuspectsManagement from './pages/SuspectsManagement'; // Novo componente

const INITIAL_SUSPECTS: Suspect[] = [
  {
    id: '1',
    name: 'Ricardo "Sombra" Silveira',
    nickname: 'Sombra',
    cpf: '084.123.456-09',
    rg: '1.234.567',
    status: 'Foragido',
    lastSeen: 'Praça da Liberdade, BH',
    timeAgo: '23 min',
    photoUrl: 'https://i.pravatar.cc/150?img=68', // Foto de pessoa
    motherName: 'Maria Helena Silveira',
    birthDate: '12/05/1990',
    articles: ['Art. 157', 'Art. 33'],
    lat: -19.9320,
    lng: -43.9381,
    vehicles: [
      { plate: 'ABC-1234', model: 'Fiat Uno', color: 'Cinza' },
      { plate: 'XYZ-9876', model: 'Honda Civic', color: 'Preto' }
    ],
    associations: [
      { suspectId: '2', relationship: 'Cúmplice em Roubo' }
    ],
    showOnMap: true,
  },
  {
    id: '2',
    name: 'Marcos Aurélio Lima',
    nickname: 'Marquinhos',
    cpf: '112.987.654-54',
    rg: '2.345.678',
    status: 'Suspeito',
    lastSeen: 'Mercado Central, BH',
    timeAgo: '1 hora',
    photoUrl: 'https://i.pravatar.cc/150?img=12', // Foto de pessoa
    motherName: 'Ana Paula Lima',
    birthDate: '22/10/1995',
    articles: ['Art. 180'],
    lat: -19.9230,
    lng: -43.9442,
    vehicles: [],
    associations: [
      { suspectId: '1', relationship: 'Contato Frequente' },
      { suspectId: '3', relationship: 'Familiar (Primo)' }
    ],
    showOnMap: true,
  },
  {
    id: '3',
    name: 'Fernanda Rocha',
    nickname: 'Nanda',
    cpf: '222.333.444-55',
    rg: '3.456.789',
    status: 'Suspeito',
    lastSeen: 'Rua da Bahia, BH',
    timeAgo: '3 dias',
    photoUrl: 'https://i.pravatar.cc/150?img=45', // Foto de pessoa
    motherName: 'Helena Rocha',
    birthDate: '01/01/1998',
    articles: ['Art. 33'],
    lat: -19.9200,
    lng: -43.9350,
    vehicles: [],
    associations: [],
    showOnMap: false, // Exemplo de suspeito que não aparece no mapa
  },
  {
    id: '4',
    name: 'Carlos "Gordo" Oliveira',
    nickname: 'Gordo',
    cpf: '333.444.555-66',
    rg: '4.567.890',
    status: 'Preso',
    lastSeen: 'Penitenciária Nelson Hungria',
    timeAgo: '1 ano',
    photoUrl: 'https://i.pravatar.cc/150?img=30',
    motherName: 'Joana Oliveira',
    birthDate: '10/03/1985',
    articles: ['Art. 121', 'Art. 33'],
    lat: -19.9500,
    lng: -43.9000,
    vehicles: [{ plate: 'HJK-5678', model: 'VW Gol', color: 'Branco' }],
    associations: [],
    showOnMap: false,
  },
  {
    id: '5',
    name: 'Patrícia Mendes',
    nickname: 'Paty',
    cpf: '444.555.666-77',
    rg: '5.678.901',
    status: 'Foragido',
    lastSeen: 'Avenida Afonso Pena, 1500',
    timeAgo: '5 horas',
    photoUrl: 'https://i.pravatar.cc/150?img=21',
    motherName: 'Lúcia Mendes',
    birthDate: '05/11/1992',
    articles: ['Art. 155'],
    lat: -19.9250,
    lng: -43.9400,
    vehicles: [],
    associations: [{ suspectId: '4', relationship: 'Ex-Parceira' }],
    showOnMap: true,
  },
  {
    id: '6',
    name: 'Roberto Souza',
    nickname: 'Beto',
    cpf: '555.666.777-88',
    rg: '6.789.012',
    status: 'CPF Cancelado',
    lastSeen: 'Registro Antigo',
    timeAgo: '2 anos',
    photoUrl: 'https://i.pravatar.cc/150?img=55',
    motherName: 'Clara Souza',
    birthDate: '20/07/1978',
    articles: [],
    lat: -19.9100,
    lng: -43.9500,
    vehicles: [{ plate: 'LMN-9012', model: 'Chevrolet Corsa', color: 'Vermelho' }],
    associations: [],
    showOnMap: false,
  }
];

const INITIAL_CUSTOM_MARKERS: CustomMarker[] = [
  {
    id: 'm1',
    lat: -19.9180,
    lng: -43.9355,
    title: 'Ponto de Observação',
    description: 'Vigilância 24h. Área de alto risco.',
    icon: 'visibility',
    color: 'bg-pmmg-gold'
  }
];

const MOCK_OFFICERS: Officer[] = [
  { id: 'o1', name: 'Sgt. Douglas', rank: '3º Sargento', unit: '1º BPM', photoUrl: 'https://picsum.photos/seed/douglas/100/100', isOnline: true },
  { id: 'o2', name: 'Cap. Pereira', rank: 'Subtenente', unit: 'ROCCA', photoUrl: 'https://picsum.photos/seed/pereira/100/100', isOnline: true },
  { id: 'o3', name: 'Cb. Silva', rank: 'Cabo', unit: 'GEPAR', photoUrl: 'https://picsum.photos/seed/silva/100/100', isOnline: false },
];

// Mock Contacts: o1 is accepted, o2 sent a request (pending), o3 is ignored/not contacted yet
const INITIAL_CONTACTS: Contact[] = [
  { officerId: 'o1', status: 'Accepted', isRequester: false },
  { officerId: 'o2', status: 'Pending', isRequester: false }, // o2 sent a request to 'EU'
];

const MOCK_CHATS: Chat[] = [
  { 
    id: 'c_o1', // Chat individual com o1 (Aceito)
    type: 'individual', 
    name: 'Sgt. Douglas (1º BPM)', 
    participants: ['o1', 'EU'], 
    lastMessage: 'Relatório de averiguação K9 concluído no Ponto Central.', 
    lastTime: '12:30', 
    unreadCount: 1, 
    icon: 'person', 
    active: true,
    messages: [
      { id: 'm3', sender: 'Eu', initials: 'EU', text: 'Sargento, o relatório foi enviado.', time: '12:25', isMe: true, type: 'text' },
      { id: 'm4', sender: 'Sgt. Douglas', initials: 'SD', text: 'Relatório de averiguação K9 concluído no Ponto Central.', time: '12:30', isMe: false, type: 'text' },
    ]
  },
];


const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcomeScreen');
  const [suspects, setSuspects] = useState<Suspect[]>(INITIAL_SUSPECTS);
  const [customMarkers, setCustomMarkers] = useState<CustomMarker[]>(INITIAL_CUSTOM_MARKERS);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [editingSuspectId, setEditingSuspectId] = useState<string | null>(null); // NOVO ESTADO PARA EDIÇÃO
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  
  // User Profile States (Updated to reflect new onboarding)
  const [userRank, setUserRank] = useState<UserRank>('Soldado');
  const [userName, setUserName] = useState('Rodrigo Alves');
  const [userCity, setUserCity] = useState('Belo Horizonte');
  const [isRegistered, setIsRegistered] = useState(false); // New state for registration status
  
  // Suspect Management Filter State
  const [initialSuspectFilter, setInitialSuspectFilter] = useState<Suspect['status'] | 'Todos'>('Todos');
  
  // Chat/Social States
  const [officers, setOfficers] = useState<Officer[]>(MOCK_OFFICERS);
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);

  const navigateTo = (screen: Screen, center?: [number, number]) => {
    if (center) setMapCenter(center);
    else if (screen !== 'map') setMapCenter(null);
    setCurrentScreen(screen);
    
    // Limpa o ID de edição ao navegar para outra tela que não seja o registro
    if (screen !== 'registry') {
      setEditingSuspectId(null);
    }
  };
  
  const navigateToSuspectsManagement = (statusFilter: Suspect['status'] | 'Todos' = 'Todos') => {
    setInitialSuspectFilter(statusFilter);
    navigateTo('suspectsManagement');
  };

  const openChat = (chatId: string) => {
    setActiveChatId(chatId);
    navigateTo('chatRoom');
  };

  // --- Lógica de Contatos ---

  const getContactStatus = (officerId: string): ContactStatus | null => {
    return contacts.find(c => c.officerId === officerId)?.status || null;
  };

  const onSendRequest = (officerId: string) => {
    if (getContactStatus(officerId)) return; // Já existe um relacionamento
    
    // Simula o envio de uma solicitação (o usuário atual é o requerente)
    const newContact: Contact = { officerId, status: 'Pending', isRequester: true };
    setContacts(prev => [...prev, newContact]);
    alert(`Solicitação de contato enviada para ${officers.find(o => o.id === officerId)?.name}. (Simulação)`);
  };

  const onAcceptRequest = (officerId: string) => {
    setContacts(prev => prev.map(c => 
      c.officerId === officerId ? { ...c, status: 'Accepted', isRequester: false } : c
    ));
    
    // Cria o chat individual imediatamente após aceitar
    startIndividualChat(officerId, true);
    alert(`Contato com ${officers.find(o => o.id === officerId)?.name} aceito!`);
  };

  const onRejectRequest = (officerId: string) => {
    setContacts(prev => prev.filter(c => c.officerId !== officerId));
    alert(`Solicitação de contato de ${officers.find(o => o.id === officerId)?.name} rejeitada.`);
  };

  const startIndividualChat = (officerId: string, forceCreation = false) => {
    const status = getContactStatus(officerId);
    
    if (status !== 'Accepted' && !forceCreation) {
      alert("Você só pode iniciar um chat individual com contatos aceitos.");
      return;
    }

    // 1. Verificar se já existe um chat individual com este oficial
    const existingChat = chats.find(chat => 
      chat.type === 'individual' && (chat.participants.includes(officerId) && chat.participants.includes('EU'))
    );

    if (existingChat) {
      openChat(existingChat.id);
      return;
    }

    // 2. Criar um novo chat
    const officer = officers.find(o => o.id === officerId);
    if (!officer) return;

    const newChat: Chat = {
      id: `c_${officerId}`,
      type: 'individual',
      name: `${officer.rank}. ${officer.name.split(' ')[1]} (${officer.unit})`,
      participants: [officerId, 'EU'], // 'EU' representa o usuário logado
      lastMessage: 'Inicie a conversa tática.',
      lastTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unreadCount: 0,
      icon: 'person',
      active: true,
      messages: [],
    };

    setChats(prev => [...prev, newChat]);
    openChat(newChat.id);
  };
  
  // Removendo onJoinGroup e onSaveGroup

  // --- Lógica de Dados ---

  const addSuspect = (newSuspect: Suspect) => {
    setSuspects([newSuspect, ...suspects]);
    navigateTo('dashboard');
  };
  
  const updateSuspect = (updatedSuspect: Suspect) => {
    setSuspects(prev => prev.map(s => s.id === updatedSuspect.id ? updatedSuspect : s));
    setEditingSuspectId(null);
    setSelectedSuspectId(updatedSuspect.id); // Volta para o perfil atualizado
    navigateTo('profile');
    alert(`Ficha de ${updatedSuspect.name} atualizada com sucesso.`);
  };

  const deleteSuspects = (ids: string[]) => {
    setSuspects(prev => prev.filter(s => !ids.includes(s.id)));
    // Também remover marcadores customizados se houver IDs correspondentes (embora improvável)
    setCustomMarkers(prev => prev.filter(m => !ids.includes(m.id)));
  };

  const addCustomMarker = (marker: CustomMarker) => {
    setCustomMarkers(prev => [...prev, marker]);
  };

  const updateCustomMarker = (updatedMarker: CustomMarker) => {
    setCustomMarkers(prev => 
      prev.map(m => (m.id === updatedMarker.id ? updatedMarker : m))
    );
  };

  const deleteCustomMarker = (id: string) => {
    setCustomMarkers(prev => prev.filter(m => m.id !== id));
  };

  const openProfile = (id: string) => {
    setSelectedSuspectId(id);
    setCurrentScreen('profile');
  };
  
  const handleEditProfile = (id: string) => {
    setEditingSuspectId(id);
    navigateTo('registry');
  };
  
  const handleOnboardingComplete = (name: string, rank: UserRank, city: string) => {
    setUserName(name);
    setUserRank(rank);
    setUserCity(city);
    navigateTo('dashboard');
  };

  const handleSendMessage = (chatId: string, message: ChatMessage) => {
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, message],
          lastMessage: message.text || (message.type === 'alert' ? 'Alerta Tático' : 'Imagem'),
          lastTime: message.time,
          unreadCount: 0, // Clear unread count when sending a message
        };
      }
      return chat;
    }));
  };

  const selectedSuspect = suspects.find(s => s.id === selectedSuspectId) || suspects[0];
  const suspectToEdit = suspects.find(s => s.id === editingSuspectId);
  const activeChat = chats.find(c => c.id === activeChatId);
  
  // Chats que o usuário participa (AGORA APENAS INDIVIDUAIS ACEITOS)
  const userChats = chats.filter(chat => 
    chat.type === 'individual' && contacts.some(c => c.officerId === chat.participants.find(p => p !== 'EU') && c.status === 'Accepted')
  );
  
  // Filtra oficiais que são contatos aceitos e estão online
  const acceptedOnlineOfficers = officers.filter(o => 
    o.isOnline && contacts.some(c => c.officerId === o.id && c.status === 'Accepted')
  );


  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-pmmg-khaki">
      {currentScreen === 'welcomeScreen' && <WelcomeScreen onEnter={() => navigateTo('dashboard')} onRequest={() => navigateTo('requestAccess')} />}
      
      {currentScreen === 'requestAccess' && <RequestAccess onBack={() => navigateTo('welcomeScreen')} onSuccess={() => { setIsRegistered(true); navigateTo('onboardingSetup'); }} />}
      
      {currentScreen === 'onboardingSetup' && isRegistered && <OnboardingSetup onComplete={handleOnboardingComplete} />}
      
      {currentScreen === 'dashboard' && <Dashboard navigateTo={navigateTo} navigateToSuspectsManagement={navigateToSuspectsManagement} onOpenProfile={openProfile} suspects={suspects} />}
      {currentScreen === 'registry' && (
        <SuspectRegistry 
          navigateTo={navigateTo} 
          onSave={addSuspect} 
          onUpdate={updateSuspect} // Passando a função de atualização
          currentSuspect={suspectToEdit} // Passando o suspeito a ser editado
          allSuspects={suspects} 
        />
      )}
      {currentScreen === 'profile' && selectedSuspect && (
        <SuspectProfile 
          suspect={selectedSuspect} 
          onBack={() => navigateTo('dashboard')} 
          navigateTo={navigateTo} 
          allSuspects={suspects} 
          onOpenProfile={openProfile}
          onEdit={handleEditProfile} // Passando a função de edição
        />
      )}
      {currentScreen === 'suspectsManagement' && (
        <SuspectsManagement
          navigateTo={navigateTo}
          onOpenProfile={openProfile}
          suspects={suspects}
          initialStatusFilter={initialSuspectFilter}
          deleteSuspects={deleteSuspects} // Passando a função de exclusão
        />
      )}
      {currentScreen === 'chatList' && (
        <TacticalChatList 
          navigateTo={navigateTo} 
          userChats={userChats} 
          officers={acceptedOnlineOfficers} 
          openChat={openChat} 
          pendingRequestsCount={contacts.filter(c => c.status === 'Pending' && !c.isRequester).length}
        />
      )}
      {currentScreen === 'chatRoom' && activeChat && (
        <TacticalChatRoom 
          chat={activeChat} 
          onBack={() => navigateTo('chatList')} 
          onSendMessage={handleSendMessage}
        />
      )}
      {currentScreen === 'aiTools' && <AITools navigateTo={navigateTo} userRank={userRank} />}
      {currentScreen === 'profileSettings' && (
        <ProfileSettings 
          navigateTo={navigateTo} 
          onBack={() => navigateTo('dashboard')} 
          currentRank={userRank} 
          onRankChange={setUserRank}
        />
      )}
      {currentScreen === 'map' && (
        <TacticalMap 
          navigateTo={navigateTo} 
          suspects={suspects} 
          onOpenProfile={openProfile} 
          initialCenter={mapCenter} 
          customMarkers={customMarkers} 
          addCustomMarker={addCustomMarker} 
          updateCustomMarker={updateCustomMarker}
          deleteCustomMarker={deleteCustomMarker}
        />
      )}
      {currentScreen === 'contacts' && (
        <TacticalContacts
          navigateTo={navigateTo}
          officers={officers}
          contacts={contacts}
          onSendRequest={onSendRequest}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
        />
      )}
    </div>
  );
};

export default App;