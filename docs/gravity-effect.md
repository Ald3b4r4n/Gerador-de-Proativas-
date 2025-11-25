# Documentação Técnica - Efeito Gravitacional

## 📖 Visão Geral

O sistema de partículas gravitacionais cria um efeito interativo na landing page onde partículas são atraídas pelo cursor do mouse (desktop) ou pelos sensores de movimento (mobile). O efeito é renderizado em um elemento `<canvas>` e utiliza física simples para criar movimento fluido e responsivo.

## 🏗️ Arquitetura

### Estrutura de Dados

```javascript
const pointer = {
  x: number,        // Posição atual X do "cursor virtual"
  y: number,        // Posição atual Y do "cursor virtual"
  vx: number,       // Velocidade X do cursor
  vy: number,       // Velocidade Y do cursor
  tx: number,       // Target X (para onde o cursor está indo)
  ty: number        // Target Y
};

const particle = {
  x: number,        // Posição X da partícula
  y: number,        // Posição Y da partícula
  vx: number,       // Velocidade X da partícula
  vy: number,       // Velocidade Y da partícula
  r: number         // Raio da partícula (2-4px)
};
```

### Fluxo de Execução

```
Inicialização
    ↓
resize() → Calcula dimensões e quantidade de partículas
    ↓
start() → Registra event listeners e inicia loop
    ↓
step() → Loop de animação (requestAnimationFrame)
    ↓
    ├─→ Atualiza posição do pointer (suavização)
    ├─→ draw() → Atualiza e desenha cada partícula
    └─→ Chama step() recursivamente
```

## 🎮 Física de Interação

### Desktop (Mouse)

**Evento:** `mousemove`

```javascript
function onMouseMove(e) {
  pointer.tx = e.clientX;  // Define target do pointer
  pointer.ty = e.clientY;
  
  // Atualiza variáveis CSS para efeito de grain
  document.documentElement.style.setProperty('--mouse-x', pointer.tx + 'px');
  document.documentElement.style.setProperty('--mouse-y', pointer.ty + 'px');
}
```

**Física do Pointer:**
```javascript
// Suavização exponencial (ease-out)
pointer.vx += (pointer.tx - pointer.x) * 0.06;  // Aceleração proporcional à distância
pointer.vy += (pointer.ty - pointer.y) * 0.06;

// Aplicar fricção (0.88 = 12% de desaceleração por frame)
pointer.vx *= cfg.pointerFriction;
pointer.vy *= cfg.pointerFriction;

// Atualizar posição
pointer.x += pointer.vx;
pointer.y += pointer.vy;
```

**Física das Partículas:**
```javascript
// Para cada partícula
const dx = pointer.x - particle.x;
const dy = pointer.y - particle.y;

// Força de atração proporcional à distância
particle.vx += dx * cfg.force;  // force = 0.004 desktop
particle.vy += dy * cfg.force;

// Aplicar fricção
particle.vx *= cfg.friction;  // friction = 0.92 desktop
particle.vy *= cfg.friction;

// Limitar velocidade máxima
const speed = Math.sqrt(particle.vx² + particle.vy²);
if (speed > cfg.speedLimit) {
  particle.vx *= cfg.speedLimit / speed;
  particle.vy *= cfg.speedLimit / speed;
}

// Atualizar posição
particle.x += particle.vx;
particle.y += particle.vy;
```

### Mobile (Touch + Sensores)

#### Touch Events

**Evento:** `touchmove`

```javascript
function onTouchMove(e) {
  const t = e.touches[0];
  if (!t) return;
  pointer.tx = t.clientX;
  pointer.ty = t.clientY;
  // Atualiza variáveis CSS
}
```

#### Device Orientation (Giroscópio)

**Evento:** `deviceorientation`

