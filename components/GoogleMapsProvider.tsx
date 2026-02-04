import React, { createContext, useContext, ReactNode } from 'react';
import { useLoadScript } from '@react-google-maps/api';

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

// Bibliotecas necessárias para o mapa (geometry para funções utilitárias)
const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["geometry"];

export const GoogleMapsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    libraries,
    language: 'pt-BR',
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};