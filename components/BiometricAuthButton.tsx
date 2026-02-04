import React, { useState, useEffect } from 'react';
import { BiometricAuth } from '@capacitor-community/biometric-auth';

interface BiometricAuthButtonProps {
  onSuccess: () => void;
}

const BiometricAuthButton: React.FC<BiometricAuthButtonProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const result = await BiometricAuth.isAvailable();
        // Verifica se o tipo de biometria é suportado (ex: 'fingerprint', 'face', 'iris')
        setIsAvailable(result.type !== 'none');
      } catch (e) {
        // Se o plugin não estiver disponível (ex: rodando no web/browser), ele falha.
        setIsAvailable(false);
        console.warn("BiometricAuth plugin not available or failed to check availability.", e);
      }
    };
    checkAvailability();
  }, []);

  const handleBiometricLogin = async () => {
    if (!isAvailable) {
      alert('Autenticação biométrica não está disponível neste dispositivo ou ambiente.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await BiometricAuth.authenticate({
        reason: 'Acesso seguro ao Sistema Operacional PMMG',
        title: 'Autenticação Necessária',
        subtitle: 'Use sua biometria para entrar.',
        description: 'Confirme sua identidade para prosseguir.',
      });

      if (result.isAuthenticated) {
        onSuccess();
      } else {
        // Isso geralmente não é acionado se o usuário cancelar, mas sim em falhas de hardware/configuração
        alert('Falha na autenticação biométrica. Tente novamente ou use a senha.');
      }
    } catch (error) {
      // Captura erros como cancelamento do usuário ou falha na leitura
      console.error('Erro de autenticação biométrica:', error);
      alert('Autenticação biométrica falhou ou foi cancelada. Tente novamente ou use a senha.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAvailable) {
    // Se não estiver disponível, o botão não é renderizado, e o usuário usa a opção de senha.
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