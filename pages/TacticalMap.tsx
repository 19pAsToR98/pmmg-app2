import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Screen, Suspect, CustomMarker } from '../types';
import BottomNav from '../components/BottomNav';
import GoogleMapWrapper from '../components/GoogleMapWrapper';
import { MarkerF, InfoWindowF } from '@react-google-maps/api';
import { ICON_PATHS } from '../utils/iconPaths';

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
type LocationFilter = 'residence' | 'approach';

const ZOOM_THRESHOLD = 15; // Nível de zoom para alternar para fotos

// Default center for BH
const DEFAULT_CENTER = { lat: -19.9167, lng: -43.9345 };

const TacticalMap: React.FC<TacticalMapProps> = ({ navigateTo, suspects, onOpenProfile, initialCenter, customMarkers, addCustomMarker, updateCustomMarker, deleteCustomMarker }) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  
  const [userPos, setUserPos] = useState<{ lat: number, lng: number } | null>(null);
  const [activeFilter, setActiveFilter] = useState<MapFilter>('Todos');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('residence');
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [newMarkerData, setNewMarkerData] = useState<Omit<CustomMarker, 'id'> | null>(null);
  const [editingMarker, setEditingMarker] = useState<CustomMarker | null>(null);
  const [currentZoom, setCurrentZoom] = useState(initialCenter ? 17 : 14);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null); // ID do marcador com InfoWindow aberta

  // Center state managed by initialCenter prop or user position
  const center = initialCenter ? { lat: initialCenter[0], lng: initialCenter[1] } : userPos || DEFAULT_CENTER;

  // Filtragem dos suspeitos
  const filteredSuspects = suspects.filter(s => 
    (s.showOnMap === undefined || s.showOnMap === true) && 
    (activeFilter === 'Todos' || s.status === activeFilter)
  );

  const usePhotoMarker = currentZoom >= ZOOM_THRESHOLD;

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    map.addListener('zoom_changed', () => {
      setCurrentZoom(map.getZoom());
    });
    
    // Se houver um initialCenter, abre o InfoWindow correspondente
    if (initialCenter) {
        // Find the suspect or custom marker at the initial center
        const targetSuspect = filteredSuspects.find(s => 
            (locationFilter === 'residence' && s.lat === initialCenter[0] && s.lng === initialCenter[1]) ||
            (locationFilter === 'approach' && s.approachLat === initialCenter[0] && s.approachLng === initialCenter[1])
        );
        if (targetSuspect) {
            setActiveInfoWindow(`suspect-${targetSuspect.id}`);
        } else {
            const targetCustom = customMarkers.find(m => m.lat === initialCenter[0] && m.lng === initialCenter[1]);
            if (targetCustom) {
                setActiveInfoWindow(`custom-${targetCustom.id}`);
            }
        }
    }

  }, [initialCenter, filteredSuspects, customMarkers, locationFilter]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    setActiveInfoWindow(null); // Fecha qualquer InfoWindow aberta
    
    if (isAddingMarker && e.latLng) {
      setNewMarkerData({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
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
      } as CustomMarker;
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
      setActiveInfoWindow(null);
    }
  };
  
  const handleShareLocation = useCallback((lat: number, lng: number, title: string) => {
    const locationLink = `https://maps.google.com/maps?q=${lat},${lng}`;
    alert(`Localização de ${title} pronta para compartilhamento:\n\nCoordenadas: ${lat.toFixed(5)}, ${lng.toFixed(5)}\nLink (Simulado): ${locationLink}`);
  }, []);

  // User Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPos({ lat: position.coords.latitude, lng: position.coords.longitude });
        }
      );
    }
  }, []);

  const recenter = () => {
    if (userPos && mapRef.current) {
      mapRef.current.setCenter(userPos);
      mapRef.current.setZoom(16);
    }
  };

  const getSuspectIcon = (suspect: Suspect) => {
    if (typeof window === 'undefined' || !window.google || !window.google.maps) return undefined; // Safety check

    if (usePhotoMarker) {
      // Photo Marker (Zoomed In)
      return {
        url: suspect.photoUrl,
        scaledSize: new window.google.maps.Size(40, 40),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(20, 20),
        labelOrigin: new window.google.maps.Point(20, 45),
      };
    } else {
      // Simple Icon Marker (Zoomed Out)
      let colorClass: string;
      let iconName: string;
      let textColor: string;

      switch (suspect.status) {
        case 'Foragido':
          colorClass = '#e31c1c'; // pmmg-red
          iconName = 'priority_high';
          textColor = '#ffffff';
          break;
        case 'Suspeito':
          colorClass = '#ffcc00'; // pmmg-yellow
          iconName = 'warning';
          textColor = '#002147'; // pmmg-navy (para contraste no amarelo)
          break;
        case 'Preso':
          colorClass = '#0047ab'; // pmmg-blue
          iconName = 'lock';
          textColor = '#ffffff';
          break;
        case 'CPF Cancelado':
          colorClass = '#475569'; // slate-600
          iconName = 'cancel';
          textColor = '#ffffff';
          break;
        default:
          colorClass = '#002147'; // pmmg-navy
          iconName = 'person';
          textColor = '#ffffff';
      }
      
      // Se o filtro de localização for 'approach', usamos 'pin_drop'
      if (locationFilter === 'approach') {
        iconName = 'pin_drop';
      }
      
      const pathData = ICON_PATHS[iconName] || ICON_PATHS['warning']; // Fallback to warning path
      
      // Usando SVG Path
      const svg = `
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="${colorClass}" stroke="#ffffff" stroke-width="2"/>
          <path d="${pathData}" fill="${textColor}" transform="translate(0 0)"/>
        </svg>
      `;
      
      return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
        scaledSize: new window.google.maps.Size(24, 24),
        anchor: new window.google.maps.Point(12, 12),
      };
    }
  };
  
  const getCustomMarkerIcon = (markerData: CustomMarker) => {
    if (typeof window === 'undefined' || !window.google || !window.google.maps) return undefined; // Safety check

    const colorHex = markerData.color.replace('bg-pmmg-gold', '#d4af37').replace('bg-pmmg-red', '#e31c1c').replace('bg-pmmg-blue', '#0047ab').replace('bg-green-500', '#22c55e');
    
    const pathData = ICON_PATHS[markerData.icon] || ICON_PATHS['flag']; // Fallback to flag path
    
    // Usando SVG Path (32x32 viewBox, path 24x24, scaled and translated)
    const svg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="${colorHex}" stroke="#ffffff" stroke-width="2"/>
        <path d="${pathData}" fill="#ffffff" transform="translate(4 4)"/>
      </svg>
    `;
    
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 16),
    };
  };

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
        <GoogleMapWrapper
          center={center}
          zoom={currentZoom}
          mapContainerClassName="w-full h-full"
          onLoad={handleMapLoad}
          onClick={handleMapClick}
          options={{
            mapTypeId: 'roadmap', // Alterado de 'hybrid' para 'roadmap'
          }}
        >
          {/* Marcador do Usuário (Oficial) */}
          {userPos && (
            <MarkerF
              position={userPos}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#0047ab" stroke="#ffffff" stroke-width="2"/>
                    <path d="${ICON_PATHS['person']}" fill="#ffffff" transform="translate(0 0)"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(32, 32),
                anchor: new window.google.maps.Point(16, 16),
              }}
              title="Você (Oficial)"
              onClick={() => setActiveInfoWindow('user-pos')}
            />
          )}
          
          {activeInfoWindow === 'user-pos' && userPos && (
            <InfoWindowF position={userPos} onCloseClick={() => setActiveInfoWindow(null)}>
              <div className="p-2">
                <p className="font-bold text-pmmg-navy text-sm">Você (Oficial)</p>
                <p className="text-[10px] text-slate-500">Localização Atual</p>
              </div>
            </InfoWindowF>
          )}

          {/* Marcadores de Suspeitos */}
          {filteredSuspects.map(suspect => {
            let lat: number | undefined;
            let lng: number | undefined;
            let locationName: string | undefined;
            let locationType: 'Última Localização' | 'Endereço de Abordagem';
            
            if (locationFilter === 'residence' && suspect.lat && suspect.lng) {
              lat = suspect.lat;
              lng = suspect.lng;
              locationName = suspect.lastSeen;
              locationType = 'Última Localização';
            } else if (locationFilter === 'approach' && suspect.approachLat && suspect.approachLng) {
              lat = suspect.approachLat;
              lng = suspect.lng;
              locationName = suspect.approachAddress;
              locationType = 'Endereço de Abordagem';
            }

            if (lat && lng) {
              const position = { lat, lng };
              const markerId = `suspect-${suspect.id}`;
              
              return (
                <React.Fragment key={markerId}>
                  <MarkerF
                    position={position}
                    icon={getSuspectIcon(suspect)}
                    title={suspect.name}
                    onClick={() => setActiveInfoWindow(markerId)}
                  />
                  
                  {activeInfoWindow === markerId && (
                    <InfoWindowF position={position} onCloseClick={() => setActiveInfoWindow(null)}>
                      <div className="p-2 min-w-[150px]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-10 h-10 rounded bg-slate-200 overflow-hidden"><img src={suspect.photoUrl} className="w-full h-full object-cover" alt={suspect.name} /></div>
                          <div>
                            <p className="font-bold text-[10px] text-pmmg-navy uppercase leading-tight">{suspect.name}</p>
                            <p className="text-[9px] text-pmmg-blue font-bold uppercase">{locationType}</p>
                            <p className="text-[9px] text-slate-500 mt-1">{locationName || 'Local não especificado'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={() => onOpenProfile(suspect.id)} 
                            className="flex-1 bg-pmmg-navy text-white text-[9px] font-bold py-1.5 rounded uppercase tracking-wider"
                          >
                            Ver Ficha
                          </button>
                          <button 
                            onClick={() => handleShareLocation(lat, lng, `${locationType} de ${suspect.name}`)} 
                            className="px-3 border-2 border-pmmg-navy/20 rounded-lg flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-pmmg-navy text-lg">share</span>
                          </button>
                        </div>
                      </div>
                    </InfoWindowF>
                  )}
                </React.Fragment>
              );
            }
            return null;
          })}

          {/* Marcadores Personalizados */}
          {customMarkers.map(markerData => {
            const position = { lat: markerData.lat, lng: markerData.lng };
            const markerId = `custom-${markerData.id}`;
            
            return (
              <React.Fragment key={markerId}>
                <MarkerF
                  position={position}
                  icon={getCustomMarkerIcon(markerData)}
                  title={markerData.title}
                  onClick={() => setActiveInfoWindow(markerId)}
                />
                
                {activeInfoWindow === markerId && (
                  <InfoWindowF position={position} onCloseClick={() => setActiveInfoWindow(null)}>
                    <div className="p-2 min-w-[150px]">
                      <p className="font-bold text-[11px] text-pmmg-navy uppercase leading-tight">{markerData.title}</p>
                      <p className="text-[10px] text-slate-600 mt-1">{markerData.description}</p>
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={() => { setEditingMarker(markerData); setActiveInfoWindow(null); }}
                          className="flex-1 bg-pmmg-navy text-white text-[9px] font-bold py-1.5 rounded uppercase tracking-wider flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button 
                          onClick={() => handleShareLocation(markerData.lat, markerData.lng, markerData.title)}
                          className="flex-1 bg-pmmg-blue text-white text-[9px] font-bold py-1.5 rounded uppercase tracking-wider flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm">share</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteMarker(markerData.id)}
                          className="px-3 bg-pmmg-red text-white text-[9px] font-bold py-1.5 rounded uppercase tracking-wider flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  </InfoWindowF>
                )}
              </React.Fragment>
            );
          })}
          
          {/* Marcador de Adição (Se ativo) */}
          {isAddingMarker && (
            <MarkerF
              position={center}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#e31c1c" stroke="#ffffff" stroke-width="4"/>
                    <path d="${ICON_PATHS['pin_drop']}" fill="#ffffff" transform="translate(8 8) scale(1.0)"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 40), // Anchor slightly lower for pin effect
              }}
              title="Clique no mapa para posicionar"
            />
          )}
        </GoogleMapWrapper>
        
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

        {/* SIDEBAR OCULTÁVEL (Legenda Tática) */}
        <div className={`absolute top-4 right-0 z-[1000] bottom-[100px] transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          {/* Botão de Toggle (Centralizado Verticalmente) */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 bg-pmmg-navy p-1.5 rounded-l-xl shadow-xl text-pmmg-yellow"
          >
            <span className="material-symbols-outlined text-lg">
              {isSidebarOpen ? 'arrow_forward_ios' : 'arrow_back_ios'}
            </span>
          </button>

          {/* Conteúdo do Painel */}
          <div className="bg-white/95 backdrop-blur-md p-3 rounded-l-2xl shadow-2xl border border-pmmg-navy/10 flex flex-col gap-2.5 h-full overflow-y-auto w-64">
            <p className="text-[8px] font-black text-pmmg-navy/40 uppercase tracking-widest border-b border-pmmg-navy/5 pb-1 mb-1">Legenda Tática</p>
            
            {/* --- Filtro de Localização --- */}
            <div className="pt-2 pb-3 border-b border-pmmg-navy/5">
              <p className="text-[9px] font-black text-pmmg-navy/60 uppercase tracking-wider mb-2">Tipo de Localização</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setLocationFilter('residence')}
                  className={`flex-1 text-[9px] font-bold uppercase py-1.5 rounded-lg transition-all ${locationFilter === 'residence' ? 'bg-pmmg-navy text-white shadow-md' : 'bg-slate-100 text-pmmg-navy/70'}`}
                >
                  <span className="material-symbols-outlined text-sm mr-1">location_on</span> Residência
                </button>
                <button 
                  onClick={() => setLocationFilter('approach')}
                  className={`flex-1 text-[9px] font-bold uppercase py-1.5 rounded-lg transition-all ${locationFilter === 'approach' ? 'bg-pmmg-navy text-white shadow-md' : 'bg-slate-100 text-pmmg-navy/70'}`}
                >
                  <span className="material-symbols-outlined text-sm mr-1">pin_drop</span> Abordagem
                </button>
              </div>
            </div>
            
            {/* --- Filtro de Status (Mantido) --- */}
            <p className="text-[8px] font-black text-pmmg-navy/40 uppercase tracking-widest border-b border-pmmg-navy/5 pb-1 mb-1 pt-2">Filtro por Status</p>

            {/* Foragido (Photo style) */}
            <div className="flex items-center gap-2">
               <div className={`w-4 h-4 ${usePhotoMarker ? 'rounded-md border-2 bg-slate-300' : 'rounded-full bg-pmmg-red flex items-center justify-center'} border-pmmg-red shadow-sm`}>
                 {!usePhotoMarker && <span className="material-symbols-outlined text-white text-[10px] fill-icon">priority_high</span>}
               </div>
               <span className="text-[9px] font-bold text-pmmg-navy uppercase">Foragido</span>
            </div>
            
            {/* Suspeito (Photo style) */}
            <div className="flex items-center gap-2">
               <div className={`w-4 h-4 ${usePhotoMarker ? 'rounded-md border-2 bg-slate-300' : 'rounded-full bg-pmmg-yellow flex items-center justify-center'} border-pmmg-yellow shadow-sm`}>
                 {!usePhotoMarker && <span className="material-symbols-outlined text-pmmg-navy text-[10px] fill-icon">warning</span>}
               </div>
               <span className="text-[9px] font-bold text-pmmg-navy uppercase">Suspeito</span>
            </div>
            
            {/* Preso */}
            <div className="flex items-center gap-2">
               <div className={`w-4 h-4 rounded-full bg-pmmg-blue flex items-center justify-center border-pmmg-blue shadow-sm`}>
                 <span className="material-symbols-outlined text-white text-[10px] fill-icon">lock</span>
               </div>
               <span className="text-[9px] font-bold text-pmmg-navy uppercase">Preso</span>
            </div>

            {/* CPF Cancelado */}
            <div className="flex items-center gap-2">
               <div className={`w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center border-slate-700 shadow-sm`}>
                 <span className="material-symbols-outlined text-white text-[10px] fill-icon">cancel</span>
               </div>
               <span className="text-[9px] font-bold text-pmmg-navy uppercase">CPF Cancelado</span>
            </div>
            
            {/* Oficial */}
            <div className="flex items-center gap-2 pt-2 border-t border-pmmg-navy/5">
               <div className="w-3.5 h-3.5 bg-pmmg-blue rounded-full border-2 border-white shadow-sm ring-1 ring-pmmg-blue/50"></div>
               <span className="text-[9px] font-bold text-pmmg-navy uppercase">Oficial (Você)</span>
            </div>
            
            {/* Ponto Tático */}
            <div className="flex items-center gap-2">
               <div className="w-3.5 h-3.5 bg-pmmg-gold rounded-full border-2 border-white shadow-sm ring-1 ring-pmmg-gold/30"></div>
               <span className="text-[9px] font-bold text-pmmg-navy uppercase">Ponto Tático</span>
            </div>
            
            {activeFilter !== 'Todos' && (
              <button 
                onClick={() => setActiveFilter('Todos')}
                className="mt-2 text-[8px] font-black text-pmmg-red uppercase border-t border-pmmg-navy/5 pt-2 text-left"
              >
                Limpar Filtros ({activeFilter})
              </button>
            )}

            {/* Espaço para futuras opções */}
            <div className="mt-4 pt-4 border-t border-pmmg-navy/5">
              <p className="text-[8px] font-black text-pmmg-navy/40 uppercase tracking-widest mb-2">Opções Futuras</p>
              <button className="w-full text-left text-[10px] font-bold text-pmmg-navy/70 uppercase py-1.5 px-2 rounded hover:bg-pmmg-navy/5 transition-colors">
                <span className="material-symbols-outlined text-sm mr-1">layers</span> Gerenciar Camadas
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav activeScreen="map" navigateTo={navigateTo} />
    </div>
  );
};

export default TacticalMap;