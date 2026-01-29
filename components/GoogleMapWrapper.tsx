import React from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';

// Libraries required for the map (geometry for utility functions, places if needed later)
const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["geometry"];

interface GoogleMapWrapperProps {
  children: React.ReactNode;
  center: { lat: number; lng: number };
  zoom: number;
  mapContainerClassName: string;
  options?: google.maps.MapOptions;
  onLoad?: (map: google.maps.Map) => void;
  onClick?: (e: google.maps.MapMouseEvent) => void;
}

// Estilos de mapa tático/militar para remover POIs e rótulos
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'landscape',
    stylers: [{ saturation: -100 }, { lightness: 10 }],
  },
  {
    featureType: 'water',
    stylers: [{ color: '#c9d6df' }],
  },
];

const GoogleMapWrapper: React.FC<GoogleMapWrapperProps> = ({ 
  children, 
  center, 
  zoom, 
  mapContainerClassName, 
  options, 
  onLoad,
  onClick
}) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    libraries,
    language: 'pt-BR',
  });

  if (loadError) {
    return <div className="p-4 text-center text-pmmg-red">Erro ao carregar o Google Maps. Verifique a chave API.</div>;
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center ${mapContainerClassName} bg-slate-200`}>
        <span className="material-symbols-outlined text-pmmg-navy animate-spin text-4xl">progress_activity</span>
        <p className="text-pmmg-navy/70 text-sm ml-3">Carregando Mapa Tático...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerClassName={mapContainerClassName}
      center={center}
      zoom={zoom}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        clickableIcons: false, // Desativa ícones clicáveis
        styles: MAP_STYLES, // Aplicando os estilos táticos
        ...options,
      }}
      onLoad={onLoad}
      onClick={onClick}
    >
      {children}
    </GoogleMap>
  );
};

export default GoogleMapWrapper;