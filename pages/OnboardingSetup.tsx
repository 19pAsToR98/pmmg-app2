import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { Screen, UserRank, UserAvatar } from '../types';
import RankBadge from '../components/RankBadge';

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

// NEW: Avatar options
const AVATAR_OPTIONS: { gender: 'Masculino' | 'Feminino', avatar: UserAvatar }[] = [
  { gender: 'Masculino', avatar: { name: 'Cabo Loso', url: 'https://iili.io/fiLMgHX.gif' } },
  { gender: 'Feminino', avatar: { name: 'Sgt Bisonha', url: 'https://iili.io/fiLMrRn.gif' } },
];


const OnboardingSetup: React.FC<OnboardingSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [rank, setRank] = useState<UserRank>('Soldado'); // Padrão: Soldado
  const [city, setCity] = useState('');
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number, name: string } | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<typeof MOCK_CITIES>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<UserAvatar | null>(null); // NEW State

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);

  // --- Map/City Logic ---
  
  // Efeito para inicializar o mapa quando o Passo 3 é atingido
  useEffect(() => {
    if (step !== 3 || !mapContainerRef.current) return;

    // Define a localização inicial (BH como fallback)
    const initialLocation = selectedLocation || MOCK_CITIES[0];
    
    const icon = L.divIcon({
      className: 'custom-location-icon',
      html: `<div class="w-8 h-8 bg-pmmg-navy rounded-full border-2 border-pmmg-yellow flex items-center justify-center shadow-lg"><span class="material-symbols-outlined text-pmmg-yellow text-[16px] fill-icon">location_on</span></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    if (!mapInstance.current) {
      // 1. Inicializa o mapa
      mapInstance.current = L.map(mapContainerRef.current, {
        center: [initialLocation.lat, initialLocation.lng],
        zoom: 12,
        zoomControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current);
      
      markerInstance.current = L.marker([initialLocation.lat, initialLocation.lng], { icon }).addTo(mapInstance.current);
      
      // Define a cidade inicial se ainda não estiver definida
      if (!city) {
          setCity(initialLocation.name);
          setSelectedLocation(initialLocation);
      }

    } else {
      // Se o mapa já existe, apenas garante que a visualização esteja correta
      mapInstance.current.setView([initialLocation.lat, initialLocation.lng], 12);
      markerInstance.current?.setLatLng([initialLocation.lat, initialLocation.lng]);
    }
    
    // Força o Leaflet a recalcular o tamanho do container
    mapInstance.current.invalidateSize();

    return () => {
      // Cleanup: Se o passo mudar, remove o mapa para evitar vazamento de memória
      if (step !== 3 && mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [step]); 

  // Efeito para atualizar o marcador quando selectedLocation muda
  useEffect(() => {
    if (step === 3 && selectedLocation && mapInstance.current && markerInstance.current) {
      mapInstance.current.setView([selectedLocation.lat, selectedLocation.lng], 12);
      markerInstance.current.setLatLng([selectedLocation.lat, selectedLocation.lng]);
    }
  }, [selectedLocation, step]);


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
    if (step === 4 && !selectedAvatar) { // NEW check for step 4
      alert("Por favor, selecione um avatar.");
      return;
    }
    
    if (step < 4) { // Changed from 3 to 4
      setStep(step + 1);
    } else {
      // Final Step
      onComplete(name.trim(), rank, city.trim(), selectedAvatar!); // Updated onComplete call
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
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
            {(city || step === 3) && (
              <div className="pmmg-card overflow-hidden">
                <div className="p-3 bg-pmmg-navy/5 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-pmmg-navy uppercase tracking-wider">Cidade Selecionada: {city || 'Carregando...'}</p>
                  <span className="text-[9px] text-green-600 font-bold uppercase">GPS OK</span>
                </div>
                {/* O mapa precisa de uma altura definida */}
                <div ref={mapContainerRef} className="h-48 w-full bg-slate-200 z-0"></div>
              </div>
            )}
          </div>
        );
      case 4: // NEW STEP: Avatar Selection
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-pmmg-navy uppercase tracking-tight">Avatar Tático</h2>
            <p className="text-sm text-slate-600">Selecione o avatar que representará você e o assistente de IA na plataforma.</p>
            
            <div className="flex justify-center gap-6">
              {AVATAR_OPTIONS.map((option) => (
                <button
                  key={option.gender}
                  onClick={() => setSelectedAvatar(option.avatar)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-4 transition-all ${
                    selectedAvatar?.name === option.avatar.name
                      ? 'bg-pmmg-navy border-pmmg-yellow shadow-lg scale-105'
                      : 'bg-white border-transparent opacity-70'
                  }`}
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <img 
                      src={option.avatar.url} 
                      alt={option.avatar.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className={`text-[10px] font-black uppercase ${selectedAvatar?.name === option.avatar.name ? 'text-pmmg-yellow' : 'text-pmmg-navy'}`}>
                    {option.avatar.name}
                  </span>
                  <span className={`text-[8px] font-bold uppercase ${selectedAvatar?.name === option.avatar.name ? 'text-pmmg-yellow/80' : 'text-slate-500'}`}>
                    {option.gender}
                  </span>
                </button>
              ))}
            </div>
            
            {selectedAvatar && (
              <div className="text-center pt-4 border-t border-pmmg-navy/10">
                <p className="text-pmmg-navy font-bold uppercase text-sm">Avatar Selecionado:</p>
                <p className="text-pmmg-red font-black text-lg mt-1">{selectedAvatar.name}</p>
              </div>
            )}
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
        <div className="pmmg-card p-6">
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