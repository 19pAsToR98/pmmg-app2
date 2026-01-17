
import React from 'react';
import { Screen, UserRank } from '../types';
import BottomNav from '../components/BottomNav';
import RankBadge from '../components/RankBadge';

interface ProfileSettingsProps {
  navigateTo: (screen: Screen) => void;
  onBack: () => void;
  currentRank: UserRank;
  onRankChange: (rank: UserRank) => void;
}

const RANKS: UserRank[] = ['Soldado', 'Cabo', '3º Sargento', '2º Sargento', '1º Sargento', 'Subtenente'];

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ navigateTo, onBack, currentRank, onRankChange }) => {
  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="bg-pmmg-navy px-6 pt-12 pb-8 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pmmg-yellow/10 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full border-4 border-pmmg-yellow/80 p-1 bg-white/10 overflow-hidden shadow-xl">
              <img alt="Officer" className="w-full h-full object-cover rounded-full grayscale" src="https://picsum.photos/seed/officer/200/200" />
            </div>
            <div className="absolute -bottom-2 -right-2 p-1 bg-pmmg-navy rounded-lg border-2 border-pmmg-yellow shadow-lg">
              <RankBadge rank={currentRank} size="sm" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">SGT. RODRIGO ALVES</h2>
          <p className="text-pmmg-yellow font-semibold text-[10px] tracking-[0.2em] uppercase mt-1">
            {currentRank} • 05º BPM
          </p>
        </div>
      </header>

      <main className="flex-1 px-4 -mt-6 pb-32 space-y-6 no-scrollbar overflow-y-auto">
        <section>
          <div className="flex items-center justify-between px-2 mb-3">
            <h3 className="text-[11px] font-bold text-pmmg-navy/60 uppercase tracking-wider">Alterar Graduação</h3>
            <span className="text-[10px] font-black text-pmmg-red bg-pmmg-red/10 px-2 py-0.5 rounded uppercase">Identificação Tática</span>
          </div>
          
          <div className="pmmg-card p-4">
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {RANKS.map((rank) => (
                <button
                  key={rank}
                  onClick={() => onRankChange(rank)}
                  className={`flex flex-col items-center gap-2 shrink-0 transition-all p-2 rounded-xl border-2 ${
                    currentRank === rank 
                      ? 'bg-pmmg-navy border-pmmg-yellow shadow-lg scale-105' 
                      : 'bg-white border-transparent grayscale opacity-60'
                  }`}
                >
                  <RankBadge rank={rank} size="md" />
                  <span className={`text-[9px] font-black uppercase ${currentRank === rank ? 'text-pmmg-yellow' : 'text-pmmg-navy'}`}>
                    {rank}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-400 mt-2 italic text-center uppercase font-medium">
              A graduação altera como o sistema de IA e os alertas se referem a você.
            </p>
          </div>
        </section>

        <section>
          <h3 className="px-2 mb-2 text-[11px] font-bold text-pmmg-navy/60 uppercase tracking-wider">Identificação Profissional</h3>
          <div className="pmmg-card overflow-hidden">
            <div className="px-4">
              {[
                { label: 'Matrícula (PM)', value: '182.449-3', icon: 'badge' },
                { label: 'Batalhão/Cia', value: '05º BPM / 124ª CIA', icon: 'account_balance' },
                { label: 'Cargo Atual', value: currentRank, icon: 'military_tech' },
              ].map((item, idx, arr) => (
                <div key={item.label} className={`flex items-center justify-between py-4 ${idx !== arr.length - 1 ? 'border-b border-pmmg-navy/5' : ''}`}>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-pmmg-navy/50 font-bold uppercase">{item.label}</span>
                    <span className="text-sm font-semibold text-pmmg-navy">{item.value}</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-300">{item.icon}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="flex flex-col items-center justify-center opacity-30 py-4">
          <span className="material-symbols-outlined text-pmmg-navy text-4xl mb-2">shield</span>
          <p className="text-[9px] font-bold uppercase tracking-widest text-pmmg-navy">PMMG • Versão 2.5.0</p>
        </div>
      </main>

      <BottomNav activeScreen="profileSettings" navigateTo={navigateTo} />
    </div>
  );
};

export default ProfileSettings;
