import React from 'react';
import { Screen } from '../types';
import BottomNav from '../components/BottomNav';

interface StoreProps {
  navigateTo: (screen: Screen) => void;
}

// Novo Mock Data para Categorias e Produtos
const TACTICAL_CATEGORIES = [
  {
    id: 'fardamento',
    name: 'Fardamento e Vestuário',
    icon: 'apparel',
    products: [
      { id: 'p1', title: 'Fardamento Tático Completo', price: 450.00, imageUrl: 'https://picsum.photos/seed/fardamento/300/400', link: '#' },
      { id: 'p2', title: 'Camiseta Dry-Fit PMMG', price: 89.90, imageUrl: 'https://picsum.photos/seed/camiseta/300/400', link: '#' },
      { id: 'p3', title: 'Botas Táticas Impermeáveis', price: 320.50, imageUrl: 'https://picsum.photos/seed/botas/300/400', link: '#' },
    ]
  },
  {
    id: 'protecao',
    name: 'Proteção e Segurança',
    icon: 'shield',
    products: [
      { id: 'p4', title: 'Colete Balístico Nível III-A', price: 3500.00, imageUrl: 'https://picsum.photos/seed/colete/300/400', link: '#' },
      { id: 'p5', title: 'Capacete Tático Balístico', price: 1800.00, imageUrl: 'https://picsum.photos/seed/capacete/300/400', link: '#' },
    ]
  },
  {
    id: 'acessorios',
    name: 'Acessórios e Equipamentos',
    icon: 'flashlight_on',
    products: [
      { id: 'p6', title: 'Lanterna Tática de Alta Potência', price: 150.00, imageUrl: 'https://picsum.photos/seed/lanterna/300/400', link: '#' },
      { id: 'p7', title: 'Mochila de Assalto 30L', price: 210.00, imageUrl: 'https://picsum.photos/seed/mochila/300/400', link: '#' },
      { id: 'p8', title: 'Coldre Velado Kydex', price: 95.00, imageUrl: 'https://picsum.photos/seed/coldre/300/400', link: '#' },
    ]
  }
];

const formatPrice = (price: number) => {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const Store: React.FC<StoreProps> = ({ navigateTo }) => {
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
        <p className="text-[10px] font-bold uppercase text-pmmg-navy/70 mb-6 text-center tracking-wider">
          Links para fornecedores parceiros e materiais recomendados.
        </p>

        <div className="space-y-8">
          {TACTICAL_CATEGORIES.map((category) => (
            <section key={category.id}>
              {/* Título da Categoria */}
              <div className="flex items-center gap-3 mb-4 px-1">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-pmmg-navy text-pmmg-yellow shrink-0">
                  <span className="material-symbols-outlined text-sm fill-icon">{category.icon}</span>
                </div>
                <h3 className="font-bold text-sm text-pmmg-navy uppercase tracking-widest">{category.name}</h3>
              </div>

              {/* Grid de Produtos */}
              <div className="grid grid-cols-2 gap-4">
                {category.products.map((product) => (
                  <a 
                    key={product.id}
                    href={product.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="pmmg-card overflow-hidden flex flex-col active:scale-[0.98] transition-transform shadow-lg"
                  >
                    {/* Imagem */}
                    <div className="w-full aspect-[3/4] relative bg-slate-200 shrink-0">
                      <img 
                        alt={product.title} 
                        className="w-full h-full object-cover" 
                        src={product.imageUrl} 
                      />
                    </div>
                    
                    {/* Detalhes */}
                    <div className="p-3 flex flex-col justify-between flex-1">
                      <h4 className="font-bold text-[10px] text-pmmg-navy uppercase leading-tight line-clamp-2 mb-1">{product.title}</h4>
                      <p className="text-sm font-black text-pmmg-red mt-1">{formatPrice(product.price)}</p>
                      <button className="w-full mt-2 bg-pmmg-navy text-white text-[8px] font-bold py-1.5 rounded-lg uppercase tracking-wide">
                        Ver Detalhes
                      </button>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 text-center opacity-50">
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