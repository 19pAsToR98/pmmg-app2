import React, { useState, useEffect } from 'react';

interface InstagramPost {
  id: number;
  imageUrl: string;
  caption: string;
  likes: number;
  link: string;
}

const MOCK_INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 1,
    imageUrl: 'https://picsum.photos/seed/pmmg_post1/300/300',
    caption: 'Operação conjunta na região central. 3 foragidos capturados.',
    likes: 1250,
    link: '#',
  },
  {
    id: 2,
    imageUrl: 'https://picsum.photos/seed/pmmg_post2/300/300',
    caption: 'Treinamento de tiro tático concluído com sucesso pela equipe GEPAR.',
    likes: 890,
    link: '#',
  },
  {
    id: 3,
    imageUrl: 'https://picsum.photos/seed/pmmg_post3/300/300',
    caption: 'Nova viatura blindada em serviço. Mais segurança para a tropa.',
    likes: 2100,
    link: '#',
  },
  {
    id: 4,
    imageUrl: 'https://picsum.photos/seed/pmmg_post4/300/300',
    caption: 'Ações de prevenção em comunidades. Polícia e comunidade unidas.',
    likes: 550,
    link: '#',
  },
];

const InstagramPostSlider: React.FC = () => {
  return (
    <div className="pmmg-card p-3 overflow-hidden shadow-xl">
      <h3 className="text-[10px] font-black text-pmmg-navy uppercase tracking-widest text-center mb-3 flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-pmmg-red text-lg fill-icon">campaign</span>
        Feed Tático (Instagram)
      </h3>
      
      <div className="flex overflow-x-auto space-x-4 pb-2 no-scrollbar">
        {MOCK_INSTAGRAM_POSTS.map(post => (
          <a 
            key={post.id}
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-40 shrink-0 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-pmmg-navy/10 dark:border-slate-700 active:scale-[0.98] transition-transform"
          >
            <div className="w-full aspect-square overflow-hidden rounded-t-xl bg-slate-200 dark:bg-slate-700 relative">
              <img 
                src={post.imageUrl} 
                alt={post.caption} 
                className="w-full h-full object-cover"
              />
              {/* Ícone do Instagram */}
              <div className="absolute top-2 right-2 bg-pink-600 p-1 rounded-full text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2zm-.2 2.2c-2.4 0-4.4 2-4.4 4.4v8.4c0 2.4 2 4.4 4.4 4.4h8.4c2.4 0 4.4-2 4.4-4.4V7.8c0-2.4-2-4.4-4.4-4.4H7.6z"/>
                  <path d="M12 7.8c-2.3 0-4.2 1.9-4.2 4.2s1.9 4.2 4.2 4.2 4.2-1.9 4.2-4.2-1.9-4.2-4.2-4.2zm0 6.8c-1.4 0-2.6-1.2-2.6-2.6s1.2-2.6 2.6-2.6 2.6 1.2 2.6 2.6-1.2 2.6-2.6 2.6z"/>
                  <circle cx="17.2" cy="6.8" r="1.2"/>
                </svg>
              </div>
            </div>
            <div className="p-2">
              <p className="text-[9px] text-pmmg-navy dark:text-slate-200 font-medium line-clamp-2 leading-tight">{post.caption}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="material-symbols-outlined text-pmmg-red text-[12px] fill-icon">favorite</span>
                <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">{post.likes.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default InstagramPostSlider;