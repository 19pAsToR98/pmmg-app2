import React, { ReactNode } from 'react';
import { Screen } from '../types';

interface ScreenContainerProps {
  screenId: Screen;
  activeScreen: Screen;
  children: ReactNode;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({ screenId, activeScreen, children }) => {
  const isActive = screenId === activeScreen;
  
  // Renderiza o componente sempre, mas o move para fora da tela se não estiver ativo.
  // Usamos 'absolute' para que ele não afete o layout quando inativo.
  const containerClasses = `
    absolute inset-0 w-full h-full transition-transform duration-300 ease-in-out
    ${isActive ? 'translate-x-0 z-10' : 'translate-x-full z-0'}
  `;

  // Para telas que não são o mapa, podemos usar 'hidden' para otimizar, mas para o mapa,
  // precisamos que ele esteja no DOM para manter o estado.
  // Como o mapa é a principal preocupação, vamos usar a transição de slide.
  
  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

export default ScreenContainer;