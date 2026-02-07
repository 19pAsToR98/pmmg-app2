import React, { useState, useEffect } from 'react';

const AD_IMAGES = [
  { 
    url: 'https://http2.mlstatic.com/D_NQ_NP_2X_834237-MLB73666981891_122023-F-spray-de-pimenta-prossecure-05-un-110ml-mais-forte.webp',
    alt: 'Spray de Pimenta Tático',
    link: '#',
  },
  { 
    url: 'https://http2.mlstatic.com/D_NQ_NP_2X_767405-MLB92205097791_092025-F-coturno-militar-masculino-confortavel-em-couro-ziper.webp',
    alt: 'Coturno Militar em Couro',
    link: '#',
  },
  { 
    url: 'https://http2.mlstatic.com/D_NQ_NP_2X_905358-MLA99601650758_122025-F.webp',
    alt: 'Equipamento Tático',
    link: '#',
  },
];

const AdImageSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % AD_IMAGES.length);
    }, 5000); // Troca a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const currentAd = AD_IMAGES[currentIndex];

  return (
    <div className="pmmg-card p-3 overflow-hidden shadow-xl h-72 flex flex-col">
      <h3 className="text-[10px] font-black text-pmmg-red uppercase tracking-widest text-center mb-3">
        Parceiros Táticos
      </h3>
      <a 
        href={currentAd.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex-1 relative w-full rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shadow-lg transition-all duration-500 ease-in-out active:scale-[0.99]"
      >
        <img 
          src={currentAd.url} 
          alt={currentAd.alt} 
          className="w-full h-full object-contain transition-opacity duration-1000"
          // Adiciona key para forçar a re-renderização e o efeito de transição (simulado)
          key={currentIndex} 
        />
        
        {/* Overlay de CTA */}
        <div className="absolute inset-0 bg-black/20 flex items-end justify-center p-4 opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-pmmg-navy text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                Ver Oferta
            </div>
        </div>
      </a>
      
      {/* Indicadores de Posição */}
      <div className="flex justify-center gap-2 mt-3">
        {AD_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentIndex === index ? 'bg-pmmg-red w-4' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default AdImageSlider;