import React from 'react';
import { Suspect } from '../types';
import SuspectGridCard from './SuspectGridCard';
import { useLongPress } from '../hooks/useLongPress';

interface SuspectGridItemProps {
  suspect: Suspect;
  isSelectionMode: boolean;
  isSelected: boolean;
  handleCardClick: (id: string) => void;
  handleLongPress: (id: string) => void;
}

const SuspectGridItem: React.FC<SuspectGridItemProps> = ({
  suspect,
  isSelectionMode,
  isSelected,
  handleCardClick,
  handleLongPress,
}) => {
  // Hook call is now safely at the top level of this component
  const longPressProps = useLongPress(() => handleLongPress(suspect.id));

  return (
    <div 
      onClick={() => handleCardClick(suspect.id)}
      {...longPressProps}
      className={`relative transition-all cursor-pointer ${isSelectionMode ? 'active:scale-[0.98]' : 'active:scale-[0.98]'}`}
    >
      <SuspectGridCard suspect={suspect} />
      
      {isSelectionMode && (
        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          isSelected ? 'bg-theme-red border-white shadow-lg' : 'bg-white/70 border-theme-navy/30'
        }`}>
          {isSelected && <span className="material-symbols-outlined text-white text-sm fill-icon">check</span>}
        </div>
      )}
    </div>
  );
};

export default SuspectGridItem;