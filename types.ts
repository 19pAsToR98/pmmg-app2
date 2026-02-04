export type Screen = 'welcomeScreen' | 'dashboard' | 'registry' | 'profile' | 'groupsList' | 'aiTools' | 'requestAccess' | 'store' | 'map' | 'contacts' | 'groupCreation' | 'groupDetail' | 'onboardingSetup' | 'suspectsManagement' | 'plateConsultation' | 'voiceReport' | 'productList' | 'groupMap';

export type UserRank = 'Soldado' | 'Cabo' | '3º Sargento' | '2º Sargento' | '1º Sargento' | 'Subtenente';

export type Institution = 'PMMG' | 'PMESP';

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

export interface GroupPost {
  id: string;
  suspectId: string; // ID da ficha compartilhada
  authorId: string; // ID do oficial que compartilhou
  observation: string; // Observação do autor
  timestamp: string; // Data e hora do post (ISO string or formatted string)
}

export interface Group {
  id: string;
  name: string;
  description: string;
  adminIds: string[];
  memberIds: string[]; // Includes admins
  pendingInviteIds: string[]; // Officers invited but not yet joined
  posts: GroupPost[];
  groupPhotoUrl?: string;
  inviteCode: string; // ADDED
  customMarkers: CustomMarker[]; // NEW
}

export interface GroupParticipant extends Officer {
  isAdmin: boolean;
  role: 'admin' | 'member'; // ADDED role for easier rendering in GroupDetail
}