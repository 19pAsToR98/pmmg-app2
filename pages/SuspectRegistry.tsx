import React, { useState, useRef } from 'react';
import { Screen, Suspect } from '../types';
import BottomNav from '../components/BottomNav';
import MapLocationPicker from '../components/MapLocationPicker';

interface SuspectRegistryProps {
  navigateTo: (screen: Screen) => void;
  onSave: (suspect: Suspect) => void;
}

const SuspectRegistry: React.FC<SuspectRegistryProps> = ({ navigateTo, onSave }) => {
  const [status, setStatus] = useState<Suspect['status']>('Suspeito');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [nickname, setNickname] = useState('');
  const [motherName, setMotherName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [description, setDescription] = useState('');
  const [currentArticle, setCurrentArticle] = useState('');
  const [articles, setArticles] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showOnMap, setShowOnMap] = useState(true);
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleLocationChange = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
  };

  const handleSave = () => {
    if (!name || !cpf) {
      alert("Nome e CPF são obrigatórios.");
      return;
    }

    const primaryPhoto = photos.length > 0 ? photos[0] : `https://picsum.photos/seed/${name}/200/250`;

    const newSuspect: Suspect = {
      id: Date.now().toString(),
      name,
      nickname,
      cpf,
      status,
      lastSeen: 'Local do Registro',
      timeAgo: 'Agora',
      photoUrl: primaryPhoto,
      photoUrls: photos.length > 0 ? photos : [primaryPhoto],
      birthDate,
      motherName,
      articles,
      description,
      lat: lat,
      lng: lng,
      showOnMap: showOnMap,
    };

    onSave(newSuspect);
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center p-1 border-2 border-pmmg-red">
            <span className="material-symbols-outlined text-pmmg-navy text-2xl">shield</span>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none text-white uppercase tracking-tight">Cadastro de Indivíduo</h1>
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

        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
          {photos.length > 0 ? (
            <>
              {photos.map((src, idx) => (
                <div key={idx} className="relative shrink-0">
                  <div className="w-32 h-44 bg-white rounded-xl overflow-hidden border-2 border-pmmg-navy shadow-lg">
                    <img src={src} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  </div>
                  <button 
                    onClick={() => removePhoto(idx)}
                    className="absolute -top-2 -right-2 bg-pmmg-red text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                  {idx === 0 && (
                    <div className="absolute bottom-2 left-2 bg-pmmg-navy text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border border-white/20">Principal</div>
                  )}
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
        
        {/* Localização no Mapa */}
        <div className="flex items-center gap-2 mb-4 mt-8">
          <div className="h-4 w-1 bg-pmmg-navy rounded-full"></div>
          <h3 className="font-bold text-xs text-pmmg-navy uppercase tracking-wider">Localização Conhecida</h3>
        </div>
        
        <MapLocationPicker 
          initialLat={lat}
          initialLng={lng}
          onLocationChange={handleLocationChange}
        />

        {/* Map Visibility Toggle */}
        <div className="mt-4 pmmg-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-pmmg-navy">map</span>
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
              <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1 ml-1 tracking-wider">Alcunha / Vulgo</label>
              <input 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="block w-full px-4 py-3 bg-white/80 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
                placeholder="Ex: Baiano" 
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
          <div className="grid grid-cols-2 gap-3">
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

        <div className="mt-10 mb-8">
          <button 
            onClick={handleSave}
            className="w-full bg-pmmg-navy text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 uppercase tracking-widest active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined">save</span>
            Salvar Registro
          </button>
        </div>
      </main>

      <BottomNav activeScreen="registry" navigateTo={navigateTo} />
    </div>
  );
};

export default SuspectRegistry;