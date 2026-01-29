export interface VehicleBrand {
  name: string;
  svg: string; // SVG Data URI for the logo
}

// Simplified SVG paths for common brands (using 24x24 viewBox)
const BRAND_SVGS: Record<string, string> = {
  // Fiat (Red shield with white text)
  'fiat': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 6V18L12 22L22 18V6L12 2Z" fill="#E31C1C"/><text x="12" y="15" font-size="8" font-weight="bold" fill="white" text-anchor="middle">FIAT</text></svg>`,
  // Volkswagen (Blue circle with white VW)
  'vw': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11" fill="#0047ab"/><path d="M12 16L10 12L12 8L14 12L12 16Z" fill="white"/><path d="M10 16L8 12L10 8M14 16L16 12L14 8" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  // Chevrolet (Yellow/Gold Bowtie)
  'chevrolet': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8L21 8L18 16L6 16L3 8Z" fill="#FFCC00"/><path d="M12 8V16" stroke="#002147" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  // Ford (Blue oval with white script)
  'ford': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="12" rx="10" ry="6" fill="#0047ab"/><text x="12" y="14" font-family="cursive" font-size="8" font-weight="bold" fill="white" text-anchor="middle">Ford</text></ellipse></svg>`,
  // Honda (Stylized H)
  'honda': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="4" fill="white"/><path d="M8 16V8h2v8h-2zm6 0V8h2v8h-2zM10 12H14" stroke="#E31C1C" stroke-width="2"/></svg>`,
  // Default (Car icon)
  'default': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11" stroke="#002147" stroke-width="2"/><path d="M17 15H7c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2z" fill="#ffcc00"/></svg>`,
};

const BRAND_KEYWORDS: Record<string, string> = {
  'fiat': 'fiat',
  'uno': 'fiat',
  'palio': 'fiat',
  'argo': 'fiat',
  'volkswagen': 'vw',
  'vw': 'vw',
  'gol': 'vw',
  'voyage': 'vw',
  'fox': 'vw',
  'chevrolet': 'chevrolet',
  'gm': 'chevrolet',
  'corsa': 'chevrolet',
  'onix': 'chevrolet',
  'prisma': 'chevrolet',
  'ford': 'ford',
  'ka': 'ford',
  'fiesta': 'ford',
  'honda': 'honda',
  'civic': 'honda',
  'fit': 'honda',
};

const COLOR_MAP: Record<string, string> = {
  'preto': 'bg-black',
  'branco': 'bg-white border border-slate-300', // Adiciona borda para visibilidade
  'prata': 'bg-gray-400',
  'cinza': 'bg-gray-600',
  'vermelho': 'bg-pmmg-red',
  'azul': 'bg-pmmg-blue',
  'verde': 'bg-green-600',
  'amarelo': 'bg-pmmg-yellow',
  'marrom': 'bg-amber-800',
};

export const getBrandData = (model: string): { name: string, svgUrl: string } => {
  const lowerModel = model.toLowerCase();
  let brandKey = 'default';

  for (const keyword in BRAND_KEYWORDS) {
    if (lowerModel.includes(keyword)) {
      brandKey = BRAND_KEYWORDS[keyword];
      break;
    }
  }

  const svg = BRAND_SVGS[brandKey] || BRAND_SVGS['default'];
  const svgUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);

  return {
    name: brandKey.toUpperCase(),
    svgUrl: svgUrl,
  };
};

export const getColorClass = (colorName: string): string => {
  const lowerColor = colorName.toLowerCase().trim();
  return COLOR_MAP[lowerColor] || 'bg-slate-300'; // Padrão: cinza claro
};