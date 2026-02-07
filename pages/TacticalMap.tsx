import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Screen, Suspect, CustomMarker, GeocodedLocation } from '../types';
import BottomNav from '../components/BottomNav';
import GoogleMapWrapper from '../components/GoogleMapWrapper';
import { MarkerF, InfoWindowF, OverlayViewF, OverlayView } from '@react-google-maps/api';
import { ICON_PATHS } from '../utils/iconPaths';
import { getCurrentLocation } from '../utils/geolocation'; // NEW IMPORT

// Definindo tipos enriquecidos para uso interno (se vierem do GroupTacticalMap)
interface EnrichedSuspect extends Suspect {
  authorName?: string;
  authorRank?: string;
}

interface EnrichedCustomMarker extends CustomMarker {
  authorName?: string;
  authorRank?: string;
}

interface TacticalMapProps {
  navigateTo: (screen: Screen) => void;
  suspects: EnrichedSuspect[]; // Pode receber suspeitos enriquecidos
  onOpenProfile: (id: string) => void;
  initialCenter?: [number, number] | null;
  userDefaultLocation: GeocodedLocation | null; // NEW PROP
  customMarkers: EnrichedCustomMarker[]; // Pode receber marcadores enriquecidos
  addCustomMarker: (marker: CustomMarker) => void;
  updateCustomMarker: (marker: CustomMarker) => void;
  deleteCustomMarker: (id: string) => void;
  groupName?: string; // NOVO: Nome do grupo, se estiver no contexto de grupo
  isDarkMode: boolean; // NEW PROP
}

type MapFilter = 'Todos' | 'Foragido' | 'Suspeito' | 'Preso' | 'CPF Cancelado';
type LocationFilter = 'residence' | 'approach';
type MapType = 'roadmap' | 'satellite' | 'hybrid'; // Tipos de mapa do Google

const ZOOM_THRESHOLD = 15; // Nível de zoom para alternar para fotos

// Default center for BH
const DEFAULT_CENTER = { lat: -19.9167, lng: -43.9345 };

