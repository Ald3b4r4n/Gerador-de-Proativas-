# Guia de Estilo

Diretrizes visuais e de UI para manter consistência, legibilidade e performance.

## Paleta de Cores

- Base: `--bg-dark` (`#1a1b26`), `--bg-panel` (`#24283b`).
- Primárias: `--primary` (`#7aa2f7`), `--secondary` (`#bb9af7`), `--accent` (`#7dcfff`).
- Texto: `--text-main`, `--text-muted`, `--text-highlight`.
- Vidro: `--glass-bg`, `--glass-border`, `--glass-blur`, `--glass-shadow`.

Uso: preferir variáveis CSS do `:root` em vez de cores hardcoded.

## Tipografia

- Fonte: `Inter`, com fallback para `system-ui`.
- Títulos: peso 700–800, espaçamento negativo leve em `h1`.
- Texto: contraste alto e placeholders com opacidade reduzida.

## Componentes

- Cards: borda translúcida, `backdrop-filter`, hover com leve elevação.
- Botões:
  - `btn-primary`: gradiente azul e leve brilho.
  - `btn-secondary`: translúcido com borda sutil.
  - `btn-success`: gradiente verde; reforço visual em hover.
  - `whatsapp-btn`: verde oficial; hover mais escuro.
- Navbar: translúcida com blur; ícone com `drop-shadow` usando `--accent`.

## Landing Page

- Canvas full-screen (`gravity-canvas`) posicionado atrás do conteúdo.
- Ícone flutuante com animação `float` contínua.
- Botão principal com `hover-scale` para feedback.

## Responsividade

- Breakpoint principal: `768px`.
- Reduzir tamanhos de fontes e padding; botões em coluna.
- Evitar overflows horizontais; usar `overflow-x: hidden` global.

## Interações e Performance

- Efeito de partículas pausado fora da `home-view`.
- `passive` em eventos de toque.
- Limitar `devicePixelRatio` em `Canvas` a 2.

## Padrões de Código

- Sem comentários em arquivos de código, preferir documentação aqui.
- Funções pequenas e focadas; evitar variáveis globais fora do escopo da app.

## Referências de Código

- Tema: `app.css`.
- Navegação: `handleNavigation` em `app.js:131`.
- Efeito: `createGravityCloud` em `app.js:440`.
