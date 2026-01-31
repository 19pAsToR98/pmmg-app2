import { InstitutionId } from '../types';
import { INSTITUTIONS } from './institutionData';

type ColorRole = 'navy' | 'khaki' | 'yellow' | 'red' | 'gold' | 'blue';

/**
 * Retorna a classe Tailwind CSS correta para uma cor base,
 * dependendo da instituição selecionada.
 */
export const getColorClass = (
  role: ColorRole, 
  institutionId: InstitutionId
): string => {
  const institution = INSTITUTIONS.find(i => i.id === institutionId);
  
  if (!institution) {
    // Fallback para PMMG se a instituição não for encontrada
    institutionId = 'PMMG';
  }
  
  // Cores que mudam (Navy e Khaki)
  if (role === 'navy') {
    return institutionId === 'PMESP' ? 'bg-pmesp-navy' : 'bg-pmmg-navy';
  }
  if (role === 'khaki') {
    return institutionId === 'PMESP' ? 'bg-pmesp-khaki' : 'bg-pmmg-khaki';
  }
  
  // Cores que são constantes ou específicas da PMMG
  if (role === 'yellow') return 'bg-pmmg-yellow';
  if (role === 'red') return 'bg-pmmg-red';
  if (role === 'gold') return 'bg-pmmg-gold';
  if (role === 'blue') return 'bg-pmmg-blue';
  
  return '';
};

/**
 * Retorna a classe Tailwind CSS correta para a cor de texto de uma cor base.
 */
export const getTextColorClass = (
  role: ColorRole, 
  institutionId: InstitutionId
): string => {
  const institution = INSTITUTIONS.find(i => i.id === institutionId);
  
  if (!institution) {
    institutionId = 'PMMG';
  }
  
  if (role === 'navy') {
    return institutionId === 'PMESP' ? 'text-pmesp-navy' : 'text-pmmg-navy';
  }
  if (role === 'khaki') {
    return institutionId === 'PMESP' ? 'text-pmesp-khaki' : 'text-pmmg-khaki';
  }
  
  if (role === 'yellow') return 'text-pmmg-yellow';
  if (role === 'red') return 'text-pmmg-red';
  if (role === 'gold') return 'text-pmmg-gold';
  if (role === 'blue') return 'text-pmmg-blue';
  
  return '';
};