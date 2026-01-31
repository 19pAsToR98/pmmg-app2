import { InstitutionId } from '../types';

export interface Institution {
  id: InstitutionId;
  name: string;
  logoPath: string;
  colorScheme: {
    primary: string; // Header/Navy
    background: string; // Khaki/Body
    accent: string; // Yellow/Gold
    critical: string; // Red
    gold: string; // Specific gold color
    blue: string; // Specific blue color
  };
}

export const INSTITUTIONS: Institution[] = [
  {
    id: 'PMMG',
    name: 'Polícia Militar de Minas Gerais',
    logoPath: 'brasoes/pmmg.png',
    colorScheme: {
      primary: '#002147', // pmmg-navy
      background: '#c5b39a', // pmmg-khaki
      accent: '#ffcc00', // pmmg-yellow
      critical: '#e31c1c', // pmmg-red
      gold: '#d4af37', // pmmg-gold
      blue: '#0047ab', // pmmg-blue
    },
  },
  {
    id: 'PMESP',
    name: 'Polícia Militar do Estado de São Paulo',
    logoPath: 'brasoes/pmesp.png',
    colorScheme: {
      primary: '#050505', // Dark Navy/Black
      background: '#FF0E18', // Requested "Khaki/Beige" (but is red)
      accent: '#ffcc00', // Yellow/Gold (Keeping PMMG yellow as accent)
      critical: '#e31c1c', // Red (Keeping PMMG red as critical)
      gold: '#ffcc00', // Using accent color for gold equivalent
      blue: '#0047ab', // Keeping PMMG blue for compatibility
    },
  },
];

export const DEFAULT_INSTITUTION = INSTITUTIONS[0];

export const getInstitutionById = (id: InstitutionId) => INSTITUTIONS.find(i => i.id === id) || DEFAULT_INSTITUTION;