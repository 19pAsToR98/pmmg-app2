import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Screen, Suspect, CustomMarker } from '../types';
import BottomNav from '../components/BottomNav';

interface GoogleTacticalMapProps {
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

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter: google.maps.LatLngLiteral = { lat: -19.9167, lng: -43.9345 }; // Belo Horizonte

const GoogleTacticalMap: React.FC<GoogleTacticalMapProps> = ({ navigateTo, suspects, onOpenProfile, initialCenter, customMarkers, addCustomMarker, updateCustomMarker, deleteCustomMarker }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    libraries: ['geometry'], // Adicionando bibliotecas se necessário
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userPos, setUserPos] = useState<google.maps.LatLngLiteral | null>(null);
  const [activeFilter, setActiveFilter] = useState<MapFilter>('Todos');
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [newMarkerData, setNewMarkerData] = useState<Omit<CustomMarker, 'id'> | null>(null);
  const [editingMarker, setEditingMarker] = useState<CustomMarker | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<Suspect | CustomMarker | null>(null);

  // --- Localização do Usuário ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserPos(pos);
          if (map && !initialCenter) {
            map.panTo(pos);
            map.setZoom(15);
          }
        }
      );
    }
  }, [map, initialCenter]);

  // --- Efeito para centralizar o mapa se initialCenter mudar ---
  useEffect(() => {
    if (map && initialCenter) {
      map.panTo({ lat: initialCenter[0], lng: initialCenter[1] });
      map.setZoom(17);
    }
  }, [map, initialCenter]);

  // --- Filtragem de Suspeitos ---
  const filteredSuspects = useMemo(() => {
    return suspects.filter(s => 
      (s.showOnMap === undefined || s.showOnMap === true) && 
      (activeFilter === 'Todos' || s.status === activeFilter) &&
      s.lat && s.lng
    );
  }, [suspects, activeFilter]);

  // --- Funções de Ação ---
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    setSelectedMarker(null);
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
  }, [isAddingMarker]);

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
      setSelectedMarker(null);
    }
  };

  const recenter = () => {
    if (userPos && map) {
      map.panTo(userPos);
      map.setZoom(16);
      // Resetar rotação (bearing) e inclinação (tilt)
      map.setHeading(0);
      map.setTilt(0);
    }
  };

  // --- Renderização de Ícones ---
  const getSuspectIcon = (s: Suspect): google.maps.Icon => {
    const color = s.status === 'Foragido' ? '#e31c1c' : s.status === 'Suspeito' ? '#ffcc00' : '#002147';
    const iconName = s.status === 'Foragido' ? 'priority_high' : 'warning';
    
    // Usando Material Symbols como SVG para o Google Maps Marker
    const svg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="${color}" stroke="#FFFFFF" stroke-width="3"/>
        <text x="16" y="20" font-family="'Material Symbols Outlined'" font-size="16" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">${iconName}</text>
      </svg>
    `;

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 16),
    };
  };

  const getCustomMarkerIcon = (m: CustomMarker): google.maps.Icon => {
    // Extrai a cor do Tailwind para uso no SVG
    const colorMap: { [key: string]: string } = {
      'bg-pmmg-gold': '#d4af37',
      'bg-pmmg-red': '#e31c1c',
      'bg-pmmg-blue': '#0047ab',
      'bg-green-500': '#22c55e',
    };
    const colorKey = m.color.replace('bg-', '');
    const color = colorMap[m.color] || '#002147';

    const svg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="${color}" stroke="#FFFFFF" stroke-width="3"/>
        <text x="16" y="20" font-family="'Material Symbols Outlined'" font-size="16" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">${m.icon}</text>
      </svg>
    `;

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 16),
    };
  };

  // --- Renderização Principal ---

  if (loadError) {
    return <div className="p-4 text-center text-pmmg-red">Erro ao carregar o Google Maps. Verifique a chave de API.</div>;
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-pmmg-navy text-white">
        <span className="material-symbols-outlined text-6xl animate-spin">progress_activity</span>
        <p className="mt-4 text-sm uppercase tracking-widest">Carregando Mapa Tático...</p>
      </div>
    );
  }

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
            {/* Controles de Rotação e Inclinação (Google Maps suporta nativamente) */}
            <button 
              onClick={() => map?.setHeading((map.getHeading() || 0) - 45)}
              className="bg-white/10 p-2 rounded-full border border-white/20 text-white active:bg-white/20"
              title="Girar 45° Esquerda"
            >
              <span className="material-symbols-outlined text-lg">rotate_left</span>
            </button>
            <button 
              onClick={() => map?.setTilt((map.getTilt() || 0) === 0 ? 45 : 0)}
              className="bg-white/10 p-2 rounded-full border border-white/20 text-white active:bg-white/20"
              title="Alternar Inclinação 3D"
            >
              <span className="material-symbols-outlined text-lg">view_in_ar</span>
            </button>
            
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

        {/* Tactical Filters Chips */}
        <div className="flex gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar px-4 bg-pmmg-navy/95">
          {['Todos', 'Foragido', 'Suspeito', 'Preso', 'CPF Cancelado'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter as MapFilter)}
              className={`shrink-0 text-[9px] font-bold px-3 py-1.5 rounded-full uppercase transition-colors ${
                activeFilter === filter 
                  ? 'bg-pmmg-yellow text-pmmg-navy shadow-md' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        
      </header>

      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={initialCenter ? { lat: initialCenter[0], lng: initialCenter[1] } : defaultCenter}
          zoom={initialCenter ? 17 : 14}
          onLoad={setMap}
          onClick={handleMapClick}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            // Habilita rotação e inclinação
            heading: 0,
            tilt: 0,
            gestureHandling: 'greedy',
            mapId: 'DEMO_MAP_ID', // Pode ser substituído por um ID de mapa customizado
          }}
        >
          {/* Marcador de Posição do Usuário */}
          {userPos && (
            <Marker 
              position={userPos} 
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#0047ab',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#FFFFFF',
              }}
              onClick={() => setSelectedMarker({ id: 'user', title: 'Você (Oficial)', description: 'Sua localização atual.', lat: userPos.lat, lng: userPos.lng, icon: 'person', color: 'bg-pmmg-blue' })}
            />
          )}

          {/* Marcadores de Suspeitos */}
          {filteredSuspects.map(s => (
            <Marker
              key={s.id}
              position={{ lat: s.lat!, lng: s.lng! }}
              icon={getSuspectIcon(s)}
              onClick={() => setSelectedMarker(s)}
            />
          ))}

          {/* Marcadores Customizados */}
          {customMarkers.map(m => (
            <Marker
              key={m.id}
              position={{ lat: m.lat, lng: m.lng }}
              icon={getCustomMarkerIcon(m)}
              onClick={() => setSelectedMarker(m)}
            />
          ))}

          {/* InfoWindow para Marcador Selecionado */}
          {selectedMarker && selectedMarker.lat && selectedMarker.lng && (
            <InfoWindow
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2 min-w-[180px] font-sans">
                
                {'name' in selectedMarker ? (
                  // Suspect Marker Content
                  <div className="flex gap-3 items-start">
                    <img 
                      src={selectedMarker.photoUrl} 
                      alt={selectedMarker.name} 
                      className="w-12 h-12 object-cover rounded-lg border border-pmmg-navy/20 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[11px] text-pmmg-navy uppercase leading-tight mb-1 truncate">
                        {selectedMarker.name}
                      </p>
                      <p className="text-[10px] text-slate-600 mb-3">
                        Status: <span className="font-semibold">{selectedMarker.status}</span>
                      </p>
                      <button 
                        onClick={() => onOpenProfile(selectedMarker.id)}
                        className="w-full bg-pmmg-navy text-white text-[9px] font-bold py-1.5 rounded uppercase tracking-wider active:scale-95 transition-transform"
                      >
                        Ver Ficha Completa
                      </button>
                    </div>
                  </div>
                ) : (
                  // Custom Marker / User Marker Content
                  <>
                    <p className="font-bold text-[11px] text-pmmg-navy uppercase leading-tight mb-1">
                      {selectedMarker.title}
                    </p>
                    <p className="text-[10px] text-slate-600 mb-3">
                      {selectedMarker.description}
                    </p>
                    {selectedMarker.id !== 'user' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setEditingMarker(selectedMarker as CustomMarker)}
                          className="flex-1 bg-pmmg-navy text-white text-[9px] font-bold py-1.5 rounded uppercase tracking-wider active:scale-95 transition-transform"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteMarker(selectedMarker.id)}
                          className="px-3 bg-pmmg-red text-white text-[9px] font-bold py-1.5 rounded uppercase tracking-wider active:scale-95 transition-transform"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
        
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
      </div>

      <BottomNav activeScreen="map" navigateTo={navigateTo} />
    </div>
  );
};

export default GoogleTacticalMap;