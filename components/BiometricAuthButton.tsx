import React, { useState, useEffect } from 'react';
import { LocalAuthentication } from '@capacitor/local-authentication';

interface BiometricAuthButtonProps {
  onSuccess: () => void;
}

const BiometricAuthButton: React.FC<BiometricAuthButtonProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const result = await LocalAuthentication.checkBiometry();
        // Verifica se o tipo de biometria é suportado (ex: impressão digital, face ID)
        setIsAvailable(result.isAvailable);
      } catch (e) {
        // Se falhar (ex: no navegador), assume que não está disponível nativamente, mas mantém a simulação.
        setIsAvailable(true); 
      }
    };
    checkAvailability();
  }, []);

  const handleBiometricLogin = async () => {
    if (!isAvailable) return;
    
    setIsLoading(true);
    
    try {
      const result = await LocalAuthentication.authenticate({
        reason: 'Acesso seguro ao Sistema Operacional PMMG',
        // iOS/Android specific options can be added here
      });

      if (result.isAuthenticated) {
        onSuccess();
      } else {
        // Autenticação falhou ou foi cancelada pelo usuário
        alert('Autenticação biométrica falhou ou foi cancelada.');
      }
    } catch (e) {
      // Se a autenticação falhar (ex: plugin não carregado no web, ou erro de SO)
      console.error('Erro na autenticação biométrica:', e);
      
      // Fallback de simulação para o ambiente web/dev
      if (typeof window !== 'undefined' && !window.Capacitor) {
        setTimeout(() => {
          onSuccess();
        }, 800);
      } else {
        alert('Não foi possível iniciar a autenticação biométrica. Tente a senha.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAvailable) {
    // Se não estiver disponível (ou se a verificação falhar no navegador), não renderiza o botão.
    // No ambiente de desenvolvimento (web), mantemos a simulação se a verificação falhar.
    return null;
  }

  return (
    <button 
      onClick={handleBiometricLogin}
      disabled={isLoading}
      className="w-full bg-white/5 backdrop-blur-sm border border-white/10 py-4 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-white/80 text-xl fill-icon">fingerprint</span>
      <span className="text-white/80 font-semibold tracking-widest text-sm uppercase">
        {isLoading ? 'Verificando Digital...' : 'Acesso por Digital'}
      </span>
    </button>
  );
};

export default BiometricAuthButton;