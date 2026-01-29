import React from 'react';
import { Screen } from '../types';
import BottomNav from '../components/BottomNav';

interface StoreProps {
  navigateTo: (screen: Screen) => void;
}

const Store: React.FC<StoreProps> = ({ navigateTo }) => {
  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 bg-pmmg-yellow rounded-full flex items-center justify-center p-1 border-2 border-white/20">
            <span className="material-symbols-outlined text-pmmg-navy text-2xl fill-icon">store</span>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none text-white uppercase tracking-tight">Loja Tática</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Em Desenvolvimento</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar flex items-center justify-center text-center p-8">
        <div className="opacity-40">
          <span className="material-symbols-outlined text-7xl text-pmmg-navy mb-4">construction</span>
          <h2 className="text-xl font-black uppercase tracking-widest text-pmmg-navy/70">Em Construção</h2>
          <p className="text-sm text-slate-600 mt-2">A Loja Tática estará disponível em breve com itens exclusivos para a tropa.</p>
        </div>
      </main>

      <BottomNav activeScreen="store" navigateTo={navigateTo} />
    </div>
  );
};

export default Store;