import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  updateCustomMarker: (marker: CustomMarker) => void;
  deleteCustomMarker: (id: string) => void;
}

type MapFilter = 'Todos' | 'Foragido' | 'Suspeito' | 'Preso' | 'CPF Cancelado';

const ZOOM_THRESHOLD = 15; // Nível de zoom para alternar para fotos

const TacticalMap: React.FC<TacticalMapProps> = ({ navigateTo, suspects, onOpenProfile, initialCenter, customMarkers, addCustomMarker, updateCustomMarker, deleteCustomMarker }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const customMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [activeFilter, setActiveFilter] = useState<MapFilter>('Todos');
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [newMarkerData, setNewMarkerData] = useState<Omit<CustomMarker, 'id'> | null>(null);
  const [editingMarker, setEditingMarker] = useState<CustomMarker | null>(null);
  const [currentZoom, setCurrentZoom] = useState(14); // Estado para rastrear o zoom
  const [isLegendOpen, setIsLegendOpen] = useState(false); // Novo estado para a barra de legenda

  // Filtragem dos suspeitos
  const filteredSuspects = suspects.filter(s => 
    (s.showOnMap === undefined || s.showOnMap === true) && 
    (activeFilter === 'Todos' || s.status === activeFilter)
  );

  // Variável de controle de zoom acessível no JSX
  const usePhotoMarker = currentZoom >= ZOOM_THRESHOLD;

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
      } as CustomMarker; // Casting para garantir que o tipo está correto
      addCustomMarker(marker);
      setNewMarkerData(null);
    }
  };

  const handleSaveEditMarker = () => {
    if (editingMarker) {
      updateCustomMarker(editingMarker);
      setEditingMarker(null);
    }
  };

  const handleCancelNewMarker = () => {
    setNewMarkerData(null);
    setIsAddingMarker(false);
    setEditingMarker(null);
  };

  const handleDeleteMarker = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este ponto tático?")) {
      deleteCustomMarker(id);
      // Fechar o popup se estiver aberto
      mapInstanceRef.current?.closePopup();
    }
  };
  
  // Função para simular o compartilhamento de localização
  const handleShareLocation = useCallback((lat: number, lng: number, title: string) => {
    const locationLink = `https://maps.google.com/maps?q=${lat},${lng}`;
    alert(`Localização de ${title} pronta para compartilhamento:\n\nCoordenadas: ${lat.toFixed(5)}, ${lng.toFixed(5)}\nLink (Simulado): ${locationLink}`);
  }, []);


  // 1. Inicialização do Mapa e Listeners de Zoom (Roda apenas uma vez)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const fallbackPos: [number, number] = [-19.9167, -43.9345];
    const startPos = initialCenter || fallbackPos;
    
    const map = L.map(mapContainerRef.current, {
      center: startPos,
      zoom: initialCenter ? 17 : 14,
      zoomControl: false 
    });
    mapInstanceRef.current = map;
    setCurrentZoom(map.getZoom()); // Inicializa o estado de zoom

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    customMarkersLayerRef.current = L.layerGroup().addTo(map);

    // Listener para atualizar o zoom
    const handleZoomChange = () => {
      setCurrentZoom(map.getZoom());
    };
    map.on('zoomend', handleZoomChange);

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
          L.marker([latitude, longitude], { icon: officerIcon }).addTo(map).bindPopup("Você (Oficial)");
        }
      );
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('zoomend', handleZoomChange);
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initialCenter]);

  // 2. Gerenciamento do Listener de Clique e Cursor (Depende de isAddingMarker)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isAddingMarker) {
      map.on('click', handleMapClick);
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.off('click', handleMapClick);
      map.getContainer().style.cursor = '';
    }

    return () => {
      map.off('click', handleMapClick);
      map.getContainer().style.cursor = '';
    };
  }, [isAddingMarker]);


  // 3. Atualização de Marcadores de Suspeitos (Depende de filteredSuspects E currentZoom)
  useEffect(() => {
    if (!markersLayerRef.current) return;
    
    markersLayerRef.current.clearLayers();
    
    const localUsePhotoMarker = currentZoom >= ZOOM_THRESHOLD;

    filteredSuspects.forEach(suspect => {
      if (suspect.lat && suspect.lng) {
        
        let suspectIcon;
        
        if (localUsePhotoMarker) {
            // Photo Marker (Zoomed In)
            const borderColorClass = suspect.status === 'Foragido' ? 'border-pmmg-red' : 
                                     suspect.status === 'Suspeito' ? 'border-pmmg-yellow' : 'border-pmmg-navy';
            
            const suspectIconHtml = `
              <div class="w-10 h-10 bg-white shadow-xl border-4 ${borderColorClass} overflow-hidden ring-2 ring-white/50 rounded-lg">
                <img src="${suspect.photoUrl}" class="w-full h-full object-cover" alt="${suspect.name}">
              </div>
            `;
            
            suspectIcon = L.divIcon({
              className: 'custom-suspect-photo-icon',
              html: suspectIconHtml,
              iconSize: [48, 48],
              iconAnchor: [24, 24]
            });
        } else {
            // Simple Icon Marker (Zoomed Out)
            const colorClass = suspect.status === 'Foragido' ? 'bg-pmmg-red' : 
                               suspect.status === 'Suspeito' ? 'bg-pmmg-yellow' : 'bg-pmmg-navy';
            const iconName = suspect.status === 'Foragido' ? 'priority_high' : 'warning';
            
            const simpleIconHtml = `
              <div class="w-6 h-6 ${colorClass} rounded-full border-2 border-white flex items-center justify-center shadow-md">
                <span class="material-symbols-outlined text-white text-[14px] fill-icon">${iconName}</span>
              </div>
            `;
            
            suspectIcon = L.divIcon({
              className: 'custom-suspect-simple-icon',
              html: simpleIconHtml,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
        }

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
          <div class="flex gap-2 mt-3">
            <button id="btn-profile-${suspect.id}" class="flex-1 bg-pmmg-navy text-white text-[9px] font-bold py-1.5 rounded uppercase tracking-wider">Ver Ficha</button>
            <button id="btn-share-suspect-${suspect.id}" class="px-3 border-2 border-pmmg-navy/20 rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-pmmg-navy text-lg">share</span>
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);
        
        marker.on('popupopen', () => {
          document.getElementById(`btn-profile-${suspect.id}`)?.addEventListener('click', () => {
            onOpenProfile(suspect.id);
          });
          // New listener for sharing suspect location
          document.getElementById(`btn-share-suspect-${suspect.id}`)?.addEventListener('click', () => {
            if (suspect.lat && suspect.lng) {
              handleShareLocation(suspect.lat, suspect.lng, suspect.name);
            }
          });
        });

        if (initialCenter && suspect.lat === initialCenter[0] && suspect.lng === initialCenter[1]) {
          marker.openPopup();
        }
      }
    });
  }, [filteredSuspects, initialCenter, activeFilter, onOpenProfile, currentZoom, handleShareLocation]);

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
      
      const popupContent = document.createElement('div');
      popupContent.className = "p-2 min-w-[150px]";
      popupContent.innerHTML = `
        <div class="p-2 min-w-[150px]">
          <p class="font-bold text-[11px] text-pmmg-navy uppercase leading-tight">${markerData.title}</p>
          <p class="text-[10px] text-slate-600 mt-1">${markerData.description}</p>
          <div class="flex gap-2 mt-3">
            <button id="edit-btn-${markerData.id}" class="flex-1 bg-pmmg-navy text-white text-[9px] font-bold py-1.5 rounded uppercase tracking-wider flex items-center justify-center">
              <span class="material-symbols-outlined text-sm">edit</span>
            </button>
            <button id="share-btn-${markerData.id}" class="flex-1 bg-pmmg-blue text-white text-[9px] font-bold py-1.5 rounded uppercase tracking-wider flex items-center justify-center">
              <span class="material-symbols-outlined text-sm">share</span>
            </button>
            <button id="delete-btn-${markerData.id}" class="px-3 bg-pmmg-red text-white text-[9px] font-bold py-1.5 rounded uppercase tracking-wider flex items-center justify-center">
              <span class="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        document.getElementById(`edit-btn-${markerData.id}`)?.addEventListener('click', () => {
          setEditingMarker(markerData);
          mapInstanceRef.current?.closePopup();
        });
        document.getElementById(`delete-btn-${markerData.id}`)?.addEventListener('click', () => {
          handleDeleteMarker(markerData.id);
        });
        // New listener for sharing custom marker location
        document.getElementById(`share-btn-${markerData.id}`)?.addEventListener('click', () => {
          handleShareLocation(markerData.lat, markerData.lng, markerData.title);
        });
      });
    });
  }, [customMarkers, handleDeleteMarker, handleShareLocation]);

  const recenter = () => {
    if (userPos && mapInstanceRef.current) {
      mapInstanceRef.current.setView(userPos, 16);
    }
  };

  // Determina qual modal de configuração exibir (Novo ou Edição)
  const activeMarkerData = newMarkerData || editingMarker;
  const isEditing = !!editingMarker;

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-[1000] bg-pmmg-navy px-4 py-4 shadow-xl">
        <div className="flex items-center justify-between">
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
              onClick={() => {
                setIsAddingMarker(prev => !prev);
                setNewMarkerData(null); 
                setEditingMarker(null);
              }}
              className={`p-2 rounded-full border transition-all ${isAddingMarker ? 'bg-pmmg-red text-white border-pmmg-red shadow-lg' : 'bg-white/10 text-white border-white/20'}`}
            >
              <span className="material-symbols-outlined text-lg">add_location_alt</span>
            </button>
            <button onClick={recenter} className="bg-white/10 p-2 rounded-full border border-white/20 text-white active:bg-white/20">
              <span className="material-symbols-outlined text-lg">my_location</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />
        
        {/* Adding Marker Mode Indicator (Non-blocking) */}
        {isAddingMarker && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1001] pointer-events-none">
            <div className="bg-pmmg-red text-white p-2 rounded-full shadow-xl border-4 border-white animate-pulse">
              <span className="material-symbols-outlined text-3xl">pin_drop</span>
            </div>
          </div>
        )}

        {/* Marker Configuration Modal (New or Edit) */}
        {activeMarkerData && (
          <div className="absolute inset-0 z-[1002] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white p-5 rounded-xl shadow-2xl w-full max-w-sm">
              <h3 className="text-lg font-bold text-pmmg-navy uppercase mb-4 border-b pb-2">
                {isEditing ? 'Editar Marcador Tático' : 'Configurar Novo Marcador'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1">Título</label>
                  <input 
                    value={activeMarkerData.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      if (isEditing) {
                        setEditingMarker(prev => prev ? {...prev, title: newTitle} : null);
                      } else {
                        setNewMarkerData(prev => prev ? {...prev, title: newTitle} : null);
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1">Descrição</label>
                  <textarea 
                    value={activeMarkerData.description}
                    onChange={(e) => {
                      const newDescription = e.target.value;
                      if (isEditing) {
                        setEditingMarker(prev => prev ? {...prev, description: newDescription} : null);
                      } else {
                        setNewMarkerData(prev => prev ? {...prev, description: newDescription} : null);
                      }
                    }}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1">Ícone ({activeMarkerData.icon})</label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {['flag', 'warning', 'shield', 'camera', 'bolt', 'visibility'].map(icon => (
                      <button 
                        key={icon}
                        onClick={() => {
                          if (isEditing) {
                            setEditingMarker(prev => prev ? {...prev, icon} : null);
                          } else {
                            setNewMarkerData(prev => prev ? {...prev, icon} : null);
                          }
                        }}
                        className={`p-2 rounded-lg border transition-all ${activeMarkerData.icon === icon ? 'bg-pmmg-navy text-pmmg-yellow border-pmmg-yellow' : 'bg-slate-100 text-pmmg-navy/50'}`}
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
                        onClick={() => {
                          const newColor = `bg-${color.v}`;
                          if (isEditing) {
                            setEditingMarker(prev => prev ? {...prev, color: newColor} : null);
                          } else {
                            setNewMarkerData(prev => prev ? {...prev, color: newColor} : null);
                          }
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${color.c} ${activeMarkerData.color === `bg-${color.v}` ? 'ring-4 ring-offset-2 ring-pmmg-navy' : 'border-white'}`}
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
                  onClick={isEditing ? handleSaveEditMarker : handleSaveNewMarker}
                  className="flex-1 bg-pmmg-navy text-white font-bold py-3 rounded-xl text-xs uppercase"
                >
                  {isEditing ? 'Salvar Edição' : 'Salvar Ponto'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Legend Bar (Fixed above BottomNav) */}
        <div className={`absolute bottom-0 left-0 right-0 z-40 max-w-md mx-auto transition-transform duration-300 ${isLegendOpen ? 'translate-y-[-100px]' : 'translate-y-[100%]'}`}>
          <div className="bg-white/95 backdrop-blur-md p-3 rounded-t-2xl shadow-2xl border-t border-pmmg-navy/10">
            <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
              <p className="text-[8px] font-black text-pmmg-navy/40 uppercase tracking-widest w-full text-center mb-1">Legenda Tática</p>
              
              {/* Foragido */}
              <button 
                onClick={() => setActiveFilter('Foragido')}
                className={`flex items-center gap-1 group transition-opacity ${activeFilter !== 'Todos' && activeFilter !== 'Foragido' ? 'opacity-40' : 'opacity-100'}`}
              >
                 <div className={`w-3 h-3 ${usePhotoMarker ? 'rounded-sm border-2 bg-slate-300' : 'rounded-full bg-pmmg-red flex items-center justify-center'} border-pmmg-red shadow-sm`}>
                   {!usePhotoMarker && <span className="material-symbols-outlined text-white text-[8px] fill-icon">priority_high</span>}
                 </div>
                 <span className="text-[8px] font-bold text-pmmg-navy uppercase group-hover:underline">Foragido</span>
              </button>
              
              {/* Suspeito */}
              <button 
                onClick={() => setActiveFilter('Suspeito')}
                className={`flex items-center gap-1 group transition-opacity ${activeFilter !== 'Todos' && activeFilter !== 'Suspeito' ? 'opacity-40' : 'opacity-100'}`}
              >
                 <div className={`w-3 h-3 ${usePhotoMarker ? 'rounded-sm border-2 bg-slate-300' : 'rounded-full bg-pmmg-yellow flex items-center justify-center'} border-pmmg-yellow shadow-sm`}>
                   {!usePhotoMarker && <span className="material-symbols-outlined text-pmmg-navy text-[8px] fill-icon">warning</span>}
                 </div>
                 <span className="text-[8px] font-bold text-pmmg-navy uppercase group-hover:underline">Suspeito</span>
              </button>
              
              {/* Oficial */}
              <div className="flex items-center gap-1">
                 <div className="w-3 h-3 bg-pmmg-blue rounded-full border-2 border-white shadow-sm ring-1 ring-pmmg-blue/50"></div>
                 <span className="text-[8px] font-bold text-pmmg-navy uppercase">Oficial</span>
              </div>
              
              {/* Ponto Tático */}
              <div className="flex items-center gap-1">
                 <div className="w-3 h-3 bg-pmmg-gold rounded-full border-2 border-white shadow-sm ring-1 ring-pmmg-gold/30"></div>
                 <span className="text-[8px] font-bold text-pmmg-navy uppercase">Ponto Tático</span>
              </div>
              
              {activeFilter !== 'Todos' && (
                <button 
                  onClick={() => setActiveFilter('Todos')}
                  className="text-[8px] font-black text-pmmg-red uppercase ml-2"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Toggle Button for Legend Bar */}
        <button 
          onClick={() => setIsLegendOpen(prev => !prev)}
          className="absolute bottom-20 right-6 z-[1001] w-16 h-6 bg-pmmg-navy text-pmmg-yellow rounded-t-xl shadow-xl flex items-center justify-center border-t-4 border-x-4 border-white active:scale-95 transition-transform"
        >
          <span className={`material-symbols-outlined text-lg transition-transform ${isLegendOpen ? 'rotate-180' : 'rotate-0'}`}>
            keyboard_arrow_up
          </span>
        </button>
      </div>

      <BottomNav activeScreen="map" navigateTo={navigateTo} />
    </div>
  );
};

export default TacticalMap;