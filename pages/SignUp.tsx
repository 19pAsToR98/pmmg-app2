import React, { useState } from 'react';
import { Screen } from '../types';

interface SignUpProps {
  onSignUpSuccess: () => void;
  onBack: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUpSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    // Simulação de cadastro bem-sucedido
    console.log('Cadastro simulado:', { email, password });
    onSignUpSuccess();
  };

  return (
    <div className="flex flex-col h-full bg-pmmg-khaki overflow-hidden">
      <header className="sticky top-0 z-50 bg-pmmg-navy px-4 py-5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div>
            <h1 className="font-bold text-base leading-none text-white uppercase tracking-tight">Registro de Oficial</h1>
            <p className="text-[10px] font-medium text-pmmg-yellow tracking-wider uppercase mt-1">Criação de Credenciais</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 pt-12 pb-32 no-scrollbar overflow-y-auto">
        <div className="max-w-sm mx-auto space-y-6">
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-pmmg-navy text-6xl fill-icon">person_add</span>
            <h2 className="text-xl font-bold text-pmmg-navy mt-2 uppercase">Bem-vindo, Oficial</h2>
            <p className="text-sm text-slate-600 mt-1">Crie seu acesso seguro ao sistema tático.</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4 pmmg-card p-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-pmmg-navy/70 mb-1">E-mail Funcional</label>
              <input 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 bg-white border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
                placeholder="seu.nome@pmmg.mg.gov.br" 
                type="email" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-pmmg-navy/70 mb-1">Senha</label>
              <input 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 bg-white border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
                placeholder="Mínimo 6 caracteres" 
                type="password" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-pmmg-navy/70 mb-1">Confirmar Senha</label>
              <input 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-4 py-3 bg-white border border-pmmg-navy/20 focus:border-pmmg-navy focus:ring-1 focus:ring-pmmg-navy rounded-lg text-sm" 
                placeholder="Repita a senha" 
                type="password" 
              />
            </div>

            {error && (
              <div className="bg-pmmg-red/10 border border-pmmg-red text-pmmg-red text-xs p-3 rounded-lg font-medium">
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-pmmg-navy text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 uppercase tracking-widest active:scale-[0.98] transition-transform mt-6"
            >
              <span className="material-symbols-outlined">lock_open</span>
              Criar Acesso
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SignUp;