// ✅ NOVO COMPONENTE: Marcador de Suspeito com Foto/Ícone
const SuspectPhotoMarker = memo<{
  suspect: EnrichedSuspect;
  position: { lat: number; lng: number };
  onClick: () => void;
  usePhotoMarker: boolean;
  locationFilter: LocationFilter;
}>(({ suspect, position, onClick, usePhotoMarker, locationFilter }) => {
  
  // Determinar cor da borda baseado no status
  const getBorderColorClass = () => {
    switch (suspect.status) {
      case 'Foragido': return 'border-pmmg-red';
      case 'Suspeito': return 'border-pmmg-yellow';
      default: return 'border-pmmg-navy';
    }
  };

  // Ícone baseado no filtro de localização
  const getIconName = () => {
    if (locationFilter === 'approach') return 'pin_drop';
    return suspect.status === 'Foragido' ? 'priority_high' : 'warning';
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // IMPEDE QUE O CLIQUE SE PROPAGUE PARA O MAPA
    onClick();
  };
  
  // AJUSTE: Centralizando o elemento no ponto (lat, lng)
  const getOffset = () => {
    if (usePhotoMarker) {
      // 40x40 -> Offset para o centro: -20, -20
      return { x: -20, y: -20 };
    }
    // 24x24 -> Offset para o centro: -12, -12
    return { x: -12, y: -12 };
  };

  return (
    <OverlayViewF
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={getOffset} 
    >
      <div 
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
        className="relative group"
      >
        {usePhotoMarker ? (
          // ✅ FOTO COM BORDA COLORIDA (40x40)
          <div 
            className={`w-10 h-10 bg-white shadow-xl ${getBorderColorClass()} border-4 overflow-hidden ring-2 ring-white/50 rounded-lg`}
            title={suspect.name}
          >
            <img 
              src={suspect.photoUrl} 
              alt={suspect.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          // ✅ ÍCONE SIMPLES (24x24)
          <div 
            className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-md ${
              suspect.status === 'Foragido' ? 'bg-pmmg-red' :
              suspect.status === 'Suspeito' ? 'bg-pmmg-yellow' : 'bg-pmmg-navy'
            }`}
            title={suspect.name}
          >
            <span className="material-symbols-outlined text-white text-[14px] fill-icon">
              {getIconName()}
            </span>
          </div>
        )}
      </div>
    </OverlayViewF>
  );
});

// ✅ NOVO COMPONENTE: Marcador Customizado com HTML
const CustomMarkerComponent = memo<{
  markerData: EnrichedCustomMarker;
  position: { lat: number; lng: number };
  onClick: () => void;
}>(({ markerData, position, onClick }) => {
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // IMPEDE QUE O CLIQUE SE PROPAGUE PARA O MAPA
    onClick();
  };
  
  // AJUSTE: Centralizando o elemento no ponto (lat, lng)
  // Marcador 32x32. Offset para o centro: -16, -16
  const getOffset = () => ({ x: -16, y: -16 });

  return (
    <OverlayViewF
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={getOffset} 
    >
      <div 
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
        className="relative group"
      >
        <div 
          className={`w-8 h-8 ${markerData.color} rounded-full border-2 border-white flex items-center justify-center shadow-lg`}
          title={markerData.title}
        >
          <span className="material-symbols-outlined text-white text-[16px] fill-icon">
            {markerData.icon}
          </span>
        </div>
      </div>
    </OverlayViewF>
  );
});

// ✅ NOVO COMPONENTE: Marcador do Usuário com HTML
const UserMarkerComponent = memo<{
  position: { lat: number; lng: number };
  onClick: () => void;
}>(({ position, onClick }) => {
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // IMPEDE QUE O CLIQUE SE PROPAGUE PARA O MAPA
    onClick();
  };
  
  // AJUSTE: Centralizando o elemento no ponto (lat, lng)
  // Marcador 32x32. Offset para o centro: -16, -16
  const getOffset = () => ({ x: -16, y: -16 });

  return (
    <OverlayViewF
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={getOffset} 
    >
      <div 
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
        className="relative group"
      >
        <div 
          className="w-8 h-8 bg-pmmg-blue rounded-full border-4 border-white flex items-center justify-center shadow-lg ring-2 ring-pmmg-blue/50"
          title="Você (Oficial)"
        >
          <span className="material-symbols-outlined text-white text-[18px]">person</span>
        </div>
      </div>
    </OverlayViewF>
  );
});

const TacticalMap: React.FC<TacticalMapProps> = ({ navigateTo, suspects, onOpenProfile, initialCenter, userDefaultLocation, customMarkers, addCustomMarker, updateCustomMarker, deleteCustomMarker, groupName, isDarkMode }) => {
  // CORREÇÃO: Inicializando useRef com null
  const mapRef = useRef<google.maps.Map | null>(null);
  
  const [userPos, setUserPos] = useState<{ lat: number, lng: number } | null>(null);
  const [activeFilter, setActiveFilter] = useState<MapFilter>('Todos');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('residence');
  const [mapType, setMapType] = useState<MapType>('roadmap'); // NOVO ESTADO: Tipo de mapa
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [newMarkerData, setNewMarkerData] = useState<Omit<CustomMarker, 'id'> | null>(null);
  const [editingMarker, setEditingMarker] = useState<CustomMarker | null>(null);
  const [currentZoom, setCurrentZoom] = useState(initialCenter ? 17 : 14);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null); 

  // Center state managed by initialCenter prop or user position
  const center = initialCenter 
    ? { lat: initialCenter[0], lng: initialCenter[1] } 
    : userPos 
      ? userPos 
      : userDefaultLocation || DEFAULT_CENTER; // USE userDefaultLocation as fallback

  // Filtragem dos suspeitos
  const filteredSuspects = suspects.filter(s => {
    // 1. Filtro de visibilidade e status
    const matchesStatus = (s.showOnMap === undefined || s.showOnMap === true) && 
                          (activeFilter === 'Todos' || s.status === activeFilter);
    if (!matchesStatus) return false;
    
    // 2. Filtro de localização (garante que a coordenada exista para o filtro selecionado)
    if (locationFilter === 'residence') {
      return s.lat !== undefined && s.lng !== undefined;
    }
    if (locationFilter === 'approach') {
      return s.approachLat !== undefined && s.approachLng !== undefined;
    }
    return false; // Deve ser inalcançável se locationFilter for 'residence' ou 'approach'
  });

  const usePhotoMarker = currentZoom >= ZOOM_THRESHOLD;

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    map.addListener('zoom_changed', () => {
      setCurrentZoom(map.getZoom() ?? 14);
    });
    
    // REMOVIDO: Lógica de abertura automática do InfoWindow ao carregar o mapa.
    // O mapa deve apenas centralizar no ponto inicial, se fornecido.

  }, []);

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
  
  const handleShareLocation = useCallback(async (lat: number, lng: number, title: string) => {
    // Usando o formato de link de pesquisa do Google Maps, conforme o exemplo do usuário.
    const locationLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    const shareText = `🚨 PMMG TÁTICO - Localização Compartilhada 🚨\n\n📍 Ponto: ${title}\n🔗 Link do Mapa: ${locationLink}\n\nCoord: ${lat.toFixed(5)}, ${lng.toFixed(5)}\n(Via Sistema Operacional PMMG)`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Localização Tática: ${title}`,
          text: shareText,
          url: locationLink,
        });
      } catch (error) {
        // Se o usuário cancelar, ou houver erro, apenas logamos.
        if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Erro ao usar navigator.share:', error);
        }
      }
    } else {
      // Fallback para desktop ou navegadores sem suporte
      alert(shareText);
    }
  }, []);

  // --- FIX: Recenter function now actively requests geolocation ---
  const recenter = async () => {
    try {
      const position = await getCurrentLocation(true); // Request high accuracy
      
      if (position) {
        const newPos = { lat: position.lat, lng: position.lng };
        setUserPos(newPos); // Update user position state
        
        if (mapRef.current) {
          mapRef.current.setCenter(newPos);
          mapRef.current.setZoom(16);
        }
      } else {
        alert('Não foi possível obter sua localização atual.');
      }
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      alert('Não foi possível obter sua localização atual. Verifique as permissões do dispositivo.');
    }
  };
  // --- END FIX ---

  const activeMarkerData = newMarkerData || editingMarker;
  const isEditing = !!editingMarker;
  
  // Lista de status para o filtro da sidebar
  const STATUS_FILTERS: { id: MapFilter, label: string, color: string, icon: string }[] = [
    { id: 'Foragido', label: 'Foragido', color: 'bg-pmmg-red', icon: 'priority_high' },
    { id: 'Suspeito', label: 'Suspeito', color: 'bg-pmmg-yellow', icon: 'warning' },
    { id: 'Preso', label: 'Preso', color: 'bg-pmmg-blue', icon: 'lock' },
    { id: 'CPF Cancelado', label: 'CPF Cancelado', color: 'bg-slate-700', icon: 'cancel' },
  ];
  
  // Lista de tipos de mapa
  const MAP_TYPES: { id: MapType, label: string, icon: string }[] = [
    { id: 'roadmap', label: 'Padrão', icon: 'map' },
    { id: 'satellite', label: 'Satélite', icon: 'satellite' },
    { id: 'hybrid', label: 'Híbrida', icon: 'layers' },
  ];

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki dark:bg-slate-900 overflow-hidden">
      
      {/* MOBILE HEADER (Visível apenas em telas pequenas) */}
      <header className="sticky top-0 z-[1000] bg-pmmg-navy px-4 py-4 shadow-xl lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigateTo(groupName ? 'groupDetail' : 'dashboard')} className="text-white active:scale-90 transition-transform">
              <span className="material-symbols-outlined">arrow_back_ios</span>
            </button>
            <div className="w-9 h-9 shrink-0 bg-white rounded-full flex items-center justify-center p-1 border-2 border-pmmg-red">
              <span className="material-symbols-outlined text-pmmg-navy text-xl">map</span>
            </div>
            <div>
              <h1 className="font-bold text-xs leading-none text-white uppercase tracking-tight">
                {groupName ? 'Mapa Tático do Grupo' : 'Mapa Tático'}
              </h1>
              <p className="text-[9px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">
                {groupName || 'Inteligência Territorial'}
              </p>
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
      
      {/* DESKTOP FLOATING ACTIONS (Visível apenas em telas grandes) */}
      <div className="hidden lg:flex absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
        {/* Removendo gap-4 e usando gap-2 para maior compactação */}
        <div className="bg-pmmg-navy/90 backdrop-blur-md p-3 rounded-xl shadow-2xl border border-pmmg-yellow/30 flex items-center gap-3">
          
          {/* Título */}
          <div className="flex items-center gap-3 shrink-0 pr-2">
            <div className="w-8 h-8 shrink-0 bg-white rounded-full flex items-center justify-center p-1 border-2 border-pmmg-red">
              <span className="material-symbols-outlined text-pmmg-navy text-xl">map</span>
            </div>
            <div>
              <h1 className="font-bold text-sm leading-none text-white uppercase tracking-tight">
                {groupName ? 'MAPA TÁTICO DO GRUPO' : 'MAPA TÁTICO'}
              </h1>
              <p className="text-[9px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">
                {groupName || 'INTELIGÊNCIA TERRITORIAL'}
              </p>
            </div>
          </div>
          
          {/* Controles de Filtro e Visualização (CONSOLIDADOS) */}
          <div className="flex items-center gap-2 pl-3 border-l border-white/20">
            
            {/* Filtro de Localização */}
            <div className="flex bg-white/10 p-1 rounded-lg shrink-0" title="Filtro de Localização">
              <button 
                onClick={() => setLocationFilter('residence')}
                className={`text-[9px] font-bold uppercase py-1.5 px-2 rounded-md transition-all flex items-center gap-1 ${locationFilter === 'residence' ? 'bg-pmmg-yellow text-pmmg-navy shadow-md' : 'text-white/70 hover:bg-white/20'}`}
              >
                <span className="material-symbols-outlined text-sm">location_on</span> Residência
              </button>
              <button 
                onClick={() => setLocationFilter('approach')}
                className={`text-[9px] font-bold uppercase py-1.5 px-2 rounded-md transition-all flex items-center gap-1 ${locationFilter === 'approach' ? 'bg-pmmg-yellow text-pmmg-navy shadow-md' : 'text-white/70 hover:bg-white/20'}`}
              >
                <span className="material-symbols-outlined text-sm">pin_drop</span> Abordagem
              </button>
            </div>
            
            {/* Filtro de Status */}
            <div className="flex bg-white/10 p-1 rounded-lg shrink-0" title="Filtro por Status">
              <button 
                onClick={() => setActiveFilter('Todos')}
                className={`text-[9px] font-bold uppercase py-1.5 px-2 rounded-md transition-all ${activeFilter === 'Todos' ? 'bg-pmmg-yellow text-pmmg-navy shadow-md' : 'text-white/70 hover:bg-white/20'}`}
              >
                Todos
              </button>
              {STATUS_FILTERS.slice(0, 3).map(filter => ( // Limita a 3 status principais
                <button 
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`text-[9px] font-bold uppercase py-1.5 px-2 rounded-md transition-all ${activeFilter === filter.id ? 'bg-pmmg-yellow text-pmmg-navy shadow-md' : 'text-white/70 hover:bg-white/20'}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            
            {/* Opções de Camadas */}
            <div className="flex bg-white/10 p-1 rounded-lg shrink-0" title="Opções de Camadas">
              {MAP_TYPES.map(type => (
                <button 
                  key={type.id}
                  onClick={() => setMapType(type.id)}
                  className={`text-[9px] font-bold uppercase py-1.5 px-2 rounded-md transition-all flex items-center gap-1 ${mapType === type.id ? 'bg-pmmg-yellow text-pmmg-navy shadow-md' : 'text-white/70 hover:bg-white/20'}`}
                >
                  <span className="material-symbols-outlined text-sm">{type.icon}</span> {type.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Botões de Ação */}
          <div className="flex items-center gap-2 pl-3 border-l border-white/20 shrink-0">
            <button 
              onClick={() => {
                setIsAddingMarker(prev => !prev);
                setNewMarkerData(null); 
                setEditingMarker(null);
              }}
              className={`p-2 rounded-full border transition-all ${isAddingMarker ? 'bg-pmmg-red text-white border-pmmg-red shadow-lg' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
              title="Adicionar Ponto Tático"
            >
              <span className="material-symbols-outlined text-lg">add_location_alt</span>
            </button>
            <button 
              onClick={recenter} 
              className="bg-white/10 p-2 rounded-full border border-white/20 text-white active:bg-white/20 hover:bg-white/20"
              title="Centralizar Minha Localização"
            >
              <span className="material-symbols-outlined text-lg">my_location</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <GoogleMapWrapper
          center={center}
          zoom={currentZoom}
          mapContainerClassName="w-full h-full"
          onLoad={handleMapLoad}
          onClick={handleMapClick}
          options={{
            mapTypeId: mapType, // USANDO O NOVO ESTADO mapType
          }}
          isDarkMode={isDarkMode} // PASSING NEW PROP
        >
          {/* ✅ MARCADOR DO USUÁRIO COM HTML COMPLETO */}
          {userPos && (
            <>
              <UserMarkerComponent
                position={userPos}
                onClick={() => setActiveInfoWindow('user-pos')}
              />
              
              {activeInfoWindow === 'user-pos' && (
                <InfoWindowF 
                  position={userPos} 
                  onCloseClick={() => setActiveInfoWindow(null)}
                  pixelOffset={{ width: 0, height: 0 }} // AJUSTE PARA CENTRALIZAR
                >
                  <div className="p-2">
                    <p className="font-bold text-pmmg-navy text-sm">Você (Oficial)</p>
                    <p className="text-[10px] text-slate-500">Localização Atual</p>
                  </div>
                </InfoWindowF>
              )}
            </>
          )}

          {/* ✅ MARCADORES DE SUSPEITOS COM FOTOS/ÍCONES */}
          {filteredSuspects.map(suspect => {
            let lat: number | undefined;
            let lng: number | undefined;
            let locationName: string | undefined;
            let locationType: 'Última Localização' | 'Endereço de Abordagem';
            
            if (locationFilter === 'residence') {
              lat = suspect.lat;
              lng = suspect.lng;
              locationName = suspect.lastSeen;
              locationType = 'Última Localização';
            } else if (locationFilter === 'approach') {
              lat = suspect.approachLat;
              lng = suspect.approachLng;
              locationName = suspect.approachAddress;
              locationType = 'Endereço de Abordagem';
            }

            if (lat && lng) {
              const position = { lat, lng };
              const markerId = `suspect-${suspect.id}`;
              
              return (
                <React.Fragment key={markerId}>
                  {/* ✅ USANDO OverlayViewF COM HTML COMPLETO */}
                  <SuspectPhotoMarker
                    suspect={suspect}
                    position={position}
                    onClick={() => setActiveInfoWindow(markerId)}
                    usePhotoMarker={usePhotoMarker}
                    locationFilter={locationFilter}
                  />
                  
                  {activeInfoWindow === markerId && (
                    <InfoWindowF 
                      position={position} 
                      onCloseClick={() => setActiveInfoWindow(null)}
                      pixelOffset={{ width: 0, height: 0 }} // AJUSTE PARA CENTRALIZAR
                    >
                      <div className="p-2 min-w-[150px]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-10 h-10 rounded bg-slate-200 overflow-hidden">
                            <img src={suspect.photoUrl} className="w-full h-full object-cover" alt={suspect.name} />
                          </div>
                          <div>
                            <p className="font-bold text-[10px] text-pmmg-navy uppercase leading-tight">{suspect.name}</p>
                            <p className="text-[9px] text-pmmg-blue font-bold uppercase">{locationType}</p>
                            <p className="text-[9px] text-slate-500 mt-1">{locationName || 'Local não especificado'}</p>
                          </div>
                        </div>
                        
                        {/* NOVO: Autor do Post (Apenas em contexto de grupo) */}
                        {groupName && suspect.authorName && (
                          <div className="mt-2 pt-2 border-t border-slate-100">
                            <p className="text-[8px] font-bold text-pmmg-navy/50 uppercase">Compartilhado por:</p>
                            <p className="text-[10px] font-black text-pmmg-red uppercase">{suspect.authorRank}. {suspect.authorName}</p>
                          </div>
                        )}
                        
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

          {/* ✅ MARCADORES PERSONALIZADOS COM HTML COMPLETO */}
          {customMarkers.map(markerData => {
            const position = { lat: markerData.lat, lng: markerData.lng };
            const markerId = `custom-${markerData.id}`;
            
            return (
              <React.Fragment key={markerId}>
                <CustomMarkerComponent
                  markerData={markerData}
                  position={position}
                  onClick={() => setActiveInfoWindow(markerId)}
                />
                
                {activeInfoWindow === markerId && (
                  <InfoWindowF 
                    position={position} 
                    onCloseClick={() => setActiveInfoWindow(null)}
                    pixelOffset={{ width: 0, height: 0 }} // AJUSTE PARA CENTRALIZAR
                  >
                    <div className="p-2 min-w-[150px]">
                      <p className="font-bold text-[11px] text-pmmg-navy uppercase leading-tight">{markerData.title}</p>
                      <p className="text-[10px] text-slate-600 mt-1">{markerData.description}</p>
                      
                      {/* NOVO: Autor do Ponto (Apenas em contexto de grupo) */}
                      {groupName && markerData.authorName && (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <p className="text-[8px] font-bold text-pmmg-navy/50 uppercase">Criado por:</p>
                          <p className="text-[10px] font-black text-pmmg-red uppercase">{markerData.authorRank}. {markerData.authorName}</p>
                        </div>
                      )}
                      
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
          
          {/* Marcador de Adição (40x40) - Mantido como SVG */}
          {isAddingMarker && (
            <MarkerF
              position={center}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#e31c1c" stroke="#ffffff" stroke-width="4"/>
                    <path d="${ICON_PATHS['pin_drop']}" fill="#ffffff" transform="translate(11 11) scale(0.75)"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(40, 40),
                // CORREÇÃO: Âncora na base central para o InfoWindow
                anchor: new window.google.maps.Point(20, 40),
              }}
              title="Clique no mapa para posicionar"
            />
          )}
        </GoogleMapWrapper>
        
        {/* Marker Configuration Modal (New or Edit) */}
        {activeMarkerData && (
          <div className="absolute inset-0 z-[1002] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-2xl w-full max-w-sm">
              <h3 className="text-lg font-bold text-pmmg-navy dark:text-slate-200 uppercase mb-4 border-b dark:border-slate-700 pb-2">
                {isEditing ? 'Editar Marcador Tático' : 'Configurar Novo Marcador'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 dark:text-slate-400 mb-1">Título</label>
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
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 dark:text-slate-400 mb-1">Descrição</label>
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
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 dark:text-slate-400 mb-1">Ícone ({activeMarkerData.icon})</label>
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
                        className={`p-2 rounded-lg border transition-all ${activeMarkerData.icon === icon ? 'bg-pmmg-navy text-pmmg-yellow border-pmmg-yellow' : 'bg-slate-100 dark:bg-slate-700 text-pmmg-navy/50 dark:text-slate-400'}`}
                      >
                        <span className="material-symbols-outlined text-xl">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 dark:text-slate-400 mb-1">Cor</label>
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
                        className={`w-8 h-8 rounded-full border-2 transition-all ${color.c} ${activeMarkerData.color === `bg-${color.v}` ? 'ring-4 ring-offset-2 ring-pmmg-navy dark:ring-pmmg-yellow' : 'border-white dark:border-slate-800'}`}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={handleCancelNewMarker}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 text-pmmg-navy dark:text-slate-200 font-bold py-3 rounded-xl text-xs uppercase"
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

        {/* SIDEBAR OCULTÁVEL (Legenda Tática) - AGORA APENAS PARA MOBILE */}
        <div className={`lg:hidden absolute top-4 right-0 z-[1000] bottom-[100px] transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
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
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-3 rounded-l-2xl shadow-2xl border border-pmmg-navy/10 dark:border-slate-700 flex flex-col gap-2.5 h-full overflow-y-auto w-64">
            <p className="text-[8px] font-black text-pmmg-navy/40 dark:text-slate-500 uppercase tracking-widest border-b border-pmmg-navy/5 dark:border-slate-700 pb-1 mb-1">Legenda Tática</p>
            
            {/* --- Filtro de Localização (MOBILE) --- */}
            <div className="pt-2 pb-3 border-b border-pmmg-navy/5 dark:border-slate-700">
              <p className="text-[9px] font-black text-pmmg-navy/60 dark:text-slate-400 uppercase tracking-wider mb-2">Tipo de Localização</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setLocationFilter('residence')}
                  className={`flex-1 text-[9px] font-bold uppercase py-1.5 rounded-lg transition-all ${locationFilter === 'residence' ? 'bg-pmmg-navy text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-pmmg-navy/70 dark:text-slate-300'}`}
                >
                  <span className="material-symbols-outlined text-sm mr-1">location_on</span> Residência
                </button>
                <button 
                  onClick={() => setLocationFilter('approach')}
                  className={`flex-1 text-[9px] font-bold uppercase py-1.5 rounded-lg transition-all ${locationFilter === 'approach' ? 'bg-pmmg-navy text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-pmmg-navy/70 dark:text-slate-300'}`}
                >
                  <span className="material-symbols-outlined text-sm mr-1">pin_drop</span> Abordagem
                </button>
              </div>
            </div>
            
            {/* --- Filtro de Status (MOBILE) --- */}
            <p className="text-[8px] font-black text-pmmg-navy/40 dark:text-slate-500 uppercase tracking-widest border-b border-pmmg-navy/5 dark:border-slate-700 pb-1 mb-1 pt-2">Filtro por Status</p>

            <button 
              onClick={() => setActiveFilter('Todos')}
              className={`flex items-center gap-2 w-full text-left p-1 rounded transition-colors ${activeFilter === 'Todos' ? 'bg-pmmg-navy/10 dark:bg-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
            >
               <div className={`w-4 h-4 rounded-full bg-pmmg-navy flex items-center justify-center shadow-sm`}>
                 <span className="material-symbols-outlined text-white text-[10px] fill-icon">done_all</span>
               </div>
               <span className="text-[9px] font-bold text-pmmg-navy dark:text-slate-200 uppercase">Todos os Suspeitos ({suspects.length})</span>
            </button>

            {STATUS_FILTERS.map(filter => (
              <button 
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 w-full text-left p-1 rounded transition-colors ${activeFilter === filter.id ? 'bg-pmmg-navy/10 dark:bg-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
              >
                <div className={`w-4 h-4 ${usePhotoMarker ? 'rounded-md border-2 bg-slate-300' : 'rounded-full flex items-center justify-center'} ${filter.color} border-white shadow-sm`}>
                  {!usePhotoMarker && <span className={`material-symbols-outlined text-[10px] fill-icon ${filter.id === 'Suspeito' ? 'text-pmmg-navy' : 'text-white'}`}>{filter.icon}</span>}
                </div>
                <span className="text-[9px] font-bold text-pmmg-navy dark:text-slate-200 uppercase">{filter.label}</span>
              </button>
            ))}
            
            {/* Oficial */}
            <div className="flex items-center gap-2 pt-2 border-t border-pmmg-navy/5 dark:border-slate-700">
               <div className="w-3.5 h-3.5 bg-pmmg-blue rounded-full border-2 border-white shadow-sm ring-1 ring-pmmg-blue/50"></div>
               <span className="text-[9px] font-bold text-pmmg-navy dark:text-slate-200 uppercase">Oficial (Você)</span>
            </div>
            
            {/* Ponto Tático */}
            <div className="flex items-center gap-2">
               <div className="w-3.5 h-3.5 bg-pmmg-gold rounded-full border-2 border-white shadow-sm ring-1 ring-pmmg-gold/30"></div>
               <span className="text-[9px] font-bold text-pmmg-navy dark:text-slate-200 uppercase">Ponto Tático</span>
            </div>
            
            {activeFilter !== 'Todos' && (
              <button 
                onClick={() => setActiveFilter('Todos')}
                className="mt-2 text-[8px] font-black text-pmmg-red uppercase border-t border-pmmg-navy/5 dark:border-slate-700 pt-2 text-left"
              >
                Limpar Filtros ({activeFilter})
              </button>
            )}

            {/* --- Opções de Camadas (MOBILE) --- */}
            <div className="mt-4 pt-4 border-t border-pmmg-navy/5 dark:border-slate-700">
              <p className="text-[8px] font-black text-pmmg-navy/40 dark:text-slate-500 uppercase tracking-widest mb-2">Visualização de Camadas</p>
              
              <button 
                onClick={() => setMapType('roadmap')}
                className={`w-full text-left text-[10px] font-bold uppercase py-1.5 px-2 rounded transition-colors flex items-center gap-1 ${mapType === 'roadmap' ? 'bg-pmmg-navy text-white' : 'text-pmmg-navy/70 dark:text-slate-300 hover:bg-pmmg-navy/5 dark:hover:bg-slate-700'}`}
              >
                <span className="material-symbols-outlined text-sm">map</span> Visualização Padrão
              </button>
              
              <button 
                onClick={() => setMapType('satellite')}
                className={`w-full text-left text-[10px] font-bold uppercase py-1.5 px-2 rounded transition-colors flex items-center gap-1 ${mapType === 'satellite' ? 'bg-pmmg-navy text-white' : 'text-pmmg-navy/70 dark:text-slate-300 hover:bg-pmmg-navy/5 dark:hover:bg-slate-700'}`}
              >
                <span className="material-symbols-outlined text-sm">satellite</span> Visualização Satélite
              </button>
              
              <button 
                onClick={() => setMapType('hybrid')}
                className={`w-full text-left text-[10px] font-bold uppercase py-1.5 px-2 rounded transition-colors flex items-center gap-1 ${mapType === 'hybrid' ? 'bg-pmmg-navy text-white' : 'text-pmmg-navy/70 dark:text-slate-300 hover:bg-pmmg-navy/5 dark:hover:bg-slate-700'}`}
              >
                <span className="material-symbols-outlined text-sm">layers</span> Visualização Híbrida
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav activeScreen={groupName ? 'groupsList' : 'map'} navigateTo={navigateTo} />
    </div>
  );
};

export default TacticalMap;