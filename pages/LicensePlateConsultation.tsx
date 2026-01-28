import React, { useState } from 'react';
import { Screen, UserRank } from '../types';
import RankBadge from '../components/RankBadge';

interface LicensePlateConsultationProps {
  navigateTo: (screen: Screen) => void;
  userRank: UserRank;
  userName: string;
}

const LicensePlateConsultation: React.FC<LicensePlateConsultationProps> = ({ navigateTo, userRank, userName }) => {
  const [plate, setPlate] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConsult = () => {
    if (!plate.trim()) return;
    setIsLoading(true);
    setResult(null);

    // Simulação de consulta IA
    setTimeout(() => {
      setIsLoading(false);
      const normalizedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      if (normalizedPlate.includes('ABC1234')) {
        setResult({
          status: 'ALERTA',
          plate: 'ABC-1234',
          model: 'FIAT UNO MILLE',
          color: 'CINZA',
          owner: 'RICARDO SILVEIRA (FORAGIDO)',
          details: 'Veículo associado a roubo à mão armada (Art. 157) em 12/05/2024. ALTA PRIORIDADE.',
          icon: 'priority_high',
          colorClass: 'bg-pmmg-red'
        });
      } else if (normalizedPlate.includes('XYZ9876')) {
        setResult({
          status: 'SUSPEITO',
          plate: 'XYZ-9876',
          model: 'HONDA CIVIC',
          color: 'PRETO',
          owner: 'MARCOS LIMA (SUSPEITO)',
          details: 'Veículo registrado em nome de indivíduo com histórico de receptação (Art. 180).',
          icon: 'warning',
          colorClass: 'bg-pmmg-yellow text-pmmg-navy'
        });
      } else {
        setResult({
          status: 'LIMPO',
          plate: normalizedPlate,
          model: 'NÃO ENCONTRADO',
          color: 'N/D',
          owner: 'N/D',
          details: 'Nenhum alerta ou restrição encontrado para esta placa na base de dados SISP.',
          icon: 'check_circle',
          colorClass: 'bg-green-600'
        });
      }
    }, 1500);
  };

  // FIX: Ensure userName is defined before splitting
  const safeUserName = userName || '';
  const rankInitials = safeUserName.split(' ').map(n => n[0]).join('');
  const officerName = safeUserName.split(' ')[0];

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="bg-pmmg-navy px-4 pt-12 pb-8 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pmmg-yellow/10 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10 flex items-center justify-between">
          <button onClick={() => navigateTo('aiTools')} className="text-white p-2 rounded-full active:bg-white/10">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div className="text-center flex-1 mx-4">
            <h1 className="text-xl font-bold text-white uppercase tracking-tight">Consultar Placa</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Leitura e Análise Veicular IA</p>
          </div>
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-pmmg-yellow/80 p-0.5 bg-white/10 overflow-hidden shadow-xl flex items-center justify-center">
              <span className="text-pmmg-navy text-sm font-bold">{rankInitials}</span>
            </div>
            <div className="absolute -bottom-2 -right-2 p-1 bg-pmmg-navy rounded-lg border-2 border-pmmg-yellow shadow-lg">
              <RankBadge rank={userRank} size="sm" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 -mt-6 pb-32 space-y-6 no-scrollbar overflow-y-auto">
        
        {/* Input Section */}
        <section className="pmmg-card p-5">
          <h3 className="text-[11px] font-bold text-pmmg-navy/60 uppercase tracking-wider mb-3">Placa Mercosul ou Antiga</h3>
          <div className="flex gap-3">
            <input 
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/80 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm font-bold uppercase tracking-widest" 
              placeholder="Ex: ABC1234" 
              type="text" 
              maxLength={8}
            />
            <button 
              onClick={handleConsult}
              disabled={isLoading || plate.trim().length < 4}
              className="bg-pmmg-navy text-white p-3 rounded-xl shadow-md active:scale-95 transition-transform disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-xl ${isLoading ? 'animate-spin' : ''}`}>
                {isLoading ? 'progress_activity' : 'search'}
              </span>
            </button>
          </div>
        </section>

        {/* Result Section */}
        {result && (
          <section className={`pmmg-card overflow-hidden border-l-4 ${result.colorClass.includes('red') ? 'border-l-pmmg-red' : result.colorClass.includes('yellow') ? 'border-l-pmmg-yellow' : 'border-l-green-600'}`}>
            <div className={`p-4 flex items-center justify-between ${result.colorClass}`}>
              <h4 className={`text-sm font-black uppercase tracking-widest ${result.colorClass.includes('yellow') ? 'text-pmmg-navy' : 'text-white'}`}>
                Status: {result.status}
              </h4>
              <span className={`material-symbols-outlined text-2xl fill-icon ${result.colorClass.includes('yellow') ? 'text-pmmg-navy' : 'text-white'}`}>
                {result.icon}
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[10px] text-pmmg-navy/50 font-bold uppercase tracking-wider mb-0.5">Placa Consultada</p>
                <p className="text-xl font-black text-pmmg-navy">{result.plate}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-pmmg-navy/50 font-bold uppercase tracking-wider mb-0.5">Modelo</p>
                  <p className="text-sm font-bold text-slate-800">{result.model}</p>
                </div>
                <div>
                  <p className="text-[10px] text-pmmg-navy/50 font-bold uppercase tracking-wider mb-0.5">Cor</p>
                  <p className="text-sm font-bold text-slate-800">{result.color}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-pmmg-navy/50 font-bold uppercase tracking-wider mb-0.5">Proprietário/Associação</p>
                <p className="text-sm font-bold text-pmmg-red">{result.owner}</p>
              </div>
              <div className="pt-3 border-t border-pmmg-navy/5">
                <p className="text-[10px] text-pmmg-navy/50 font-bold uppercase tracking-wider mb-1">Detalhes Táticos (IA)</p>
                <p className="text-xs text-slate-700 italic">{result.details}</p>
              </div>
            </div>
          </section>
        )}

        {/* Info Box */}
        <div className="bg-pmmg-navy/5 p-4 rounded-xl border border-pmmg-navy/10 mt-6">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-pmmg-navy text-xl">info</span>
            <p className="text-[10px] text-pmmg-navy font-semibold uppercase tracking-tight leading-4">
              A consulta utiliza a base de dados SISP e a rede neural tática para identificar alertas e associações criminais.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LicensePlateConsultation;