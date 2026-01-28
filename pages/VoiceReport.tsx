import React, { useState } from 'react';
import { Screen, UserRank } from '../types';
import RankBadge from '../components/RankBadge';

interface VoiceReportProps {
  navigateTo: (screen: Screen) => void;
  userRank: UserRank;
  userName: string;
}

const VoiceReport: React.FC<VoiceReportProps> = ({ navigateTo, userRank, userName }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [reportText, setReportText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      // Simulação de transcrição e processamento
      setTimeout(() => {
        setReportText("Transcrição: 'Guarnição em patrulhamento na área central, avistou indivíduo em atitude suspeita próximo ao Mercado Central. Foi realizada abordagem e busca pessoal, resultando na apreensão de uma faca e pequena quantidade de substância análoga à maconha. Indivíduo conduzido à delegacia para providências.'");
        setIsProcessing(false);
      }, 2500);
    } else {
      setReportText('');
      setIsRecording(true);
    }
  };

  const handleFinalizeReport = () => {
    if (reportText.length > 50) {
      alert("Boletim de Ocorrência Tático registrado com sucesso! (Simulação)");
      navigateTo('aiTools');
    } else {
      alert("O relatório é muito curto. Por favor, grave mais detalhes.");
    }
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
            <h1 className="text-xl font-bold text-white uppercase tracking-tight">Boletim por Voz</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Registro Rápido de Ocorrências</p>
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

      <main className="flex-1 px-4 -mt-6 pb-32 space-y-6 no-scrollbar overflow-y-auto flex flex-col items-center">
        
        {/* Recording Status */}
        <div className="pmmg-card p-6 w-full text-center">
          <h3 className="text-[11px] font-bold text-pmmg-navy/60 uppercase tracking-wider mb-4">Status do Microfone</h3>
          
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${
            isRecording ? 'bg-pmmg-red/20 ring-4 ring-pmmg-red/50 animate-pulse' : 
            isProcessing ? 'bg-pmmg-navy/20 ring-4 ring-pmmg-navy/50' : 'bg-slate-200'
          }`}>
            <span className={`material-symbols-outlined text-5xl ${isRecording ? 'text-pmmg-red fill-icon' : 'text-pmmg-navy/70'}`}>
              {isRecording ? 'mic' : isProcessing ? 'settings_voice' : 'mic_off'}
            </span>
          </div>

          <p className={`mt-4 text-sm font-bold uppercase ${isRecording ? 'text-pmmg-red' : 'text-pmmg-navy'}`}>
            {isRecording ? 'GRAVANDO...' : isProcessing ? 'PROCESSANDO ÁUDIO...' : 'PRONTO PARA GRAVAR'}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {isRecording ? 'Fale claramente o relato da ocorrência.' : isProcessing ? 'Aguarde a transcrição IA.' : 'Pressione o botão para iniciar.'}
          </p>
        </div>

        {/* Control Button */}
        <button 
          onClick={handleToggleRecording}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm ${
            isRecording ? 'bg-pmmg-red text-white' : 'bg-pmmg-navy text-white'
          } disabled:opacity-50`}
        >
          <span className="material-symbols-outlined text-lg text-pmmg-yellow">
            {isRecording ? 'stop' : 'mic'}
          </span>
          {isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}
        </button>

        {/* Transcription Result */}
        {reportText && (
          <section className="pmmg-card p-5 w-full space-y-3">
            <h3 className="text-[11px] font-bold text-pmmg-navy/60 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-pmmg-navy text-lg">description</span>
              Transcrição IA
            </h3>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              rows={8}
              className="w-full p-3 bg-white border border-pmmg-navy/10 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-pmmg-navy"
              placeholder="Texto do relatório transcrito..."
            />
            <p className="text-[9px] text-slate-500 italic">Revise e edite o texto antes de finalizar o boletim.</p>
            
            <button 
              onClick={handleFinalizeReport}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-4 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-lg">send</span>
              Finalizar Boletim Tático
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

export default VoiceReport;