import React, { useState } from 'react';
import { Screen, Suspect, UserRank, CustomMarker } from './types';
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

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [suspects, setSuspects] = useState<Suspect[]>(INITIAL_SUSPECTS);
  const [customMarkers, setCustomMarkers] = useState<CustomMarker[]>(INITIAL_CUSTOM_MARKERS);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [userRank, setUserRank] = useState<UserRank>('Soldado');

  const navigateTo = (screen: Screen, center?: [number, number]) => {
    if (center) setMapCenter(center);
    else if (screen !== 'map') setMapCenter(null);
    setCurrentScreen(screen);
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

  const selectedSuspect = suspects.find(s => s.id === selectedSuspectId) || suspects[0];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-pmmg-khaki">
      {currentScreen === 'onboarding' && <Onboarding onEnter={() => navigateTo('dashboard')} onRequest={() => navigateTo('requestAccess')} />}
      {currentScreen === 'dashboard' && <Dashboard navigateTo={navigateTo} onOpenProfile={openProfile} suspects={suspects} />}
      {currentScreen === 'registry' && <SuspectRegistry navigateTo={navigateTo} onSave={addSuspect} />}
      {currentScreen === 'profile' && <SuspectProfile suspect={selectedSuspect} onBack={() => navigateTo('dashboard')} navigateTo={navigateTo} allSuspects={suspects} onOpenProfile={openProfile} />}
      {currentScreen === 'chatList' && <TacticalChatList navigateTo={navigateTo} />}
      {currentScreen === 'chatRoom' && <TacticalChatRoom onBack={() => navigateTo('chatList')} />}
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