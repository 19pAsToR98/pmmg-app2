import React, { ReactNode } from 'react';
import { Screen } from '../types';

interface ScreenContainerProps {
  screenId: Screen;
  activeScreen: Screen;
  children: ReactNode;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({ screenId, activeScreen, children }) => {
  const isActive = screenId === activeScreen;
  
  // Se a tela não estiver ativa, ela é movida para fora da tela e escondida
  const containerClasses = `
    absolute inset-0 w-full h-full
    ${isActive ? 'translate-x-0 z-10' : 'translate-x-full z-0 hidden'}
  `;

  // Nota: Usamos 'hidden' para garantir que elementos como o mapa não tentem renderizar
  // quando estão fora da tela, mas o fato de estarem no DOM e serem re-renderizados
  // com a mesma chave (key) no App.tsx deve preservar o estado do GoogleMap.
  
  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

export default ScreenContainer;