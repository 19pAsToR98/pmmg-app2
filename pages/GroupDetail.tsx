import React, { useState, useMemo } from 'react';
import { Screen, Group, Officer, Suspect } from '../types';

interface GroupDetailProps {
  navigateTo: (screen: Screen) => void;
  group: Group;
  allOfficers: Officer[];
  allSuspects: Suspect[];
  onOpenProfile: (id: string) => void;
  onShareSuspect: (groupId: string, suspectId: string, observation: string) => void;
}

type PostFilterStatus = Suspect['status'] | 'Todos';

const STATUS_OPTIONS: PostFilterStatus[] = ['Todos', 'Foragido', 'Suspeito', 'Preso', 'CPF Cancelado'];

const GroupDetail: React.FC<GroupDetailProps> = ({ navigateTo, group, allOfficers, allSuspects, onOpenProfile, onShareSuspect }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuspectId, setShareSuspectId] = useState<string | null>(null);
  const [shareObservation, setShareObservation] = useState('');
  const [suspectSearchTerm, setSuspectSearchTerm] = useState('');
  
  // Filtros da Linha do Tempo
  const [timelineSearchTerm, setTimelineSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PostFilterStatus>('Todos');
  const [authorFilterId, setAuthorFilterId] = useState<string>('Todos'); // 'Todos' ou Officer ID

  const getOfficer = (id: string) => allOfficers.find(o => o.id === id) || { name: 'Oficial Desconhecido', rank: 'N/D', unit: 'N/D', photoUrl: 'https://i.pravatar.cc/150?img=5', isOnline: false };
  const getSuspect = (id: string) => allSuspects.find(s => s.id === id);

  const filteredSuspects = useMemo(() => {
    if (!suspectSearchTerm) return [];
    const term = suspectSearchTerm.toLowerCase();
    return allSuspects.filter(s => 
      s.name.toLowerCase().includes(term) || s.cpf.includes(term)
    ).slice(0, 5);
  }, [suspectSearchTerm, allSuspects]);

  // Membros do grupo para o filtro de autor
  const groupMembers = useMemo(() => {
    return allOfficers.filter(o => group.memberIds.includes(o.id));
  }, [group.memberIds, allOfficers]);

  // Lógica de Filtragem da Linha do Tempo
  const filteredPosts = useMemo(() => {
    const searchLower = timelineSearchTerm.toLowerCase().trim();
    const sorted = [...group.posts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return sorted.filter(post => {
      const suspect = getSuspect(post.suspectId);
      if (!suspect) return false;

      // Filtro por Autor
      if (authorFilterId !== 'Todos' && post.authorId !== authorFilterId) {
        return false;
      }

      // Filtro por Status
      if (statusFilter !== 'Todos' && suspect.status !== statusFilter) {
        return false;
      }

      // Pesquisa por Termo (Nome, CPF, Observação)
      if (searchLower) {
        const matchesSearch = 
          suspect.name.toLowerCase().includes(searchLower) ||
          suspect.cpf.includes(searchLower) ||
          post.observation.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [group.posts, timelineSearchTerm, statusFilter, authorFilterId, allSuspects]);

  const handleShare = () => {
    if (shareSuspectId && shareObservation.trim()) {
      onShareSuspect(group.id, shareSuspectId, shareObservation.trim());
      setIsSharing(false);
      setShareSuspectId(null);
      setShareObservation('');
      setSuspectSearchTerm('');
    } else {
      alert("Selecione uma ficha e adicione uma observação tática.");
    }
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (date.toDateString() === today.toDateString()) {
      return `Hoje, ${time}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem, ${time}`;
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) + ` ${time}`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-blue-600 p-4 flex items-center justify-between">
        <button onClick={() => navigateTo('groupsList')} className="text-white">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <div className="flex-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600">groups</span>
          </div>
          <div>
            <h1 className="font-semibold text-white text-lg">{group.name}</h1>
            <p className="text-sm text-gray-300">{group.memberIds.length} Membros</p>
          </div>
        </div>
        <button className="text-white" onClick={() => alert('Gerenciar membros')}>
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Share Button */}
        <div className="flex justify-center">
          <button 
            onClick={() => setIsSharing(true)}
            className="bg-red-500 text-white text-sm font-bold px-5 py-3 rounded-full shadow-lg hover:bg-red-600 transition-all"
          >
            <span className="material-symbols-outlined text-lg">share</span> Compartilhar Ficha
          </button>
        </div>

        {/* Filters Section */}
        <section className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Filtros da Linha do Tempo</h3>
          
          {/* Search */}
          <div className="relative mb-4">
            <input 
              value={timelineSearchTerm}
              onChange={(e) => setTimelineSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-sm"
              placeholder="Buscar por nome, CPF ou observação..." 
              type="text" 
            />
          </div>

          {/* Status Filter */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600">Status do Indivíduo</label>
            <div className="flex gap-3 mt-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setStatusFilter(opt)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${statusFilter === opt ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Author Filter */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600">Autor do Post</label>
            <select
              value={authorFilterId}
              onChange={(e) => setAuthorFilterId(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-sm"
            >
              <option value="Todos">Todos os Oficiais</option>
              {groupMembers.map(officer => (
                <option key={officer.id} value={officer.id}>
                  {officer.rank} - {officer.name}
                </option>
              ))}
            </select>
          </div>

          <p className="text-center text-sm text-gray-500">{filteredPosts.length} posts encontrados</p>
        </section>

        {/* Timeline Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Resultados da Linha do Tempo</h3>
          
          {filteredPosts.length > 0 ? filteredPosts.map((post) => {
            const author = getOfficer(post.authorId);
            const suspect = getSuspect(post.suspectId);
            
            if (!suspect) return null;

            return (
              <div key={post.id} className="flex gap-4 mb-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div className="w-0.5 h-full bg-gray-300"></div>
                </div>
                <div className="flex-1 p-4 bg-white rounded-xl shadow-md">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-semibold">{author.rank} - {author.name}</p>
                      <p className="text-xs text-gray-500">{author.unit}</p>
                    </div>
                    <p className="text-xs text-gray-400">{formatTimestamp(post.timestamp)}</p>
                  </div>
                  <p className="mt-2 italic text-sm text-gray-600">"{post.observation}"</p>
                  <div 
                    onClick={() => onOpenProfile(suspect.id)}
                    className="mt-4 flex items-center gap-3 bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden">
                      <img src={suspect.photoUrl} alt={suspect.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-600">{suspect.status}</p>
                      <p className="text-sm font-semibold text-gray-700">{suspect.name}</p>
                      <p className="text-xs text-gray-500">{suspect.cpf}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center text-gray-500 mt-10">
              <span className="material-symbols-outlined text-5xl">search_off</span>
              <p className="mt-4 text-sm">Nenhum post corresponde aos filtros aplicados.</p>
            </div>
          )}
        </section>
      </main>

      {/* Share Modal */}
      {isSharing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Compartilhar Ficha</h3>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600">Buscar Suspeito</label>
              <input 
                value={suspectSearchTerm}
                onChange={(e) => setSuspectSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-sm"
                placeholder="Nome ou CPF do suspeito"
              />
              {filteredSuspects.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg bg-white shadow-lg">
                  {filteredSuspects.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setShareSuspectId(s.id);
                        setSuspectSearchTerm(s.name); // Preenche o input com o nome
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {s.name} ({s.cpf})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {shareSuspectId && getSuspect(shareSuspectId) && (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                <span className="material-symbols-outlined text-yellow-500">check_circle</span>
                <span className="ml-2">Ficha Selecionada: {getSuspect(shareSuspectId)?.name}</span>
              </div>
            )}

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600">Observação Tática</label>
              <textarea 
                value={shareObservation}
                onChange={(e) => setShareObservation(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg text-sm"
                placeholder="Ex: Visto em área de risco com veículo novo."
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setIsSharing(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleShare}
                disabled={!shareSuspectId || !shareObservation.trim()}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-sm disabled:opacity-50"
              >
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
