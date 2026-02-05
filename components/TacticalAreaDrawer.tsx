import React, { useState, useMemo } from 'react';
import { TacticalArea } from '../types';

interface TacticalAreaDrawerProps {
  areas: TacticalArea[];
  isDrawing: boolean;
  setIsDrawing: (is: boolean) => void;
  onAreaSelect: (area: TacticalArea) => void;
  onAreaDelete: (id: string) => void;
  onAreaEdit: (area: TacticalArea) => void;
  onCancelDrawing: () => void;
  onSaveNewArea: (name: string, description: string, color: string, paths: { lat: number; lng: number }[]) => void;
  newAreaPaths: { lat: number; lng: number }[];
  isEditingArea: boolean;
  editingArea: TacticalArea | null;
  onCancelEdit: () => void;
  onUpdateArea: (updatedArea: TacticalArea) => void;
}

const COLOR_OPTIONS = [
  { name: 'Facção Vermelha', hex: '#e31c1c', tailwind: 'bg-pmmg-red' },
  { name: 'Facção Azul', hex: '#0047ab', tailwind: 'bg-pmmg-blue' },
  { name: 'Área de Risco', hex: '#ffcc00', tailwind: 'bg-pmmg-yellow' },
  { name: 'Área de Patrulha', hex: '#002147', tailwind: 'bg-pmmg-navy' },
];

