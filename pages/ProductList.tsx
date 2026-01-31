import React from 'react';
import { Screen } from '../types';
import BottomNav from '../components/BottomNav';
import { Category, findCategoryById } from '../utils/storeData';

interface ProductListProps {
  navigateTo: (screen: Screen) => void;
  categoryId: string;
}

const ProductList: React.FC<ProductListProps> = ({ navigateTo, categoryId }) => {
  const category = findCategoryById(categoryId);

  if (!category) {
    return (
      <div className="flex flex-col h-full bg-theme-khaki items-center justify-center p-8">
        <span className="material-symbols-outlined text-theme-red text-6xl mb-4">error</span>
        <h1 className="font-bold text-xl text-theme-navy uppercase">Categoria Não Encontrada</h1>
        <button onClick={() => navigateTo('store')} className="mt-6 bg-theme-navy text-white py-3 px-6 rounded-xl text-sm font-bold uppercase">
          Voltar para a Loja
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-theme-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-theme-navy px-4 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button onClick={() => navigateTo('store')} className="text-white active:scale-90 transition-transform">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div>
            <h1 className="font-bold text-sm leading-none text-white uppercase tracking-tight">{category.name}</h1>
            <p className="text-[10px] font-medium text-theme-yellow tracking-wider uppercase mt-1">Lista de Produtos</p>
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
        <p className="text-[10px] font-bold uppercase text-theme-navy/70 mb-6 text-center tracking-wider">
          {category.products.length} itens disponíveis em {category.name}.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {category.products.map((product, index) => (
            <a 
              key={index}
              href={product.link}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col p-3 bg-white rounded-xl shadow-md border border-theme-navy/10 active:scale-[0.98] transition-transform"
            >
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100 mb-3">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-[10px] font-black text-theme-navy uppercase leading-tight line-clamp-2">{product.name}</h4>
              <p className="text-sm font-bold text-theme-red mt-1">{product.price}</p>
              <span className="text-[8px] font-bold text-slate-500 uppercase mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                Ver Detalhes
              </span>
            </a>
          ))}
        </div>
      </main>

      <BottomNav activeScreen="store" navigateTo={navigateTo} />
    </div>
  );
};

export default ProductList;