export interface VehicleBrand {
  name: string;
  svg: string; // SVG Data URI for the logo
}

// SVGs simplificados baseados nos logos oficiais (viewBox 24x24)
const BRAND_SVGS: Record<string, string> = {
  // FIAT: Escudo vermelho com "FIAT" em branco (versão 2020)
  'fiat': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L3 7.5V16.5L12 21L21 16.5V7.5L12 3Z" fill="#D40000"/>
    <text x="12" y="15.5" font-family="Arial,Helvetica,sans-serif" font-size="6.5" font-weight="700" fill="white" text-anchor="middle" letter-spacing="-0.3">FIAT</text>
  </svg>`,

  // VOLKSWAGEN: Círculo com "VW" estilizado (versão 2019 minimalista)
  'vw': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10.5" fill="#003D66"/>
    <path d="M12 16.5L9.5 12L12 7.5L14.5 12L12 16.5Z" fill="white"/>
    <path d="M9.5 16.5L7 12L9.5 7.5M14.5 16.5L17 12L14.5 7.5" stroke="white" stroke-width="1.3" stroke-linecap="round" fill="none"/>
  </svg>`,

  // CHEVROLET: Gravata/bowtie dourada (versão 2D atual 2023)
  'chevrolet': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 10L12 4L20 10L16 14L12 18L8 14L4 10Z" fill="#F0B31B"/>
    <path d="M12 4V18" stroke="#000000" stroke-width="1.2" stroke-linecap="square"/>
  </svg>`,

  // FORD: Oval azul com script "FORD" (versão blue oval clássica) - CORRIGIDO
  'ford': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="12" rx="10" ry="7" fill="#002B5F"/>
    <text x="12" y="14.5" font-family="Brush Script MT, cursive" font-size="8" font-weight="bold" fill="white" text-anchor="middle" letter-spacing="0.5">FORD</text>
  </svg>`,

  // HONDA: "H" vermelho sobre fundo branco com borda preta (versão clássica)
  'honda': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" fill="white" stroke="#000000" stroke-width="1"/>
    <path d="M9 8V16M15 8V16M9 12H15" stroke="#E31C1C" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  // DEFAULT: Ícone de carro neutro
  'default': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10.5" fill="none" stroke="#333" stroke-width="1.5"/>
    <path d="M7 15h10c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2z" fill="#555"/>
    <circle cx="8" cy="16" r="1.5" fill="#333"/>
    <circle cx="16" cy="16" r="1.5" fill="#333"/>
  </svg>`,
};

const BRAND_KEYWORDS: Record<string, string> = {
  'fiat': 'fiat',
  'uno': 'fiat',
  'palio': 'fiat',
  'argo': 'fiat',
  'mobi': 'fiat',
  'strada': 'fiat',
  'volkswagen': 'vw',
  'vw': 'vw',
  'gol': 'vw',
  'voyage': 'vw',
  'fox': 'vw',
  'polo': 'vw',
  't-cross': 'vw',
  'chevrolet': 'chevrolet',
  'gm': 'chevrolet',
  'corsa': 'chevrolet',
  'onix': 'chevrolet',
  'prisma': 'chevrolet',
  'cruze': 'chevrolet',
  'tracker': 'chevrolet',
  'ford': 'ford',
  'ka': 'ford',
  'fiesta': 'ford',
  'focus': 'ford',
  'ranger': 'ford',
  'ecosport': 'ford',
  'honda': 'honda',
  'civic': 'honda',
  'fit': 'honda',
  'hr-v': 'honda',
  'city': 'honda',
};

const COLOR_MAP: Record<string, string> = {
  'preto': 'bg-black',
  'branco': 'bg-white border border-slate-300',
  'prata': 'bg-gray-400',
  'cinza': 'bg-gray-600',
  'vermelho': 'bg-red-600',
  'azul': 'bg-blue-600',
  'verde': 'bg-green-600',
  'amarelo': 'bg-yellow-400',
  'marrom': 'bg-amber-800',
};

export const getBrandData = (model: string): { name: string, svgUrl: string } => {
  const lowerModel = model.toLowerCase().trim();
  let brandKey = 'default';

  // Ordena keywords por comprimento descendente para evitar falsos positivos
  const sortedKeywords = Object.entries(BRAND_KEYWORDS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [keyword, brand] of sortedKeywords) {
    if (lowerModel.includes(keyword)) {
      brandKey = brand;
      break;
    }
  }

  const svg = BRAND_SVGS[brandKey] || BRAND_SVGS['default'];
  const svgUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);

  // Nomes amigáveis para exibição
  const brandNames: Record<string, string> = {
    'fiat': 'Fiat',
    'vw': 'Volkswagen',
    'chevrolet': 'Chevrolet',
    'ford': 'Ford',
    'honda': 'Honda',
    'default': 'Outra marca',
  };

  return {
    name: brandNames[brandKey] || brandKey.toUpperCase(),
    svgUrl: svgUrl,
  };
};

export const getColorClass = (colorName: string): string => {
  const lowerColor = colorName.toLowerCase().trim();
  return COLOR_MAP[lowerColor] || 'bg-slate-300';
};