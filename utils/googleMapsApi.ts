import { GeocodedLocation } from '../types';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Searches for an address using Google Geocoding API.
 * @param address The address string to search for.
 * @returns Promise resolving to an array of GeocodedLocation suggestions.
 */
export const searchGoogleAddress = async (address: string): Promise<GeocodedLocation[]> => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("GOOGLE_MAPS_API_KEY is missing.");
    return [];
  }
  
  // Usando components=country:br para focar no Brasil e language=pt-BR
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&components=country:br&language=pt-BR&key=${GOOGLE_MAPS_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'OK' && data.results.length > 0) {
    // Mapeia os 5 primeiros resultados para sugestões
    return data.results.slice(0, 5).map((item: any) => ({
      name: item.formatted_address,
      lat: item.geometry.location.lat,
      lng: item.geometry.location.lng,
    }));
  }
  
  if (data.status !== 'ZERO_RESULTS') {
    console.error("Google Geocoding Error Status:", data.status, data.error_message);
  }
  
  return [];
};

/**
 * Performs reverse geocoding (Coordinates -> Address) using Google Geocoding API.
 * @param lat Latitude.
 * @param lng Longitude.
 * @returns Promise resolving to a single GeocodedLocation or null.
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<GeocodedLocation | null> => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("GOOGLE_MAPS_API_KEY is missing.");
    return null;
  }
  
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=pt-BR&key=${GOOGLE_MAPS_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'OK' && data.results.length > 0) {
    const result = data.results[0];
    return {
      name: result.formatted_address,
      lat: lat,
      lng: lng,
    };
  }
  
  if (data.status !== 'ZERO_RESULTS') {
    console.error("Google Reverse Geocoding Error Status:", data.status, data.error_message);
  }
  
  return null;
};