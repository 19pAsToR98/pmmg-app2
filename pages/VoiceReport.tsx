import React, { useState, useEffect } from 'react';
import { Screen, UserRank } from '../types';

interface VoiceReportProps {
  navigateTo: (screen: Screen) => void;
  userRank: UserRank;
}

const MAX_DURATION_SECONDS = 120; // 2 minutes

const VoiceReport: React.FC<VoiceReportProps> = ({ navigateTo, userRank }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0); // Duration in seconds
  
  const rankLabel = userRank === 'Subtenente' ? 'Subtenente' : 
                   userRank.includes('Sargento') ? 'Sargento' : 
                   userRank;

  useEffect(() => {
    let timer: number;
    if (isRecording && duration < MAX_DURATION_SECONDS) {
      timer = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else if (duration >= MAX_DURATION_SECONDS) {
      handleStopRecording();
    }
    
    return () => clearInterval(timer);
  }, [isRecording, duration]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setDuration(0);
    // Simulação de início de gravação
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (duration > 0) {
      alert(`Gravação finalizada (${duration}s). Enviando para transcrição e análise de IA...`);
      setDuration(0);
    }
  };
  
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki dark:bg-slate-900 overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button onClick={() => navigateTo('aiTools')} className="text-white active:scale-90 transition-transform">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div>
            <h1 className="font-bold text-sm leading-none text-white uppercase tracking-tight">Boletim por Voz</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Relatório Tático Assistido</p>
          </div>
        </div>
        <span className="material-symbols-outlined text-pmmg-yellow fill-icon">mic</span>
      </header>

      <main className="flex-1 overflow-y-auto pb-4 no-scrollbar px-4 pt-6 flex flex-col items-center">
        
        {/* AI Avatar and Bubble */}
        <div className="flex flex-col items-center pt-4 px-6">
          <div className="relative w-40 h-40 mb-6">
            <div className="w-full h-full rounded-full overflow-hidden relative shadow-2xl">
               <img 
                alt="AI Mascot" 
                className="w-full h-full object-cover rounded-full" 
                src="https://regularmei.com.br/wp-content/uploads/2026/01/ai_mascot.gif" 
              />
            </div>
          </div>
          <div className="relative bg-white dark:bg-slate-800 rounded-[1.5rem] p-4 px-6 shadow-lg mb-12 text-center border-2 border-pmmg-navy/5 dark:border-slate-700 after:content-[''] after:absolute after:top-0 after:left-1/2 after:w-0 after:h-0 after:border-[20px] after:border-transparent after:border-b-white dark:after:border-b-slate-800 after:mt-[-20px] after:ml-[-20px] after:border-t-0">
            <p className="text-pmmg-navy dark:text-slate-200 font-semibold text-sm">
              Pressione o microfone para iniciar o relato. O tempo máximo de gravação é de <span className="font-bold text-pmmg-red">2 minutos</span>.
            </p>
          </div>
        </div>

        {/* Recording Section */}
        <section className="flex flex-col items-center justify-center flex-1 w-full max-w-xs">
          
          <div className={`w-full text-center mb-8 transition-opacity duration-500 ${isRecording ? 'opacity-100' : 'opacity-50'}`}>
            <p className="text-pmmg-navy dark:text-slate-200 font-black text-4xl tracking-widest">
              {formatTime(duration)}
            </p>
            <p className="text-[10px] font-bold uppercase text-pmmg-navy/60 dark:text-slate-400 mt-1">
              {isRecording ? 'GRAVANDO RELATO TÁTICO...' : 'PRONTO PARA INICIAR'}
            </p>
          </div>

          <button 
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`w-32 h-32 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
              isRecording 
                ? 'bg-pmmg-red scale-110 ring-8 ring-pmmg-red/30' 
                : 'bg-pmmg-navy scale-100 ring-0'
            }`}
          >
            <span className={`material-symbols-outlined text-white text-6xl ${isRecording ? 'fill-icon' : ''}`}>
              {isRecording ? 'stop' : 'mic'}
            </span>
          </button>
          
          <p className="text-[9px] text-slate-400 mt-8 italic text-center uppercase font-medium">
            {isRecording ? 'Toque para finalizar e enviar.' : 'Toque para iniciar a gravação.'}
          </p>
        </section>
      </main>
    </div>
  );
};

export default VoiceReport;