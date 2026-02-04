import React, { useMemo } from 'react';
import { Screen, Suspect, CustomMarker, Group } from '../types';
import TacticalMap from './TacticalMap';

interface GroupTacticalMapProps {
  navigateTo: (screen: Screen) => void;
  group: Group;
  allSuspects: Suspect[];
  onOpenProfile: (id: string) => void;
  addCustomMarker: (marker: CustomMarker) => void;
  updateCustomMarker: (marker: CustomMarker) => void;
  deleteCustomMarker: (id: string) => void;
}

const GroupTacticalMap: React.FC<GroupTacticalMapProps> = ({
  navigateTo,
  group,
  allSuspects,
  onOpenProfile,
  addCustomMarker,
  updateCustomMarker,
  deleteCustomMarker,
}) => {
  
  // 1. Identify unique suspect IDs shared in the group posts
  const sharedSuspectIds = useMemo(() => {
    const ids = new Set<string>();
    group.posts.forEach(post => ids.add(post.suspectId));
    return Array.from(ids);
  }, [group.posts]);

  // 2. Filter the global suspects list to include only shared suspects
  const groupSuspects = useMemo(() => {
    return allSuspects.filter(s => sharedSuspectIds.includes(s.id));
  }, [allSuspects, sharedSuspectIds]);

  // Determine the initial center based on the first shared suspect, if available
  const initialCenter = useMemo(() => {
    const firstSuspect = groupSuspects.find(s => s.lat && s.lng);
    if (firstSuspect && firstSuspect.lat && firstSuspect.lng) {
      return [firstSuspect.lat, firstSuspect.lng] as [number, number];
    }
    return null;
  }, [groupSuspects]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* NOVO: Cabeçalho simplificado para navegação de volta */}
      <div className="sticky top-0 z-[1000] bg-pmmg-navy px-4 py-4 shadow-xl">
        <div className="flex items-center gap-3">
          <button onClick={() => navigateTo('groupDetail')} className="text-white active:scale-90 transition-transform">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-sm text-white leading-tight uppercase tracking-tight truncate">Mapa Tático do Grupo</h1>
            <p className="text-[9px] font-medium text-pmmg-yellow tracking-wider uppercase mt-0.5">Grupo: {group.name}</p>
          </div>
        </div>
      </div>
      
      {/* Render the main TacticalMap component with filtered data */}
      <div className="flex-1">
        <TacticalMap
          navigateTo={navigateTo}
          suspects={groupSuspects} // Only suspects shared in the group
          onOpenProfile={onOpenProfile}
          initialCenter={initialCenter}
          customMarkers={group.customMarkers} // Group-specific markers
          addCustomMarker={(marker) => addCustomMarker(marker)}
          updateCustomMarker={(marker) => updateCustomMarker(marker)}
          deleteCustomMarker={(markerId) => deleteCustomMarker(markerId)}
        />
      </div>
    </div>
  );
};

export default GroupTacticalMap;