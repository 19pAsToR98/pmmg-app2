import { Institution, InstitutionId } from '../types';

export const INSTITUTIONS: Institution[] = [
  {
    id: 'PMMG',
    name: 'Polícia Militar de Minas Gerais',
    logoPath: '/brasoes/pmmg.png',
    colors: {
      navy: 'bg-pmmg-navy',
      khaki: 'bg-pmmg-khaki',
      yellow: 'text-pmmg-yellow',
      red: 'text-pmmg-red',
    },
  },
  {
    id: 'PMESP',
    name: 'Polícia Militar do Estado de São Paulo',
    logoPath: '/brasoes/pmesp.png',
    colors: {
      navy: 'bg-pmesp-navy', // #050505
      khaki: 'bg-pmesp-khaki', // #FF0E18 (Background color requested by user)
      yellow: 'text-pmmg-yellow',
      red: 'text-pmmg-red',
    },
  },
];

export const findInstitutionById = (id: InstitutionId) => INSTITUTIONS.find(i => i.id === id);