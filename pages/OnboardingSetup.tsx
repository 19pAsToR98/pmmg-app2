import React, { useState, useRef, useEffect } from 'react';
import { Screen, UserRank, UserAvatar } from '../types';
import RankBadge from '../components/RankBadge';
import GoogleMapWrapper from '../components/GoogleMapWrapper';
import { MarkerF } from '@react-google-maps/api';
import { ICON_PATHS } from '../utils/iconPaths';

interface OnboardingSetupProps {
  onComplete: (name: string, rank: UserRank, city: string, avatar: UserAvatar) => void;
}

const RANKS: UserRank[] = ['Soldado', 'Cabo', '3º Sargento', '2º Sargento', '1º Sargento', 'Subtenente'];

// Mock data for city search (since we cannot use external APIs)
const MOCK_CITIES = [
  { name: 'Belo Horizonte', lat: -19.9167, lng: -43.9345 },
  { name: 'Contagem', lat: -19.9300, lng: -44.0500 },
  { name: 'Uberlândia', lat: -18.9183, lng: -48.2750 },
  { name: 'Juiz de Fora', lat: -21.7639, lng: -43.3400 },
  { name: 'Montes Claros', lat: -16.7342, lng: -43.8611 },
];

// NEW: Avatar options (Masculino agora é o primeiro)
const AVATAR_OPTIONS: { gender: 'Masculino' | 'Feminino', avatar: UserAvatar }[] = [
  { gender: 'Masculino', avatar: { name: 'Cabo Loso', url: 'https://iili.io/fiLMgHX.gif' } },
  { gender: 'Feminino', avatar: { name: 'Sgt Bisonha', url: 'https://iili.io/fiLMrRn.gif' } },
];


