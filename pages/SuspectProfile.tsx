import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Screen, Suspect } from '../types';
import BottomNav from '../components/BottomNav';

interface SuspectProfileProps {
  suspect: Suspect;
  onBack: () => void;
  navigateTo: (screen: Screen, center?: [number, number]) => void;
  allSuspects: Suspect[];
  onOpenProfile: (id: string) => void;
}

const SuspectProfile: React.FC<SuspectProfileProps> = ({ suspect, onBack, navigateTo, allSuspects, onOpenProfile }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('data');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const photos = suspect.photoUrls || [suspect.photoUrl];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const findAssociatedSuspect = (id: string) => {
    return allSuspects.find(s => s.id === id);
  };

  useEffect(() => {
    if (miniMapRef.current && suspect.lat && suspect.lng && !mapInstance.current) {
      mapInstance.current = L.map(miniMapRef.current, {
        center: [suspect.lat, suspect.lng],
        zoom: 15,
        zoomControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current);

      const color = suspect.status === 'Foragido' ? 'bg-pmmg-red' : 'bg-pmmg-yellow';
      const suspectIcon = L.divIcon({
        className: 'custom-suspect-icon',
        html: `<div class="w-8 h-8 ${color} rounded-lg border-2 border-pmmg-navy flex items-center justify-center shadow-lg transform rotate-45"><span class="material-symbols-outlined text-pmmg-navy text-[16px] transform -rotate-45">priority_high</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker([suspect.lat, suspect.lng], { icon: suspectIcon }).addTo(mapInstance.current);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [suspect]);

  const handleOpenMap = () => {
    if (suspect.lat && suspect.lng) {
      navigateTo('map', [suspect.lat, suspect.lng]);
    } else {
      navigateTo('map');
    }
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      {/* Fullscreen Photo Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[2000] bg-black/98 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="absolute top-6 right-6 text-white bg-white/20 p-2 rounded-full backdrop-blur-md">
            <span className="material-symbols-outlined text-2xl">close</span>
          </div>
          <img 
            src={fullscreenImage} 
            alt="Evidência em Detalhe" 
            className="max-w-full max-h-[85vh] object-contain rounded-sm shadow-2xl border border-white/10" 
          />
          <div className="mt-6 px-8 text-center">
            <p className="text-pmmg-yellow text-[11px] font-black uppercase tracking-[0.2em] bg-pmmg-navy/80 px-6 py-3 rounded-full border border-pmmg-yellow/40 shadow-xl">
              VISUALIZAÇÃO DE IDENTIFICAÇÃO ORIGINAL
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
          <button onClick={() => alert('Compartilhando...')} className="bg-white/10 p-1.5 rounded-full">
            <span className="material-symbols-outlined text-white text-xl">share</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        {/* Header Section with Static Photo - NO FILTER */}
        <section className="p-4 bg-gradient-to-b from-pmmg-navy to-pmmg-navy/80 pb-12 rounded-b-[2rem] shadow-xl">
          <div className="flex gap-4 relative">
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
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-end">
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
              
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl backdrop-blur-sm">
                <p className="text-[9px] text-pmmg-yellow/60 font-bold uppercase tracking-widest mb-1">Descrição Tática</p>
                <p className="text-[10px] text-white/90 leading-snug italic font-medium">
                  {suspect.description || "Nenhuma observação física registrada no prontuário."}
                </p>
              </div>
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

          {/* NEW: Vehicles Section */}
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

          {/* NEW: Associations Section */}
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

          {/* Photo Gallery - NO FILTERS */}
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

          <div className="pmmg-card overflow-hidden">
            <div className="p-4 flex items-center justify-between text-pmmg-navy bg-white/40">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">location_on</span>
                <span className="text-sm font-bold uppercase">Última Localização</span>
              </div>
              <span className="text-[9px] font-bold uppercase opacity-50">{suspect.lastSeen}</span>
            </div>
            <div className="relative group cursor-pointer" onClick={handleOpenMap}>
              <div ref={miniMapRef} className="h-48 w-full bg-slate-200 z-0 pointer-events-none"></div>
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                <div className="bg-pmmg-navy/80 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-xl backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-transform">
                  <span className="material-symbols-outlined text-sm">open_in_full</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Abrir Mapa Geral</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav activeScreen="dashboard" navigateTo={navigateTo} />
    </div>
  );
};

export default SuspectProfile;