export type Screen = 'welcomeScreen' | 'dashboard' | 'registry' | 'profile' | 'chatList' | 'chatRoom' | 'aiTools' | 'requestAccess' | 'profileSettings' | 'map' | 'contacts' | 'groupManagement' | 'onboardingSetup' | 'suspectsManagement' | 'plateConsultation' | 'voiceReport';

export type UserRank = 'Soldado' | 'Cabo' | '3º Sargento' | '2º Sargento' | '1º Sargento' | 'Subtenente';

export interface UserAvatar {
  name: string;
  url: string;
}

export interface Vehicle {
  plate: string;
  model: string;
  color: string;
}

export interface Association {
  suspectId: string;
  relationship: string; // e.g., 'Cúmplice', 'Familiar', 'Contato'
}

export interface CustomMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  icon: string; // Material Symbols icon name
  color: string; // Tailwind color class (e.g., 'bg-pmmg-gold')
}

export interface Suspect {
  id: string;
  name: string;
  nickname?: string;
  cpf: string;
  rg?: string; // NOVO: Registro Geral
  status: 'Foragido' | 'Suspeito' | 'Preso' | 'CPF Cancelado';
  lastSeen: string;
  timeAgo: string;
  photoUrl: string; // Primary photo
  photoUrls?: string[]; // Multiple photos
  birthDate?: string;
  motherName?: string;
  articles?: string[];
  description?: string;
  lat?: number;
  lng?: number;
  approachAddress?: string; // NOVO: Endereço da abordagem
  approachLat?: number; // NOVO: Latitude da abordagem
  approachLng?: number; // NOVO: Longitude da abordagem
  vehicles?: Vehicle[];
  associations?: Association[];
  showOnMap?: boolean; // NEW: Controla se o marcador deve ser exibido no mapa tático
}

export interface ChatMessage {
  id: string;
  sender: string;
  initials: string;
  text: string;
  time: string;
  isMe: boolean;
  type: 'text' | 'alert' | 'image';
  alertData?: {
    title: string;
    description: string;
    image: string;
  };
}

export type ContactStatus = 'Pending' | 'Accepted' | 'Blocked';

export interface Contact {
  officerId: string;
  status: ContactStatus;
  isRequester: boolean; // True if the current user sent the request
}

export interface Officer {
  id: string;
  name: string;
  rank: UserRank;
  unit: string;
  photoUrl: string;
  isOnline: boolean;
}

export interface GroupParticipant extends Officer {
  isAdmin: boolean;
}

export interface Chat {
  id: string;
  type: 'group' | 'individual';
  name: string;
  participants: string[]; // Officer IDs
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  icon: string;
  active: boolean;
  messages: ChatMessage[];
  // Propriedades adicionais para grupos
  description?: string;
  groupPhotoUrl?: string;
  admins?: string[]; // IDs dos administradores
}