```javascript
function onOrientation(e) {
  const gamma = e.gamma || 0;  // Inclinação esquerda-direita (-90 a 90)
  const beta = e.beta || 0;    // Inclinação frente-trás (-180 a 180)
  
  // Mapear para coordenadas de canvas
  const gx = (gamma / 45) * (width * 0.25);  // Normalizar e escalar
  const gy = (beta / 45) * (height * 0.25);
  
  // Centro da tela + offset baseado na inclinação
  pointer.tx = width * 0.5 + gx;
  pointer.ty = height * 0.5 + gy;
}
```

**Diagrama de inclinação:**
```
        beta = -90
            ↑
            |
gamma = -90 ← O → gamma = +90
            |
            ↓
        beta = +90
```

#### Device Motion (Acelerômetro)

**Evento:** `devicemotion`

```javascript
function onMotion(e) {
  const ax = e.accelerationIncludingGravity?.x || 0;  // Aceleração X
  const ay = e.accelerationIncludingGravity?.y || 0;  // Aceleração Y
  
  // Normalizar por gravidade terrestre (9.8 m/s²)
  const gx = (ax / 9.8) * (width * 0.2);
  const gy = (ay / 9.8) * (height * 0.2);
  
  pointer.tx = width * 0.5 + gx;
  pointer.ty = height * 0.5 + gy;
}
```

#### Permissões iOS 13+

```javascript
function requestSensorPermission() {
  const D = window.DeviceOrientationEvent;
  const M = window.DeviceMotionEvent;
  
  // iOS exige prompt de permissão
  if (D && typeof D.requestPermission === 'function') {
    D.requestPermission().then(response => {
      if (response === 'granted') {
        sensorEnabled = true;
      }
    });
  }
  
  // Similar para DeviceMotionEvent
  if (M && typeof M.requestPermission === 'function') {
    M.requestPermission().then(/* ... */);
  }
}

// Trigger: touch do usuário
window.addEventListener('touchstart', requestSensorPermission, { once: true });
window.addEventListener('click', requestSensorPermission, { once: true });
```

## ⚙️ Parâmetros Configuráveis

### Configuração Desktop vs Mobile

```javascript
const cfg = isCoarse  // Detecta se é touch device
  ? {  // MOBILE
      friction: 0.95,           // Alta fricção (partículas mais lentas)
      pointerFriction: 0.82,    // Pointer mais responsivo
      force: 0.006,             // Força de atração maior
      speedLimit: 2.4,          // Velocidade máxima reduzida
      countDiv: 26000           // Menos partículas (área/26000)
    }
  : {  // DESKTOP
      friction: 0.92,           // Fricção moderada
      pointerFriction: 0.88,    // Pointer suavizado
      force: 0.004,             // Força de atração menor
      speedLimit: 3.0,          // Velocidade máxima maior
      countDiv: 18000           // Mais partículas (área/18000)
    };
```

### Cálculo de Quantidade de Partículas

```javascript
const countTarget = Math.max(
  40,  // Mínimo
  Math.min(
    120,  // Máximo
    Math.floor((width * height) / cfg.countDiv)  // Baseado na área da tela
  )
);
```

**Exemplos:**
- Mobile 375x667: (375 * 667) / 26000 ≈ 9.6 → 40 partículas (mínimo)
- Desktop 1920x1080: (1920 * 1080) / 18000 ≈ 115 partículas
- Desktop 4K 3840x2160: (3840 * 2160) / 18000 ≈ 461 → 120 partículas (máximo)

## 🎨 Renderização

### Gradiente Radial

```javascript
const grad = ctx.createRadialGradient(
  p.x, p.y, 0,          // Centro (posição da partícula)
  p.x, p.y, p.r * 3     // Raio externo (3x o raio da partícula)
);

// Cor central opaca
grad.addColorStop(0, 'rgba(125, 207, 255, 0.9)');

// Cor externa quase transparente (blur effect)
grad.addColorStop(1, 'rgba(122, 162, 247, 0.05)');

ctx.fillStyle = grad;
```

### Compositing Mode

