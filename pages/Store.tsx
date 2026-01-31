import React, { useState } from 'react';
import { Screen } from '../types';
import BottomNav from '../components/BottomNav';

interface StoreProps {
  navigateTo: (screen: Screen) => void;
}

interface Product {
  name: string;
  price: string;
  imageUrl: string;
  link: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  products: Product[];
}

const CATEGORIES: Category[] = [
  {
    id: 'fardamento',
    name: 'Fardamento e Vestuário',
    icon: 'apparel',
    products: [
      { name: 'Fardamento Tático Completo', price: 'R$ 450,00', imageUrl: 'https://picsum.photos/seed/farda/150/150', link: 'https://www.exemplo.com/fardamento' },
      { name: 'Botas Táticas Impermeáveis', price: 'R$ 280,00', imageUrl: 'https://picsum.photos/seed/bota/150/150', link: 'https://www.exemplo.com/botas' },
      { name: 'Luvas Táticas', price: 'R$ 85,00', imageUrl: 'https://picsum.photos/seed/luva/150/150', link: 'https://www.exemplo.com/luvas' },
    ],
  },
  {
    id: 'protecao',
    name: 'Proteção e Balística',
    icon: 'shield',
    products: [
      { name: 'Colete Balístico Nível III-A', price: 'R$ 3.500,00', imageUrl: 'https://picsum.photos/seed/colete/150/150', link: 'https://www.exemplo.com/colete' },
      { name: 'Capacete Tático', price: 'R$ 1.200,00', imageUrl: 'https://picsum.photos/seed/capacete/150/150', link: 'https://www.exemplo.com/capacete' },
    ],
  },
  {
    id: 'acessorios',
    name: 'Acessórios e Iluminação',
    icon: 'flashlight_on',
    products: [
      { name: 'Lanterna Tática de Alta Potência', price: 'R$ 150,00', imageUrl: 'https://picsum.photos/seed/lanterna/150/150', link: 'https://www.exemplo.com/lanterna' },
      { name: 'Mochila de Assalto 30L', price: 'R$ 199,90', imageUrl: 'https://picsum.photos/seed/mochila/150/150', link: 'https://www.exemplo.com/mochila' },
      { name: 'Coldre Velado', price: 'R$ 90,00', imageUrl: 'https://picsum.photos/seed/coldre/150/150', link: 'https://www.exemplo.com/coldre' },
    ],
  },
  {
    id: 'comunicacao',
    name: 'Comunicação e GPS',
    icon: 'satellite_alt',
    products: [
      { name: 'Rádio HT Digital', price: 'R$ 800,00', imageUrl: 'https://picsum.photos/seed/radio/150/150', link: 'https://www.exemplo.com/radio' },
      { name: 'GPS Tático Militar', price: 'R$ 1.500,00', imageUrl: 'https://picsum.photos/seed/gps/150/150', link: 'https://www.exemplo.com/gps' },
    ],
  },
];

const Store: React.FC<StoreProps> = ({ navigateTo }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(prev => (prev === categoryId ? null : categoryId));
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center p-1 border-2 border-pmmg-yellow shadow-inner">
            <span className="material-symbols-outlined text-pmmg-navy text-2xl">storefront</span>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none text-white uppercase tracking-tight">Materiais Táticos</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Equipamentos e Suprimentos</p>
          </div>
        </div>
        <button 
          onClick={() => alert('Abrindo carrinho de compras...')}
          className="bg-white/10 p-1.5 rounded-full border border-white/20 text-white"
        >
          <span className="material-symbols-outlined text-xl">shopping_cart</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar px-4 pt-6">
        <p className="text-[10px] font-bold uppercase text-pmmg-navy/70 mb-4 text-center tracking-wider">
          Links para fornecedores parceiros e materiais recomendados.
        </p>

        <div className="space-y-4">
          {CATEGORIES.map((category) => (
            <div key={category.id} className="pmmg-card overflow-hidden">
              {/* Category Header (Clickable) */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center p-3 gap-3 border-l-4 border-pmmg-navy/50 active:bg-slate-50 transition-colors"
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-xl shrink-0 bg-pmmg-navy text-pmmg-yellow">
                  <span className="material-symbols-outlined text-3xl fill-icon">
                    {category.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-bold text-sm truncate uppercase tracking-tight text-pmmg-navy">{category.name}</h3>
                  <p className="text-xs text-slate-600 truncate leading-tight mt-0.5">
                    {category.products.length} itens disponíveis
                  </p>
                </div>
                <span className="material-symbols-outlined text-pmmg-navy/40 text-lg shrink-0 transition-transform duration-300"
                      style={{ transform: expandedCategory === category.id ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                  chevron_right
                </span>
              </button>

              {/* Product Grid (Collapsible Content) */}
              {expandedCategory === category.id && (
                <div className="p-4 border-t border-pmmg-navy/10 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    {category.products.map((product, index) => (
                      <a 
                        key={index}
                        href={product.link}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col p-2 bg-white rounded-xl shadow-md border border-pmmg-navy/10 active:scale-[0.98] transition-transform"
                      >
                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100 mb-2">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="text-[10px] font-black text-pmmg-navy uppercase leading-tight line-clamp-2">{product.name}</h4>
                        <p className="text-sm font-bold text-pmmg-red mt-1">{product.price}</p>
                        <span className="text-[8px] font-bold text-slate-500 uppercase mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                          Ver Detalhes
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center opacity-50">
          <span className="material-symbols-outlined text-4xl text-pmmg-navy/20">info</span>
          <p className="text-[9px] font-bold uppercase tracking-widest text-pmmg-navy/40 mt-2">
            Os links são externos e a PMMG não se responsabiliza pelas compras.
          </p>
        </div>
      </main>

      <BottomNav activeScreen="store" navigateTo={navigateTo} />
    </div>
  );
};

export default Store;