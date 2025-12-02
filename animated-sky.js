/**
 * AnimatedSky - Módulo de Céu Animado Responsivo
 * 
 * Sistema modular para renderizar céu animado com suporte a:
 * - Dark Mode: Noite estrelada com Via Láctea, lua e estrelas cadentes
 * - Light Mode: Dia de verão com sol, nuvens e partículas flutuantes
 * 
 * @author CB Antônio Rafael
 * @version 2.0.0
 */

class AnimatedSky {
  /**
   * @param {Object} options - Configurações de inicialização
   * @param {string} options.canvasId - ID do elemento canvas
   * @param {string} options.theme - Tema inicial ('dark' ou 'light')
   * @param {boolean} options.enableParallax - Ativar efeito parallax (padrão: true)
   * @param {boolean} options.respectReducedMotion - Respeitar prefers-reduced-motion (padrão: true)
   */
  constructor(options = {}) {
    // Configurações
    this.canvasId = options.canvasId || 'gravityCanvas';
    this.currentTheme = options.theme || 'dark';
    this.enableParallax = options.enableParallax !== false;
    this.respectReducedMotion = options.respectReducedMotion !== false;
    
    // Estado
    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this.running = false;
    this.animationId = null;
    
    // Elementos visuais
    this.stars = [];
    this.shootingStars = [];
    this.clouds = [];
    this.particles = [];
    this.moon = null;
    this.sun = null;
    
    // Easter eggs (dark mode)
    this.uap = null;  // UAP/OVNI
    this.santaSleigh = null;  // Trenó do Papai Noel
    
    // Easter eggs (light mode)
    this.bird = null;  // Pássaro voando
    this.airplane = null;  // Avião com banner
    
    // Mouse tracking para parallax
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    
    // Performance
    this.lastFrameTime = 0;
    this.fps = 60;
    this.frameInterval = 1000 / this.fps;
    
    // Detecção de movimento reduzido
    this.reducedMotion = this.respectReducedMotion && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Detecção de dispositivo móvel
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Inicializa o canvas e começa a animação
   * @returns {boolean} Sucesso da inicialização
   */
  init() {
    try {
      // Obter canvas
      this.canvas = document.getElementById(this.canvasId);
      if (!this.canvas) {
        console.warn(`AnimatedSky: Canvas #${this.canvasId} não encontrado`);
        return false;
      }

      // Configurar contexto 2D
      this.ctx = this.canvas.getContext('2d', { alpha: false });
      if (!this.ctx) {
        console.error('AnimatedSky: Falha ao obter contexto 2D');
        return false;
      }

      // Configurar dimensões
      this.resize();

      // Event listeners
      window.addEventListener('resize', () => this.resize());
      
      if (this.enableParallax && !this.reducedMotion) {
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      }

      // Page Visibility API - pausar quando aba não está visível
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pause();
        } else {
          this.resume();
        }
      });

      // Inicializar elementos do tema atual
      this.initThemeElements();

      // Iniciar animação
      this.start();