const TacticalAreaDrawer: React.FC<TacticalAreaDrawerProps> = ({
  areas,
  isDrawing,
  setIsDrawing,
  onAreaSelect,
  onAreaDelete,
  onCancelDrawing,
  onSaveNewArea,
  newAreaPaths,
  isEditingArea,
  editingArea,
  onCancelEdit,
  onUpdateArea,
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaDescription, setNewAreaDescription] = useState('');
  const [newAreaColor, setNewAreaColor] = useState(COLOR_OPTIONS[0].hex);
  
  // Estados para edição
  const [editName, setEditName] = useState(editingArea?.name || '');
  const [editDescription, setEditDescription] = useState(editingArea?.description || '');
  const [editColor, setEditColor] = useState(editingArea?.color || COLOR_OPTIONS[0].hex);

  // Sincroniza estados de edição quando o editingArea muda
  React.useEffect(() => {
    if (editingArea) {
      setEditName(editingArea.name);
      setEditDescription(editingArea.description);
      setEditColor(editingArea.color);
      setIsPanelOpen(true);
    }
  }, [editingArea]);

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setIsPanelOpen(true);
    setNewAreaName('');
    setNewAreaDescription('');
    setNewAreaColor(COLOR_OPTIONS[0].hex);
  };

  const handleSave = () => {
    if (isEditingArea && editingArea) {
      onUpdateArea({
        ...editingArea,
        name: editName,
        description: editDescription,
        color: editColor,
        strokeColor: COLOR_OPTIONS.find(c => c.hex === editColor)?.hex || editColor,
      });
      onCancelEdit();
    } else if (newAreaPaths.length >= 3) {
      onSaveNewArea(newAreaName, newAreaDescription, newAreaColor, newAreaPaths);
      setIsDrawing(false);
      setNewAreaName('');
      setNewAreaDescription('');
      setNewAreaColor(COLOR_OPTIONS[0].hex);
    } else {
      alert("A área deve ter pelo menos 3 pontos (vértices).");
    }
  };
  
  const handleCancel = () => {
    if (isDrawing) {
      onCancelDrawing();
    }
    if (isEditingArea) {
      onCancelEdit();
    }
    setIsPanelOpen(false);
  };

  const currentMode = isDrawing ? 'drawing' : isEditingArea ? 'editing' : 'view';
  
  const currentAreaColor = currentMode === 'editing' ? editColor : newAreaColor;

  return (
    <div className={`absolute top-4 right-0 z-[1000] bottom-[100px] transition-transform duration-300 ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      
      {/* Botão de Toggle */}
      <button 
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 bg-pmmg-navy p-1.5 rounded-l-xl shadow-xl text-pmmg-yellow"
      >
        <span className="material-symbols-outlined text-lg">
          {isPanelOpen ? 'arrow_forward_ios' : 'arrow_back_ios'}
        </span>
      </button>

      {/* Conteúdo do Painel */}
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-l-2xl shadow-2xl border border-pmmg-navy/10 flex flex-col gap-3 h-full overflow-y-auto w-72">
        
        <h3 className="text-[10px] font-black text-pmmg-navy/60 uppercase tracking-widest border-b border-pmmg-navy/5 pb-2">
          {currentMode === 'editing' ? 'Editar Área Tática' : 'Gestão de Áreas Táticas'}
        </h3>

        {/* Modo de Desenho/Edição */}
        {(isDrawing || isEditingArea) ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase text-pmmg-red">
                {currentMode === 'drawing' ? `DESENHANDO (${newAreaPaths.length} PONTOS)` : 'EDITANDO METADADOS'}
              </p>
              {currentMode === 'drawing' && newAreaPaths.length > 0 && (
                <button 
                  onClick={onCancelDrawing}
                  className="text-[8px] font-black text-pmmg-red uppercase"
                >
                  Limpar Pontos
                </button>
              )}
            </div>
            
            {/* Input de Nome */}
            <div>
              <label className="block text-[9px] font-bold uppercase text-pmmg-navy/70 mb-1">Nome da Área</label>
              <input 
                value={currentMode === 'editing' ? editName : newAreaName}
                onChange={(e) => currentMode === 'editing' ? setEditName(e.target.value) : setNewAreaName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Ex: Zona de Facção Gamma"
              />
            </div>
            
            {/* Input de Descrição */}
            <div>
              <label className="block text-[9px] font-bold uppercase text-pmmg-navy/70 mb-1">Descrição</label>
              <textarea 
                value={currentMode === 'editing' ? editDescription : newAreaDescription}
                onChange={(e) => currentMode === 'editing' ? setEditDescription(e.target.value) : setNewAreaDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Detalhes da atuação ou risco"
              />
            </div>
            
            {/* Seleção de Cor */}
            <div>
              <label className="block text-[9px] font-bold uppercase text-pmmg-navy/70 mb-1">Cor de Identificação</label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map(opt => (
                  <button
                    key={opt.hex}
                    onClick={() => currentMode === 'editing' ? setEditColor(opt.hex) : setNewAreaColor(opt.hex)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${opt.tailwind} ${currentAreaColor === opt.hex ? 'ring-4 ring-offset-2 ring-pmmg-navy' : 'border-white'}`}
                    title={opt.name}
                  ></button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-pmmg-navy/5">
              <button 
                onClick={handleCancel}
                className="flex-1 bg-slate-200 text-pmmg-navy font-bold py-2 rounded-xl text-xs uppercase"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={currentMode === 'drawing' && newAreaPaths.length < 3}
                className="flex-1 bg-pmmg-navy text-white font-bold py-2 rounded-xl text-xs uppercase disabled:opacity-50"
              >
                {currentMode === 'editing' ? 'Salvar Edição' : 'Salvar Área'}
              </button>
            </div>
          </div>
        ) : (
          // Modo de Visualização
          <>
            <button 
              onClick={handleStartDrawing}
              className="w-full bg-pmmg-red text-white text-xs font-bold py-3 rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-md"
            >
              <span className="material-symbols-outlined text-lg">draw</span>
              Desenhar Nova Área
            </button>
            
            <p className="text-[8px] font-black text-pmmg-navy/40 uppercase tracking-widest border-b border-pmmg-navy/5 pb-1 mb-1 pt-2">Áreas Salvas ({areas.length})</p>

            <div className="space-y-2 flex-1 overflow-y-auto">
              {areas.length > 0 ? areas.map(area => (
                <div 
                  key={area.id} 
                  onClick={() => onAreaSelect(area)}
                  className="p-3 bg-white rounded-xl border border-pmmg-navy/10 shadow-sm cursor-pointer active:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                        style={{ backgroundColor: area.color }}
                      ></div>
                      <h4 className="text-[11px] font-black text-pmmg-navy uppercase leading-tight">{area.name}</h4>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onAreaEdit(area); }}
                        className="text-pmmg-navy/50 hover:text-pmmg-navy p-1"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onAreaDelete(area.id); }}
                        className="text-pmmg-red/50 hover:text-pmmg-red p-1"
                        title="Excluir"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1 line-clamp-2">{area.description}</p>
                </div>
              )) : (
                <p className="text-xs text-slate-400 italic text-center py-4">Nenhuma área tática registrada.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TacticalAreaDrawer;