import React, { useMemo } from 'react';
import { Screen, Suspect, CustomMarker, Group, Officer, GeocodedLocation, GroupPost } from '../types';
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
  isDarkMode: boolean; // NEW PROP
}

const GroupTacticalMap: React.FC<GroupTacticalMapProps> = ({
  navigateTo,
  group,
  allSuspects,
  allOfficers,
  userName,
  userRank,
  userDefaultLocation,
  onOpenProfile,
  addCustomMarker,
  updateCustomMarker,
  deleteCustomMarker,
  isDarkMode,
}) => {
  
  // Inclui o usuário atual na lista de oficiais para lookup
  const allParticipants: Officer[] = useMemo(() => [
    ...allOfficers, 
    { id: 'EU', name: userName, rank: userRank, unit: '', photoUrl: '', isOnline: true }
  ], [allOfficers, userName, userRank]);

  const findAuthor = (authorId: string) => allParticipants.find(o => o.id === authorId);

  // 1. Identifica e enriquece suspeitos compartilhados, ordenando pelo post mais recente
  const groupSuspects: EnrichedSuspect[] = useMemo(() => {
    // Mapeia posts de suspeitos para enriquecer os dados
    const suspectPosts = group.posts
      .filter(post => post.type === 'suspect' && post.suspectId)
      .map(post => {
        const suspect = allSuspects.find(s => s.id === post.suspectId);
        const author = findAuthor(post.authorId);
        
        if (suspect) {
          return {
            ...suspect,
            authorName: author?.name,
            authorRank: author?.rank,
            postTimestamp: new Date(post.timestamp).getTime(), // Adiciona timestamp para ordenação
          };
        }
        return null;
      })
      .filter((s): s is EnrichedSuspect & { postTimestamp: number } => s !== null);

    // Ordena do mais recente para o mais antigo
    suspectPosts.sort((a, b) => b.postTimestamp - a.postTimestamp);
    
    // Remove duplicatas (mantendo o mais recente)
    const uniqueSuspects = new Map<string, EnrichedSuspect>();
    suspectPosts.forEach(s => {
        if (!uniqueSuspects.has(s.id)) {
            uniqueSuspects.set(s.id, s);
        }
    });
    
    return Array.from(uniqueSuspects.values());
  }, [group.posts, allSuspects, findAuthor]);

  // 2. Enriquece os marcadores customizados
  const enrichedCustomMarkers: (EnrichedCustomMarker & { postTimestamp: number })[] = useMemo(() => {
    // Para marcadores customizados, assumimos que o autor é o primeiro admin do grupo
    const adminId = group.adminIds[0];
    const admin = findAuthor(adminId);
    
    // Como não temos timestamp para marcadores customizados no mock, 
    // vamos usar a data de criação do grupo como fallback para ordenação.
    const groupCreationTime = new Date(group.posts.find(p => p.eventType === 'group_created')?.timestamp || Date.now()).getTime();

    return group.customMarkers.map(marker => ({
        ...marker,
        authorName: admin?.name,
        authorRank: admin?.rank,
        postTimestamp: groupCreationTime, // Usando data de criação do grupo como mock de timestamp
    }));
  }, [group.customMarkers, group.adminIds, findAuthor, group.posts]);


  // 3. Determine o centro inicial (Prioridade: Ponto mais recente com coordenadas)
  const initialCenter = useMemo(() => {
    
    // 3.1. Busca o suspeito mais recente com coordenadas válidas
    const mostRecentSuspect = groupSuspects.find(s => s.lat && s.lng);
    
    // 3.2. Busca o marcador customizado mais recente (usando o mock de timestamp)
    // Nota: Como o timestamp do marcador é mockado, ele só será usado se não houver suspeitos.
    const mostRecentMarker = enrichedCustomMarkers.length > 0 ? enrichedCustomMarkers[0] : null;
    
    // 3.3. Compara e seleciona o ponto mais recente
    if (mostRecentSuspect) {
        // Se o suspeito mais recente tiver coordenadas, centraliza nele.
        return [mostRecentSuspect.lat!, mostRecentSuspect.lng!] as [number, number];
    }
    
    if (mostRecentMarker) {
        // Se não houver suspeitos, mas houver marcadores customizados, centraliza no primeiro marcador.
        return [mostRecentMarker.lat, mostRecentMarker.lng] as [number, number];
    }
    
    return null; // Deixa o TacticalMap usar userDefaultLocation ou DEFAULT_CENTER
  }, [groupSuspects, enrichedCustomMarkers]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Render the main TacticalMap component with filtered data */}
      <div className="flex-1">
        <TacticalMap
          navigateTo={navigateTo}
          suspects={groupSuspects} // Suspeitos enriquecidos
          onOpenProfile={onOpenProfile}
          initialCenter={initialCenter}
          userDefaultLocation={userDefaultLocation}
          customMarkers={enrichedCustomMarkers} // Marcadores enriquecidos
          addCustomMarker={(marker) => addCustomMarker(group.id, marker)}
          updateCustomMarker={(marker) => updateCustomMarker(group.id, marker)}
          deleteCustomMarker={(markerId) => deleteCustomMarker(group.id, markerId)}
          groupName={group.name}
          isDarkMode={isDarkMode} // PASSING NEW PROP
        />
      </div>
    </div>
  );
};

export default GroupTacticalMap;