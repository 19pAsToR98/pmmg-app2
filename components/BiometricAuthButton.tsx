import React, { useState, useEffect } from 'react';

interface BiometricAuthButtonProps {
  onSuccess: () => void;
}

const BiometricAuthButton: React.FC<BiometricAuthButtonProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // Simulação: A biometria está sempre disponível no ambiente de desenvolvimento
  useEffect(() => {
    setIsAvailable(true); 
  }, []);

  const handleBiometricLogin = async () => {
    if (!isAvailable) return;
    
    setIsLoading(true);
    
    // Simulação de autenticação bem-sucedida após um pequeno atraso
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 800);
  };

  if (!isAvailable) {
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