
import React from 'react';

interface RequestAccessProps {
  onBack: () => void;
}

const RequestAccess: React.FC<RequestAccessProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div>
            <h1 className="font-bold text-base leading-none text-white uppercase tracking-tight">Solicitação de Acesso</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Cadastro de Oficial</p>
          </div>
        </div>
        <div className="bg-white/10 p-2 rounded-lg text-white">
          <span className="material-symbols-outlined">security</span>
        </div>
      </header>

      <main className="flex-1 px-5 pt-6 pb-32 no-scrollbar overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-white/40 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
            <p className="text-xs text-pmmg-navy/80 leading-relaxed font-medium">
              <span className="font-bold text-pmmg-navy">Atenção:</span> O preenchimento deste formulário é obrigatório para oficiais que necessitam acessar o sistema. Todos os dados serão validados pelo Comando Geral.
            </p>
          </div>
          
          <form className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-pmmg-navy mb-1.5 ml-1">Nome Completo</label>
              <input className="block w-full px-4 py-3 bg-white/70 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm placeholder-pmmg-navy/40" placeholder="Conforme Identidade Militar" type="text" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-pmmg-navy mb-1.5 ml-1">CPF</label>
                <input className="block w-full px-4 py-3 bg-white/70 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm placeholder-pmmg-navy/40" placeholder="000.000.000-00" type="text" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-pmmg-navy mb-1.5 ml-1">Matrícula</label>
                <input className="block w-full px-4 py-3 bg-white/70 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm placeholder-pmmg-navy/40" placeholder="Nº de Registro" type="text" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-pmmg-navy mb-1.5 ml-1">E-mail Funcional</label>
              <input className="block w-full px-4 py-3 bg-white/70 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm placeholder-pmmg-navy/40" placeholder="exemplo@pmmg.mg.gov.br" type="email" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-pmmg-navy mb-1.5 ml-1">Batalhão / Unidade</label>
              <select className="block w-full px-4 py-3 bg-white/70 border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm transition-all appearance-none bg-no-repeat bg-[right_1rem_center]">
                <option value="">Selecione sua unidade</option>
                <option>1º BPM - Belo Horizonte</option>
                <option>2º BPM - Juiz de Fora</option>
                <option>3º BPM - Diamantina</option>
                <option>Outros...</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-pmmg-navy mb-1.5 ml-1">Documento Funcional (Foto)</label>
              <div className="relative group">
                <input className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" type="file" />
                <div className="border-2 border-dashed border-pmmg-navy/30 rounded-xl p-8 bg-white/30 flex flex-col items-center justify-center text-center transition-colors group-hover:bg-white/50 group-hover:border-pmmg-navy/50">
                  <span className="material-symbols-outlined text-pmmg-navy/40 text-4xl mb-2">add_a_photo</span>
                  <span className="text-xs font-bold text-pmmg-navy/60 uppercase">Anexar Identidade Militar</span>
                  <span className="text-[10px] text-pmmg-navy/40 mt-1">Frente e Verso visíveis</span>
                </div>
              </div>
            </div>
            <div className="bg-pmmg-navy/5 p-4 rounded-lg border border-pmmg-navy/10 mt-6">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-pmmg-navy text-xl">info</span>
                <p className="text-[10px] text-pmmg-navy font-semibold uppercase tracking-tight leading-4">
                  Sua solicitação será enviada para o Comando Geral. A confirmação será feita via e-mail funcional.
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-pmmg-khaki via-pmmg-khaki to-transparent max-w-md mx-auto">
        <button 
          onClick={() => { alert('Solicitação enviada com sucesso!'); onBack(); }}
          className="w-full bg-pmmg-navy text-white font-bold py-4 rounded-xl shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
        >
          <span className="uppercase tracking-widest text-sm">Solicitar Credenciais</span>
          <span className="material-symbols-outlined text-pmmg-yellow">lock_open</span>
        </button>
        <p className="text-center text-[9px] text-pmmg-navy/50 uppercase font-bold mt-3 tracking-widest">Plataforma Segura PMMG © 2024</p>
      </footer>
    </div>
  );
};

export default RequestAccess;
