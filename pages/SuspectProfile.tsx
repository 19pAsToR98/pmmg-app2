import React, { useState, useEffect, useRef } from 'react';
import { Screen, Suspect } from '../types';
import BottomNav from '../components/BottomNav';
import GoogleMapWrapper from '../components/GoogleMapWrapper';
import { MarkerF } from '@react-google-maps/api';

interface SuspectProfileProps {
  suspect: Suspect;
  onBack: () => void;
  navigateTo: (screen: Screen, center?: [number, number]) => void;
  allSuspects: Suspect[];
  onOpenProfile: (id: string) => void;
  onEdit: (id: string) => void; // NOVO: Função para iniciar a edição
}

const SuspectProfile: React.FC<SuspectProfileProps> = ({ suspect, onBack, navigateTo, allSuspects, onOpenProfile, onEdit }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('data');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  
  const photos = suspect.photoUrls && suspect.photoUrls.length > 0 ? suspect.photoUrls : [suspect.photoUrl];
  const currentPhotoIndex = fullscreenImage ? photos.indexOf(fullscreenImage) : -1;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const findAssociatedSuspect = (id: string) => {
    return allSuspects.find(s => s.id === id);
  };

  const handleNextImage = () => {
    if (currentPhotoIndex !== -1 && currentPhotoIndex < photos.length - 1) {
      setFullscreenImage(photos[currentPhotoIndex + 1]);
    }
  };

  const handlePrevImage = () => {
    if (currentPhotoIndex > 0) {
      setFullscreenImage(photos[currentPhotoIndex - 1]);
    }
  };

  const handleOpenMap = (lat?: number, lng?: number) => {
    if (lat && lng) {
      navigateTo('map', [lat, lng]);
    } else if (suspect.lat && suspect.lng) {
      navigateTo('map', [suspect.lat, suspect.lng]);
    } else {
      navigateTo('map');
    }
  };
  
  // Helper function to generate marker icon for mini-maps
  const getMiniMapIcon = (isApproach: boolean) => {
    if (typeof window === 'undefined' || !window.google || !window.google.maps) return undefined; // Safety check

    const color = isApproach ? '#002147' : (suspect.status === 'Foragido' ? '#e31c1c' : '#ffcc00');
    const iconName = isApproach ? 'pin_drop' : (suspect.status === 'Foragido' ? 'priority_high' : 'warning');
    
    const svg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="${color}" stroke="#ffffff" stroke-width="2"/>
        <text x="16" y="22" font-family="Material Symbols Outlined" font-size="16" fill="${isApproach ? '#ffcc00' : '#ffffff'}" text-anchor="middle">${iconName}</text>
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
      {/* Fullscreen Photo Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[2000] bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
        >
          {/* Close Button */}
          <button 
            onClick={() => setFullscreenImage(null)}
            className="absolute top-6 right-6 text-white bg-white/20 p-2 rounded-full backdrop-blur-md z-10 hover:bg-white/30 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          {/* Image Container */}
          <div className="relative flex items-center justify-center w-full h-full">
            
            {/* Previous Button */}
            <button
              onClick={handlePrevImage}
              disabled={currentPhotoIndex <= 0}
              className={`absolute left-4 z-10 p-3 rounded-full bg-black/50 text-white transition-opacity ${currentPhotoIndex <= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/70'}`}
            >
              <span className="material-symbols-outlined">arrow_back_ios</span>
            </button>

            {/* Image */}
            <img 
              src={fullscreenImage} 
              alt="Evidência em Detalhe" 
              className="max-w-full max-h-[85vh] object-contain rounded-sm shadow-2xl transition-transform duration-300" 
            />

            {/* Next Button */}
            <button
              onClick={handleNextImage}
              disabled={currentPhotoIndex >= photos.length - 1}
              className={`absolute right-4 z-10 p-3 rounded-full bg-black/50 text-white transition-opacity ${currentPhotoIndex >= photos.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/70'}`}
            >
              <span className="material-symbols-outlined">arrow_forward_ios</span>
            </button>
          </div>

          {/* Footer/Counter */}
          <div className="mt-6 px-8 text-center">
            <p className="text-pmmg-yellow text-[11px] font-black uppercase tracking-[0.2em] bg-pmmg-navy/80 px-6 py-3 rounded-full border border-pmmg-yellow/40 shadow-xl">
              {currentPhotoIndex + 1} / {photos.length} - VISUALIZAÇÃO DE IDENTIFICAÇÃO
            </p>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white active:scale-90 transition-transform">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div>
            <h1 className="font-bold text-sm leading-none text-white uppercase tracking-tight">Ficha Individual</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">ID: #{suspect.id.slice(-6)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onEdit(suspect.id)} 
            className="bg-pmmg-yellow text-pmmg-navy p-1.5 rounded-full border border-pmmg-yellow/50 active:scale-95 transition-transform"
            title="Editar Ficha"
          >
            <span className="material-symbols-outlined text-xl fill-icon">edit</span>
          </button>
          <button onClick={() => alert('Compartilhando...')} className="bg-white/10 p-1.5 rounded-full">
            <span className="material-symbols-outlined text-white text-xl">share</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        {/* Header Section with Photo and Text side-by-side */}
        <section className="p-4 bg-gradient-to-b from-pmmg-navy to-pmmg-navy/80 pb-12 rounded-b-[2rem] shadow-xl">
          
          <div className="flex gap-4 relative items-start">
            {/* Bloco da Foto (Esquerda) */}
            <div className="shrink-0">
              <div 
                className="w-32 h-40 bg-slate-300 rounded-2xl border-2 border-pmmg-yellow/50 overflow-hidden shadow-2xl relative cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => setFullscreenImage(suspect.photoUrl)}
              >
                <img 
                  alt={suspect.name} 
                  className="w-full h-full object-cover" 
                  src={suspect.photoUrl} 
                />
                <div className="absolute bottom-0 right-0 p-1.5 bg-pmmg-navy/60 rounded-tl-xl backdrop-blur-sm">
                  <span className="material-symbols-outlined text-white text-sm">zoom_in</span>
                </div>
              </div>
            </div>
            
            {/* Bloco de Texto (Direita) */}
            <div className="flex-1 flex flex-col justify-start">
              <div className="flex justify-end mb-2">
                <span className={`text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-white/20 uppercase tracking-widest ${
                  suspect.status === 'Foragido' ? 'bg-pmmg-red animate-pulse' : 
                  suspect.status === 'Suspeito' ? 'bg-pmmg-yellow text-pmmg-navy' : 'bg-pmmg-blue'
                }`}>
                  {suspect.status}
                </span>
              </div>
              
              <div className="mb-2">
                <h2 className="text-xl font-bold text-white uppercase leading-tight">{suspect.name}</h2>
                {suspect.nickname && <p className="text-pmmg-yellow text-xs font-semibold mt-1">Vulgo: "{suspect.nickname}"</p>}
              </div>
              
              {/* Descrição Tática */}
              {suspect.description && (
                <p className="text-[10px] text-white/90 leading-snug italic font-medium">
                  {suspect.description}
                </p>
              )}
              {!suspect.description && (
                <p className="text-[10px] text-white/60 leading-snug italic font-medium">
                  Nenhuma observação física registrada no prontuário.
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="px-4 -mt-6 space-y-3">
          <div className="pmmg-card">
            <div onClick={() => toggleSection('data')} className="flex items-center justify-between p-4 cursor-pointer">
              <div className="flex items-center gap-3 text-pmmg-navy">
                <span className="material-symbols-outlined">person</span>
                <span className="text-sm font-bold uppercase">Dados do Indivíduo</span>
              </div>
              <span className="material-symbols-outlined text-pmmg-navy/40">
                {expandedSection === 'data' ? 'expand_less' : 'expand_more'}
              </span>
            </div>
            {expandedSection === 'data' && (
              <div className="p-4 space-y-4 border-t border-pmmg-navy/5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-pmmg-navy/50 font-bold uppercase tracking-wider mb-0.5">CPF</p>
                    <p className="text-sm font-bold text-slate-800">{suspect.cpf}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-pmmg-navy/50 font-bold uppercase tracking-wider mb-0.5">RG</p>
                    <p className="text-sm font-bold text-slate-800">{suspect.rg || 'N/D'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-pmmg-navy/50 font-bold uppercase tracking-wider mb-0.5">Nascimento</p>
                    <p className="text-sm font-bold text-slate-800">{suspect.birthDate || 'N/D'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-pmmg-navy/50 font-bold uppercase tracking-wider mb-0.5">Filiação (Genitora)</p>
                  <p className="text-sm font-bold text-slate-800">{suspect.motherName || 'Não Informado'}</p>
                </div>
              </div>
            )}
          </div>

          <div className="pmmg-card">
             <div onClick={() => toggleSection('articles')} className="flex items-center justify-between p-4 cursor-pointer">
              <div className="flex items-center gap-3 text-pmmg-navy">
                <span className="material-symbols-outlined">gavel</span>
                <span className="text-sm font-bold uppercase">Artigos Criminais</span>
              </div>
              <span className="material-symbols-outlined text-pmmg-navy/40">
                {expandedSection === 'articles' ? 'expand_less' : 'expand_more'}
              </span>
            </div>
            {expandedSection === 'articles' && (
              <div className="p-4 space-y-3 border-t border-pmmg-navy/5">
                {suspect.articles && suspect.articles.length > 0 ? suspect.articles.map((art, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 bg-pmmg-navy/5 rounded border border-pmmg-navy/10">
                    <span className="text-pmmg-navy font-bold text-sm">{art}</span>
                    <p className="text-[10px] text-slate-500 italic mt-0.5">Enquadramento ativo no sistema.</p>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 italic">Nenhum artigo registrado.</p>
                )}
              </div>
            )}
          </div>

          {/* Vehicles Section */}
          <div className="pmmg-card">
            <div onClick={() => toggleSection('vehicles')} className="flex items-center justify-between p-4 cursor-pointer">
              <div className="flex items-center gap-3 text-pmmg-navy">
                <span className="material-symbols-outlined">directions_car</span>
                <span className="text-sm font-bold uppercase">Veículos Cadastrados</span>
              </div>
              <span className="material-symbols-outlined text-pmmg-navy/40">
                {expandedSection === 'vehicles' ? 'expand_less' : 'expand_more'}
              </span>
            </div>
            {expandedSection === 'vehicles' && (
              <div className="p-4 space-y-3 border-t border-pmmg-navy/5">
                {suspect.vehicles && suspect.vehicles.length > 0 ? suspect.vehicles.map((vehicle, i) => (
                  <div key={i} className="p-3 bg-pmmg-navy/5 rounded border border-pmmg-navy/10">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-pmmg-navy">{vehicle.plate}</p>
                      <span className="text-[10px] font-semibold text-slate-500">{vehicle.color}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-1">{vehicle.model}</p>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 italic">Nenhum veículo registrado.</p>
                )}
              </div>
            )}
          </div>

          {/* Associations Section */}
          <div className="pmmg-card">
            <div onClick={() => toggleSection('associations')} className="flex items-center justify-between p-4 cursor-pointer">
              <div className="flex items-center gap-3 text-pmmg-navy">
                <span className="material-symbols-outlined">link</span>
                <span className="text-sm font-bold uppercase">Ligações e Contatos</span>
              </div>
              <span className="material-symbols-outlined text-pmmg-navy/40">
                {expandedSection === 'associations' ? 'expand_less' : 'expand_more'}
              </span>
            </div>
            {expandedSection === 'associations' && (
              <div className="p-4 space-y-3 border-t border-pmmg-navy/5">
                {suspect.associations && suspect.associations.length > 0 ? suspect.associations.map((association, i) => {
                  const associatedSuspect = findAssociatedSuspect(association.suspectId);
                  if (!associatedSuspect) return null;

                  return (
                    <div 
                      key={i} 
                      className="flex items-center gap-3 p-3 bg-pmmg-navy/5 rounded border border-pmmg-navy/10 cursor-pointer active:bg-pmmg-navy/10 transition-colors"
                      onClick={() => onOpenProfile(associatedSuspect.id)}
                    >
                      <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden bg-slate-300 border border-pmmg-navy/20">
                        <img src={associatedSuspect.photoUrl} alt={associatedSuspect.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-pmmg-navy/50 font-bold uppercase tracking-wider truncate">{association.relationship}</p>
                        <h4 className="text-sm font-bold text-pmmg-navy truncate">{associatedSuspect.name}</h4>
                      </div>
                      <span className="material-symbols-outlined text-pmmg-navy/40 text-lg shrink-0">arrow_forward_ios</span>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-slate-400 italic">Nenhuma ligação registrada.</p>
                )}
              </div>
            )}
          </div>

          {/* Photo Gallery */}
          <div className="pmmg-card p-4">
            <h3 className="text-[10px] font-bold text-pmmg-navy/60 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">photo_library</span>
              Galeria de Identificação ({photos.length})
            </h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {photos.map((src, i) => (
                <div 
                  key={i} 
                  onClick={() => setFullscreenImage(src)}
                  className={`shrink-0 w-24 h-32 rounded-lg overflow-hidden border-2 transition-all active:scale-95 shadow-sm border-pmmg-navy/10`}
                >
                  <img src={src} className="w-full h-full object-cover" alt="Thumbnail" />
                </div>
              ))}
            </div>
            <p className="text-[8px] text-slate-400 mt-2 uppercase text-center font-bold italic tracking-wider">Clique para expandir (Cores Reais)</p>
          </div>

          {/* Última Localização (Ocorrência/Residência) */}
          {suspect.lat && suspect.lng && (
            <div className="pmmg-card overflow-hidden">
              <div className="p-4 flex items-center justify-between text-pmmg-navy bg-white/40">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">location_on</span>
                  <span className="text-sm font-bold uppercase">Última Localização (Ocorrência/Residência)</span>
                </div>
                <span className="text-[9px] font-bold uppercase opacity-50">{suspect.lastSeen}</span>
              </div>
              <div className="relative group cursor-pointer" onClick={() => handleOpenMap(suspect.lat, suspect.lng)}>
                <GoogleMapWrapper
                  center={{ lat: suspect.lat, lng: suspect.lng }}
                  zoom={15}
                  mapContainerClassName="h-48 w-full z-0 pointer-events-none"
                  options={{
                    disableDefaultUI: true,
                    draggable: false,
                    scrollwheel: false,
                    zoomControl: false,
                    mapTypeId: 'roadmap'
                  }}
                >
                  <MarkerF
                    position={{ lat: suspect.lat, lng: suspect.lng }}
                    icon={getMiniMapIcon(false)}
                  />
                </GoogleMapWrapper>
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                  <div className="bg-pmmg-navy/80 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-xl backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-transform">
                    <span className="material-symbols-outlined text-sm">open_in_full</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Abrir Mapa Geral</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Endereço da Abordagem (NOVO MAPA) */}
          {suspect.approachAddress && suspect.approachLat && suspect.approachLng && (
            <div className="pmmg-card overflow-hidden">
              <div className="p-4 flex items-center justify-between text-pmmg-navy bg-white/40">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">pin_drop</span>
                  <span className="text-sm font-bold uppercase">Endereço da Abordagem</span>
                </div>
                <span className="text-[9px] font-bold uppercase opacity-50">{suspect.approachAddress}</span>
              </div>
              <div className="relative group cursor-pointer" onClick={() => handleOpenMap(suspect.approachLat!, suspect.approachLng!)}>
                <GoogleMapWrapper
                  center={{ lat: suspect.approachLat, lng: suspect.approachLng }}
                  zoom={15}
                  mapContainerClassName="h-48 w-full z-0 pointer-events-none"
                  options={{
                    disableDefaultUI: true,
                    draggable: false,
                    scrollwheel: false,
                    zoomControl: false,
                    mapTypeId: 'roadmap'
                  }}
                >
                  <MarkerF
                    position={{ lat: suspect.approachLat, lng: suspect.approachLng }}
                    icon={getMiniMapIcon(true)}
                  />
                </GoogleMapWrapper>
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                  <div className="bg-pmmg-navy/80 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-xl backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-transform">
                    <span className="material-symbols-outlined text-sm">open_in_full</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Abrir Mapa Geral</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav activeScreen="dashboard" navigateTo={navigateTo} />
    </div>
  );
};

export default SuspectProfile;