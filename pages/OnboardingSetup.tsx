import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { Screen, UserRank } from '../types';

interface OnboardingSetupProps {
  onSetupComplete: (name: string, rank: UserRank, city: string, cityCoords: [number, number]) => void;
}

const RANKS: UserRank[] = ['Soldado', 'Cabo', '3º Sargento', '2º Sargento', '1º Sargento', 'Subtenente'];
const MOCK_CITIES = [
  { name: 'Belo Horizonte', lat: -19.9167, lng: -43.9345 },
  { name: 'Juiz de Fora', lat: -21.7639, lng: -43.3494 },
  { name: 'Uberlândia', lat: -18.9183, lng: -48.2750 },
];

const OnboardingSetup: React.FC<OnboardingSetupProps> = ({ onSetupComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [rank, setRank] = useState<UserRank>('Soldado');
  const [city, setCity] = useState('');
  const [cityCoords, setCityCoords] = useState<[number, number] | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim() || !rank) {
        alert("Preencha seu nome e graduação.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!city || !cityCoords) {
        alert("Selecione sua cidade padrão no mapa.");
        return;
      }
      onSetupComplete(name, rank, city, cityCoords);
    }
  };

  const handleCitySelect = (cityName: string) => {
    const selected = MOCK_CITIES.find(c => c.name === cityName);
    if (selected) {
      setCity(selected.name);
      setCityCoords([selected.lat, selected.lng]);
      
      if (mapInstance.current) {
        mapInstance.current.setView([selected.lat, selected.lng], 12);
        
        if (markerInstance.current) {
          markerInstance.current.setLatLng([selected.lat, selected.lng]);
        } else {
          const icon = L.divIcon({
            className: 'custom-city-icon',
            html: `<div class="w-8 h-8 bg-pmmg-navy rounded-full border-4 border-pmmg-yellow flex items-center justify-center shadow-lg"><span class="material-symbols-outlined text-white text-[18px] fill-icon">location_city</span></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });
          markerInstance.current = L.marker([selected.lat, selected.lng], { icon }).addTo(mapInstance.current);
        }
      }
    }
  };

  // Initialize map for Step 2
  useEffect(() => {
    if (step === 2 && mapRef.current && !mapInstance.current) {
      const initialCity = MOCK_CITIES[0];
      
      const map = L.map(mapRef.current, {
        center: [initialCity.lat, initialCity.lng],
        zoom: 8,
        zoomControl: false,
      });
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);
      
      // Set initial selection if not already set
      if (!cityCoords) {
        handleCitySelect(initialCity.name);
      }
    }
    
    return () => {
      if (mapInstance.current) {
        // Explicitly remove marker and clear references before removing the map
        if (markerInstance.current) {
          markerInstance.current.remove();
          markerInstance.current = null;
        }
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [step, cityCoords]);


  const progress = step === 1 ? 50 : 100;

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center p-1 border-2 border-pmmg-red">
            <span className="material-symbols-outlined text-pmmg-navy text-2xl">shield</span>
          </div>
          <div>
            <h1 className="font-bold text-base leading-none text-white uppercase tracking-tight">Configuração Tática</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Passo {step} de 2</p>
          </div>
        </div>
      </header>

      <div className="w-full bg-pmmg-navy/50 h-1">
        <div className="h-1 bg-pmmg-yellow transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar px-5 pt-6">
        {step === 1 && (
          <div className="space-y-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-pmmg-navy uppercase">Identificação Pessoal</h2>
            <p className="text-sm text-slate-600">Informe seus dados para configurar seu perfil operacional.</p>
            
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-pmmg-navy mb-1.5 ml-1">Nome Completo</label>
              <input 
                className="block w-full px-4 py-3 bg-white/70 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm placeholder-pmmg-navy/40" 
                placeholder="Seu nome de guerra" 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-pmmg-navy mb-1.5 ml-1">Graduação Militar</label>
              <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                {RANKS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRank(r)}
                    className={`flex flex-col items-center justify-center gap-1 shrink-0 p-3 rounded-xl border-2 transition-all ${
                      rank === r 
                        ? 'bg-pmmg-navy border-pmmg-yellow shadow-lg' 
                        : 'bg-white border-transparent opacity-70'
                    }`}
                  >
                    <span className={`text-[10px] font-black uppercase ${rank === r ? 'text-pmmg-yellow' : 'text-pmmg-navy'}`}>
                      {r}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-pmmg-navy uppercase">Localização Padrão</h2>
            <p className="text-sm text-slate-600">Selecione sua cidade de atuação principal. Isso otimiza o mapa tático.</p>
            
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-pmmg-navy mb-1.5 ml-1">Cidade Padrão</label>
              <select 
                className="block w-full px-4 py-3 bg-white/70 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm transition-all appearance-none bg-no-repeat bg-[right_1rem_center]"
                value={city}
                onChange={(e) => handleCitySelect(e.target.value)}
              >
                <option value="">Selecione uma cidade</option>
                {MOCK_CITIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="pmmg-card overflow-hidden">
              <div className="p-3 bg-pmmg-navy/5 flex items-center justify-between">
                <p className="text-[10px] font-bold text-pmmg-navy uppercase tracking-wider">Visualização no Mapa</p>
                <span className="text-[9px] text-green-600 font-bold uppercase">{cityCoords ? 'Localizado' : 'Aguardando'}</span>
              </div>
              <div ref={mapRef} className="h-64 w-full bg-slate-200 z-0"></div>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-pmmg-khaki via-pmmg-khaki to-transparent max-w-md mx-auto">
        <button 
          onClick={handleNext}
          className="w-full bg-pmmg-navy text-white font-bold py-4 rounded-xl shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
        >
          <span className="uppercase tracking-widest text-sm">{step === 1 ? 'Próximo Passo' : 'Concluir Configuração'}</span>
          <span className="material-symbols-outlined text-pmmg-yellow">{step === 1 ? 'arrow_forward' : 'check_circle'}</span>
        </button>
      </footer>
    </div>
  );
};

export default OnboardingSetup;