import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Screen, UserRank } from '../types';

interface OnboardingStepsProps {
  onComplete: (name: string, rank: UserRank, city: string, lat: number, lng: number) => void;
  initialRank: UserRank;
}

const RANKS: UserRank[] = ['Soldado', 'Cabo', '3º Sargento', '2º Sargento', '1º Sargento', 'Subtenente'];

// Mock de cidades para pesquisa
const MOCK_CITIES = [
  { name: 'Belo Horizonte', lat: -19.9167, lng: -43.9345 },
  { name: 'Contagem', lat: -19.9319, lng: -44.0533 },
  { name: 'Uberlândia', lat: -18.9183, lng: -48.2750 },
  { name: 'Juiz de Fora', lat: -21.7639, lng: -43.3408 },
  { name: 'Montes Claros', lat: -16.7348, lng: -43.8616 },
];

const OnboardingSteps: React.FC<OnboardingStepsProps> = ({ onComplete, initialRank }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [rank, setRank] = useState<UserRank>(initialRank);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<{ name: string, lat: number, lng: number } | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<typeof MOCK_CITIES>([]);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);

  // --- Step 2: City Map Logic ---
  useEffect(() => {
    if (step === 2 && mapContainerRef.current) {
      if (!mapInstance.current) {
        const initialCenter = selectedCity ? [selectedCity.lat, selectedCity.lng] : MOCK_CITIES[0];
        
        mapInstance.current = L.map(mapContainerRef.current, {
          center: [initialCenter.lat, initialCenter.lng],
          zoom: 12,
          zoomControl: false,
          dragging: true,
          touchZoom: true,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false
        });
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current);
      }

      // Update map view and marker when selectedCity changes
      if (selectedCity && mapInstance.current) {
        mapInstance.current.setView([selectedCity.lat, selectedCity.lng], 13);
        
        if (markerInstance.current) {
          markerInstance.current.setLatLng([selectedCity.lat, selectedCity.lng]);
        } else {
          const cityIcon = L.divIcon({
            className: 'custom-city-icon',
            html: `<div class="w-8 h-8 bg-pmmg-navy rounded-full border-4 border-pmmg-yellow flex items-center justify-center shadow-lg"><span class="material-symbols-outlined text-pmmg-yellow text-[16px] fill-icon">location_city</span></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });
          markerInstance.current = L.marker([selectedCity.lat, selectedCity.lng], { icon: cityIcon }).addTo(mapInstance.current);
        }
        markerInstance.current.bindPopup(`<b>${selectedCity.name}</b>`).openPopup();
      }
    }

    return () => {
      // Cleanup is handled by the component unmounting, but we ensure the map is removed if step changes
      if (step !== 2 && mapInstance.current) {
        // mapInstance.current.remove(); // Keep map instance alive if component stays mounted
      }
    };
  }, [step, selectedCity]);

  const handleCitySearch = (term: string) => {
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

  const handleSelectCity = (city: { name: string, lat: number, lng: number }) => {
    setSelectedCity(city);
    setCitySearchTerm(city.name);
    setCitySuggestions([]);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        alert("Por favor, insira seu nome completo.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedCity) {
        alert("Por favor, selecione sua cidade padrão.");
        return;
      }
      onComplete(name.trim(), rank, selectedCity.name, selectedCity.lat, selectedCity.lng);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-pmmg-navy uppercase">Identificação Pessoal</h3>
              <p className="text-sm text-slate-600 mt-1">Informe seu nome e graduação militar.</p>
            </div>
            
            {/* Nome */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-pmmg-navy/70 mb-1">Nome Completo</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-3 bg-white border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
                placeholder="Ex: Rodrigo Alves" 
                type="text" 
              />
            </div>

            {/* Graduação */}
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-pmmg-navy/70 mb-3">Graduação Militar</h3>
              <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar pmmg-card p-4">
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
                    {/* RankBadge component is not available here, using placeholder */}
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full ${rank === r ? 'bg-pmmg-yellow' : 'bg-slate-200'}`}>
                        <span className="material-symbols-outlined text-pmmg-navy text-xl">military_tech</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase ${rank === r ? 'text-pmmg-yellow' : 'text-pmmg-navy'}`}>
                      {r}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-pmmg-navy uppercase">Localização Padrão</h3>
              <p className="text-sm text-slate-600 mt-1">Defina sua cidade de atuação principal.</p>
            </div>

            {/* City Search */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-pmmg-navy/70 mb-1">Buscar Cidade</label>
              <input 
                value={citySearchTerm}
                onChange={(e) => handleCitySearch(e.target.value)}
                className="block w-full px-4 py-3 bg-white border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
                placeholder="Ex: Belo Horizonte" 
                type="text" 
              />
              
              {citySuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-pmmg-navy/20 rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
                  {citySuggestions.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectCity(city)}
                      className="w-full text-left px-4 py-2 text-sm text-pmmg-navy hover:bg-pmmg-khaki/50 transition-colors border-b border-pmmg-navy/5 last:border-b-0"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Map Visualization */}
            <div className="pmmg-card overflow-hidden">
              <div className="p-3 bg-pmmg-navy/5 flex items-center justify-between">
                <p className="text-[10px] font-bold text-pmmg-navy uppercase tracking-wider">
                  {selectedCity ? `Visualizando: ${selectedCity.name}` : 'Selecione uma cidade'}
                </p>
                <span className="text-[9px] text-green-600 font-bold uppercase">MAPA ATIVO</span>
              </div>
              <div ref={mapContainerRef} className="h-64 w-full bg-slate-200 z-0"></div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button onClick={handleBack} className="text-white">
              <span className="material-symbols-outlined">arrow_back_ios</span>
            </button>
          )}
          <div>
            <h1 className="font-bold text-base leading-none text-white uppercase tracking-tight">Configuração Inicial</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Etapa {step} de 2</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 pt-6 pb-32 no-scrollbar overflow-y-auto">
        <div className="max-w-sm mx-auto">
          {renderStepContent()}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-pmmg-khaki via-pmmg-khaki to-transparent max-w-md mx-auto">
        <button 
          onClick={handleNext}
          className="w-full bg-pmmg-navy text-white font-bold py-4 rounded-xl shadow-2xl flex items-center justify-center gap-3 uppercase tracking-widest active:scale-[0.98] transition-transform"
        >
          <span className="material-symbols-outlined">{step === 1 ? 'arrow_forward' : 'check_circle'}</span>
          {step === 1 ? 'Próxima Etapa' : 'Concluir Onboarding'}
        </button>
      </footer>
    </div>
  );
};

export default OnboardingSteps;