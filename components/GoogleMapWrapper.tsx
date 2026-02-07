import React from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { LIGHT_MAP_STYLES, DARK_MAP_STYLES } from '../utils/mapStyles';

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
  isDarkMode?: boolean; // NEW PROP
}

const GoogleMapWrapper: React.FC<GoogleMapWrapperProps> = ({ 
  children, 
  center, 
  zoom, 
  mapContainerClassName, 
  options, 
  onLoad,
  onClick,
  isDarkMode = false, // Default to false
}) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    libraries,
    language: 'pt-BR',
  });
  
  // Determine which style to use based on dark mode state
  const mapStyles = isDarkMode ? DARK_MAP_STYLES : LIGHT_MAP_STYLES;

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
        zoomControl: false, 
        rotateControl: false, 
        // Removendo tilt: 0 para permitir rotação por gestos
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        styles: mapStyles, 
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