import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

interface MapLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationChange: (lat: number, lng: number) => void;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ initialLat, initialLng, onLocationChange }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  const defaultCenter: [number, number] = [-19.9167, -43.9345]; // Belo Horizonte

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      const startPos = currentLocation ? [currentLocation.lat, currentLocation.lng] as [number, number] : defaultCenter;
      
      mapInstance.current = L.map(mapRef.current, {
        center: startPos,
        zoom: currentLocation ? 15 : 12,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current);

      mapInstance.current.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        updateMarker(lat, lng);
        onLocationChange(lat, lng);
      });
    }

    const updateMarker = (lat: number, lng: number) => {
      const newLocation = { lat, lng };
      setCurrentLocation(newLocation);

      const customIcon = L.divIcon({
        className: 'custom-picker-icon',
        html: `<div class="w-8 h-8 bg-pmmg-red rounded-full border-4 border-white flex items-center justify-center shadow-lg ring-2 ring-pmmg-red/50"><span class="material-symbols-outlined text-white text-[18px] fill-icon">pin_drop</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstance.current!);
      }
    };

    if (currentLocation && !markerRef.current) {
        updateMarker(currentLocation.lat, currentLocation.lng);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [initialLat, initialLng]);

  const handleLocateMe = () => {
    if (navigator.geolocation && mapInstance.current) {
      mapInstance.current.locate({ setView: true, maxZoom: 15 });
      mapInstance.current.once('locationfound', (e) => {
        const { lat, lng } = e.latlng;
        const customIcon = L.divIcon({
            className: 'custom-picker-icon',
            html: `<div class="w-8 h-8 bg-pmmg-red rounded-full border-4 border-white flex items-center justify-center shadow-lg ring-2 ring-pmmg-red/50"><span class="material-symbols-outlined text-white text-[18px] fill-icon">pin_drop</span></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });

        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else {
            markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstance.current!);
        }
        setCurrentLocation({ lat, lng });
        onLocationChange(lat, lng);
      });
    }
  };

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-pmmg-navy/20 shadow-inner">
      <div ref={mapRef} className="w-full h-full z-0" />
      <div className="absolute top-3 right-3 z-[500]">
        <button 
          onClick={handleLocateMe}
          className="bg-pmmg-navy text-white p-2 rounded-full shadow-lg active:scale-95 transition-transform flex items-center gap-1 text-[10px] font-bold uppercase"
        >
          <span className="material-symbols-outlined text-lg">my_location</span>
        </button>
      </div>
      <div className="absolute bottom-3 left-3 right-3 z-[500] bg-pmmg-navy/80 backdrop-blur-sm text-white p-2 rounded-xl text-center shadow-lg">
        <p className="text-[9px] font-bold uppercase tracking-widest">
          {currentLocation ? `Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)}` : 'Clique no mapa para definir a localização'}
        </p>
      </div>
    </div>
  );
};

export default MapLocationPicker;