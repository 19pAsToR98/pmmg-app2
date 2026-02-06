import React, { useState, useRef, useEffect } from 'react';
import { Screen, UserRank, UserAvatar, GeocodedLocation } from '../types';
import RankBadge from '../components/RankBadge';
import GoogleMapWrapper from '../components/GoogleMapWrapper';
import { MarkerF } from '@react-google-maps/api';
import { ICON_PATHS } from '../utils/iconPaths';
import { searchGoogleAddress } from '../utils/googleMapsApi';

interface OnboardingSetupProps {
  onComplete: (name: string, rank: UserRank, city: string, avatar: UserAvatar, defaultLocation: GeocodedLocation) => void; // MODIFICADO: Removida Institution
  // onInstitutionChange: (institution: Institution) => void; // REMOVIDO
  defaultAvatar: UserAvatar; // NOVO: Recebe o avatar padrão
}

// Graduações simplificadas para exibição
type SimplifiedRank = 'Soldado' | 'Cabo' | 'Sargento';

// Mapeamento de Graduações Simplificadas para UserRank (para compatibilidade com types.ts)
const RANK_MAPPING: Record<SimplifiedRank, UserRank> = {
    'Soldado': 'Soldado',
    'Cabo': 'Cabo',
    'Sargento': '3º Sargento',
};

const SIMPLIFIED_RANKS: SimplifiedRank[] = ['Soldado', 'Cabo', 'Sargento'];

// Default location for map initialization before search
const DEFAULT_LOCATION: GeocodedLocation = { name: 'Belo Horizonte', lat: -19.9167, lng: -43.9345 };