      console.log('AnimatedSky: Inicializado com sucesso');
      return true;

    } catch (error) {
      console.error('AnimatedSky: Erro na inicialização:', error);
      return false;
    }
  }

  /**
   * Redimensiona o canvas para preencher a janela
   */
  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Reinicializar elementos com novas dimensões
    this.initThemeElements();
  }

  /**
   * Manipula movimento do mouse para efeito parallax
   */
  handleMouseMove(e) {
    this.mouse.targetX = (e.clientX / this.width) * 2 - 1;
    this.mouse.targetY = (e.clientY / this.height) * 2 - 1;
  }

  /**
   * Muda o tema e reinicializa elementos
   * @param {string} theme - 'dark' ou 'light'
   */
  setTheme(theme) {
    if (theme === this.currentTheme) return;
    
    this.currentTheme = theme;
    this.initThemeElements();
    
    console.log(`AnimatedSky: Tema alterado para ${theme}`);
  }

  /**
   * Inicializa elementos visuais baseado no tema atual
   */
  initThemeElements() {
    // Limpar arrays
    this.stars = [];
    this.shootingStars = [];
    this.clouds = [];
    this.particles = [];
    this.uap = null;
    this.santaSleigh = null;
    this.bird = null;
    this.airplane = null;
    this.trees = [];

    if (this.currentTheme === 'dark') {
      this.initDarkMode();
    } else {
      this.initLightMode();
    }
  }

  /**
   * Inicializa elementos do modo escuro (noite estrelada)
   */
  initDarkMode() {
    // Quantidade de estrelas baseada no tamanho da tela e dispositivo
    const starCount = this.isMobile 
      ? Math.floor((this.width * this.height) / 1500)
      : Math.floor((this.width * this.height) / 800);

    // Criar estrelas
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleDirection: Math.random() > 0.5 ? 1 : -1,
        // Cores variadas para realismo
        color: this.getStarColor(),
        // Parallax depth (0-1, quanto maior mais próximo)
        depth: Math.random()
      });
    }

    // Lua
    this.moon = {
      x: this.width * 0.85,
      y: this.height * 0.15,
      radius: this.isMobile ? 40 : 60,
      color: '#f4f1de',
      glowColor: 'rgba(244, 241, 222, 0.3)'
    };

    // Via Láctea MELHORADA (mais evidente e realista)
    const milkyWayCount = this.isMobile ? 300 : 600;  // Mais partículas
    for (let i = 0; i < milkyWayCount; i++) {
      // Criar forma diagonal da Via Láctea
      const t = Math.random();
      const centerX = this.width * (0.2 + t * 0.6);  // Diagonal
      const centerY = this.height * (0.3 + t * 0.5);
      
      // Dispersão perpendicular
      const spread = (Math.random() - 0.5) * this.height * 0.3;
      const angle = Math.atan2(1, 1.5);  // Ângulo diagonal
      
      this.particles.push({
        x: centerX + Math.cos(angle + Math.PI/2) * spread,
        y: centerY + Math.sin(angle + Math.PI/2) * spread,
        radius: Math.random() * 3 + 0.5,  // Partículas maiores
        opacity: Math.random() * 0.6 + 0.1,  // Mais brilhantes
        color: this.getMilkyWayColor(),
        isMilkyWay: true
      });
    }

    // Nuvens noturnas (sutis)
    const nightCloudCount = this.isMobile ? 2 : 4;
    for (let i = 0; i < nightCloudCount; i++) {
      this.clouds.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.4),
        scale: Math.random() * 0.6 + 0.5,
        speed: Math.random() * 0.15 + 0.1,
        opacity: Math.random() * 0.15 + 0.05,  // Muito sutis
        puffs: this.generateCloudPuffs()
      });
    }

    // Easter Eggs - Inicializar ocasionalmente
    // UAP aparece raramente (5% de chance ao inicializar)
    if (Math.random() < 0.05) {
      this.initUAP();
    }
    
    // Trenó do Papai Noel (3% de chance, especialmente em dezembro)
    const isDecember = new Date().getMonth() === 11;
    const sleighChance = isDecember ? 0.15 : 0.03;
    if (Math.random() < sleighChance) {
      this.initSantaSleigh();
    }
  }

  /**
   * Inicializa elementos do modo claro (dia de verão)
   */
  initLightMode() {
    // Sol
    this.sun = {
      x: this.width * 0.85,
      y: this.height * 0.15,
      radius: this.isMobile ? 50 : 70,
      color: '#FFD700',
      glowColor: 'rgba(255, 215, 0, 0.4)',
      rayRotation: 0
    };

    // Nuvens
    const cloudCount = this.isMobile ? 4 : 7;
    for (let i = 0; i < cloudCount; i++) {
      this.clouds.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.5),
        scale: Math.random() * 0.5 + 0.7,
        speed: Math.random() * 0.3 + 0.2,
        puffs: this.generateCloudPuffs()
      });
    }

    // Partículas flutuantes (pólen/poeira)
    const particleCount = this.isMobile ? 15 : 30;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() * 0.3 + 0.1,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.2
      });
    }

    // Easter Eggs - Inicializar ocasionalmente
    // Pássaro voando (8% de chance)
    if (Math.random() < 0.08) {
      this.initBird();
    }
    
    // Avião com banner (4% de chance)
    if (Math.random() < 0.04) {
      this.initAirplane();
    }
  }

  /**
   * Gera puffs (bolinhas) para formar uma nuvem
   */
  generateCloudPuffs() {
    const puffs = [];
    const puffCount = 5;
    
    for (let i = 0; i < puffCount; i++) {
      puffs.push({
        dx: (Math.random() - 0.5) * 100,
        dy: (Math.random() - 0.5) * 50,
        radius: Math.random() * 30 + 30
      });
    }
    
    return puffs;
  }

  /**
   * Retorna cor aleatória para estrelas
   */
  getStarColor() {
    const colors = [
      '#ffffff',  // Branco
      '#fffacd',  // Amarelo claro
      '#e0e0ff',  // Azul claro
      '#ffd1dc'   // Rosa claro
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Retorna cor aleatória para Via Láctea
   */
  getMilkyWayColor() {
    const colors = [
      'rgba(147, 112, 219, 0.3)',  // Roxo
      'rgba(138, 43, 226, 0.2)',   // Violeta
      'rgba(75, 0, 130, 0.25)'     // Índigo
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Inicializa UAP (OVNI) que cruza o céu
   */
  initUAP() {
    const startFromLeft = Math.random() > 0.5;
    
    this.uap = {
      x: startFromLeft ? -100 : this.width + 100,
      y: Math.random() * (this.height * 0.4) + this.height * 0.1,
      vx: startFromLeft ? (Math.random() * 3 + 2) : -(Math.random() * 3 + 2),
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 20 + 30,
      wobble: 0,
      wobbleSpeed: Math.random() * 0.05 + 0.03,
      glowIntensity: 0,
      glowDirection: 1,
      active: true
    };
  }

  /**
   * Inicializa trenó do Papai Noel
   */
  initSantaSleigh() {
    // Trenó sempre passa da direita para esquerda, em frente à lua
    this.santaSleigh = {
      x: this.width + 200,
      y: this.moon ? this.moon.y : this.height * 0.15,
      vx: -(Math.random() * 2 + 3),
      scale: Math.random() * 0.3 + 0.4,
      active: true
    };
  }

  /**
   * Desenha UAP (OVNI)
   */
  drawUAP() {
    if (!this.uap || !this.uap.active) return;

    const uap = this.uap;
    this.ctx.save();
    this.ctx.translate(uap.x, uap.y);

    // Wobble (oscilação)
    if (!this.reducedMotion) {
      uap.wobble += uap.wobbleSpeed;
    }
    const wobbleY = Math.sin(uap.wobble) * 3;
    this.ctx.translate(0, wobbleY);

    // Glow pulsante
    uap.glowIntensity += 0.02 * uap.glowDirection;
    if (uap.glowIntensity > 1 || uap.glowIntensity < 0.3) {
      uap.glowDirection *= -1;
    }

    // Luzes do UAP (glow)
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, uap.size);
    gradient.addColorStop(0, `rgba(100, 200, 255, ${uap.glowIntensity * 0.8})`);
    gradient.addColorStop(0.5, `rgba(100, 200, 255, ${uap.glowIntensity * 0.3})`);
    gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, uap.size * 1.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Corpo do UAP (disco)
    this.ctx.fillStyle = '#4a5568';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, uap.size, uap.size * 0.3, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Cúpula
    this.ctx.fillStyle = '#64748b';
    this.ctx.beginPath();
    this.ctx.ellipse(0, -uap.size * 0.15, uap.size * 0.5, uap.size * 0.25, 0, Math.PI, 0, true);
    this.ctx.fill();

    // Luzes coloridas na base
    const lights = 5;
    for (let i = 0; i < lights; i++) {
      const angle = (i / lights) * Math.PI * 2;
      const lx = Math.cos(angle) * uap.size * 0.7;
      const ly = Math.sin(angle) * uap.size * 0.2;
      
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
      this.ctx.fillStyle = colors[i];
      this.ctx.globalAlpha = uap.glowIntensity * 0.8;
      this.ctx.beginPath();
      this.ctx.arc(lx, ly, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;

    this.ctx.restore();

    // Atualizar posição
    if (!this.reducedMotion) {
      uap.x += uap.vx;
      uap.y += uap.vy;

      // Desativar quando sair da tela
      if (uap.x < -200 || uap.x > this.width + 200) {
        uap.active = false;
        // Chance de reaparecer depois de um tempo
        setTimeout(() => {
          if (Math.random() < 0.3) this.initUAP();
        }, Math.random() * 60000 + 30000); // 30-90 segundos
      }
    }
  }

  /**
   * Desenha trenó do Papai Noel
   */
  drawSantaSleigh() {
    if (!this.santaSleigh || !this.santaSleigh.active) return;

    const sleigh = this.santaSleigh;
    this.ctx.save();
    this.ctx.translate(sleigh.x, sleigh.y);
    this.ctx.scale(sleigh.scale, sleigh.scale);

    // Sombra/silhueta escura
    this.ctx.fillStyle = 'rgba(20, 20, 40, 0.9)';
    this.ctx.strokeStyle = 'rgba(20, 20, 40, 0.9)';
    this.ctx.lineWidth = 2;

    // Renas (3 visíveis na silhueta)
    for (let i = 0; i < 3; i++) {
      const rx = -120 - i * 40;
      const ry = -10 + Math.sin(Date.now() / 200 + i) * 3; // Galope

      // Corpo da rena
      this.ctx.beginPath();
      this.ctx.ellipse(rx, ry, 15, 10, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Cabeça
      this.ctx.beginPath();
      this.ctx.arc(rx - 12, ry - 8, 6, 0, Math.PI * 2);
      this.ctx.fill();

      // Chifres
      this.ctx.beginPath();
      this.ctx.moveTo(rx - 12, ry - 14);
      this.ctx.lineTo(rx - 15, ry - 22);
      this.ctx.lineTo(rx - 12, ry - 20);
      this.ctx.moveTo(rx - 12, ry - 14);
      this.ctx.lineTo(rx - 9, ry - 22);
      this.ctx.lineTo(rx - 12, ry - 20);
      this.ctx.stroke();

      // Pernas
      this.ctx.beginPath();
      this.ctx.moveTo(rx - 8, ry + 8);
      this.ctx.lineTo(rx - 8, ry + 18);
      this.ctx.moveTo(rx + 8, ry + 8);
      this.ctx.lineTo(rx + 8, ry + 18);
      this.ctx.stroke();
    }

    // Trenó
    this.ctx.beginPath();
    // Base do trenó
    this.ctx.moveTo(-30, 0);
    this.ctx.lineTo(30, 0);
    this.ctx.lineTo(35, 10);
    this.ctx.lineTo(-35, 10);
    this.ctx.closePath();
    this.ctx.fill();

    // Lateral do trenó
    this.ctx.beginPath();
    this.ctx.moveTo(-35, 10);
    this.ctx.lineTo(-40, -5);
    this.ctx.lineTo(25, -5);
    this.ctx.lineTo(30, 0);
    this.ctx.fill();

    // Papai Noel (silhueta)
    this.ctx.beginPath();
    // Corpo
    this.ctx.ellipse(0, -15, 12, 18, 0, 0, Math.PI * 2);
    this.ctx.fill();
    // Cabeça
    this.ctx.beginPath();
    this.ctx.arc(0, -35, 10, 0, Math.PI * 2);
    this.ctx.fill();
    // Gorro
    this.ctx.beginPath();
    this.ctx.moveTo(-8, -35);
    this.ctx.lineTo(-5, -48);
    this.ctx.lineTo(8, -35);
    this.ctx.fill();
    // Pompom do gorro
    this.ctx.beginPath();
    this.ctx.arc(-3, -50, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Saco de presentes
    this.ctx.beginPath();
    this.ctx.arc(15, -20, 15, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();

    // Atualizar posição
    if (!this.reducedMotion) {
      sleigh.x += sleigh.vx;

      // Desativar quando sair da tela
      if (sleigh.x < -300) {
        sleigh.active = false;
        // Chance de reaparecer (maior em dezembro)
        const isDecember = new Date().getMonth() === 11;
        setTimeout(() => {
          if (Math.random() < (isDecember ? 0.4 : 0.1)) {
            this.initSantaSleigh();
          }
        }, Math.random() * 120000 + 60000); // 1-3 minutos
      }
    }
  }

  /**
   * Inicializa pássaro voando (light mode)
   */
  initBird() {
    const startFromLeft = Math.random() > 0.5;
    
    this.bird = {
      x: startFromLeft ? -100 : this.width + 100,
      y: Math.random() * (this.height * 0.3) + this.height * 0.1,
      vx: startFromLeft ? (Math.random() * 2 + 1.5) : -(Math.random() * 2 + 1.5),
      vy: Math.sin(Date.now() / 1000) * 0.5,
      size: Math.random() * 15 + 20,
      wingPhase: 0,
      wingSpeed: Math.random() * 0.15 + 0.1,
      type: Math.random() > 0.5 ? 'eagle' : 'seagull',
      active: true
    };
  }

  /**
   * Inicializa avião com banner (light mode)
   */
  initAirplane() {
    const messages = [
      'BEM-VINDO!',
      'FELIZ DIA!',
      '☺ SORRIA!',
      'VOCÊ É INCRIVEL!',
      'TENHA UM ÓTIMO DIA!'
    ];
    
    this.airplane = {
      x: this.width + 200,
      y: Math.random() * (this.height * 0.2) + this.height * 0.15,
      vx: -(Math.random() * 1.5 + 1),
      size: 40,
      message: messages[Math.floor(Math.random() * messages.length)],
      active: true
    };
  }

  /**
   * Desenha pássaro voando
   */
  drawBird() {
    if (!this.bird || !this.bird.active) return;

    const bird = this.bird;
    this.ctx.save();
    this.ctx.translate(bird.x, bird.y);

    // Flip horizontal se voando para esquerda
    if (bird.vx < 0) {
      this.ctx.scale(-1, 1);
    }

    // Animação de bater asas
    if (!this.reducedMotion) {
      bird.wingPhase += bird.wingSpeed;
    }
    const wingAngle = Math.sin(bird.wingPhase) * 0.6;

    // Cor baseada no tipo
    const color = bird.type === 'eagle' ? '#3d2817' : '#ffffff';
    const outlineColor = bird.type === 'eagle' ? '#2d1810' : '#cccccc';

    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = outlineColor;
    this.ctx.lineWidth = 2;

    // Corpo
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, bird.size * 0.4, bird.size * 0.25, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Cabeça
    this.ctx.beginPath();
    this.ctx.arc(bird.size * 0.35, -bird.size * 0.1, bird.size * 0.2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Bico
    this.ctx.fillStyle = '#ffa500';
    this.ctx.beginPath();
    this.ctx.moveTo(bird.size * 0.5, -bird.size * 0.1);
    this.ctx.lineTo(bird.size * 0.65, -bird.size * 0.05);
    this.ctx.lineTo(bird.size * 0.5, 0);
    this.ctx.closePath();
    this.ctx.fill();

    // Asa esquerda
    this.ctx.fillStyle = color;
    this.ctx.save();
    this.ctx.rotate(wingAngle);
    this.ctx.beginPath();
    this.ctx.ellipse(-bird.size * 0.2, 0, bird.size * 0.6, bird.size * 0.15, -0.3, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();

    // Asa direita
    this.ctx.save();
    this.ctx.rotate(-wingAngle);
    this.ctx.beginPath();
    this.ctx.ellipse(-bird.size * 0.2, 0, bird.size * 0.6, bird.size * 0.15, 0.3, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();

    // Cauda
    this.ctx.beginPath();
    this.ctx.moveTo(-bird.size * 0.4, 0);
    this.ctx.lineTo(-bird.size * 0.7, -bird.size * 0.15);
    this.ctx.lineTo(-bird.size * 0.7, bird.size * 0.15);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();

    // Atualizar posição
    if (!this.reducedMotion) {
      bird.x += bird.vx;
      bird.y += Math.sin(Date.now() / 500) * 0.3; // Movimento ondulatório

      // Desativar quando sair da tela
      if (bird.x < -150 || bird.x > this.width + 150) {
        bird.active = false;
        // Chance de reaparecer
        setTimeout(() => {
          if (Math.random() < 0.4) this.initBird();
        }, Math.random() * 40000 + 20000); // 20-60 segundos
      }
    }
  }

  /**
   * Desenha avião com banner (design comercial)
   */
  drawAirplane() {
    if (!this.airplane || !this.airplane.active) return;

    const plane = this.airplane;
    const scale = 0.15; // Escala do avião
    
    // Banner (faixa) - DESENHAR PRIMEIRO (atrás do avião)
    const bannerWidth = plane.message.length * 15;
    const bannerHeight = 30;
    const bannerX = plane.x + 100; // Banner ATRÁS do avião

    this.ctx.save();
    
    // Corda conectando ao avião (da cauda até o banner)
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(plane.x + 90, plane.y); // Cauda do avião
    this.ctx.lineTo(bannerX, plane.y);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Faixa do banner
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#e5e7eb';
    this.ctx.lineWidth = 2;
    this.ctx.fillRect(bannerX, plane.y - bannerHeight / 2, bannerWidth, bannerHeight);
    this.ctx.strokeRect(bannerX, plane.y - bannerHeight / 2, bannerWidth, bannerHeight);

    // Texto do banner
    this.ctx.fillStyle = '#1f2937';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(plane.message, bannerX + bannerWidth / 2, plane.y);

    this.ctx.restore();

    // AVIÃO (desenhar por cima do banner)
    this.ctx.save();
    this.ctx.translate(plane.x, plane.y);
    this.ctx.scale(scale, scale);

    // Cores
    const white = '#f0f4f8';
    const blue = '#1d5298';
    const windowColor = '#cadbed';
    const stroke = '#222';

    // CAUDA VERTICAL
    this.ctx.fillStyle = white;
    this.ctx.strokeStyle = stroke;
    this.ctx.lineWidth = 8;
    this.ctx.beginPath();
    this.ctx.moveTo(60, -200);
    this.ctx.lineTo(0, -200);
    this.ctx.lineTo(0, -60);
    this.ctx.lineTo(100, -60);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Parte azul da cauda
    this.ctx.fillStyle = blue;
    this.ctx.fillRect(0, -200, 35, 140);
    this.ctx.strokeRect(0, -200, 35, 140);

    // ESTABILIZADOR HORIZONTAL
    this.ctx.fillStyle = '#e0e0e0';
    this.ctx.strokeStyle = stroke;
    this.ctx.beginPath();
    this.ctx.ellipse(40, -20, 65, 22, Math.PI * 0.05, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // FUSELAGEM (corpo principal)
    this.ctx.fillStyle = white;
    this.ctx.strokeStyle = stroke;
    this.ctx.lineWidth = 8;
    this.ctx.beginPath();
    // Formato aerodinâmico apontando para ESQUERDA
    this.ctx.moveTo(-400, -40); // Nariz (esquerda)
    this.ctx.quadraticCurveTo(-450, -40, -450, 0); // Curva superior do nariz
    this.ctx.quadraticCurveTo(-450, 40, -400, 40); // Curva inferior do nariz
    this.ctx.lineTo(100, 40); // Barriga
    this.ctx.quadraticCurveTo(150, 40, 150, 0); // Cauda arredondada
    this.ctx.quadraticCurveTo(150, -40, 100, -40); // Topo da cauda
    this.ctx.lineTo(-400, -40); // Topo
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // BARRIGA AZUL
    this.ctx.fillStyle = blue;
    this.ctx.strokeStyle = stroke;
    this.ctx.lineWidth = 6;
    this.ctx.beginPath();
    this.ctx.moveTo(-350, 40);
    this.ctx.lineTo(-50, 40);
    this.ctx.lineTo(-30, 60);
    this.ctx.lineTo(-370, 60);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // TEXTO NA FUSELAGEM
    this.ctx.fillStyle = stroke;
    this.ctx.font = 'bold 70px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PM', -150, 10);

    // JANELAS
    this.ctx.fillStyle = windowColor;
    this.ctx.strokeStyle = stroke;
    this.ctx.lineWidth = 4;
    for (let i = 0; i < 15; i++) {
      const x = -350 + i * 30;
      this.ctx.fillRect(x, -15, 12, 18);
      this.ctx.strokeRect(x, -15, 12, 18);
    }

    // PORTAS
    this.ctx.fillStyle = white;
    this.ctx.strokeStyle = stroke;
    this.ctx.lineWidth = 6;
    // Porta dianteira
    this.ctx.fillRect(-380, -5, 25, 45);
    this.ctx.strokeRect(-380, -5, 25, 45);
    // Porta traseira
    this.ctx.fillRect(50, -5, 25, 45);
    this.ctx.strokeRect(50, -5, 25, 45);

    // COCKPIT (janela do piloto)
    this.ctx.save();
    this.ctx.translate(-420, -10);
    
    // Borda do cockpit
    this.ctx.fillStyle = stroke;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 20);
    this.ctx.lineTo(10, -10);
    this.ctx.lineTo(35, -10);
    this.ctx.lineTo(50, 10);
    this.ctx.lineTo(50, 20);
    this.ctx.closePath();
    this.ctx.fill();

    // Vidro do cockpit
    this.ctx.fillStyle = windowColor;
    this.ctx.beginPath();
    this.ctx.moveTo(2, 18);
    this.ctx.lineTo(12, -8);
    this.ctx.lineTo(33, -8);
    this.ctx.lineTo(48, 10);
    this.ctx.lineTo(48, 18);
    this.ctx.closePath();
    this.ctx.fill();

    // Divisória do cockpit
    this.ctx.strokeStyle = stroke;
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(25, -8);
    this.ctx.lineTo(25, 18);
    this.ctx.stroke();

    this.ctx.restore();

    // ASA
    this.ctx.fillStyle = '#e0e0e0';
    this.ctx.strokeStyle = stroke;
    this.ctx.lineWidth = 8;
    this.ctx.beginPath();
    this.ctx.moveTo(-200, 40);
    this.ctx.lineTo(-180, 120);
    this.ctx.quadraticCurveTo(-150, 140, -100, 130);
    this.ctx.lineTo(-120, 40);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Sombra da asa
    this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
    this.ctx.beginPath();
    this.ctx.moveTo(-180, 50);
    this.ctx.lineTo(-170, 120);
    this.ctx.lineTo(-120, 115);
    this.ctx.lineTo(-130, 50);
    this.ctx.closePath();
    this.ctx.fill();

    // MOTOR
    this.ctx.fillStyle = white;
    this.ctx.strokeStyle = stroke;
    this.ctx.lineWidth = 6;
    this.ctx.beginPath();
    this.ctx.roundRect(-180, 130, 80, 40, 15);
    this.ctx.fill();
    this.ctx.stroke();

    // Detalhe vermelho do motor
    this.ctx.fillStyle = '#c00';
    this.ctx.fillRect(-175, 130, 12, 40);
    this.ctx.strokeRect(-175, 130, 12, 40);

    // HÉLICE GIRANDO (na frente do motor)
    this.ctx.save();
    this.ctx.translate(-185, 150);
    
    // Rotação contínua
    const rotation = (Date.now() / 20) % (Math.PI * 2);
    this.ctx.rotate(rotation);
    
    // 3 pás da hélice
    this.ctx.fillStyle = '#555';
    this.ctx.strokeStyle = '#222';
    this.ctx.lineWidth = 3;
    
    for (let i = 0; i < 3; i++) {
      this.ctx.save();
      this.ctx.rotate((i * Math.PI * 2) / 3);
      
      // Pá
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, 35, 8, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.restore();
    }
    
    // Centro da hélice
    this.ctx.fillStyle = '#333';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.restore(); // Restaurar hélice

    // ANTENA
    this.ctx.fillStyle = white;
    this.ctx.strokeStyle = stroke;
    this.ctx.lineWidth = 4;
    this.ctx.fillRect(-100, -55, 8, 15);
    this.ctx.strokeRect(-100, -55, 8, 15);

    this.ctx.restore(); // Restaurar avião

    // Atualizar posição (SEMPRE)
    plane.x += plane.vx;

    // Desativar quando sair da tela (incluindo banner)
    if (plane.x < -bannerWidth - 200) {
      plane.active = false;
      // Chance de reaparecer
      setTimeout(() => {
        if (Math.random() < 0.2) this.initAirplane();
      }, Math.random() * 180000 + 120000); // 2-5 minutos
    }
  }

  /**
   * Loop principal de animação
   */
  animate(currentTime = 0) {
    if (!this.running) return;

    // Controle de FPS
    const elapsed = currentTime - this.lastFrameTime;
    if (elapsed < this.frameInterval) {
      this.animationId = requestAnimationFrame((t) => this.animate(t));
      return;
    }
    this.lastFrameTime = currentTime - (elapsed % this.frameInterval);

    // Limpar canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Renderizar baseado no tema
    if (this.currentTheme === 'dark') {
      this.renderDarkMode();
    } else {
      this.renderLightMode();
    }

    // Próximo frame
    this.animationId = requestAnimationFrame((t) => this.animate(t));
  }

  /**
   * Renderiza modo escuro (noite estrelada)
   */
  renderDarkMode() {
    // Gradiente do céu noturno
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#0a0e27');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Atualizar parallax suavemente
    if (this.enableParallax && !this.reducedMotion) {
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;
    }

    // Via Láctea MELHORADA (nebulosa de fundo com glow)
    this.particles.forEach(p => {
      if (p.isMilkyWay) {
        // Glow effect para Via Láctea
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = p.color;
      }
      
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.shadowBlur = 0;
    });
    this.ctx.globalAlpha = 1;

    // Nuvens noturnas (sutis)
    if (this.clouds.length > 0) {
      this.clouds.forEach(cloud => {
        // Movimento
        if (!this.reducedMotion) {
          cloud.x -= cloud.speed;
          if (cloud.x < -200) {
            cloud.x = this.width + 100;
          }
        }

        this.ctx.save();
        this.ctx.translate(cloud.x, cloud.y);
        this.ctx.scale(cloud.scale, cloud.scale);

        // Nuvens escuras/sutis
        this.ctx.fillStyle = `rgba(30, 41, 59, ${cloud.opacity})`;
        this.ctx.beginPath();
        cloud.puffs.forEach(puff => {
          this.ctx.arc(puff.dx, puff.dy, puff.radius, 0, Math.PI * 2);
        });
        this.ctx.fill();

        this.ctx.restore();
      });
    }

    // Lua
    if (this.moon) {
      // Brilho da lua
      this.ctx.shadowBlur = 40;
      this.ctx.shadowColor = this.moon.glowColor;
      this.ctx.fillStyle = this.moon.color;
      this.ctx.beginPath();
      this.ctx.arc(this.moon.x, this.moon.y, this.moon.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    // Estrelas com efeito de piscar
    this.stars.forEach(star => {
      // Efeito de piscar
      if (!this.reducedMotion) {
        star.opacity += star.twinkleSpeed * star.twinkleDirection;
        if (star.opacity > 1 || star.opacity < 0.2) {
          star.twinkleDirection *= -1;
        }
      }

      // Parallax
      let offsetX = 0, offsetY = 0;
      if (this.enableParallax && !this.reducedMotion) {
        offsetX = this.mouse.x * star.depth * 10;
        offsetY = this.mouse.y * star.depth * 10;
      }

      this.ctx.fillStyle = star.color;
      this.ctx.globalAlpha = Math.max(0, Math.min(1, star.opacity));
      this.ctx.beginPath();
      this.ctx.arc(star.x + offsetX, star.y + offsetY, star.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;

    // Estrelas cadentes (ocasionais)
    if (!this.reducedMotion && Math.random() < 0.005) {
      this.shootingStars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.5),
        vx: -(Math.random() * 8 + 5),
        vy: Math.random() * 4 + 3,
        life: 1.0,
        length: 0
      });
    }

    // Atualizar e desenhar estrelas cadentes
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const star = this.shootingStars[i];
      
      star.x += star.vx;
      star.y += star.vy;
      star.length += 2;
      star.life -= 0.015;

      if (star.life <= 0 || star.x < -100 || star.y > this.height + 100) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      // Desenhar rastro
      const gradient = this.ctx.createLinearGradient(
        star.x, star.y,
        star.x - star.vx * 2, star.y - star.vy * 2
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${star.life})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(star.x, star.y);
      this.ctx.lineTo(star.x - star.vx * 2, star.y - star.vy * 2);
      this.ctx.stroke();
    }

    // Easter Eggs
    this.drawUAP();
    this.drawSantaSleigh();
  }

  /**
   * Renderiza modo claro (dia de verão)
   */
  renderLightMode() {
    // Gradiente do céu diurno
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.6, '#B0E0E6');
    gradient.addColorStop(1, '#E0F6FF');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Sol
    if (this.sun) {
      this.ctx.save();
      this.ctx.translate(this.sun.x, this.sun.y);

      // Brilho do sol
      this.ctx.shadowBlur = 60;
      this.ctx.shadowColor = this.sun.glowColor;

      // Núcleo do sol
      this.ctx.fillStyle = this.sun.color;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.sun.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Raios do sol (opcionais, rotacionando)
      if (!this.reducedMotion) {
        this.sun.rayRotation += 0.003;
        this.ctx.shadowBlur = 0;
        this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
        this.ctx.lineWidth = 3;
        this.ctx.rotate(this.sun.rayRotation);

        for (let i = 0; i < 12; i++) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.sun.radius + 10, 0);
          this.ctx.lineTo(this.sun.radius + 30, 0);
          this.ctx.stroke();
          this.ctx.rotate(Math.PI / 6);
        }
      }

      this.ctx.restore();
    }

    // Nuvens
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.clouds.forEach(cloud => {
      // Movimento
      if (!this.reducedMotion) {
        cloud.x -= cloud.speed;
        if (cloud.x < -200) {
          cloud.x = this.width + 100;
        }
      }

      this.ctx.save();
      this.ctx.translate(cloud.x, cloud.y);
      this.ctx.scale(cloud.scale, cloud.scale);

      // Desenhar puffs da nuvem
      this.ctx.beginPath();
      cloud.puffs.forEach(puff => {
        this.ctx.arc(puff.dx, puff.dy, puff.radius, 0, Math.PI * 2);
      });
      this.ctx.fill();

      this.ctx.restore();
    });

    // Partículas flutuantes
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.particles.forEach(p => {
      if (!this.reducedMotion) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
        if (p.y > this.height) p.y = 0;
      }

      this.ctx.globalAlpha = p.opacity;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;

    // Easter Eggs
    this.drawBird();
    this.drawAirplane();
  }

  /**
   * Inicia a animação
   */
  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrameTime = performance.now();
    this.animate();
    console.log('AnimatedSky: Animação iniciada');
  }

  /**
   * Pausa a animação
   */
  pause() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    console.log('AnimatedSky: Animação pausada');
  }

  /**
   * Resume a animação
   */
  resume() {
    if (!this.running) {
      this.start();
    }
  }

  /**
   * Destrói a instância e limpa recursos
   */
  destroy() {
    this.pause();
    
    // Remover event listeners
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('mousemove', this.handleMouseMove);
    
    // Limpar canvas
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    
    // Limpar referências
    this.canvas = null;
    this.ctx = null;
    this.stars = [];
    this.shootingStars = [];
    this.clouds = [];
    this.particles = [];
    this.trees = [];
    
    console.log('AnimatedSky: Instância destruída');
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.AnimatedSky = AnimatedSky;
}
