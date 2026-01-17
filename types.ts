
export type Screen = 'onboarding' | 'dashboard' | 'registry' | 'profile' | 'chatList' | 'chatRoom' | 'aiTools' | 'requestAccess' | 'profileSettings' | 'map';

export type UserRank = 'Soldado' | 'Cabo' | '3º Sargento' | '2º Sargento' | '1º Sargento' | 'Subtenente';

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
