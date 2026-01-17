export type Screen = 'onboarding' | 'dashboard' | 'registry' | 'profile' | 'chatList' | 'chatRoom' | 'aiTools' | 'requestAccess' | 'profileSettings' | 'map';

export type UserRank = 'Soldado' | 'Cabo' | '3º Sargento' | '2º Sargento' | '1º Sargento' | 'Subtenente';

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