import React, { useState, useMemo, useEffect } from 'react';
import { Screen, Suspect, UserRank, CustomMarker, Officer, Contact, ContactStatus, UserAvatar, Group, GroupPost, GroupParticipant, Institution, ColorPalette } from './types';
import WelcomeScreen from './pages/WelcomeScreen'; // Renomeado
import Dashboard from './pages/Dashboard';
import SuspectRegistry from './pages/SuspectRegistry';
import SuspectProfile from './pages/SuspectProfile';
import AITools from './pages/AITools';
import RequestAccess from './pages/RequestAccess';
import TacticalMap from './pages/TacticalMap';
import TacticalContacts from './pages/TacticalContacts';
import OnboardingSetup from './pages/OnboardingSetup'; // Novo componente
import SuspectsManagement from './pages/SuspectsManagement'; // Novo componente
import PlateConsultation from './pages/PlateConsultation'; // NOVO
import VoiceReport from './pages/VoiceReport'; // NOVO
import Store from './pages/Store'; // NOVO: Loja
import ProductList from './pages/ProductList'; // NOVO: Lista de Produtos da Loja
import ProfileSettings from './pages/ProfileSettings';
import GroupsList from './pages/GroupsList'; // NOVO: Lista de Grupos
import GroupCreation from './pages/GroupCreation'; // NOVO: Criação de Grupo
import GroupDetail from './pages/GroupDetail'; // NOVO: Detalhe do Grupo

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

const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Patrulha Tática 402',
    description: 'Grupo de coordenação da Patrulha 402, 5º BPM.',
    adminIds: ['EU'],
    memberIds: ['EU', 'o1', 'o3'],
    pendingInviteIds: [],
    groupPhotoUrl: 'https://picsum.photos/seed/patrulha/100/100',
    inviteCode: 'P402-BH', // ADDED
    posts: [
      {
        id: 'p1',
        suspectId: '1', // Ricardo "Sombra" Silveira
        authorId: 'o1',
        observation: 'Suspeito visto na área de cobertura. Prioridade máxima.',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
      {
        id: 'p2',
        suspectId: '5', // Patrícia Mendes
        authorId: 'EU',
        observation: 'Adicionando ficha de Patrícia. Possível rota de fuga para Contagem.',
        timestamp: new Date().toISOString(), // Now
      }
    ]
  }
];

// ATUALIZADO: Usando uma imagem de perfil genérica para o usuário
const DEFAULT_USER_AVATAR: UserAvatar = { 
  name: 'Oficial PMMG', 
  url: 'https://i.pravatar.cc/150?img=5' // Imagem de perfil genérica
};

// Avatar padrão para a IA antes do onboarding
const DEFAULT_AI_AVATAR: UserAvatar = {
  name: 'AI Assistente',
  url: 'https://regularmei.com.br/wp-content/uploads/2026/01/ai_mascot.gif'
};

// --- Paletas de Cores ---
const PALETTES: Record<Institution, ColorPalette> = {
  PMMG: {
    primary: '#002147', // Navy
    primaryDark: '#001530',
    background: '#c5b39a', // Khaki
    backgroundLight: '#dcd1c1',
    accent: '#ffcc00', // Yellow
    critical: '#e31c1c', // Red
    secondary: '#0047ab', // Blue
    gold: '#d4af37', // Gold
  },
  PMESP: {
    primary: '#050505', // Black
    primaryDark: '#000000',
    background: '#f5f5f5', // Light Gray (to contrast with red/black uniform theme)
    backgroundLight: '#ffffff',
    accent: '#ffcc00', // Yellow/Gold
    critical: '#e31c1c', // Red (High Priority)
    secondary: '#FF0E18', // Crimson Red (Uniform color, used as secondary highlight)
    gold: '#d4af37', // Gold
  }
};

// Define enriched types for GroupDetail consumption
interface EnrichedGroupPost extends GroupPost {
  authorName: string;
  authorRank: UserRank;
  suspectName: string;
  suspectPhoto: string;
}

interface EnrichedGroup extends Group {
  members: GroupParticipant[];
  posts: EnrichedGroupPost[];
}