```javascript
// Modo "lighter" para efeito de brilho aditivo
ctx.globalCompositeOperation = 'lighter';

// Desenhar todas as partículas
particles.forEach(p => p.draw(ctx));

// Restaurar modo padrão
ctx.globalCompositeOperation = 'source-over';
```

**Efeito:** Partículas sobrepostas se somam, criando áreas mais brilhantes.

### Device Pixel Ratio

```javascript
dpr = Math.min(2, window.devicePixelRatio || 1);  // Limita em 2x para performance

canvas.width = Math.floor(width * dpr);
canvas.height = Math.floor(height * dpr);
canvas.style.width = width + 'px';
canvas.style.height = height + 'px';

ctx.setTransform(dpr, 0, 0, dpr, 0, 0);  // Escala o contexto de desenho
```

**Objetivo:** Renderização nítida em telas Retina sem comprometer performance.

## 🔧 Otimizações de Performance

### 1. RequestAnimationFrame

```javascript
function step() {
  // Lógica de atualização
  draw();
  rafId = requestAnimationFrame(step);  // Sincroniza com refresh rate do monitor
}
```

**Benefício:** 60fps em telas 60Hz, 120fps em telas 120Hz (móvel)

### 2. Cálculo de Distância Otimizado

```javascript
// ❌ EVITAR (uso desnecessário de Math.sqrt)
const distance = Math.sqrt(dx*dx + dy*dy);
if (distance < threshold) { /* ... */ }

// ✅ OTIMIZADO (compara quadrados)
const distanceSquared = dx*dx + dy*dy;
if (distanceSquared < threshold*threshold) { /* ... */ }
```

No código atual, `Math.sqrt` só é usado quando necessário (limitar velocidade).

### 3. Limites de Partículas

- Mínimo: 40 partículas
- Máximo: 120 partículas
- Evita sobrecarga em telas grandes

### 4. Detecção de Dispositivo

```javascript
const isCoarse = window.matchMedia && 
                 window.matchMedia('(pointer: coarse)').matches;
```

**Uso:** Aplica configurações otimizadas para mobile logo na inicialização.

### 5. Canvas Clearing

```javascript
ctx.clearRect(0, 0, width, height);  // Limpa canvas inteiro
```

**Alternativa não utilizada:** Clear parcial (mais complexo, benefício marginal)

## 🐛 Troubleshooting

### Problema: Efeito não aparece

**Checklist:**
1. Verificar se `<canvas id="gravityCanvas">` existe no HTML
2. Console: erros de inicialização?
3. Browser: DevTools → Performance → FPS counter
4. CSS: canvas está com `z-index` correto?

```javascript
// Debug: verificar se canvas foi encontrado
const canvas = document.getElementById('gravityCanvas');
console.log('Canvas encontrado:', !!canvas);
```

### Problema: Performance ruim (< 30 FPS)

**Soluções:**
1. Reduzir `cfg.countDiv` (menos partículas)
2. Limitar `dpr` em 1 ao invés de 2
3. Reduzir `p.r * 3` no gradiente radial
4. Desativar em dispositivos muito antigos:

```javascript
// Adicionar no início de createGravityCloud()
const isLowEnd = navigator.hardwareConcurrency < 4;  // Menos de 4 cores
if (isLowEnd) return { start() {}, stop() {} };
```

### Problema: Sensores não funcionam em mobile

**Checklist:**
1. iOS 13+: permissão foi solicitada?
   - Trigger: usuário deve tocar na tela primeiro
2. HTTPS: site está em conexão segura?
   - APIs de sensor só funcionam em HTTPS
3. Navegador: Safari/Chrome mobile atualizados?

**Debug:**
```javascript
// Verificar suporte
console.log('DeviceOrientation:', !!window.DeviceOrientationEvent);
console.log('DeviceMotion:', !!window.DeviceMotionEvent);

// Verificar permissão (iOS)
DeviceOrientationEvent.requestPermission?.()
  .then(response => console.log('Permissão:', response));
```

