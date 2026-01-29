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

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  // Oculta todos os Pontos de Interesse (POIs)
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }]
  },
  // Oculta ícones de transporte público
  {
    featureType: "transit",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }]
  },
  // Opcional: Simplifica a geometria das estradas para um visual mais limpo
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ lightness: 100 }, { visibility: "simplified" }]
  },
  // Opcional: Simplifica rótulos de estradas
  {
    featureType: "road",
    elementType: "labels.text",
    stylers: [{ visibility: "off" }]
  },
  // Opcional: Simplifica rótulos de áreas
  {
    featureType: "administrative",
    elementType: "labels.text",
    stylers: [{ visibility: "off" }]
  },
  // Opcional: Mantém rótulos de cidades/países
  {
    featureType: "administrative.locality",
    elementType: "labels.text",
    stylers: [{ visibility: "on" }]
  }
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
        styles: MAP_STYLES, // Aplicando os novos estilos limpos
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