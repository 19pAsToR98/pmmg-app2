import React, { useState } from 'react';
import { Screen, Suspect, UserRank, CustomMarker, Officer, Chat, ChatMessage } from './types';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import SuspectRegistry from './pages/SuspectRegistry';
import SuspectProfile from './pages/SuspectProfile';
import TacticalChatList from './pages/TacticalChatList';
import TacticalChatRoom from './pages/TacticalChatRoom';
import AITools from './pages/AITools';
import RequestAccess from './pages/RequestAccess';
import ProfileSettings from './pages/ProfileSettings';
import TacticalMap from './pages/TacticalMap';

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

const MOCK_CHATS: Chat[] = [
  { 
    id: 'c1', 
    type: 'group', 
    name: 'Tático Móvel - 1º BPM', 
    participants: ['o1', 'o2'], 
    lastMessage: 'QAP. Viatura 24190 em deslocamento para o setor delta.', 
    lastTime: '12:45', 
    unreadCount: 3, 
    icon: 'shield', 
    active: true,
    messages: [
      { id: 'm1', sender: 'Sgt. Douglas', initials: 'SD', text: 'Viatura 2314 em patrulhamento na Av. Amazonas. Nenhuma alteração até o momento.', time: '09:42', isMe: false, type: 'text' },
      { id: 'm2', sender: 'Cap. Pereira', initials: 'CP', text: 'Copiado. Equipe do 1º BPM deslocando para apoio no cerco da região central.', time: '09:48', isMe: false, type: 'text' },
    ]
  },
  { 
    id: 'c2', 
    type: 'individual', 
    name: 'Cap. Pereira (ROCCA)', 
    participants: ['o2'], 
    lastMessage: 'Relatório de averiguação K9 concluído no Ponto Central.', 
    lastTime: '12:30', 
    unreadCount: 1, 
    icon: 'person', 
    active: false,
    messages: [
      { id: 'm3', sender: 'Eu', initials: 'EU', text: 'Capitão, o relatório foi enviado.', time: '12:25', isMe: true, type: 'text' },
      { id: 'm4', sender: 'Cap. Pereira', initials: 'CP', text: 'Relatório de averiguação K9 concluído no Ponto Central.', time: '12:30', isMe: false, type: 'text' },
    ]
  },
];


const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [suspects, setSuspects] = useState<Suspect[]>(INITIAL_SUSPECTS);
  const [customMarkers, setCustomMarkers] = useState<CustomMarker[]>(INITIAL_CUSTOM_MARKERS);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [userRank, setUserRank] = useState<UserRank>('Soldado');
  
  // New States for Chat/Social
  const [officers, setOfficers] = useState<Officer[]>(MOCK_OFFICERS);
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const navigateTo = (screen: Screen, center?: [number, number]) => {
    if (center) setMapCenter(center);
    else if (screen !== 'map') setMapCenter(null);
    setCurrentScreen(screen);
  };

  const openChat = (chatId: string) => {
    setActiveChatId(chatId);
    navigateTo('chatRoom');
  };

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

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-pmmg-khaki">
      {currentScreen === 'onboarding' && <Onboarding onEnter={() => navigateTo('dashboard')} onRequest={() => navigateTo('requestAccess')} />}
      {currentScreen === 'dashboard' && <Dashboard navigateTo={navigateTo} onOpenProfile={openProfile} suspects={suspects} />}
      {currentScreen === 'registry' && <SuspectRegistry navigateTo={navigateTo} onSave={addSuspect} allSuspects={suspects} />}
      {currentScreen === 'profile' && <SuspectProfile suspect={selectedSuspect} onBack={() => navigateTo('dashboard')} navigateTo={navigateTo} allSuspects={suspects} onOpenProfile={openProfile} />}
      {currentScreen === 'chatList' && <TacticalChatList navigateTo={navigateTo} chats={chats} officers={officers} openChat={openChat} />}
      {currentScreen === 'chatRoom' && activeChat && (
        <TacticalChatRoom 
          chat={activeChat} 
          onBack={() => navigateTo('chatList')} 
          onSendMessage={handleSendMessage}
        />
      )}
      {currentScreen === 'aiTools' && <AITools navigateTo={navigateTo} userRank={userRank} />}
      {currentScreen === 'requestAccess' && <RequestAccess onBack={() => navigateTo('onboarding')} />}
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
    </div>
  );
};

export default App;