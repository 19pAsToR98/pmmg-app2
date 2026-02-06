import React, { useState } from 'react';
import { Screen } from '../types';

interface RequestAccessProps {
  onBack: () => void;
  onSuccess: () => void;
}

const RequestAccess: React.FC<RequestAccessProps> = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }
    if (!email || !password) {
      alert("Preencha todos os campos.");
      return;
    }
    
    // Simulação de envio de credenciais
    alert('Credenciais registradas. Iniciando configuração de perfil...');
    onSuccess();
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki dark:bg-slate-900 overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div>
            <h1 className="font-bold text-base leading-none text-white uppercase tracking-tight">Registro de Acesso</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Criação de Credenciais</p>
          </div>
        </div>
        <div className="bg-white/10 p-2 rounded-lg text-white">
          <span className="material-symbols-outlined">security</span>
        </div>
      </header>

      <main className="flex-1 px-5 pt-6 pb-32 no-scrollbar overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-white/40 dark:bg-slate-700/50 p-4 rounded-xl border border-white/20 dark:border-slate-600 backdrop-blur-sm">
            <p className="text-xs text-pmmg-navy/80 dark:text-slate-300 leading-relaxed font-medium">
              <span className="font-bold text-pmmg-navy dark:text-pmmg-yellow">Passo 1/2:</span> Crie suas credenciais de acesso seguro.
            </p>
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-pmmg-navy dark:text-slate-400 mb-1.5 ml-1">E-mail Funcional</label>
              <input 
                className="block w-full px-4 py-3 bg-white/70 dark:bg-slate-700 border border-pmmg-navy/20 dark:border-slate-600 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm placeholder-pmmg-navy/40 dark:text-slate-200 dark:placeholder-slate-500" 
                placeholder="exemplo@pmmg.mg.gov.br" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-pmmg-navy dark:text-slate-400 mb-1.5 ml-1">Senha</label>
                <input 
                  className="block w-full px-4 py-3 bg-white/70 dark:bg-slate-700 border border-pmmg-navy/20 dark:border-slate-600 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm placeholder-pmmg-navy/40 dark:text-slate-200 dark:placeholder-slate-500" 
                  placeholder="Mínimo 6 caracteres" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-pmmg-navy dark:text-slate-400 mb-1.5 ml-1">Confirmar Senha</label>
                <input 
                  className="block w-full px-4 py-3 bg-white/70 dark:bg-slate-700 border border-pmmg-navy/20 dark:border-slate-600 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm placeholder-pmmg-navy/40 dark:text-slate-200 dark:placeholder-slate-500" 
                  placeholder="Repita a senha" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="bg-pmmg-navy/5 dark:bg-slate-700 p-4 rounded-lg border border-pmmg-navy/10 dark:border-slate-600 mt-6">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-pmmg-navy dark:text-pmmg-yellow text-xl">info</span>
                <p className="text-[10px] text-pmmg-navy dark:text-slate-300 font-semibold uppercase tracking-tight leading-4">
                  Após o registro, você será direcionado para a configuração inicial do seu perfil tático.
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-pmmg-khaki dark:from-slate-900 via-pmmg-khaki dark:via-slate-900 to-transparent max-w-md mx-auto">
        <button 
          onClick={handleSubmit}
          className="w-full bg-pmmg-navy text-white font-bold py-4 rounded-xl shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
        >
          <span className="uppercase tracking-widest text-sm">Registrar Credenciais</span>
          <span className="material-symbols-outlined text-pmmg-yellow">lock_open</span>
        </button>
        <p className="text-center text-[9px] text-pmmg-navy/50 dark:text-slate-500 uppercase font-bold mt-3 tracking-widest">Plataforma Segura PMMG © 2024</p>
      </footer>
    </div>
  );
};

export default RequestAccess;