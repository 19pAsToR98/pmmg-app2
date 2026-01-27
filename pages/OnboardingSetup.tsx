import React, { useState, useRef, useEffect } from 'react';
import { Screen, UserRank } from '../types';
import RankBadge from '../components/RankBadge';

interface OnboardingSetupProps {
  onComplete: (name: string, rank: UserRank, city: string) => void;
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

const OnboardingSetup: React.FC<OnboardingSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [rank, setRank] = useState<UserRank>('Soldado'); // Padrão: Soldado
  const [city, setCity] = useState('');
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number, name: string } | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<typeof MOCK_CITIES>([]);

  // Removendo referências ao Leaflet
  // const mapContainerRef = useRef<HTMLDivElement>(null);
  // const mapInstance = useRef<L.Map | null>(null);
  // const markerInstance = useRef<L.Marker | null>(null);

  // --- Map/City Logic ---
  
  // Removendo useEffects relacionados ao Leaflet

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
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Final Step
      onComplete(name.trim(), rank, city.trim());
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
            
            {/* Exibe a cidade selecionada sem o mapa Leaflet */}
            {city && (
              <div className="pmmg-card overflow-hidden">
                <div className="p-3 bg-pmmg-navy/5 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-pmmg-navy uppercase tracking-wider">Cidade Selecionada: {city}</p>
                  <span className="text-[9px] text-green-600 font-bold uppercase">OK</span>
                </div>
                <div className="h-12 w-full bg-pmmg-khaki/50 flex items-center justify-center">
                    <span className="text-[10px] text-pmmg-navy/50 font-medium">Localização definida para {city}</span>
                </div>
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
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Passo {step} de 3</p>
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
            {step === 3 ? (
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