### Problema: Partículas "explodem" ou ficam erráticas

**Causa:** `cfg.force` muito alto ou `cfg.friction` muito baixo

**Solução:**
```javascript
// Reduzir força de atração
force: 0.003,  // Ao invés de 0.004

// Aumentar fricção
friction: 0.95,  // Ao invés de 0.92
```

## 📊 Benchmarks

### Performance Target

| Dispositivo | FPS Alvo | Partículas | DPR |
|-------------|----------|------------|-----|
| Desktop (1080p) | 60 FPS | 100-120 | 2 |
| Laptop Retina | 60 FPS | 80-100 | 2 |
| Mobile High-end | 60 FPS | 40-60 | 2 |
| Mobile Mid-range | 30 FPS | 40 | 1 |

### Medição de FPS

```javascript
let lastTime = performance.now();
let frames = 0;

function measureFPS() {
  frames++;
  const now = performance.now();
  if (now >= lastTime + 1000) {
    console.log('FPS:', frames);
    frames = 0;
    lastTime = now;
  }
  requestAnimationFrame(measureFPS);
}

measureFPS();
```

## 🔐 APIs e Compatibilidade

### Browser Support

| API | Chrome | Firefox | Safari | Edge |
|-----|--------|---------|--------|------|
| Canvas 2D | ✅ | ✅ | ✅ | ✅ |
| requestAnimationFrame | ✅ | ✅ | ✅ | ✅ |
| deviceorientation | ✅ | ✅ | ✅ 13+ | ✅ |
| devicemotion | ✅ | ✅ | ✅ 13+ | ✅ |
| matchMedia (pointer) | ✅ | ✅ | ✅ | ✅ |

### Permissões (iOS 13+)

```javascript
// Feature detection
if (typeof DeviceOrientationEvent.requestPermission === 'function') {
  // iOS 13+ - permissão obrigatória
} else {
  // Android/Desktop - permissão automática
}
```

## 📝 Manutenção e Extensões

### Adicionar Nova Cor de Partícula

```javascript
// Em createGravityCloud(), line ~520
const colors = [
  'rgba(125, 207, 255, 0.9)',  // Azul existente
  'rgba(139, 92, 246, 0.9)',   // Roxo (secondary)
  'rgba(16, 185, 129, 0.9)'    // Verde (accent)
];

// Atribuir cor aleatória ao criar partícula
particles = Array.from({ length: countTarget }, () => ({
  // ... outros campos
  color: colors[Math.floor(Math.random() * colors.length)]
}));

// Usar no gradiente
grad.addColorStop(0, p.color);
```

### Adicionar Repulsão (ao invés de apenas atração)

```javascript
// Em draw(), substituir atração por repulsão quando muito próximo
const dx = pointer.x - p.x;
const dy = pointer.y - p.y;
const distSq = dx*dx + dy*dy;

if (distSq < 50*50) {  // Se distância < 50px
  // Repulsão (inverter direção)
  p.vx -= dx * 0.01;
  p.vy -= dy * 0.01;
} else {
  // Atração normal
  p.vx += dx * cfg.force;
  p.vy += dy * cfg.force;
}
```

### Adicionar Conectores entre Partículas

```javascript
// Após desenhar partículas
for (let i = 0; i < particles.length; i++) {
  for (let j = i + 1; j < particles.length; j++) {
    const p1 = particles[i];
    const p2 = particles[j];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist < 100) {  // Conecta se distância < 100px
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(59, 130, 246, ${1 - dist/100})`;  // Fade com distância
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}
```

## 🔗 Referências

- [Canvas API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Device Orientation Event - MDN](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent)
- [requestAnimationFrame - MDN](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [Physics for Game Programmers](http://buildnewgames.com/gamephysics/)

---

*Última atualização: 25 de novembro de 2025*
