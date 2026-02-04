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
      {/* Render the main TacticalMap component with filtered data */}
      <div className="flex-1">
        <TacticalMap
          navigateTo={navigateTo}
          suspects={groupSuspects} // Only suspects shared in the group
          onOpenProfile={onOpenProfile}
          initialCenter={initialCenter}
          customMarkers={group.customMarkers} // Group-specific markers
          addCustomMarker={(marker) => addCustomMarker(group.id, marker)} // Pass group ID to App.tsx handler
          updateCustomMarker={(marker) => updateCustomMarker(group.id, marker)} // Pass group ID to App.tsx handler
          deleteCustomMarker={(markerId) => deleteCustomMarker(group.id, markerId)} // Pass group ID to App.tsx handler
          groupName={group.name} // Pass the group name for header customization
        />
      </div>
    </div>
  );
};

export default GroupTacticalMap;