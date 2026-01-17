import React, { useState, useRef } from 'react';
import { POI } from '../types';

interface MapPOIEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (poi: POI) => void;
  initialCoords: { lat: number; lng: number } | null;
}

const POI_TYPES: POI['type'][] = ['Ponto de Risco', 'Base Tática', 'Comércio Suspeito', 'Outro'];

const MapPOIEditorModal: React.FC<MapPOIEditorModalProps> = ({ isOpen, onClose, onSave, initialCoords }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<POI['type']>('Ponto de Risco');
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !initialCoords) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetState = () => {
    setTitle('');
    setDescription('');
    setType('Ponto de Risco');
    setPhoto(undefined);
  };

  const handleSave = () => {
    if (!title || !description) {
      alert('Título e descrição são obrigatórios.');
      return;
    }

    const newPOI: POI = {
      id: Date.now().toString(),
      lat: initialCoords.lat,
      lng: initialCoords.lng,
      title,
      description,
      type,
      photoUrl: photo,
      officerId: 'SGT_RODRIGO', // Mocked officer ID
      timestamp: new Date().toISOString(),
    };

    onSave(newPOI);
    resetState();
    onClose();
  };
  
  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/50 backdrop-blur-sm flex items-end justify-center p-4">
      <div className="bg-pmmg-khaki p-5 rounded-t-3xl w-full max-w-md shadow-2xl transform translate-y-0 transition-transform duration-300">
        
        <header className="flex justify-between items-center border-b border-pmmg-navy/10 pb-3 mb-4">
          <h2 className="text-lg font-bold text-pmmg-navy uppercase tracking-tight">Cadastrar Ponto Tático</h2>
          <button onClick={handleClose} className="text-pmmg-navy/60 hover:text-pmmg-red">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
          
          {/* Coordenadas */}
          <div className="bg-white/70 p-3 rounded-lg border border-pmmg-navy/10">
            <p className="text-[10px] font-bold uppercase text-pmmg-navy/70 tracking-wider">Localização (Lat/Lng)</p>
            <p className="text-sm font-mono text-pmmg-navy mt-1">{initialCoords.lat.toFixed(5)}, {initialCoords.lng.toFixed(5)}</p>
          </div>

          {/* Tipo de POI */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-2 ml-1 tracking-wider">Tipo de Ponto</label>
            <div className="grid grid-cols-2 gap-2">
              {POI_TYPES.map((poiType) => (
                <button
                  key={poiType}
                  onClick={() => setType(poiType)}
                  className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                    type === poiType 
                      ? 'bg-pmmg-navy text-pmmg-yellow border-pmmg-yellow' 
                      : 'bg-white/70 text-pmmg-navy border-pmmg-navy/20'
                  }`}
                >
                  {poiType}
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1 ml-1 tracking-wider">Título Curto</label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full px-4 py-3 bg-white/80 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
              placeholder="Ex: Beco do Tráfico, Base 402" 
              type="text" 
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-1 ml-1 tracking-wider">Descrição Detalhada</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="block w-full px-4 py-3 bg-white/80 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
              placeholder="Detalhes da atividade, horários de pico, riscos, etc." 
            />
          </div>

          {/* Foto de Evidência */}
          <div className="mt-4">
            <label className="block text-[10px] font-bold uppercase text-pmmg-navy/70 mb-2 ml-1 tracking-wider">Evidência Fotográfica (Opcional)</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoChange} 
              accept="image/*" 
              className="hidden" 
              capture="environment"
            />
            
            {photo ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-pmmg-navy shadow-md">
                <img src={photo} alt="Evidência" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setPhoto(undefined)}
                  className="absolute top-2 right-2 bg-pmmg-red text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-20 bg-white/50 border-2 border-dashed border-pmmg-navy/30 rounded-xl flex flex-col items-center justify-center hover:border-pmmg-navy/50 transition-colors"
              >
                <span className="material-symbols-outlined text-pmmg-navy/40 text-3xl">photo_camera</span>
                <span className="text-[9px] font-bold text-pmmg-navy/60 uppercase tracking-widest mt-1">Tirar Foto / Anexar</span>
              </button>
            )}
          </div>
        </div>

        <footer className="pt-4 flex gap-3">
          <button 
            onClick={handleClose}
            className="flex-1 bg-white border border-pmmg-navy/20 text-pmmg-navy font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-3 uppercase tracking-widest active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined">cancel</span>
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 bg-pmmg-navy text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 uppercase tracking-widest active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined">add_location_alt</span>
            Salvar Ponto
          </button>
        </footer>
      </div>
    </div>
  );
};

export default MapPOIEditorModal;