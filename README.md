# ServeUp — Estrutura organizada

Esta versão mantém o funcionamento e o visual do ServeUp, mas separa cada tela real em seu próprio HTML.

## Estrutura

- `index.html` — início
- `html/` — demais telas e área administrativa
- `css/style.css` — estilos visuais preservados e pequenos ajustes estruturais
- `js/` — JavaScript separado por responsabilidade
- `imagens/` — todas as imagens locais

## Regra do carrinho
O carrinho continua sendo uma função dentro do cardápio, não uma tela própria. Durante a navegação entre telas ele é mantido; iniciar um novo pedido limpa o fluxo.

## Produtos
Produtos definidos no código continuam sendo a base do catálogo. Produtos adicionados pelo ADM permanecem salvos no navegador. Recomendações apontam para os mesmos produtos do catálogo.
