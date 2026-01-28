import React, { useState, useRef } from 'react';
import { Screen, UserRank } from '../types';

interface PlateConsultationProps {
  navigateTo: (screen: Screen) => void;
  userRank: UserRank;
}

const PlateConsultation: React.FC<PlateConsultationProps> = ({ navigateTo, userRank }) => {
  const [plate, setPlate] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const rankLabel = userRank === 'Subtenente' ? 'Subtenente' : 
                   userRank.includes('Sargento') ? 'Sargento' : 
                   userRank;

  const handleSearch = () => {
    if (plate.trim()) {
      alert(`Consultando placa: ${plate.toUpperCase()}`);
      // Simulação de resultado
      setPlate('');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Foto da placa recebida: ${file.name}. Iniciando OCR e consulta...`);
      // Simulação de processamento
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button onClick={() => navigateTo('aiTools')} className="text-white active:scale-90 transition-transform">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div>
            <h1 className="font-bold text-sm leading-none text-white uppercase tracking-tight">Consultar Placa</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Leitura de Placa IA</p>
          </div>
        </div>
        <span className="material-symbols-outlined text-pmmg-yellow fill-icon">photo_camera</span>
      </header>

      <main className="flex-1 overflow-y-auto pb-4 no-scrollbar px-4 pt-6">
        
        {/* AI Avatar and Bubble */}
        <div className="flex flex-col items-center pt-4 px-6">
          <div className="relative w-40 h-40 mb-6">
            <div className="w-full h-full rounded-full overflow-hidden relative shadow-2xl">
               <img 
                alt="AI Mascot" 
                className="w-full h-full object-cover rounded-full" 
                src="https://regularmei.com.br/wp-content/uploads/2026/01/ai_mascot.gif" 
              />
            </div>
          </div>
          <div className="relative bg-white rounded-[1.5rem] p-4 px-6 shadow-lg mb-8 text-center border-2 border-pmmg-navy/5 after:content-[''] after:absolute after:top-0 after:left-1/2 after:w-0 after:h-0 after:border-[20px] after:border-transparent after:border-b-white after:mt-[-20px] after:ml-[-20px] after:border-t-0">
            <p className="text-pmmg-navy font-semibold text-sm">
              <span className="font-bold text-pmmg-red">{rankLabel}</span>, insira a placa manualmente ou utilize a câmera para leitura automática.
            </p>
          </div>
        </div>

        {/* Minimalist Input Section */}
        <section className="mt-4 space-y-6">
          
          {/* Consulta Manual */}
          <div className="flex gap-2 p-2 bg-white/70 rounded-xl shadow-md border border-pmmg-navy/10">
            <input 
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-3 bg-transparent border-none focus:ring-0 text-lg font-black uppercase tracking-widest placeholder-pmmg-navy/40" 
              placeholder="ABC1234" 
              type="text" 
              maxLength={8}
            />
            <button 
              onClick={handleSearch}
              disabled={plate.length < 7}
              className="bg-pmmg-navy text-white p-3 rounded-lg active:scale-95 transition-transform disabled:opacity-50 shrink-0"
            >
              <span className="material-symbols-outlined text-xl">search</span>
            </button>
          </div>
          
          <p className="text-[10px] font-bold text-pmmg-navy/60 uppercase tracking-wider text-center">OU</p>

          {/* Leitura por Imagem */}
          <div className="pmmg-card p-4 space-y-3">
            <h3 className="text-[11px] font-bold text-pmmg-navy/60 uppercase tracking-wider text-center">Leitura por Imagem (OCR)</h3>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload} 
              accept="image/*" 
              className="hidden" 
              capture="environment"
            />
            <button 
              onClick={triggerFileInput}
              className="w-full bg-pmmg-red text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-3 uppercase tracking-widest active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-lg">photo_camera</span>
              Abrir Câmera
            </button>
            <p className="text-[9px] text-slate-400 mt-2 italic text-center uppercase font-medium">
              A IA fará a leitura automática da placa na imagem.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PlateConsultation;