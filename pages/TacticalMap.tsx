
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Screen, Suspect } from '../types';
import BottomNav from '../components/BottomNav';

interface TacticalMapProps {
  navigateTo: (screen: Screen) => void;
  suspects: Suspect[];
  onOpenProfile: (id: string) => void;
  initialCenter?: [number, number] | null;
}

type MapFilter = 'Todos' | 'Foragido' | 'Suspeito' | 'Preso' | 'CPF Cancelado';

const TacticalMap: React.FC<TacticalMapProps> = ({ navigateTo, suspects, onOpenProfile, initialCenter }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [activeFilter, setActiveFilter] = useState<MapFilter>('Todos');

  // Filtragem dos suspeitos com base no estado do filtro
  const filteredSuspects = suspects.filter(s => 
    activeFilter === 'Todos' || s.status === activeFilter
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const fallbackPos: [number, number] = [-19.9167, -43.9345];
    const startPos = initialCenter || fallbackPos;
    
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: startPos,
        zoom: initialCenter ? 17 : 14,
        zoomControl: false 
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstanceRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    // Localização do usuário
    if (navigator.geolocation && !userPos) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPos([latitude, longitude]);
          
          if (!initialCenter && mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 15);
          }
          
          const officerIcon = L.divIcon({
            className: 'custom-officer-icon',
            html: `<div class="w-8 h-8 bg-pmmg-blue rounded-full border-4 border-white flex items-center justify-center shadow-lg ring-2 ring-pmmg-blue/50"><span class="material-symbols-outlined text-white text-[18px]">person</span></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });
          L.marker([latitude, longitude], { icon: officerIcon }).addTo(mapInstanceRef.current!).bindPopup("Você (Oficial)");
        }
      );
    }

    // Atualizar marcadores toda vez que o filtro ou os suspeitos mudarem
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
      
      filteredSuspects.forEach(suspect => {
        if (suspect.lat && suspect.lng) {
          const iconColorClass = suspect.status === 'Foragido' ? 'bg-pmmg-red' : 
                               suspect.status === 'Suspeito' ? 'bg-pmmg-yellow' : 'bg-slate-600';
          
          const suspectIcon = L.divIcon({
            className: 'custom-suspect-icon',
            html: `<div class="w-10 h-10 ${iconColorClass} rounded-lg border-2 border-pmmg-navy flex items-center justify-center shadow-lg transform rotate-45"><span class="material-symbols-outlined text-pmmg-navy text-[20px] transform -rotate-45">priority_high</span></div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          });

          const marker = L.marker([suspect.lat, suspect.lng], { icon: suspectIcon }).addTo(markersLayerRef.current!);
          
          const popupContent = document.createElement('div');
          popupContent.className = "p-2 min-w-[150px]";
          popupContent.innerHTML = `
            <div class="flex items-center gap-2 mb-2">
              <div class="w-10 h-10 rounded bg-slate-200 overflow-hidden"><img src="${suspect.photoUrl}" class="w-full h-full object-cover"></div>
              <div>
                <p class="font-bold text-[10px] text-pmmg-navy uppercase leading-tight">${suspect.name}</p>
                <p class="text-[9px] text-slate-500 font-bold uppercase">${suspect.status}</p>
              </div>
            </div>
            <button id="btn-${suspect.id}" class="w-full bg-pmmg-navy text-white text-[9px] font-bold py-1.5 rounded uppercase tracking-wider">Ver Ficha</button>
          `;

          marker.bindPopup(popupContent);
          
          marker.on('popupopen', () => {
            document.getElementById(`btn-${suspect.id}`)?.addEventListener('click', () => {
              onOpenProfile(suspect.id);
            });
          });

          if (initialCenter && initialCenter[0] === suspect.lat && initialCenter[1] === suspect.lng) {
            marker.openPopup();
          }
        }
      });
    }

  }, [filteredSuspects, initialCenter, activeFilter]);

  const recenter = () => {
    if (userPos && mapInstanceRef.current) {
      mapInstanceRef.current.setView(userPos, 16);
    }
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-[1000] bg-pmmg-navy px-4 py-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 shrink-0 bg-white rounded-full flex items-center justify-center p-1 border-2 border-pmmg-red">
              <span className="material-symbols-outlined text-pmmg-navy text-xl">map</span>
            </div>
            <div>
              <h1 className="font-bold text-xs leading-none text-white uppercase tracking-tight">Mapa Tático</h1>
              <p className="text-[9px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Inteligência Territorial</p>
            </div>
          </div>
          <button onClick={recenter} className="bg-white/10 p-2 rounded-full border border-white/20 text-white active:bg-white/20">
            <span className="material-symbols-outlined text-lg">my_location</span>
          </button>
        </div>

        {/* Tactical Filters Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['Todos', 'Foragido', 'Suspeito', 'Preso'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter as MapFilter)}
              className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                activeFilter === filter 
                ? 'bg-pmmg-yellow text-pmmg-navy border-pmmg-yellow' 
                : 'bg-white/10 text-white/60 border-white/10'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />
        
        {/* Floating Counter */}
        <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
          <div className="bg-pmmg-navy/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-pmmg-yellow/30 flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-pmmg-yellow uppercase tracking-[0.2em]">Monitoramento</span>
              <span className="text-[10px] font-black text-white uppercase">{filteredSuspects.length} Alvos na Região</span>
            </div>
            <div className="h-6 w-px bg-white/20"></div>
            <span className="text-pmmg-yellow material-symbols-outlined text-sm animate-pulse">radar</span>
          </div>
        </div>

        {/* Interactive Legend */}
        <div className="absolute bottom-32 right-4 z-[1000]">
          <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-pmmg-navy/10 flex flex-col gap-2.5">
            <p className="text-[8px] font-black text-pmmg-navy/40 uppercase tracking-widest border-b border-pmmg-navy/5 pb-1 mb-1">Legenda Tática</p>
            <button 
              onClick={() => setActiveFilter('Foragido')}
              className={`flex items-center gap-2 group transition-opacity ${activeFilter !== 'Todos' && activeFilter !== 'Foragido' ? 'opacity-40' : 'opacity-100'}`}
            >
               <div className="w-3.5 h-3.5 bg-pmmg-red rounded shadow-sm border border-black/10"></div>
               <span className="text-[9px] font-bold text-pmmg-navy uppercase group-hover:underline">Foragido</span>
            </button>
            <button 
              onClick={() => setActiveFilter('Suspeito')}
              className={`flex items-center gap-2 group transition-opacity ${activeFilter !== 'Todos' && activeFilter !== 'Suspeito' ? 'opacity-40' : 'opacity-100'}`}
            >
               <div className="w-3.5 h-3.5 bg-pmmg-yellow rounded shadow-sm border border-black/10"></div>
               <span className="text-[9px] font-bold text-pmmg-navy uppercase group-hover:underline">Suspeito</span>
            </button>
            <div className="flex items-center gap-2">
               <div className="w-3.5 h-3.5 bg-pmmg-blue rounded-full border-2 border-white shadow-sm ring-1 ring-pmmg-blue/30"></div>
               <span className="text-[9px] font-bold text-pmmg-navy uppercase">Oficial</span>
            </div>
            {activeFilter !== 'Todos' && (
              <button 
                onClick={() => setActiveFilter('Todos')}
                className="mt-1 text-[8px] font-black text-pmmg-red uppercase border-t border-pmmg-navy/5 pt-2"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        </div>
      </div>

      <BottomNav activeScreen="map" navigateTo={navigateTo} />
    </div>
  );
};

export default TacticalMap;
