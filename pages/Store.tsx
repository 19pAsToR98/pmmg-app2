import React from 'react';
import { Screen } from '../types';
import BottomNav from '../components/BottomNav';

interface StoreProps {
  navigateTo: (screen: Screen) => void;
}

const Store: React.FC<StoreProps> = ({ navigateTo }) => {
  const militarySupplies = [
    { name: 'Fardamento Tático Completo', description: 'Conjunto completo de fardamento padrão PMMG.', link: 'https://www.exemplo.com/fardamento', icon: 'apparel' },
    { name: 'Colete Balístico Nível III-A', description: 'Proteção balística de alta performance.', link: 'https://www.exemplo.com/colete', icon: 'shield' },
    { name: 'Lanterna Tática de Alta Potência', description: 'Iluminação robusta para operações noturnas.', link: 'https://www.exemplo.com/lanterna', icon: 'flashlight_on' },
    { name: 'Botas Táticas Impermeáveis', description: 'Conforto e durabilidade em qualquer terreno.', link: 'https://www.exemplo.com/botas', icon: 'hiking' },
    { name: 'Mochila de Assalto 30L', description: 'Compacta e resistente para missões rápidas.', link: 'https://www.exemplo.com/mochila', icon: 'backpack' },
    { name: 'Luvas Táticas Antiderrapantes', description: 'Aderência e proteção para manuseio de equipamentos.', link: 'https://www.exemplo.com/luvas', icon: 'gloves' },
  ];

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
          {militarySupplies.map((item, index) => (
            <a 
              key={index} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="pmmg-card flex items-center p-3 gap-3 border-l-4 border-pmmg-navy/50 active:scale-[0.98] transition-transform"
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-xl shrink-0 bg-pmmg-navy text-pmmg-yellow">
                <span className="material-symbols-outlined text-3xl fill-icon">
                  {item.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate uppercase tracking-tight text-pmmg-navy">{item.name}</h3>
                <p className="text-xs text-slate-600 truncate leading-tight mt-0.5">
                  {item.description}
                </p>
              </div>
              <span className="material-symbols-outlined text-pmmg-navy/40 text-lg shrink-0">arrow_forward_ios</span>
            </a>
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