const OnboardingSetup: React.FC<OnboardingSetupProps> = ({ onComplete, defaultAvatar }) => {
  // Os passos agora são 1 (Nome), 2 (Graduação), 3 (Cidade)
  const [step, setStep] = useState(1);
  
  const [name, setName] = useState('');
  // Usando SimplifiedRank para o estado local
  const [simplifiedRank, setSimplifiedRank] = useState<SimplifiedRank>('Soldado'); 
  const [city, setCity] = useState(DEFAULT_LOCATION.name); // Initialize city name
  const [citySearchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<GeocodedLocation | null>(DEFAULT_LOCATION); // Default to BH
  const [citySuggestions, setCitySuggestions] = useState<GeocodedLocation[]>([]);
  const [isCitySearching, setIsCitySearching] = useState(false);
  const [searchExecuted, setSearchExecuted] = useState(false); // Indica se uma busca foi executada
  
  // O avatar é fixo e vem de defaultAvatar

  // --- Map/City Logic ---
  
  const handleCitySearchChange = (term: string) => {
    setSearchTerm(term);
    setCitySuggestions([]);
    setSearchExecuted(false); // Reseta o estado de busca executada ao digitar
    
    // Se o usuário digitar, limpa a localização selecionada (para forçar a re-seleção)
    if (selectedLocation && selectedLocation.name !== term) {
        setSelectedLocation(null);
        setCity('');
    }
  };
  
  const handleCitySearch = async () => {
    if (citySearchTerm.length < 3) {
      alert("Digite pelo menos 3 caracteres para buscar uma cidade.");
      return;
    }
    
    setIsCitySearching(true);
    setCitySuggestions([]);
    setSearchExecuted(true); // Marca que a busca foi executada

    try {
      // Usando a função real de geocodificação
      const results = await searchGoogleAddress(citySearchTerm);

      if (results.length > 0) {
        setCitySuggestions(results);
      } else {
        // Se não houver resultados, a mensagem será exibida
      }
    } catch (error) {
      console.error("Erro ao buscar cidade:", error);
      alert("Erro na comunicação com o serviço de geocodificação do Google.");
    } finally {
      setIsCitySearching(false);
    }
  };

  const handleSelectCity = (location: GeocodedLocation) => {
    setSelectedLocation(location);
    setCity(location.name); // Garante que o estado 'city' seja atualizado
    setSearchTerm(location.name); // Preenche o input com o nome completo
    setCitySuggestions([]);
    setSearchExecuted(false); // Esconde a mensagem de erro se houver
  };

  // --- Navigation Logic ---

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      alert("Por favor, insira seu nome completo.");
      return;
    }
    if (step === 3 && (!city.trim() || !selectedLocation)) {
      alert("Por favor, selecione sua cidade padrão no mapa.");
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      const finalRank = RANK_MAPPING[simplifiedRank];
      // Chamando onComplete com o avatar padrão
      onComplete(name.trim(), finalRank, city.trim(), defaultAvatar, selectedLocation!); 
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const getCityMarkerIcon = () => {
    if (typeof window === 'undefined' || !window.google || !window.google.maps) return undefined;

    const pathData = ICON_PATHS['location_on'];
    
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
      case 1: // Name (Antigo Passo 2)
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-primary-dark uppercase tracking-tight">Identificação Pessoal</h2>
            <p className="text-sm text-secondary-light">Insira seu nome completo para identificação no sistema.</p>
            <div>
              <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 dark:text-slate-400 mb-1 ml-1 tracking-wider">Nome Completo</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border border-pmmg-navy/20 dark:border-slate-600 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm dark:text-slate-200" 
                placeholder="Ex: Rodrigo Alves da Silva" 
                type="text" 
              />
            </div>
          </div>
        );
      case 2: // Rank (Antigo Passo 3)
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-primary-dark uppercase tracking-tight">Graduação Militar</h2>
            <p className="text-sm text-secondary-light">Selecione sua graduação atual. Isso define sua hierarquia tática.</p>
            
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar justify-center">
              {SIMPLIFIED_RANKS.map((r) => (
                <button
                  key={r}
                  onClick={() => setSimplifiedRank(r)}
                  className={`flex flex-col items-center gap-2 shrink-0 transition-all p-2 rounded-xl border-2 ${
                    simplifiedRank === r 
                      ? 'bg-pmmg-navy border-pmmg-yellow shadow-lg scale-105' 
                      : 'bg-white dark:bg-slate-700 border-transparent grayscale opacity-60'
                  }`}
                >
                  <RankBadge rank={RANK_MAPPING[r]} size="md" />
                  <span className={`text-[9px] font-black uppercase ${simplifiedRank === r ? 'text-pmmg-yellow' : 'text-primary-dark'}`}>
                    {r}
                  </span>
                </button>
              ))}
            </div>
            <div className="text-center">
              <p className="text-primary-dark font-bold uppercase text-sm">Graduação Selecionada:</p>
              <p className="text-pmmg-red font-black text-lg mt-1">{simplifiedRank}</p>
            </div>
          </div>
        );
      case 3: // City (Antigo Passo 4)
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary-dark uppercase tracking-tight">Cidade Padrão</h2>
            <p className="text-sm text-secondary-light">Defina sua cidade de atuação principal para otimizar alertas e mapas.</p>
            
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 dark:text-slate-400 mb-1 ml-1 tracking-wider">Buscar Cidade em MG</label>
              <div className="flex gap-2">
                <input 
                  value={citySearchTerm}
                  onChange={(e) => handleCitySearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCitySearch();
                    }
                  }}
                  className="block w-full px-4 py-3 bg-white/80 dark:bg-slate-700 border border-pmmg-navy/20 dark:border-slate-600 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm dark:text-slate-200" 
                  placeholder="Ex: Belo Horizonte" 
                  type="text" 
                />
                <button 
                  onClick={handleCitySearch}
                  disabled={isCitySearching || citySearchTerm.length < 3}
                  className="bg-pmmg-navy text-white p-3 rounded-lg active:scale-95 transition-transform disabled:opacity-50 shrink-0"
                  title="Buscar Cidade"
                >
                  <span className="material-symbols-outlined text-xl animate-spin" style={{ display: isCitySearching ? 'block' : 'none' }}>progress_activity</span>
                  <span className="material-symbols-outlined text-xl" style={{ display: isCitySearching ? 'none' : 'block' }}>search</span>
                </button>
              </div>
              
              {/* Dropdown de Sugestões (Posicionamento Absoluto) */}
              {citySuggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-white dark:bg-slate-800 border border-pmmg-navy/20 dark:border-slate-700 rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
                  {citySuggestions.map((loc, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectCity(loc)}
                      className="w-full text-left px-4 py-2 text-sm text-primary-dark hover:bg-pmmg-khaki/50 dark:hover:bg-slate-700 transition-colors border-b border-pmmg-navy/5 dark:border-slate-700 last:border-b-0"
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Mensagem de "Nenhuma cidade encontrada" (Controlada por searchExecuted) */}
              {searchExecuted && citySuggestions.length === 0 && !isCitySearching && (
                <p className="text-[10px] text-pmmg-red italic text-center mt-2">Nenhuma cidade encontrada.</p>
              )}
            </div>
            
            {/* Exibe o mapa se uma cidade foi selecionada */}
            {selectedLocation && (
              <div className="pmmg-card overflow-hidden">
                <div className="p-3 bg-pmmg-navy/5 dark:bg-slate-700 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-primary-dark uppercase tracking-wider">Cidade Selecionada: {city || 'Carregando...'}</p>
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
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki dark:bg-slate-900 overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 shrink-0 bg-pmmg-yellow rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-dark text-xl fill-icon">person_check</span>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none text-white uppercase tracking-tight">Configuração Inicial</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Passo {step} de 3</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar px-4 pt-6">
        {/* Aplicando fundo branco sólido ao container principal do passo 4 */}
        <div className={`rounded-xl shadow-md p-6 pmmg-card`}>
          {renderStepContent()}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-900/95 border-t border-pmmg-navy/10 dark:border-slate-700 backdrop-blur-lg max-w-md mx-auto">
        <div className="flex justify-between gap-3">
          <button 
            onClick={handleBack}
            disabled={step === 1}
            className="flex-1 bg-slate-200 dark:bg-slate-700 text-primary-dark dark:text-slate-200 font-bold py-3 rounded-xl text-xs uppercase disabled:opacity-50"
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