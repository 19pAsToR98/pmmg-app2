const GoogleMapWrapper: React.FC<GoogleMapWrapperProps> = ({ 
  children, 
  center, 
  zoom, 
  mapContainerClassName, 
  options, 
  onLoad,
  onClick,
  isDarkMode = false,
}) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    libraries,
    language: 'pt-BR',
  });
  
  const mapStyles = isDarkMode ? DARK_MAP_STYLES : LIGHT_MAP_STYLES;

  if (loadError) {
    return <div className="p-4 text-center text-pmmg-red">Erro ao carregar o Google Maps. Verifique a chave API.</div>;
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center ${mapContainerClassName} bg-slate-200`}>
        <span className="material-symbols-outlined text-pmmg-navy animate-spin text-4xl">progress_activity</span>
        <p className="text-pmmg-navy/70 text-sm ml-3">Carregando Mapa Tático...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerClassName={mapContainerClassName}
      center={center}
      zoom={zoom}
      options={{
        disableDefaultUI: true,
        zoomControl: false, 
        rotateControl: false, // ✅ Mantém oculto (rotação por gesto, não botão)
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        styles: mapStyles,
        
        // ✅ CONFIGURAÇÕES PARA HABILITAR ROTAÇÃO POR GESTO:
        gestureHandling: 'greedy', // ✅ Prioriza gestos do mapa (melhor para mobile)
        // tilt: undefined,        // ✅ Deixa a API decidir (permite inclinação/rotação)
        // heading: undefined,     // ✅ Deixa a API decidir (permite rotação)
        // draggable: true,        // ✅ Mantém arrastar (necessário para gestos)
        
        ...options, // Permite override via prop
      }}
      onLoad={onLoad}
      onClick={onClick}
    >
      {children}
    </GoogleMap>
  );
};