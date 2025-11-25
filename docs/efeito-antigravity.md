# Efeito "Nuvem Gravitacional" (Antigravity)

Este documento descreve a implementação do efeito interativo de partículas na página inicial que simula uma nuvem gravitacional com atração/repulsão, otimizado para desktop e mobile.

## Visão Geral

- Renderização via `Canvas 2D` em `#gravityCanvas`.
- Física de partículas com atração ao ponto de interação e repulsão em raio próximo.
- Suavização de movimento com inércia e `requestAnimationFrame`.
- Integração com variáveis CSS (`--mouse-x`, `--mouse-y`) para mascaramento de grão.

## Arquitetura

- Inicialização: `createGravityCloud()` instanciado em `app.js` e ativado somente na `home-view`.
- Ciclo: `step()` atualiza alvo do ponteiro, velocidades e posições, e desenha partículas.
- Partículas: quantidade adaptativa pelo tamanho do viewport (60–160).

## Interações

- Desktop: `mousemove` atualiza o alvo (`tx`, `ty`).
- Touch: `touchmove` com `passive: true` atualiza o alvo.
- Sensores: tentativa de habilitar `DeviceOrientationEvent` e `DeviceMotionEvent` após primeiro gesto do usuário; iOS requer `requestPermission()`.

## Parâmetros Principais

- Raio de repulsão: 80 px.
- Base da gravidade: 0.08 (ajuste fino da força ≈ 1/dist²).
- Atrito: 0.96 em partículas; inércia do ponteiro 0.9.
- DPR: limitado a 2 para manter performance e nitidez.

## Performance

- Uso de `devicePixelRatio` com transformação do `context` ao invés de `scale` repetido.
- Limite dinâmico de partículas por área.
- `passive` em eventos de touch para não bloquear o scroll.
- Pausa automática do efeito fora da `home-view` via `handleNavigation()`.

## Alterações e Extensões

- Cores: gradiente definido no preenchimento das partículas; pode ser ajustado para seguir `--primary` e `--accent`.
- Quantidade de partículas: ajuste do divisor `14000` para mais/menos densidade.
- Forças: alterar `forceBase` e `repelRadius` para comportamento mais atraído ou mais disperso.

## Compatibilidade

- Testado com navegadores modernos que suportam `Canvas`, `DeviceOrientationEvent` e `DeviceMotionEvent`.
- Fallback: se sensores não forem permitidos/disponíveis, interação permanece por toque.

## Localizações no Código

- Canvas: `index.html` (`#gravityCanvas`).
- Estilos: `app.css` (classe `gravity-canvas` e utilitários `text-accent`, `hover-scale`).
- Lógica: `app.js`:
  - Inicialização do efeito e start/stop: `handleNavigation()` em `app.js:136`.
  - Criação do efeito: `createGravityCloud` em `app.js:440`.
