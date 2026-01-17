import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

interface MapLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ initialLat, initialLng, onLocationChange }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentAddress, setCurrentAddress] = useState('Arraste o marcador para definir a localização.');
  const [searchLoading, setSearchLoading] = useState(false);

  const defaultCenter: [number, number] = initialLat && initialLng ? [initialLat, initialLng] : [-19.9167, -43.9345];

  // Função para atualizar o estado e o marcador
  const updateMarkerAndLocation = (lat: number, lng: number) => {
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
      
      // Centraliza o mapa se a mudança for significativa (ex: após busca)
      if (mapInstanceRef.current.getCenter().distanceTo(newLatLng) > 500) {
        mapInstanceRef.current.setView(newLatLng, 15);
      }
      
      reverseGeocode(lat, lng);
    }
  };

  // Geocodificação Reversa (Lat/Lng -> Endereço)
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      const address = data.display_name || 'Endereço não encontrado';
      setCurrentAddress(address);
      onLocationChange(lat, lng, address);
    } catch (error) {
      console.error("Erro na geocodificação reversa:", error);
      setCurrentAddress('Erro ao buscar endereço.');
      onLocationChange(lat, lng, 'Erro ao buscar endereço.');
    }
  };

  // Geocodificação (Endereço -> Lat/Lng)
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=1&countrycodes=br`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        updateMarkerAndLocation(newLat, newLng);
      } else {
        alert('Endereço não encontrado. Tente ser mais específico.');
      }
    } catch (error) {
      console.error("Erro na busca de endereço:", error);
      alert('Erro ao conectar com o serviço de busca de endereço.');
    } finally {
      setSearchLoading(false);
    }
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

    // Adiciona o marcador inicial
    updateMarkerAndLocation(defaultCenter[0], defaultCenter[1]);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative">
        <input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="block w-full pr-12 py-3 bg-white border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
          placeholder="Buscar endereço (Rua, Bairro, Cidade)..." 
          type="text" 
          disabled={searchLoading}
        />
        <button 
          onClick={handleSearch}
          disabled={searchLoading}
          className="absolute right-0 top-0 h-full px-3 text-pmmg-navy active:bg-pmmg-navy/10 rounded-r-lg transition-colors"
        >
          <span className={`material-symbols-outlined text-xl ${searchLoading ? 'animate-spin' : ''}`}>
            {searchLoading ? 'progress_activity' : 'search'}
          </span>
        </button>
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