const OnboardingSetup: React.FC<OnboardingSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [rank, setRank] = useState<UserRank>('Soldado'); // Padrão: Soldado
  const [city, setCity] = useState('');
  const [citySearchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number, name: string } | null>(MOCK_CITIES[0]); // Default to BH
  const [citySuggestions, setCitySuggestions] = useState<typeof MOCK_CITIES>([]);
  
  // NEW State for Avatar selection index
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);
  const selectedAvatar = AVATAR_OPTIONS[selectedAvatarIndex].avatar;

  // --- Map/City Logic ---
  
  // Efeito para garantir que a cidade inicial seja definida
  useEffect(() => {
    if (!city && selectedLocation) {
        setCity(selectedLocation.name);
    }
  }, [city, selectedLocation]);


  const handleCitySearchChange = (term: string) => {
    setCitySearchTerm(term);
    if (term.length > 1) {
      const filtered = MOCK_CITIES.filter(c => 
        c.name.toLowerCase().includes(term.toLowerCase())
      );
      setCitySuggestions(filtered);
    } else {
      setCitySuggestions([]);
    }
  };

  const handleSelectCity = (location: { lat: number, lng: number, name: string }) => {
    setSelectedLocation(location);
    setCity(location.name);
    setCitySearchTerm('');
    setCitySuggestions([]);
  };

  // --- Navigation Logic ---

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      alert("Por favor, insira seu nome completo.");
      return;
    }
    if (step === 3 && !city.trim()) {
      alert("Por favor, selecione sua cidade padrão.");
      return;
    }
    
    if (step < 4) { 
      setStep(step + 1);
    } else {
      // Final Step
      onComplete(name.trim(), rank, city.trim(), selectedAvatar); 
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleAvatarChange = (direction: 'next' | 'prev') => {
    setSelectedAvatarIndex(prev => {
      if (direction === 'next') {
        return (prev + 1) % AVATAR_OPTIONS.length;
      } else {
        return (prev - 1 + AVATAR_OPTIONS.length) % AVATAR_OPTIONS.length;
      }
    });
  };

  const getCityMarkerIcon = () => {
    if (typeof window === 'undefined' || !window.google || !window.google.maps) return undefined; // Safety check

    const pathData = ICON_PATHS['location_on'];
    
    // Aplicando REGRA DE OURO 2: translate(6 6) scale(0.75)
    const svg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#002147" stroke="#ffcc00" stroke-width="2"/>
        <path d="${pathData}" fill="#ffcc00" transform="translate(6 6) scale(0.75)"/>
      </svg>
    `;
    
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 16),
    };
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-pmmg-navy uppercase tracking-tight">Identificação Pessoal</h2>
            <p className="text-sm text-slate-600">Insira seu nome completo para identificação no sistema.</p>
            <div>
              <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1 ml-1 tracking-wider">Nome Completo</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-3 bg-white/80 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
                placeholder="Ex: Rodrigo Alves da Silva" 
                type="text" 
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-pmmg-navy uppercase tracking-tight">Graduação Militar</h2>
            <p className="text-sm text-slate-600">Selecione sua graduação atual. Isso define sua hierarquia tática.</p>
            
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar justify-center">
              {RANKS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRank(r)}
                  className={`flex flex-col items-center gap-2 shrink-0 transition-all p-2 rounded-xl border-2 ${
                    rank === r 
                      ? 'bg-pmmg-navy border-pmmg-yellow shadow-lg scale-105' 
                      : 'bg-white border-transparent grayscale opacity-60'
                  }`}
                >
                  <RankBadge rank={r} size="md" />
                  <span className={`text-[9px] font-black uppercase ${rank === r ? 'text-pmmg-yellow' : 'text-pmmg-navy'}`}>
                    {r}
                  </span>
                </button>
              ))}
            </div>
            <div className="text-center">
              <p className="text-pmmg-navy font-bold uppercase text-sm">Graduação Selecionada:</p>
              <p className="text-pmmg-red font-black text-lg mt-1">{rank}</p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-pmmg-navy uppercase tracking-tight">Cidade Padrão</h2>
            <p className="text-sm text-slate-600">Defina sua cidade de atuação principal para otimizar alertas e mapas.</p>
            
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1 ml-1 tracking-wider">Buscar Cidade em MG</label>
              <input 
                value={citySearchTerm}
                onChange={(e) => handleCitySearchChange(e.target.value)}
                className="block w-full px-4 py-3 bg-white/80 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
                placeholder="Ex: Belo Horizonte" 
                type="text" 
              />
              
              {citySearchTerm.length > 0 && citySuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-pmmg-navy/20 rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
                  {citySuggestions.map((loc, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectCity(loc)}
                      className="w-full text-left px-4 py-2 text-sm text-pmmg-navy hover:bg-pmmg-khaki/50 transition-colors border-b border-pmmg-navy/5 last:border-b-0"
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              )}
              {citySearchTerm.length > 0 && citySuggestions.length === 0 && (
                <p className="text-[10px] text-pmmg-navy/50 mt-2 text-center">Nenhuma cidade encontrada.</p>
              )}
            </div>
            
            {/* Exibe o mapa se uma cidade foi selecionada ou se estamos no passo 3 (usando fallback) */}
            {selectedLocation && (
              <div className="pmmg-card overflow-hidden">
                <div className="p-3 bg-pmmg-navy/5 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-pmmg-navy uppercase tracking-wider">Cidade Selecionada: {city || 'Carregando...'}</p>
                  <span className="text-[9px] text-green-600 font-bold uppercase">GPS OK</span>
                </div>
                {/* Google Map Wrapper */}
                <GoogleMapWrapper
                  center={selectedLocation}
                  zoom={12}
                  mapContainerClassName="h-48 w-full z-0"
                  options={{
                    disableDefaultUI: true,
                    draggable: false,
                    scrollwheel: false,
                    zoomControl: false,
                    mapTypeId: 'roadmap'
                  }}
                >
                  <MarkerF
                    position={selectedLocation}
                    icon={getCityMarkerIcon()}
                  />
                </GoogleMapWrapper>
              </div>
            )}
          </div>
        );
      case 4: // NEW STEP: Avatar Selection (Slider)
        const currentOption = AVATAR_OPTIONS[selectedAvatarIndex];
        
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-pmmg-navy uppercase tracking-tight">Avatar Tático</h2>
            <p className="text-sm text-slate-600">Selecione o avatar que representará você e o assistente de IA na plataforma.</p>
            
            {/* Container do Slider: Fundo limpo, apenas setas e avatar */}
            <div className="relative flex items-center justify-center pt-8 pb-4">
              
              {/* Previous Button */}
              <button
                onClick={() => handleAvatarChange('prev')}
                className="absolute left-0 z-10 p-2 rounded-full bg-pmmg-navy/10 text-pmmg-navy shadow-md active:scale-95 transition-transform ml-2"
              >
                <span className="material-symbols-outlined">arrow_back_ios</span>
              </button>

              {/* Avatar Display */}
              <div className="flex flex-col items-center text-center transition-all duration-300 ease-in-out">
                {/* Moldura Circular e Aumento de Tamanho */}
                <div className="w-64 h-64 overflow-hidden mb-4 rounded-full border-4 border-pmmg-navy shadow-xl p-1 bg-white">
                  <img 
                    src={currentOption.avatar.url} 
                    alt={currentOption.avatar.name} 
                    className="w-full h-full object-contain rounded-full" 
                  />
                </div>
                {/* Nome do Personagem */}
                <div className="bg-pmmg-navy text-white px-4 py-2 rounded-full shadow-lg">
                  <p className="text-lg font-black uppercase tracking-widest">{currentOption.avatar.name}</p>
                  {/* Gênero removido */}
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={() => handleAvatarChange('next')}
                className="absolute right-0 z-10 p-2 rounded-full bg-pmmg-navy/10 text-pmmg-navy shadow-md active:scale-95 transition-transform mr-2"
              >
                <span className="material-symbols-outlined">arrow_forward_ios</span>
              </button>
            </div>
            
            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 pt-2">
              {AVATAR_OPTIONS.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${selectedAvatarIndex === index ? 'bg-pmmg-navy w-4' : 'bg-slate-300'}`}
                ></div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 shrink-0 bg-pmmg-yellow rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-pmmg-navy text-xl fill-icon">person_check</span>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none text-white uppercase tracking-tight">Configuração Inicial</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Passo {step} de 4</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar px-4 pt-6">
        {/* Aplicando fundo branco sólido ao container principal do passo 4 */}
        <div className={`rounded-xl shadow-md p-6 ${step === 4 ? 'bg-white' : 'pmmg-card'}`}>
          {renderStepContent()}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 border-t border-pmmg-navy/10 backdrop-blur-lg max-w-md mx-auto">
        <div className="flex justify-between gap-3">
          <button 
            onClick={handleBack}
            disabled={step === 1}
            className="flex-1 bg-slate-200 text-pmmg-navy font-bold py-3 rounded-xl text-xs uppercase disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
          <button 
            onClick={handleNext}
            className="flex-[3] bg-pmmg-navy text-white font-bold py-3 rounded-xl text-xs uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            {step === 4 ? (
              <>
                <span className="material-symbols-outlined text-pmmg-yellow">check_circle</span>
                Concluir Configuração
              </>
            ) : (
              <>
                Próximo Passo
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default OnboardingSetup;