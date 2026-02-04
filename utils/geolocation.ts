import { Geolocation, Position } from '@capacitor/geolocation';

interface GeolocationResult {
  lat: number;
  lng: number;
}

/**
 * Tries to get the current position using Capacitor Geolocation if available, 
 * falling back to the standard browser navigator.geolocation.
 * @param highAccuracy Request high accuracy (default: true).
 * @returns Promise resolving to { lat, lng } or null if failed.
 */
export const getCurrentLocation = async (highAccuracy = true): Promise<GeolocationResult | null> => {
  const options: PositionOptions = {
    enableHighAccuracy: highAccuracy,
    timeout: 10000,
    maximumAge: 0,
  };

  try {
    // 1. Try Capacitor Geolocation (preferred for native apps)
    if (typeof Geolocation.getCurrentPosition === 'function') {
      const position: Position = await Geolocation.getCurrentPosition(options);
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    }
  } catch (e) {
    console.warn("Capacitor Geolocation failed, falling back to navigator.geolocation:", e);
    // Fall through to navigator.geolocation
  }

  // 2. Fallback to standard browser Geolocation API
  if (navigator.geolocation) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.error('Erro ao obter localização (Web API):', err);
          reject(new Error(`Erro ao obter localização: ${err.message}`));
        },
        options
      );
    });
  }

  throw new Error("Geolocalização não suportada pelo dispositivo.");
};