# Diretrizes de Desenvolvimento (AI Rules)

Este documento estabelece as regras e o stack tecnológico para a manutenção e evolução do aplicativo PMMG Operacional.

## Stack Tecnológico

O projeto é construído com foco em simplicidade, desempenho e aderência ao design tático da PMMG.

*   **Framework:** React (com Hooks e Componentes Funcionais).
*   **Linguagem:** TypeScript, garantindo tipagem estática e maior robustez.
*   **Estilização:** Tailwind CSS, utilizado para todos os aspectos de design e responsividade, utilizando a paleta de cores PMMG customizada (`pmmg-navy`, `pmmg-khaki`, `pmmg-yellow`, `pmmg-red`, etc.).
*   **Mapeamento:** Leaflet, a biblioteca padrão para visualização de mapas táticos e geolocalização.
*   **Ícones:** Google Material Symbols (via CDN), utilizados com as classes `material-symbols-outlined` e `fill-icon`.
*   **Estrutura:** Componentes organizados em `src/components/` e páginas em `src/pages/`.
*   **Roteamento:** Gerenciamento de rotas simples baseado em estado (React State) dentro do `App.tsx`.

## Regras de Uso de Bibliotecas

Para manter a consistência e evitar inchaço no projeto, siga estas regras estritas ao introduzir ou modificar funcionalidades:

1.  **UI/Componentes:** Priorize a criação de componentes customizados com Tailwind CSS. Se for necessário um componente complexo (ex: modais, dropdowns, formulários avançados), utilize os componentes disponíveis da biblioteca **shadcn/ui**, adaptando-os à estética PMMG.
2.  **Mapas:** **Leaflet** é a única biblioteca de mapeamento permitida. Todas as funcionalidades de mapa devem ser implementadas usando a API do Leaflet.
3.  **Ícones:** Utilize exclusivamente os ícones do **Google Material Symbols**. Não adicione bibliotecas de ícones externas (como `lucide-react`) a menos que um ícone específico seja estritamente necessário e não esteja disponível.
4.  **Comunicação Tática:** Para notificações e feedback ao usuário (ex: sucesso, erro), utilize um sistema de **toasts** (se implementado) ou alertas simples.
5.  **Estrutura de Arquivos:** Mantenha a regra de um componente por arquivo. Arquivos de componentes devem ser pequenos e focados.