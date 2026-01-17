import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Screen, Suspect, CustomMarker } from '../types';
import BottomNav from '../components/BottomNav';

interface TacticalMapProps {
  navigateTo: (screen: Screen) => void;
  suspects: Suspect[];
  onOpenProfile: (id: string) => void;
  initialCenter?: [number, number] | null;
  customMarkers: CustomMarker[];
  addCustomMarker: (marker: CustomMarker) => void;
}

type MapFilter = 'Todos' | 'Foragido' | 'Suspeito' | 'Preso' | 'CPF Cancelado';

const TacticalMap: React.FC<TacticalMapProps> = ({ navigateTo, suspects, onOpenProfile, initialCenter, customMarkers, addCustomMarker }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const customMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [activeFilter, setActiveFilter] = useState<MapFilter>('Todos');
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [newMarkerData, setNewMarkerData] = useState<{ lat: number, lng: number, title: string, description: string, icon: string, color: string } | null>(null);

  // Filtragem dos suspeitos
  const filteredSuspects = suspects.filter(s => 
    (s.showOnMap === undefined || s.showOnMap === true) && 
    (activeFilter === 'Todos' || s.status === activeFilter)
  );

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (isAddingMarker) {
      setNewMarkerData({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        title: 'Novo Ponto Tático',
        description: 'Detalhes do ponto de interesse.',
        icon: 'flag',
        color: 'bg-pmmg-gold'
      });
      setIsAddingMarker(false);
    }
  };

  const handleSaveNewMarker = () => {
    if (newMarkerData) {
      const marker: CustomMarker = {
        ...newMarkerData,
        id: Date.now().toString(),
      };
      addCustomMarker(marker);
      setNewMarkerData(null);
    }
  };

  const handleCancelNewMarker = () => {
    setNewMarkerData(null);
    setIsAddingMarker(false);
  };

  // 1. Inicialização do Mapa (Roda apenas uma vez)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const fallbackPos: [number, number] = [-19.9167, -43.9345];
    const startPos = initialCenter || fallbackPos;
    
    mapInstanceRef.current = L.map(mapContainerRef.current, {
      center: startPos,
      zoom: initialCenter ? 17 : 14,
      zoomControl: false 
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapInstanceRef.current);

    markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    customMarkersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);

    // Localização do usuário
    if (navigator.geolocation) {
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

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Gerenciamento do Listener de Clique (Depende de isAddingMarker)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isAddingMarker) {
      map.on('click', handleMapClick);
    } else {
      map.off('click', handleMapClick);
    }

    return () => {
      map.off('click', handleMapClick);
    };
  }, [isAddingMarker]);


  // 3. Atualização de Marcadores de Suspeitos (Depende de filteredSuspects)
  useEffect(() => {
    if (!markersLayerRef.current) return;
    
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

        if (initialCenter && suspect.lat === initialCenter[0] && suspect.lng === initialCenter[1]) {
          marker.openPopup();
        }
      }
    });
  }, [filteredSuspects, initialCenter, activeFilter, onOpenProfile]);

  // 4. Atualização de Marcadores Personalizados (Depende de customMarkers)
  useEffect(() => {
    if (!customMarkersLayerRef.current) return;
    
    customMarkersLayerRef.current.clearLayers();

    customMarkers.forEach(markerData => {
      const customIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: `<div class="w-8 h-8 ${markerData.color} rounded-full border-2 border-white flex items-center justify-center shadow-lg"><span class="material-symbols-outlined text-white text-[16px] fill-icon">${markerData.icon}</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([markerData.lat, markerData.lng], { icon: customIcon }).addTo(customMarkersLayerRef.current!);
      
      const popupContent = `
        <div class="p-2 min-w-[150px]">
          <p class="font-bold text-[11px] text-pmmg-navy uppercase leading-tight">${markerData.title}</p>
          <p class="text-[10px] text-slate-600 mt-1">${markerData.description}</p>
        </div>
      `;
      marker.bindPopup(popupContent);
    });
  }, [customMarkers]);

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
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAddingMarker(true)}
              className={`p-2 rounded-full border transition-all ${isAddingMarker ? 'bg-pmmg-red text-white border-pmmg-red shadow-lg' : 'bg-white/10 text-white border-white/20'}`}
            >
              <span className="material-symbols-outlined text-lg">add_location_alt</span>
            </button>
            <button onClick={recenter} className="bg-white/10 p-2 rounded-full border border-white/20 text-white active:bg-white/20">
              <span className="material-symbols-outlined text-lg">my_location</span>
            </button>
          </div>
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
              <span className="text-[10px] font-black text-white uppercase">{filteredSuspects.length + customMarkers.length} Alvos/Pontos Táticos</span>
            </div>
            <div className="h-6 w-px bg-white/20"></div>
            <span className="text-pmmg-yellow material-symbols-outlined text-sm animate-pulse">radar</span>
          </div>
        </div>
        
        {/* Adding Marker Mode Indicator */}
        {isAddingMarker && (
          <div className="absolute inset-0 z-[1001] bg-black/30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-2xl text-center max-w-xs">
              <span className="material-symbols-outlined text-pmmg-red text-4xl mb-2">pin_drop</span>
              <p className="text-sm font-bold text-pmmg-navy uppercase">Modo de Adição Ativo</p>
              <p className="text-xs text-slate-600 mt-2">Clique em qualquer ponto do mapa para posicionar o novo marcador tático.</p>
              <button 
                onClick={() => setIsAddingMarker(false)}
                className="mt-4 w-full bg-pmmg-red text-white py-2 rounded-lg text-xs font-bold uppercase"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* New Marker Configuration Modal */}
        {newMarkerData && (
          <div className="absolute inset-0 z-[1002] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white p-5 rounded-xl shadow-2xl w-full max-w-sm">
              <h3 className="text-lg font-bold text-pmmg-navy uppercase mb-4 border-b pb-2">Configurar Marcador</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1">Título</label>
                  <input 
                    value={newMarkerData.title}
                    onChange={(e) => setNewMarkerData({...newMarkerData, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1">Descrição</label>
                  <textarea 
                    value={newMarkerData.description}
                    onChange={(e) => setNewMarkerData({...newMarkerData, description: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1">Ícone ({newMarkerData.icon})</label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {['flag', 'warning', 'shield', 'camera', 'bolt', 'visibility'].map(icon => (
                      <button 
                        key={icon}
                        onClick={() => setNewMarkerData({...newMarkerData, icon})}
                        className={`p-2 rounded-lg border transition-all ${newMarkerData.icon === icon ? 'bg-pmmg-navy text-pmmg-yellow border-pmmg-yellow' : 'bg-slate-100 text-pmmg-navy/50'}`}
                      >
                        <span className="material-symbols-outlined text-xl">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1">Cor</label>
                  <div className="flex gap-2">
                    {[{c: 'bg-pmmg-gold', v: 'pmmg-gold'}, {c: 'bg-pmmg-red', v: 'pmmg-red'}, {c: 'bg-pmmg-blue', v: 'pmmg-blue'}, {c: 'bg-green-500', v: 'green-500'}].map(color => (
                      <button 
                        key={color.v}
                        onClick={() => setNewMarkerData({...newMarkerData, color: `bg-${color.v}`})}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${color.c} ${newMarkerData.color === `bg-${color.v}` ? 'ring-4 ring-offset-2 ring-pmmg-navy' : 'border-white'}`}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={handleCancelNewMarker}
                  className="flex-1 bg-slate-200 text-pmmg-navy font-bold py-3 rounded-xl text-xs uppercase"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveNewMarker}
                  className="flex-1 bg-pmmg-navy text-white font-bold py-3 rounded-xl text-xs uppercase"
                >
                  Salvar Ponto
                </button>
              </div>
            </div>
          </div>
        )}

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
            <div className="flex items-center gap-2">
               <div className="w-3.5 h-3.5 bg-pmmg-gold rounded-full border-2 border-white shadow-sm ring-1 ring-pmmg-gold/30"></div>
               <span className="text-[9px] font-bold text-pmmg-navy uppercase">Ponto Tático</span>
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