import React, { useState, useRef, useEffect } from 'react';
import { Screen, Suspect, Vehicle, Association } from '../types';
import BottomNav from '../components/BottomNav';
import GoogleMapWrapper from '../components/GoogleMapWrapper';
import { MarkerF } from '@react-google-maps/api';
import { ICON_PATHS } from '../utils/iconPaths';
import { searchGoogleAddress } from '../utils/vehicleData'; // Importação removida, pois a função searchGoogleAddress está no topo do arquivo
import VehicleVisuals from '../components/VehicleVisuals'; // NOVO

interface SuspectRegistryProps {
  navigateTo: (screen: Screen) => void;
  onSave: (suspect: Suspect) => void;
  onUpdate: (suspect: Suspect) => void; // NOVO: Função para atualizar
  currentSuspect?: Suspect | null; // NOVO: Suspeito a ser editado
  allSuspects: Suspect[];
}

interface GeocodedLocation {
  name: string;
  lat: number;
  lng: number;
}

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Função auxiliar para buscar endereço usando a API de Geocodificação do Google
const searchGoogleAddress = async (address: string): Promise<GeocodedLocation[]> => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("GOOGLE_MAPS_API_KEY is missing.");
    return [];
  }
  
  // Usando components=country:br para focar no Brasil e language=pt-BR
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&components=country:br&language=pt-BR&key=${GOOGLE_MAPS_MAP_KEY}`;
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


const SuspectRegistry: React.FC<SuspectRegistryProps> = ({ navigateTo, onSave, onUpdate, currentSuspect, allSuspects }) => {
  const isEditing = !!currentSuspect;
  
  // Inicializa estados com dados do suspeito atual se estiver editando
  const [status, setStatus] = useState<Suspect['status']>(currentSuspect?.status || 'Suspeito');
  const [name, setName] = useState(currentSuspect?.name || '');
  const [cpf, setCpf] = useState(currentSuspect?.cpf || '');
  const [rg, setRg] = useState(currentSuspect?.rg || '');
  const [nickname, setNickname] = useState(currentSuspect?.nickname || '');
  const [motherName, setMotherName] = useState(currentSuspect?.motherName || '');
  const [birthDate, setBirthDate] = useState(currentSuspect?.birthDate || '');
  const [description, setDescription] = useState(currentSuspect?.description || '');
  const [currentArticle, setCurrentArticle] = useState('');
  const [articles, setArticles] = useState<string[]>(currentSuspect?.articles || []);
  const [photos, setPhotos] = useState<string[]>(currentSuspect?.photoUrls || (currentSuspect?.photoUrl ? [currentSuspect.photoUrl] : []));
  const [showOnMap, setShowOnMap] = useState(currentSuspect?.showOnMap ?? true);
  
  // --- States for Vehicles and Associations ---
  const [vehicles, setVehicles] = useState<Vehicle[]>(currentSuspect?.vehicles || []);
  const [associations, setAssociations] = useState<Association[]>(currentSuspect?.associations || []);
  
  // --- States for Last Seen Address (Ocorrência/Residência) ---
  const initialLastSeenAddress = currentSuspect?.lastSeen || '';
  const initialLastSeenLat = currentSuspect?.lat;
  const initialLastSeenLng = currentSuspect?.lng;
  
  const [lastSeenAddress, setLastSeenAddress] = useState(initialLastSeenAddress);
  const [selectedLastSeenLocation, setSelectedLastSeenLocation] = useState<GeocodedLocation | null>(
    (initialLastSeenLat && initialLastSeenLng) ? { name: initialLastSeenAddress, lat: initialLastSeenLat, lng: initialLastSeenLng } : null
  );
  const [lastSeenAddressSuggestions, setLastSeenAddressSuggestions] = useState<GeocodedLocation[]>([]);
  const [isLastSeenSearching, setIsLastSeenSearching] = useState(false);

  // --- States for Approach Address (Abordagem) ---
  const initialApproachAddress = currentSuspect?.approachAddress || '';
  const initialApproachLat = currentSuspect?.approachLat;
  const initialApproachLng = currentSuspect?.approachLng;

  const [approachAddress, setApproachAddress] = useState(initialApproachAddress);
  const [selectedApproachLocation, setSelectedApproachLocation] = useState<GeocodedLocation | null>(
    (initialApproachLat && initialApproachLng) ? { name: initialApproachAddress, lat: initialApproachLat, lng: initialApproachLng } : null
  );
  const [approachAddressSuggestions, setApproachAddressSuggestions] = useState<GeocodedLocation[]>([]);
  const [isApproachSearching, setIsApproachSearching] = useState(false);

  // Vehicle Input States
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehicleColor, setNewVehicleColor] = useState('');

  // Association Input States
  const [associationSearchTerm, setAssociationSearchTerm] = useState('');
  const [associationRelationship, setAssociationRelationship] = useState('');
  const [filteredSuspects, setFilteredSuspects] = useState<Suspect[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Default center for map wrapper if no location is selected
  const defaultMapCenter = { lat: -19.9167, lng: -43.9345 }; 
  
  // --- Address Search Logic (Google Geocoding) ---
  
  // Last Seen Handlers
  const handleLastSeenAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastSeenAddress(e.target.value);
    setSelectedLastSeenLocation(null); // Clear location if user starts typing again
    setLastSeenAddressSuggestions([]); // Clear suggestions while typing
  };

  const handleLastSeenAddressSearch = async () => {
    if (lastSeenAddress.length < 3) {
      alert("Digite pelo menos 3 caracteres para buscar um endereço.");
      return;
    }
    
    setIsLastSeenSearching(true);
    setLastSeenAddressSuggestions([]);

    try {
      const results = await searchGoogleAddress(lastSeenAddress);

      if (results.length > 0) {
        setLastSeenAddressSuggestions(results);
      } else {
        alert("Nenhum endereço encontrado para a busca no Google Maps.");
      }
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      alert("Erro na comunicação com o serviço de geocodificação do Google.");
    } finally {
      setIsLastSeenSearching(false);
    }
  };

  const handleSelectLastSeenLocation = (location: GeocodedLocation) => {
    setSelectedLastSeenLocation(location);
    setLastSeenAddress(location.name);
    setLastSeenAddressSuggestions([]);
  };
  
  // Approach Handlers
  const handleApproachAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApproachAddress(e.target.value);
    setSelectedApproachLocation(null);
    setApproachAddressSuggestions([]);
  };

  const handleApproachAddressSearch = async () => {
    if (approachAddress.length < 3) {
      alert("Digite pelo menos 3 caracteres para buscar um endereço.");
      return;
    }
    
    setIsApproachSearching(true);
    setApproachAddressSuggestions([]);

    try {
      const results = await searchGoogleAddress(approachAddress);

      if (results.length > 0) {
        setApproachAddressSuggestions(results);
      } else {
        alert("Nenhum endereço encontrado para a busca no Google Maps.");
      }
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      alert("Erro na comunicação com o serviço de geocodificação do Google.");
    } finally {
      setIsApproachSearching(false);
    }
  };

  const handleSelectApproachLocation = (location: GeocodedLocation) => {
    setSelectedApproachLocation(location);
    setApproachAddress(location.name);
    setApproachAddressSuggestions([]);
  };

  // --- Vehicle Management Logic ---
  const handleAddVehicle = () => {
    if (newVehiclePlate.trim() && newVehicleModel.trim()) {
      const newVehicle: Vehicle = {
        plate: newVehiclePlate.trim().toUpperCase(),
        model: newVehicleModel.trim(),
        color: newVehicleColor.trim() || 'Não Informado',
      };
      setVehicles([...vehicles, newVehicle]);
      setNewVehiclePlate('');
      setNewVehicleModel('');
      setNewVehicleColor('');
    }
  };

  const handleRemoveVehicle = (index: number) => {
    setVehicles(vehicles.filter((_, i) => i !== index));
  };

  // --- Association Management Logic ---
  useEffect(() => {
    if (associationSearchTerm.length > 1) {
      const term = associationSearchTerm.toLowerCase();
      const results = allSuspects.filter(s => 
        s.name.toLowerCase().includes(term) && 
        !associations.some(a => a.suspectId === s.id) // Avoid adding already associated suspects
      );
      setFilteredSuspects(results);
    } else {
      setFilteredSuspects([]);
    }
  }, [associationSearchTerm, allSuspects, associations]);

  const handleAddAssociation = (suspectId: string) => {
    if (associationRelationship.trim()) {
      const newAssociation: Association = {
        suspectId,
        relationship: associationRelationship.trim(),
      };
      setAssociations([...associations, newAssociation]);
      setAssociationSearchTerm('');
      setAssociationRelationship('');
      setFilteredSuspects([]);
    } else {
      alert("Defina o tipo de ligação (Ex: Cúmplice, Familiar).");
    }
  };

  const handleRemoveAssociation = (index: number) => {
    setAssociations(associations.filter((_, i) => i !== index));
  };

  // --- General Registry Logic ---
  const handleAddArticle = () => {
    if (currentArticle.trim()) {
      setArticles([...articles, currentArticle.trim()]);
      setCurrentArticle('');
    }
  };

  const handleRemoveArticle = (index: number) => {
    setArticles(articles.filter((_, i) => i !== index));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    if (!name || !cpf) {
      alert("Nome e CPF são obrigatórios.");
      return;
    }

    const primaryPhoto = photos.length > 0 ? photos[0] : `https://picsum.photos/seed/${name}/200/250`;

    // Last Seen Location (Ocorrência/Residência)
    const lastSeenLat = selectedLastSeenLocation?.lat || (-19.9 + (Math.random() * 0.05 - 0.025));
    const lastSeenLng = selectedLastSeenLocation?.lng || (-43.9 + (Math.random() * 0.05 - 0.025));
    const lastSeen = selectedLastSeenLocation?.name || lastSeenAddress || 'Local do Registro';
    
    // Approach Location (Abordagem)
    const approachLat = selectedApproachLocation?.lat;
    const approachLng = selectedApproachLocation?.lng;
    const approach = selectedApproachLocation?.name || approachAddress || undefined;


    const suspectData: Suspect = {
      id: currentSuspect?.id || Date.now().toString(), // Usa ID existente se estiver editando
      name,
      nickname,
      cpf,
      rg,
      status,
      lastSeen,
      timeAgo: isEditing ? currentSuspect!.timeAgo : 'Agora', // Mantém o tempo se estiver editando
      photoUrl: primaryPhoto,
      photoUrls: photos.length > 0 ? photos : [primaryPhoto],
      birthDate,
      motherName,
      articles,
      description,
      lat: lastSeenLat,
      lng: lastSeenLng,
      approachAddress: approach, // NEW
      approachLat, // NEW
      approachLng, // NEW
      showOnMap,
      vehicles,
      associations,
    };

    if (isEditing) {
      onUpdate(suspectData);
    } else {
      onSave(suspectData);
    }
  };
  
  // Helper function to generate marker icon for mini-maps
  const getMiniMapIcon = (isApproach: boolean) => {
    if (typeof window === 'undefined' || !window.google || !window.google.maps) return undefined; // Safety check

    const color = isApproach ? '#002147' : '#002147';
    const iconName = isApproach ? 'pin_drop' : 'location_on';
    
    const pathData = ICON_PATHS[iconName];
    
    // Aplicando REGRA DE OURO 2: translate(6 6) scale(0.75)
    const svg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="${color}" stroke="#ffcc00" stroke-width="2"/>
        <path d="${pathData}" fill="#ffcc00" transform="translate(6 6) scale(0.75)"/>
      </svg>
    `;
    
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 16),
    };
  };


  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigateTo(isEditing ? 'profile' : 'dashboard')} className="text-white active:scale-90 transition-transform">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div>
            <h1 className="font-bold text-sm leading-none text-white uppercase tracking-tight">
              {isEditing ? 'Editar Ficha' : 'Cadastro de Indivíduo'}
            </h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">SISTEMA OPERACIONAL</p>
          </div>
        </div>
        <button 
          onClick={triggerFileInput}
          className="bg-pmmg-navy border border-pmmg-yellow/30 p-1.5 rounded-md text-pmmg-yellow active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-xl">add_a_photo</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar px-4 pt-6">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handlePhotoChange} 
          accept="image/*" 
          multiple
          className="hidden" 
          capture="environment"
        />

        {/* Photo Gallery Section (Existing) */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
          {photos.length > 0 ? (
            <>
              {photos.map((src, idx) => (
                <div key={idx} className="relative shrink-0">
                  <div className="w-32 h-44 bg-white rounded-xl overflow-hidden border-2 border-pmmg-navy shadow-lg">
                    <img src={src} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    {/* Botão de exclusão movido para dentro do contêiner da imagem, posicionado no canto superior direito */}
                    <button 
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 bg-pmmg-red text-white w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-white"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-2 left-2 bg-pmmg-navy text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border border-white/20">Principal</div>
                    )}
                  </div>
                </div>
              ))}
              <button 
                onClick={triggerFileInput}
                className="w-32 h-44 bg-white/30 border-2 border-dashed border-pmmg-navy/30 rounded-xl flex flex-col items-center justify-center shrink-0 active:bg-white/50 transition-colors"
              >
                <span className="material-symbols-outlined text-pmmg-navy/40 text-3xl">add</span>
                <span className="text-[9px] font-bold text-pmmg-navy/60 uppercase mt-1">Mais Fotos</span>
              </button>
            </>
          ) : (
            <div 
              onClick={triggerFileInput}
              className="w-full h-52 bg-white/50 border-2 border-dashed border-pmmg-navy/30 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-pmmg-navy/50 transition-colors shadow-inner"
            >
              <div className="w-16 h-16 rounded-full bg-pmmg-navy/5 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-pmmg-navy/40 text-4xl">add_a_photo</span>
              </div>
              <span className="text-[10px] font-bold text-pmmg-navy/60 uppercase tracking-widest">Adicionar Fotos</span>
              <p className="text-[8px] text-pmmg-navy/40 mt-1 uppercase">Suporta múltiplos arquivos</p>
            </div>
          )}
        </div>

        {/* Status Section (Existing) */}
        <p className="text-[10px] font-bold uppercase text-pmmg-navy/70 mb-3 mt-4 text-center tracking-wider">Status de Monitoramento</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'Foragido', icon: 'warning', color: 'text-pmmg-red', border: 'border-pmmg-red/30' },
            { id: 'Suspeito', icon: 'visibility', color: 'text-pmmg-yellow', border: 'border-pmmg-yellow/50' },
            { id: 'CPF Cancelado', icon: 'person_off', color: 'text-slate-600', border: 'border-slate-400/30' },
            { id: 'Preso', icon: 'lock', color: 'text-pmmg-navy', border: 'border-pmmg-navy/30' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatus(s.id as any)}
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all ${
                status === s.id ? 'bg-white border-pmmg-navy shadow-md ring-1 ring-pmmg-navy' : 'bg-white/40 ' + s.border
              }`}
            >
              <span className={`material-symbols-outlined ${s.color} ${status === s.id ? 'fill-icon' : ''}`}>
                {s.icon}
              </span>
              <span className="text-[9px] font-bold text-pmmg-navy text-center leading-tight">
                {s.id.split(' ').map((word, i) => <React.Fragment key={i}>{word}{i === 0 && s.id.includes(' ') && <br />}</React.Fragment>)}
              </span>
            </button>
          ))}
        </div>
        
        {/* Map Visibility Toggle (Existing) */}
        <div className="mt-6 pmmg-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">map</span>
            <div>
              <p className="text-sm font-bold text-pmmg-navy uppercase leading-none">Exibir no Mapa Tático</p>
              <p className="text-[10px] text-slate-500 mt-1">Marcar a última localização conhecida no mapa.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowOnMap(!showOnMap)}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${showOnMap ? 'bg-pmmg-navy' : 'bg-slate-300'}`}
          >
            <span className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${showOnMap ? 'translate-x-6' : 'translate-x-0'}`}></span>
          </button>
        </div>

        {/* 1. --- DADOS PESSOAIS --- */}
        <div className="flex items-center gap-2 mb-4 mt-8">
          <div className="h-4 w-1 bg-pmmg-navy rounded-full"></div>
          <h3 className="font-bold text-xs text-pmmg-navy uppercase tracking-wider">Dados Pessoais</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1 ml-1 tracking-wider">Nome Completo</label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-4 py-3 bg-white/80 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
              placeholder="Ex: João da Silva" 
              type="text" 
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1 ml-1 tracking-wider">CPF</label>
              <input 
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="block w-full px-4 py-3 bg-white/80 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
                placeholder="000.000.000-00" 
                type="text" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1 ml-1 tracking-wider">RG (Registro Geral)</label>
              <input 
                value={rg}
                onChange={(e) => setRg(e.target.value)}
                className="block w-full px-4 py-3 bg-white/80 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
                placeholder="0.000.000" 
                type="text" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1 ml-1 tracking-wider">Alcunha / Vulgo</label>
              <input 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="block w-full px-4 py-3 bg-white/80 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
                placeholder="Ex: Baiano" 
                type="text" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1 ml-1 tracking-wider">Data de Nascimento</label>
              <input 
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="block w-full px-4 py-3 bg-white/80 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
                placeholder="DD/MM/AAAA" 
                type="text" 
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1 ml-1 tracking-wider">Descrição / Sinais Particulares</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="block w-full px-4 py-3 bg-white/80 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
              placeholder="Cicatriz no braço, tatuagem no pescoço, etc." 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1 ml-1 tracking-wider">Nome da Mãe</label>
            <input 
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
              className="block w-full px-4 py-3 bg-white/80 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
              placeholder="Nome completo da genitora" 
              type="text" 
            />
          </div>
        </div>

        {/* 2. --- ARTIGOS CRIMINAIS --- */}
        <div className="flex items-center gap-2 mb-4 mt-8">
          <div className="h-4 w-1 bg-pmmg-red rounded-full"></div>
          <h3 className="font-bold text-xs text-pmmg-navy uppercase tracking-wider">Artigos Criminais</h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {articles.map((art, idx) => (
            <span key={idx} className="px-3 py-1.5 bg-pmmg-red/10 border border-pmmg-red/20 text-pmmg-red text-[10px] font-bold rounded-full flex items-center gap-1">
              {art} <span onClick={() => handleRemoveArticle(idx)} className="material-symbols-outlined text-[14px] cursor-pointer">close</span>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input 
            value={currentArticle}
            onChange={(e) => setCurrentArticle(e.target.value)}
            className="flex-1 px-4 py-2 bg-white border border-pmmg-navy/20 rounded-lg text-xs" 
            placeholder="Ex: Art. 157" 
            type="text" 
          />
          <button 
            onClick={handleAddArticle}
            className="px-4 py-2 bg-pmmg-navy text-white text-[10px] font-bold rounded-lg uppercase"
          >
            Adicionar
          </button>
        </div>

        {/* 3. --- Endereço e Localização --- */}
        <div className="flex items-center gap-2 mb-4 mt-8">
          <div className="h-4 w-1 bg-pmmg-navy rounded-full"></div>
          <h3 className="font-bold text-xs text-pmmg-navy uppercase tracking-wider">Endereço e Localização</h3>
        </div>
        <div className="space-y-4">
          
          {/* 3.1. Endereço Principal */}
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1 ml-1 tracking-wider">Endereço Principal</label>
            <div className="flex gap-2">
              <input 
                value={lastSeenAddress}
                onChange={handleLastSeenAddressChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLastSeenAddressSearch();
                  }
                }}
                className="block w-full px-4 py-3 bg-white/80 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
                placeholder="Pesquisar endereço..." 
                type="text" 
              />
              <button 
                onClick={handleLastSeenAddressSearch}
                disabled={isLastSeenSearching}
                className="bg-pmmg-navy text-white p-3 rounded-lg active:scale-95 transition-transform disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-xl animate-spin" style={{ display: isLastSeenSearching ? 'block' : 'none' }}>progress_activity</span>
                <span className="material-symbols-outlined text-xl" style={{ display: isLastSeenSearching ? 'none' : 'block' }}>search</span>
              </button>
            </div>
            
            {lastSeenAddressSuggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-pmmg-navy/20 rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
                {lastSeenAddressSuggestions.map((loc, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectLastSeenLocation(loc)}
                    className="w-full text-left px-4 py-2 text-sm text-pmmg-navy hover:bg-pmmg-khaki/50 transition-colors border-b border-pmmg-navy/5 last:border-b-0"
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            )}
            {lastSeenAddressSuggestions.length === 0 && !isLastSeenSearching && lastSeenAddress.length > 2 && (
              <p className="text-[10px] text-pmmg-red italic text-center mt-2">Nenhum resultado encontrado.</p>
            )}
          </div>
          
          {/* Minimap (Last Seen Location) */}
          {selectedLastSeenLocation && (
            <div className="pmmg-card overflow-hidden">
              <div className="p-3 bg-pmmg-navy/5 flex items-center justify-between">
                <p className="text-[10px] font-bold text-pmmg-navy uppercase tracking-wider">Localização Confirmada (Endereço Principal)</p>
                <span className="text-[9px] text-green-600 font-bold uppercase">GPS OK</span>
              </div>
              <GoogleMapWrapper
                center={selectedLastSeenLocation}
                zoom={15}
                mapContainerClassName="h-40 w-full z-0"
                options={{
                  disableDefaultUI: true,
                  draggable: false,
                  scrollwheel: false,
                  zoomControl: false,
                  mapTypeId: 'roadmap'
                }}
              >
                <MarkerF
                  position={selectedLastSeenLocation}
                  icon={getMiniMapIcon(false)}
                />
              </GoogleMapWrapper>
            </div>
          )}
          
          {/* 3.2. Endereço da Abordagem (NEW) */}
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1 ml-1 tracking-wider">Endereço da Abordagem (Opcional)</label>
            <div className="flex gap-2">
              <input 
                value={approachAddress}
                onChange={handleApproachAddressChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApproachAddressSearch();
                  }
                }}
                className="block w-full px-4 py-3 bg-white/80 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
                placeholder="Pesquisar endereço da abordagem..." 
                type="text" 
              />
              <button 
                onClick={handleApproachAddressSearch}
                disabled={isApproachSearching}
                className="bg-pmmg-navy text-white p-3 rounded-lg active:scale-95 transition-transform disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-xl animate-spin" style={{ display: isApproachSearching ? 'block' : 'none' }}>progress_activity</span>
                <span className="material-symbols-outlined text-xl" style={{ display: isApproachSearching ? 'none' : 'block' }}>search</span>
              </button>
            </div>
            
            {approachAddressSuggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-pmmg-navy/20 rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
                {approachAddressSuggestions.map((loc, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectApproachLocation(loc)}
                    className="w-full text-left px-4 py-2 text-sm text-pmmg-navy hover:bg-pmmg-khaki/50 transition-colors border-b border-pmmg-navy/5 last:border-b-0"
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            )}
            {approachAddressSuggestions.length === 0 && !isApproachSearching && approachAddress.length > 2 && (
              <p className="text-[10px] text-pmmg-red italic text-center mt-2">Nenhum resultado encontrado.</p>
            )}
          </div>
          
          {/* Minimap (Approach Location) */}
          {selectedApproachLocation && (
            <div className="pmmg-card overflow-hidden">
              <div className="p-3 bg-pmmg-navy/5 flex items-center justify-between">
                <p className="text-[10px] font-bold text-pmmg-navy uppercase tracking-wider">Localização Confirmada (Abordagem)</p>
                <span className="text-[9px] text-green-600 font-bold uppercase">GPS OK</span>
              </div>
              <GoogleMapWrapper
                center={selectedApproachLocation}
                zoom={15}
                mapContainerClassName="h-40 w-full z-0"
                options={{
                  disableDefaultUI: true,
                  draggable: false,
                  scrollwheel: false,
                  zoomControl: false,
                  mapTypeId: 'roadmap'
                }}
              >
                <MarkerF
                  position={selectedApproachLocation}
                  icon={getMiniMapIcon(true)}
                />
              </GoogleMapWrapper>
            </div>
          )}
        </div>

        {/* 4. --- Veículos Section (Existing) --- */}
        <div className="flex items-center gap-2 mb-4 mt-8">
          <div className="h-4 w-1 bg-pmmg-navy rounded-full"></div>
          <h3 className="font-bold text-xs text-pmmg-navy uppercase tracking-wider">Veículos Cadastrados ({vehicles.length})</h3>
        </div>
        <div className="pmmg-card p-4 space-y-3">
          {vehicles.map((v, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-pmmg-navy/5 rounded-lg border border-pmmg-navy/10">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <VehicleVisuals vehicle={v} size="sm" /> {/* NOVO COMPONENTE */}
                <div>
                  <p className="text-sm font-bold text-pmmg-navy truncate">{v.plate}</p>
                  <p className="text-[10px] text-slate-500">{v.model} ({v.color})</p>
                </div>
              </div>
              <button onClick={() => handleRemoveVehicle(idx)} className="text-pmmg-red p-1 shrink-0">
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          ))}
          <div className="pt-2 space-y-2 border-t border-pmmg-navy/10">
            <div className="grid grid-cols-2 gap-3">
              <input 
                value={newVehiclePlate}
                onChange={(e) => setNewVehiclePlate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-pmmg-navy/20 rounded-lg text-xs" 
                placeholder="Placa (Ex: ABC1234)" 
                type="text" 
              />
              <input 
                value={newVehicleModel}
                onChange={(e) => setNewVehicleModel(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-pmmg-navy/20 rounded-lg text-xs" 
                placeholder="Modelo (Ex: Fiat Uno)" 
                type="text" 
              />
            </div>
            <div className="flex gap-3">
              <input 
                value={newVehicleColor}
                onChange={(e) => setNewVehicleColor(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-pmmg-navy/20 rounded-lg text-xs" 
                placeholder="Cor (Opcional)" 
                type="text" 
              />
              <button 
                onClick={handleAddVehicle}
                disabled={!newVehiclePlate.trim() || !newVehicleModel.trim()}
                className="px-4 py-2 bg-pmmg-navy text-white text-[10px] font-bold rounded-lg uppercase disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* 5. --- Ligações Section (Existing) --- */}
        <div className="flex items-center gap-2 mb-4 mt-8">
          <div className="h-4 w-1 bg-pmmg-navy rounded-full"></div>
          <h3 className="font-bold text-xs text-pmmg-navy uppercase tracking-wider">Ligações e Associações ({associations.length})</h3>
        </div>
        <div className="pmmg-card p-4 space-y-3">
          {associations.map((a, idx) => {
            const associatedSuspect = allSuspects.find(s => s.id === a.suspectId);
            if (!associatedSuspect) return null;
            return (
              <div key={idx} className="flex items-center justify-between p-2 bg-pmmg-navy/5 rounded-lg border border-pmmg-navy/10">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-300 shrink-0">
                    <img src={associatedSuspect.photoUrl} alt={associatedSuspect.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-pmmg-navy/50 font-bold uppercase truncate">{a.relationship}</p>
                    <p className="text-sm font-bold text-pmmg-navy truncate">{associatedSuspect.name}</p>
                  </div>
                </div>
                <button onClick={() => handleRemoveAssociation(idx)} className="text-pmmg-red p-1 shrink-0">
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            );
            
          })}
          <div className="pt-2 space-y-2 border-t border-pmmg-navy/10">
            <input 
              value={associationRelationship}
              onChange={(e) => setAssociationRelationship(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-pmmg-navy/20 rounded-lg text-xs" 
              placeholder="Tipo de Ligação (Ex: Cúmplice, Familiar)" 
              type="text" 
            />
            <input 
              value={associationSearchTerm}
              onChange={(e) => setAssociationSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-pmmg-navy/20 rounded-lg text-xs" 
              placeholder="Buscar indivíduo existente (Nome/CPF)" 
              type="text" 
            />
            {filteredSuspects.length > 0 && associationRelationship.trim() && (
              <div className="bg-white border border-pmmg-navy/20 rounded-lg shadow-md max-h-40 overflow-y-auto">
                {filteredSuspects.slice(0, 5).map((s) => (
                  <div 
                    key={s.id} 
                    className="flex items-center justify-between p-2 hover:bg-pmmg-khaki/50 transition-colors border-b border-pmmg-navy/5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-300 shrink-0">
                        <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-pmmg-navy truncate">{s.name}</p>
                        <p className="text-[10px] text-slate-500">{s.cpf}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddAssociation(s.id)}
                      className="bg-pmmg-navy text-white text-[9px] font-bold px-3 py-1 rounded uppercase shrink-0"
                    >
                      Vincular
                    </button>
                  </div>
                ))}
              </div>
            )}
            {filteredSuspects.length > 0 && !associationRelationship.trim() && (
                <p className="text-[10px] text-pmmg-red italic text-center">Defina o tipo de ligação antes de vincular.</p>
            )}
          </div>
        </div>

        <div className="mt-10 mb-8">
          <button 
            onClick={handleSave}
            className="w-full bg-pmmg-navy text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 uppercase tracking-widest active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined">{isEditing ? 'save' : 'person_add'}</span>
            {isEditing ? 'Salvar Alterações' : 'Salvar Registro'}
          </button>
        </div>
      </main>

      <BottomNav activeScreen="registry" navigateTo={navigateTo} />
    </div>
  );
};

export default SuspectRegistry;