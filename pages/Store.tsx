import React, { useState } from 'react';
import { Screen } from '../types';
import BottomNav from '../components/BottomNav';
import { CATEGORIES } from '../utils/storeData';

interface StoreProps {
  navigateTo: (screen: Screen, categoryId?: string) => void;
}

const Store: React.FC<StoreProps> = ({ navigateTo }) => {

  const handleCategoryClick = (categoryId: string) => {
    // Navega para a nova tela 'productList', passando o ID da categoria como parâmetro
    navigateTo('productList', categoryId);
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki dark:bg-slate-900 overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-4 flex items-center justify-between shadow-xl shrink-0">
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

      <main className="flex-1 overflow-y-auto lg:pb-4 no-scrollbar px-4 pt-6">
        <p className="text-[10px] font-bold uppercase text-pmmg-navy/70 dark:text-slate-400 mb-4 text-center tracking-wider">
          Links para fornecedores parceiros e materiais recomendados.
        </p>

        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 lg:max-w-5xl lg:mx-auto">
          {CATEGORIES.map((category) => (
            <div key={category.id} className="pmmg-card overflow-hidden">
              {/* Category Header (Clickable) */}
              <button
                onClick={() => handleCategoryClick(category.id)}
                className="w-full flex items-center p-3 gap-3 border-l-4 border-pmmg-navy/50 dark:border-pmmg-yellow/50 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-xl shrink-0 bg-pmmg-navy text-pmmg-yellow">
                  <span className="material-symbols-outlined text-3xl fill-icon">
                    {category.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-bold text-sm truncate uppercase tracking-tight text-pmmg-navy dark:text-slate-200">{category.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate leading-tight mt-0.5">
                    {category.products.length} itens disponíveis
                  </p>
                </div>
                <span className="material-symbols-outlined text-pmmg-navy/40 dark:text-slate-600 text-lg shrink-0 transition-transform duration-300">
                  chevron_right
                </span>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center opacity-50">
          <span className="material-symbols-outlined text-4xl text-pmmg-navy/20 dark:text-slate-700">info</span>
          <p className="text-[9px] font-bold uppercase tracking-widest text-pmmg-navy/40 dark:text-slate-600 mt-2">
            Os links são externos e a PMMG não se responsabiliza pelas compras.
          </p>
        </div>
      </main>

      {/* BottomNav is now handled by App.tsx and hidden on desktop */}
    </div>
  );
};

export default Store;