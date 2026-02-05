import React, { useMemo } from 'react';
import { Screen, Suspect, CustomMarker, Group, Officer, GeocodedLocation } from '../types';
import TacticalMap from './TacticalMap';

// Definindo tipos enriquecidos para passar ao TacticalMap
interface EnrichedSuspect extends Suspect {
  authorName?: string;
  authorRank?: Officer['rank'];
}

interface EnrichedCustomMarker extends CustomMarker {
  authorName?: string;
  authorRank?: Officer['rank'];
}

interface GroupTacticalMapProps {
  navigateTo: (screen: Screen) => void;
  group: Group;
  allSuspects: Suspect[];
  allOfficers: Officer[]; // Adicionado para buscar o nome do autor
  userName: string; // Adicionado para o usuário 'EU'
  userRank: Officer['rank']; // Adicionado para o usuário 'EU'
  userDefaultLocation: GeocodedLocation | null; // NOVO: Localização padrão do usuário
  onOpenProfile: (id: string) => void;
  addCustomMarker: (marker: CustomMarker) => void;
  updateCustomMarker: (marker: CustomMarker) => void;
  deleteCustomMarker: (id: string) => void;
}

const GroupTacticalMap: React.FC<GroupTacticalMapProps> = ({
  navigateTo,
  group,
  allSuspects,
  allOfficers,
  userName,
  userRank,
  userDefaultLocation, // NOVO
  onOpenProfile,
  addCustomMarker,
  updateCustomMarker,
  deleteCustomMarker,
}) => {
  
  // Inclui o usuário atual na lista de oficiais para lookup
  const allParticipants: Officer[] = useMemo(() => [
    ...allOfficers, 
    { id: 'EU', name: userName, rank: userRank, unit: '', photoUrl: '', isOnline: true }
  ], [allOfficers, userName, userRank]);

  const findAuthor = (authorId: string) => allParticipants.find(o => o.id === authorId);

  // 1. Identifica IDs de suspeitos compartilhados e o autor mais recente
  const sharedSuspectsMap = useMemo(() => {
    const map = new Map<string, { suspect: Suspect, authorId: string }>();
    
    // Posts são ordenados do mais novo para o mais antigo no App.tsx, mas vamos garantir o autor mais recente
    // Na verdade, vamos usar o autor do post mais recente para simplificar a exibição no mapa.
    const postsBySuspectId = new Map<string, GroupPost>();
    
    // Itera posts do mais novo para o mais antigo (se o App.tsx garantir a ordem)
    group.posts.forEach(post => {
        if (post.suspectId && !postsBySuspectId.has(post.suspectId)) {
            postsBySuspectId.set(post.suspectId, post);
        }
    });

    postsBySuspectId.forEach((post, suspectId) => {
        const suspect = allSuspects.find(s => s.id === suspectId);
        if (suspect) {
            map.set(suspectId, { suspect, authorId: post.authorId });
        }
    });
    
    return map;
  }, [group.posts, allSuspects]);

  // 2. Filtra e enriquece a lista de suspeitos
  const groupSuspects: EnrichedSuspect[] = useMemo(() => {
    return Array.from(sharedSuspectsMap.values()).map(({ suspect, authorId }) => {
        const author = findAuthor(authorId);
        return {
            ...suspect,
            authorName: author?.name,
            authorRank: author?.rank,
        };
    });
  }, [sharedSuspectsMap, findAuthor]);

  // 3. Enriquece os marcadores customizados
  const enrichedCustomMarkers: EnrichedCustomMarker[] = useMemo(() => {
    // Para marcadores customizados, precisamos de uma forma de rastrear o autor.
    // Como a interface CustomMarker não tem 'authorId', vamos assumir que o autor é o primeiro admin do grupo
    // ou, idealmente, o autor do post que levou à criação do marcador (o que não temos no mock).
    // Por simplicidade, vamos usar o primeiro admin como autor do marcador customizado.
    const adminId = group.adminIds[0];
    const admin = findAuthor(adminId);
    
    return group.customMarkers.map(marker => ({
        ...marker,
        authorName: admin?.name,
        authorRank: admin?.rank,
    }));
  }, [group.customMarkers, group.adminIds, findAuthor]);


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
          suspects={groupSuspects} // Suspeitos enriquecidos
          onOpenProfile={onOpenProfile}
          initialCenter={initialCenter}
          userDefaultLocation={userDefaultLocation} // PASSANDO A LOCALIZAÇÃO PADRÃO
          customMarkers={enrichedCustomMarkers} // Marcadores enriquecidos
          addCustomMarker={(marker) => addCustomMarker(group.id, marker)}
          updateCustomMarker={(marker) => updateCustomMarker(group.id, marker)}
          deleteCustomMarker={(markerId) => deleteCustomMarker(group.id, markerId)}
          groupName={group.name}
        />
      </div>
    </div>
  );
};

export default GroupTacticalMap;