import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

interface MapLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ initialLat, initialLng, onLocationChange }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentAddress, setCurrentAddress] = useState('Arraste o marcador para definir a localização.');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const defaultCenter: [number, number] = initialLat && initialLng ? [initialLat, initialLng] : [-19.9167, -43.9345];

  // Função para atualizar o estado e o marcador
  const updateMarker = (lat: number, lng: number) => {
    if (mapInstanceRef.current) {
      const newLatLng = L.latLng(lat, lng);
      
      if (markerRef.current) {
        markerRef.current.setLatLng(newLatLng);
      } else {
        markerRef.current = L.marker(newLatLng, { draggable: true }).addTo(mapInstanceRef.current);
        markerRef.current.on('dragend', (e) => {
          const { lat, lng } = e.target.getLatLng();
          reverseGeocode(lat, lng);
        });
      }
      
      // Centraliza o mapa
      mapInstanceRef.current.setView(newLatLng, 15);
      
      // Limpa os resultados e fecha o dropdown após uma seleção/atualização bem-sucedida
      setSearchResults([]);
      setIsDropdownOpen(false);
    }
  };

  // Geocodificação Reversa (Lat/Lng -> Endereço Curto)
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      
      let address = data.display_name || 'Endereço não encontrado';
      
      // Attempt to construct a shorter address from structured data
      if (data.address) {
          const parts = [
              data.address.road,
              data.address.house_number,
              data.address.neighbourhood,
              data.address.city,
              data.address.state
          ].filter(Boolean);
          
          if (parts.length > 0) {
              address = parts.join(', ');
          } else {
              address = data.display_name;
          }
      }

      setCurrentAddress(address);
      onLocationChange(lat, lng, address);
      setSearchTerm(address); // Define o termo de busca para o endereço selecionado
    } catch (error) {
      console.error("Erro na geocodificação reversa:", error);
      setCurrentAddress('Erro ao buscar endereço.');
      onLocationChange(lat, lng, 'Erro ao buscar endereço.');
    }
  };

  // Geocodificação (Endereço -> Lista de Sugestões)
  const handleSearch = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }
    setSearchLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=br`);
      const data: SearchResult[] = await response.json();
      
      setSearchResults(data);
      // Abrir o dropdown somente se houver resultados
      if (data.length > 0) {
        setIsDropdownOpen(true);
      } else {
        setIsDropdownOpen(false);
      }
    } catch (error) {
      console.error("Erro na busca de endereço:", error);
      setSearchResults([]);
      setIsDropdownOpen(false);
    } finally {
      setSearchLoading(false);
    }
  };

  // Seleção de um resultado da busca
  const handleSelectResult = (result: SearchResult) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    
    updateMarker(newLat, newLng);
    reverseGeocode(newLat, newLng);
  };

  // Inicialização do Mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 14,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current);

    // Adiciona o marcador inicial e faz a geocodificação reversa
    updateMarker(defaultCenter[0], defaultCenter[1]);
    reverseGeocode(defaultCenter[0], defaultCenter[1]);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Efeito para lidar com a busca ao digitar (simulando debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      // Só pesquisa se o termo for diferente do endereço atual E se o termo não estiver vazio
      if (searchTerm && searchTerm !== currentAddress) {
        handleSearch(searchTerm);
      } else if (!searchTerm) {
        // Limpa resultados se o campo estiver vazio
        setSearchResults([]);
        setIsDropdownOpen(false);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, currentAddress]);
  
  // Efeito para fechar o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);


  return (
    <div className="space-y-3">
      <div className="relative" ref={wrapperRef}>
        <input 
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            // Se o usuário começar a digitar, e o termo for diferente do endereço atual, 
            // reabrimos o dropdown para que o debounce possa preenchê-lo.
            if (e.target.value !== currentAddress) {
                setIsDropdownOpen(true);
            }
          }}
          onFocus={() => {
            // Ao focar, se o termo de busca for o endereço já selecionado, não abra o dropdown.
            // Caso contrário, se houver resultados anteriores, reabra.
            if (searchTerm !== currentAddress && searchResults.length > 0) {
              setIsDropdownOpen(true);
            }
          }}
          className="block w-full pr-12 py-3 bg-white border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
          placeholder="Buscar endereço (Rua, Bairro, Cidade)..." 
          type="text" 
          disabled={searchLoading}
        />
        <span className={`material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-pmmg-navy/40 text-xl ${searchLoading ? 'animate-spin' : ''}`}>
          {searchLoading ? 'progress_activity' : 'search'}
        </span>

        {isDropdownOpen && searchResults.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-pmmg-navy/20 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <div
                key={index}
                onMouseDown={(e) => {
                  e.preventDefault(); // Previne que o input perca o foco
                  handleSelectResult(result);
                }}
                className="p-3 cursor-pointer hover:bg-pmmg-khaki/50 transition-colors border-b border-pmmg-navy/5 last:border-b-0"
              >
                <p className="text-sm font-medium text-pmmg-navy leading-tight">{result.display_name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Lat: {parseFloat(result.lat).toFixed(4)}, Lng: {parseFloat(result.lon).toFixed(4)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pmmg-card p-3">
        <p className="text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1">Localização Atual (Arrastável)</p>
        <p className="text-xs font-semibold text-pmmg-navy leading-snug">{currentAddress}</p>
      </div>

      <div ref={mapContainerRef} className="h-64 w-full rounded-xl border-2 border-pmmg-navy/20 shadow-inner" style={{ zIndex: 1 }}></div>
      
      <p className="text-[9px] text-slate-500 text-center italic">
        Latitude: {markerRef.current?.getLatLng().lat.toFixed(6)} | Longitude: {markerRef.current?.getLatLng().lng.toFixed(6)}
      </p>
    </div>
  );
};

export default MapLocationPicker;