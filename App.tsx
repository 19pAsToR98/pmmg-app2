import React, { useState } from 'react';
import { Screen, Suspect, UserRank, CustomMarker, Officer, Chat, ChatMessage, Contact, ContactStatus } from './types';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import SuspectRegistry from './pages/SuspectRegistry';
import SuspectProfile from './pages/SuspectProfile';
import TacticalChatList from './pages/TacticalChatList';
import TacticalChatRoom from './pages/TacticalChatRoom';
import AITools from './pages/AITools';
import Register from './pages/Register'; // Importação renomeada
import OnboardingSetup from './pages/OnboardingSetup'; // Nova importação
import ProfileSettings from './pages/ProfileSettings';
import TacticalMap from './pages/TacticalMap';
import TacticalContacts from './pages/TacticalContacts';
import GroupManagement from './pages/GroupManagement';

const INITIAL_SUSPECTS: Suspect[] = [
  {
    id: '1',
    name: 'Ricardo "Sombra" Silveira',
    nickname: 'Sombra',
    cpf: '084.123.456-09',
    status: 'Foragido',
    lastSeen: 'Praça da Liberdade, BH',
    timeAgo: '23 min',
    photoUrl: 'https://picsum.photos/seed/ricardo/200/250?grayscale',
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
    status: 'Suspeito',
    lastSeen: 'Mercado Central, BH',
    timeAgo: '1 hora',
    photoUrl: 'https://picsum.photos/seed/marcos/200/250?grayscale',
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
    status: 'Suspeito',
    lastSeen: 'Rua da Bahia, BH',
    timeAgo: '3 dias',
    photoUrl: 'https://picsum.photos/seed/fernanda/200/250?grayscale',
    motherName: 'Helena Rocha',
    birthDate: '01/01/1998',
    articles: ['Art. 33'],
    lat: -19.9200,
    lng: -43.9350,
    vehicles: [],
    associations: [],
    showOnMap: false, // Exemplo de suspeito que não aparece no mapa
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
    id: 'c1', 
    type: 'group', 
    name: 'Tático Móvel - 1º BPM', 
    participants: ['o1', 'o2', 'EU'], // Usuário participa
    lastMessage: 'QAP. Viatura 24190 em deslocamento para o setor delta.', 
    lastTime: '12:45', 
    unreadCount: 3, 
    icon: 'shield', 
    active: true,
    messages: [],
    description: 'Grupo de coordenação tática do 1º BPM.',
    groupPhotoUrl: 'https://picsum.photos/seed/group1/100/100',
    admins: ['o1', 'EU']
  },
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
  // Grupo Público que o usuário NÃO participa
  {
    id: 'c3',
    type: 'group',
    name: 'ROCCA - Patrulha Canina',
    participants: ['o2', 'o3'], // Usuário NÃO participa
    lastMessage: 'Cães em treinamento na área sul.',
    lastTime: '14:00',
    unreadCount: 0,
    icon: 'pets',
    active: false,
    messages: [],
    description: 'Grupo de apoio com cães farejadores.',
    groupPhotoUrl: 'https://picsum.photos/seed/group2/100/100',
    admins: ['o2']
  }
];


