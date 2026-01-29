export interface VehicleBrand {
  name: string;
  svg: string; // SVG Data URI for the logo
}

// Simplified SVG paths for common brands (using 24x24 viewBox)
const BRAND_SVGS: Record<string, string> = {
  // Fiat (Simple F in a circle)
  'fiat': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="12" fill="#002147"/><path d="M10 17V7h4v10h-4z" fill="#ffcc00"/></svg>`,
  // Volkswagen (VW)
  'vw': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11" stroke="#002147" stroke-width="2"/><path d="M8 16L12 8L16 16H8Z" fill="#002147"/><path d="M12 12V16" stroke="#ffcc00" stroke-width="2" stroke-linecap="round"/></svg>`,
  // Chevrolet (Bowtie)
  'chevrolet': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="8" width="18" height="8" fill="#002147" transform="skewX(20)"/><path d="M5 12L19 12" stroke="#ffcc00" stroke-width="2" stroke-linecap="round"/></svg>`,
  // Ford (Oval)
  'ford': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="12" rx="10" ry="6" fill="#0047ab"/><text x="12" y="14" font-size="8" font-weight="bold" fill="white" text-anchor="middle">FORD</text></ellipse></svg>`,
  // Honda (H)
  'honda': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="4" fill="#e31c1c"/><path d="M8 16V8h2v8h-2zm6 0V8h2v8h-2z" fill="white"/></svg>`,
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