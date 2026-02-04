import React, { useState } from 'react';

interface BiometricAuthButtonProps {
  onSuccess: () => void;
}

const BiometricAuthButton: React.FC<BiometricAuthButtonProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleBiometricLogin = async () => {
    setIsLoading(true);
    
    // NOTA PARA FUTURA IMPLEMENTAÇÃO NATIVA:
    // Para iOS/Android, use um plugin Capacitor (ex: @capacitor/identity-vault ou similar)
    // para chamar a API nativa de biometria.
    
    // --- SIMULAÇÃO DE AUTENTICAÇÃO ---
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulação: 90% de chance de sucesso
    const success = Math.random() > 0.1; 

    if (success) {
      onSuccess();
    } else {
      alert('Falha na autenticação biométrica. Tente novamente ou use a senha.');
    }
    
    setIsLoading(false);
  };

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