const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [suspects, setSuspects] = useState<Suspect[]>(INITIAL_SUSPECTS);
  const [customMarkers, setCustomMarkers] = useState<CustomMarker[]>(INITIAL_CUSTOM_MARKERS);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  
  // User Profile States (Updated for Onboarding Setup)
  const [userName, setUserName] = useState('Oficial PMMG');
  const [userRank, setUserRank] = useState<UserRank>('Soldado');
  const [userCity, setUserCity] = useState('Belo Horizonte');
  const [userCityCoords, setUserCityCoords] = useState<[number, number]>([-19.9167, -43.9345]);
  
  // Chat/Social States
  const [officers, setOfficers] = useState<Officer[]>(MOCK_OFFICERS);
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);

  const navigateTo = (screen: Screen, center?: [number, number]) => {
    if (center) setMapCenter(center);
    else if (screen !== 'map') setMapCenter(null);
    setCurrentScreen(screen);
  };

  const openChat = (chatId: string) => {
    setActiveChatId(chatId);
    navigateTo('chatRoom');
  };

  // --- Lógica de Registro e Onboarding ---
  
  const handleRegisterSuccess = () => {
    // Após o registro (e-mail/senha), move para a configuração do perfil
    navigateTo('onboardingSetup');
  };

  const handleSetupComplete = (name: string, rank: UserRank, city: string, cityCoords: [number, number]) => {
    setUserName(name);
    setUserRank(rank);
    setUserCity(city);
    setUserCityCoords(cityCoords);
    navigateTo('dashboard');
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
  
  const onJoinGroup = (chatId: string) => {
    const chatToJoin = chats.find(c => c.id === chatId);
    if (!chatToJoin || chatToJoin.type !== 'group') return;

    if (chatToJoin.participants.includes('EU')) {
      openChat(chatId);
      return;
    }

    // Simula a entrada imediata no grupo (sem aprovação, para simplificar)
    setChats(prev => prev.map(c => 
      c.id === chatId ? { ...c, participants: [...c.participants, 'EU'], active: true } : c
    ));
    alert(`Você entrou no grupo ${chatToJoin.name}.`);
    openChat(chatId);
  };

  const onSaveGroup = (groupData: Omit<Chat, 'messages' | 'lastMessage' | 'lastTime' | 'unreadCount' | 'active'>) => {
    const existingChatIndex = chats.findIndex(c => c.id === groupData.id);

    const baseChat: Chat = {
      ...groupData,
      messages: [],
      lastMessage: groupData.description || 'Novo grupo criado.',
      lastTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unreadCount: 0,
      active: true,
    };

    if (existingChatIndex !== -1) {
      // Edição
      setChats(prev => prev.map((c, index) => index === existingChatIndex ? baseChat : c));
      alert(`Grupo ${groupData.name} atualizado com sucesso.`);
    } else {
      // Criação
      setChats(prev => [...prev, baseChat]);
      alert(`Grupo ${groupData.name} criado com sucesso.`);
    }
  };

  // --- Lógica de Dados ---

  const addSuspect = (newSuspect: Suspect) => {
    setSuspects([newSuspect, ...suspects]);
    navigateTo('dashboard');
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
  const activeChat = chats.find(c => c.id === activeChatId);
  
  // Chats que o usuário participa (Individual Aceito OU Grupo que inclui 'EU')
  const userChats = chats.filter(chat => 
    (chat.type === 'group' && chat.participants.includes('EU')) || 
    (chat.type === 'individual' && contacts.some(c => c.officerId === chat.participants.find(p => p !== 'EU') && c.status === 'Accepted'))
  );
  
  // Todos os grupos, incluindo aqueles que o usuário não participa
  const allGroups = chats.filter(chat => chat.type === 'group');

  // Filtra oficiais que são contatos aceitos e estão online
  const acceptedOnlineOfficers = officers.filter(o => 
    o.isOnline && contacts.some(c => c.officerId === o.id && c.status === 'Accepted')
  );


  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-pmmg-khaki">
      {currentScreen === 'onboarding' && <Onboarding onEnter={() => navigateTo('dashboard')} onRequest={() => navigateTo('register')} />}
      {currentScreen === 'register' && <Register onBack={() => navigateTo('onboarding')} onRegisterSuccess={handleRegisterSuccess} />}
      {currentScreen === 'onboardingSetup' && <OnboardingSetup onSetupComplete={handleSetupComplete} />}
      {currentScreen === 'dashboard' && <Dashboard navigateTo={navigateTo} onOpenProfile={openProfile} suspects={suspects} />}
      {currentScreen === 'registry' && <SuspectRegistry navigateTo={navigateTo} onSave={addSuspect} allSuspects={suspects} />}
      {currentScreen === 'profile' && <SuspectProfile suspect={selectedSuspect} onBack={() => navigateTo('dashboard')} navigateTo={navigateTo} allSuspects={suspects} onOpenProfile={openProfile} />}
      {currentScreen === 'chatList' && (
        <TacticalChatList 
          navigateTo={navigateTo} 
          userChats={userChats} // Passa apenas os chats que o usuário participa
          allGroups={allGroups} // Passa todos os grupos (públicos)
          officers={acceptedOnlineOfficers} 
          openChat={openChat} 
          startIndividualChat={startIndividualChat}
          onJoinGroup={onJoinGroup}
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
      {currentScreen === 'groupManagement' && (
        <GroupManagement
          navigateTo={navigateTo}
          onBack={() => navigateTo('chatList')}
          onSaveGroup={onSaveGroup}
          allOfficers={officers}
          // currentChat={...} // Adicionar lógica para edição se necessário
        />
      )}
    </div>
  );
};

export default App;