const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcomeScreen');
  const [suspects, setSuspects] = useState<Suspect[]>(INITIAL_SUSPECTS);
  const [customMarkers, setCustomMarkers] = useState<CustomMarker[]>(INITIAL_CUSTOM_MARKERS);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [editingSuspectId, setEditingSuspectId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  
  // NEW: State for Institution
  const [institution, setInstitution] = useState<Institution>('PMMG');
  
  // NEW: State for Store navigation
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  
  // User Profile States
  const [userRank, setUserRank] = useState<UserRank>('Soldado');
  const [userName, setUserName] = useState('Rodrigo Alves');
  const [userCity, setUserCity] = useState('Belo Horizonte');
  const [isRegistered, setIsRegistered] = useState(false);
  const [userAvatar, setUserAvatar] = useState<UserAvatar>(DEFAULT_USER_AVATAR);
  
  // AI Avatar State (Selected during onboarding)
  const [aiAvatar, setAiAvatar] = useState<UserAvatar>(DEFAULT_AI_AVATAR);
  
  // Suspect Management Filter State
  const [initialSuspectFilter, setInitialSuspectFilter] = useState<Suspect['status'] | 'Todos'>('Todos');
  
  // Social States (Only Officers and Contacts remain)
  const [officers, setOfficers] = useState<Officer[]>(MOCK_OFFICERS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  
  // Group States
  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // --- Efeito para aplicar a paleta de cores ---
  useEffect(() => {
    const palette = PALETTES[institution];
    const root = document.documentElement;
    
    root.style.setProperty('--color-primary', palette.primary);
    root.style.setProperty('--color-primary-dark', palette.primaryDark);
    root.style.setProperty('--color-background', palette.background);
    root.style.setProperty('--color-background-light', palette.backgroundLight);
    root.style.setProperty('--color-accent', palette.accent);
    root.style.setProperty('--color-critical', palette.critical);
    root.style.setProperty('--color-secondary', palette.secondary);
    root.style.setProperty('--color-gold', palette.gold);
    
    // Forçar re-renderização de componentes que dependem de cores globais se necessário
    // (Tailwind classes should handle this automatically via CSS variables)
  }, [institution]);


  const navigateTo = (screen: Screen, param?: string | [number, number]) => {
    if (Array.isArray(param)) {
      setMapCenter(param);
    } else if (screen === 'productList' && typeof param === 'string') {
      setSelectedCategoryId(param);
    } else {
      setMapCenter(null);
      setSelectedCategoryId(undefined);
    }
    
    setCurrentScreen(screen);
    
    if (screen !== 'registry') {
      setEditingSuspectId(null);
    }
    
    // Limpa IDs ativos ao sair das telas de detalhe
    if (screen !== 'groupDetail') setActiveGroupId(null);
  };
  
  const navigateToSuspectsManagement = (statusFilter: Suspect['status'] | 'Todos' = 'Todos') => {
    setInitialSuspectFilter(statusFilter);
    navigateTo('suspectsManagement');
  };

  // --- Lógica de Grupos ---
  
  const handleCreateGroup = (newGroupData: Omit<Group, 'id' | 'posts' | 'inviteCode'>) => {
    const newGroup: Group = {
      ...newGroupData,
      id: `g${Date.now()}`,
      inviteCode: `G${Math.floor(Math.random() * 9000) + 1000}-${newGroupData.name.slice(0, 2).toUpperCase()}`, // Generate mock invite code
      posts: [],
    };
    setGroups(prev => [...prev, newGroup]);
    alert(`Grupo ${newGroup.name} criado com sucesso! Convites enviados.`);
  };
  
  const handleUpdateGroup = (updatedGroup: Group) => {
    setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };
  
  const handleDeleteGroup = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    setActiveGroupId(null);
  };
  
  const handleShareSuspect = (groupId: string, suspectId: string, observation: string) => {
    const newPost: GroupPost = {
      id: `p${Date.now()}`,
      suspectId,
      authorId: 'EU', // Current user
      observation,
      timestamp: new Date().toISOString(),
    };
    
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        // Adiciona o novo post no início para que seja o mais recente
        return { ...group, posts: [newPost, ...group.posts] };
      }
      return group;
    }));
    alert('Ficha compartilhada no grupo com sucesso!');
  };
  
  const openGroup = (groupId: string) => {
    setActiveGroupId(groupId);
    navigateTo('groupDetail');
  };

  // --- Lógica de Contatos (para convites de grupo) ---

  const getContactStatus = (officerId: string): ContactStatus | null => {
    return contacts.find(c => c.officerId === officerId)?.status || null;
  };

  const onSendRequest = (officerId: string) => {
    if (getContactStatus(officerId)) return;
    
    const newContact: Contact = { officerId, status: 'Pending', isRequester: true };
    setContacts(prev => [...prev, newContact]);
    alert(`Solicitação de contato enviada para ${officers.find(o => o.id === officerId)?.name}. (Simulação)`);
  };

  const onAcceptRequest = (officerId: string) => {
    setContacts(prev => prev.map(c => 
      c.officerId === officerId ? { ...c, status: 'Accepted', isRequester: false } : c
    ));
    
    alert(`Contato com ${officers.find(o => o.id === officerId)?.name} aceito!`);
  };

  const onRejectRequest = (officerId: string) => {
    setContacts(prev => prev.filter(c => c.officerId !== officerId));
    alert(`Solicitação de contato de ${officers.find(o => o.id === officerId)?.name} rejeitada.`);
  };
  
  // --- Lógica de Dados ---

  const addSuspect = (newSuspect: Suspect) => {
    setSuspects([newSuspect, ...suspects]);
    navigateTo('dashboard');
  };
  
  const updateSuspect = (updatedSuspect: Suspect) => {
    setSuspects(prev => prev.map(s => s.id === updatedSuspect.id ? updatedSuspect : s));
    setEditingSuspectId(null);
    setSelectedSuspectId(updatedSuspect.id);
    navigateTo('profile');
    alert(`Ficha de ${updatedSuspect.name} atualizada com sucesso.`);
  };

  const deleteSuspects = (ids: string[]) => {
    setSuspects(prev => prev.filter(s => !ids.includes(s.id)));
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
  
  const handleOnboardingComplete = (name: string, rank: UserRank, city: string, avatar: UserAvatar, selectedInstitution: Institution) => {
    setUserName(name);
    setUserRank(rank);
    setUserCity(city);
    setAiAvatar(avatar);
    setInstitution(selectedInstitution); // Set institution on completion
    navigateTo('dashboard');
  };

  const selectedSuspect = suspects.find(s => s.id === selectedSuspectId) || suspects[0];
  const suspectToEdit = suspects.find(s => s.id === editingSuspectId);
  const activeGroup = groups.find(g => g.id === activeGroupId);
  
  // Grupos que o usuário é membro
  const userGroups = groups.filter(g => g.memberIds.includes('EU'));
  
  // Filtra oficiais que são contatos aceitos
  const acceptedOfficers = officers.filter(o => 
    contacts.some(c => c.officerId === o.id && c.status === 'Accepted')
  );
  
  // Data enrichment for GroupDetail
  const enrichedActiveGroup: EnrichedGroup | null = useMemo(() => {
    if (!activeGroup) return null;

    // Include current user ('EU') in the list of all potential participants
    const allParticipants: Officer[] = [...officers, { 
      id: 'EU', 
      name: userName, 
      rank: userRank, 
      unit: userCity, 
      photoUrl: userAvatar.url, 
      isOnline: true 
    }];
    
    // 1. Enrich Members
    const members: GroupParticipant[] = activeGroup.memberIds.map(memberId => {
      const officer = allParticipants.find(o => o.id === memberId);
      if (!officer) return null;
      
      const isAdmin = activeGroup.adminIds.includes(memberId);
      return {
        ...officer,
        isAdmin,
        role: isAdmin ? 'admin' : 'member',
      } as GroupParticipant;
    }).filter((m): m is GroupParticipant => m !== null);

    // 2. Enrich Posts
    const enrichedPosts: EnrichedGroupPost[] = activeGroup.posts.map(post => {
      const author = allParticipants.find(o => o.id === post.authorId);
      const suspect = suspects.find(s => s.id === post.suspectId);
      
      // Format timestamp for display (e.g., "DD/MM/YYYY HH:MM")
      const date = new Date(post.timestamp);
      const formattedTimestamp = `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      
      return {
        ...post,
        authorName: author?.name.split(' ')[0] || 'Oficial', // Use first name for brevity
        authorRank: author?.rank || 'Soldado',
        suspectName: suspect?.name || 'Indivíduo Desconhecido',
        suspectPhoto: suspect?.photoUrl || 'https://picsum.photos/seed/placeholder/100/100',
        timestamp: formattedTimestamp, // Use formatted timestamp
      };
    });

    return {
      ...activeGroup,
      members,
      posts: enrichedPosts,
    };
  }, [activeGroup, officers, suspects, userName, userRank, userCity, userAvatar.url]);

  const pendingRequestsCount = contacts.filter(c => c.status === 'Pending' && !c.isRequester).length;


  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-pmmg-khaki">
      {currentScreen === 'welcomeScreen' && <WelcomeScreen onEnter={() => navigateTo('dashboard')} onRequest={() => navigateTo('requestAccess')} />}
      
      {currentScreen === 'requestAccess' && <RequestAccess onBack={() => navigateTo('welcomeScreen')} onSuccess={() => { setIsRegistered(true); navigateTo('onboardingSetup'); }} />}
      
      {currentScreen === 'onboardingSetup' && isRegistered && (
        <OnboardingSetup 
          onComplete={handleOnboardingComplete} 
          currentInstitution={institution}
          onInstitutionChange={setInstitution}
        />
      )}
      
      {currentScreen === 'dashboard' && <Dashboard navigateTo={navigateTo} navigateToSuspectsManagement={navigateToSuspectsManagement} onOpenProfile={openProfile} suspects={suspects} />}
      {currentScreen === 'registry' && (
        <SuspectRegistry 
          navigateTo={navigateTo} 
          onSave={addSuspect} 
          onUpdate={updateSuspect}
          currentSuspect={suspectToEdit}
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
          onEdit={handleEditProfile}
        />
      )}
      {currentScreen === 'suspectsManagement' && (
        <SuspectsManagement
          navigateTo={navigateTo}
          onOpenProfile={openProfile}
          suspects={suspects}
          initialStatusFilter={initialSuspectFilter}
          deleteSuspects={deleteSuspects}
        />
      )}
      
      {/* Grupos List */}
      {currentScreen === 'groupsList' && (
        <GroupsList 
          navigateTo={navigateTo} 
          userGroups={userGroups}
          officers={officers} 
          allSuspects={suspects}
          openGroup={openGroup}
          pendingRequestsCount={pendingRequestsCount}
        />
      )}
      
      {/* Criação de Grupo */}
      {currentScreen === 'groupCreation' && (
        <GroupCreation
          navigateTo={navigateTo}
          allOfficers={officers}
          onCreateGroup={handleCreateGroup}
        />
      )}
      
      {/* Detalhe do Grupo */}
      {currentScreen === 'groupDetail' && enrichedActiveGroup && (
        <GroupDetail
          navigateTo={navigateTo}
          group={enrichedActiveGroup}
          allOfficers={officers}
          allSuspects={suspects}
          onOpenProfile={openProfile}
          onShareSuspect={handleShareSuspect}
          onUpdateGroup={handleUpdateGroup}
          onDeleteGroup={handleDeleteGroup}
        />
      )}
      
      {currentScreen === 'aiTools' && <AITools navigateTo={navigateTo} userRank={userRank} aiAvatar={aiAvatar} />}
      
      {currentScreen === 'plateConsultation' && (
        <PlateConsultation 
          navigateTo={navigateTo} 
          userRank={userRank} 
        />
      )}
      {currentScreen === 'voiceReport' && (
        <VoiceReport 
          navigateTo={navigateTo} 
          userRank={userRank} 
        />
      )}
      
      {currentScreen === 'store' && (
        <Store 
          navigateTo={navigateTo} 
        />
      )}
      
      {currentScreen === 'productList' && selectedCategoryId && (
        <ProductList
          navigateTo={navigateTo}
          categoryId={selectedCategoryId}
        />
      )}
      
      {currentScreen === 'profileSettings' && (
        <ProfileSettings 
          navigateTo={navigateTo} 
          onBack={() => navigateTo('dashboard')} 
          currentRank={userRank} 
          onRankChange={setUserRank}
          userAvatar={userAvatar}
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