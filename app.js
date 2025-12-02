document.addEventListener("DOMContentLoaded", function () {
  // =============================================
  // 1. DATA & STATE
  // =============================================
  const locaisSaoJorge = [
    "Loquinhas", "São Bento", "Vale da Lua", "Volta da Serra",
    "Parque Nacional", "Centro", "Praça do Coreto",
    "Mirante do Por do Sol", "Mirante da Janela", "Mirante do Morro da Baleia",
  ].sort();

  const tiposAtividade = [
    "PE/PTR", "Visita Escolar", "Visita ao Comércio",
    "Visita solidária", "Policiamento de Eventos", "Bloqueio",
    "Abordagem Estática",
  ].sort();

  let currentFile = null;
  let gravityEngine = null;

  // =============================================
  // 2. DOM ELEMENTS
  // =============================================
  const elements = {
    equipeInput: document.getElementById("equipeInput"),
    localSelect: document.getElementById("localSelect"),
    localPersonalizadoDiv: document.getElementById("localPersonalizadoDiv"),
    localPersonalizadoInput: document.getElementById("localPersonalizadoInput"),
    enderecoInput: document.getElementById("enderecoInput"),
    atividadeSelect: document.getElementById("atividadeSelect"),
    atividadeInput: document.getElementById("atividadeInput"),
    cameraBtn: document.getElementById("cameraBtn"),
    galleryBtn: document.getElementById("galleryBtn"),
    fileInput: document.getElementById("fileInput"),
    uploadArea: document.getElementById("uploadArea"),
    previewSection: document.getElementById("previewSection"),
    preview: document.getElementById("preview"),
    removePhotoBtn: document.getElementById("removePhotoBtn"),
    reportPreview: document.getElementById("reportPreview"),
    copyBtn: document.getElementById("copyBtn"),
    whatsappBtn: document.getElementById("whatsappBtn"),
    clearSessionBtn: document.getElementById("clearSessionBtn"),
    homeView: document.getElementById("home-view"),
    appView: document.getElementById("app-view"),
    landingThemeToggle: document.getElementById("landingThemeToggle"),
    appThemeToggle: document.getElementById("appThemeToggle"),
  };

  // =============================================
  // 3. THEME LOGIC
  // =============================================
  function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateToggleIcons(savedTheme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateToggleIcons(next);
    
    // Atualizar AnimatedSky com novo tema
    if (gravityEngine && gravityEngine.setTheme) {
      gravityEngine.setTheme(next);
    }
  }

  function updateToggleIcons(theme) {
    const iconClass = theme === "dark" ? "bi-sun-fill" : "bi-moon-stars-fill";
    [elements.landingThemeToggle, elements.appThemeToggle].forEach(btn => {
      const i = btn.querySelector("i");
      i.className = `bi ${iconClass}`;
    });
  }

  // =============================================
  // 4. GRAVITY ENGINE (METAL SUPERNOVA)
  // =============================================
  class GravityEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext("2d");
      this.particles = [];
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.running = false;
      
      // Physics Parameters
      this.pointer = { x: this.width / 2, y: this.height / 2 };
      this.repulsionRadius = 150;
      this.attractionRadius = 800;
      this.friction = 0.95;
      
      // Mobile Sensors
      this.sensorMode = false;

      this.resize();
      window.addEventListener("resize", () => this.resize());
      this.setupInteraction();
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.initParticles();
    }

    initParticles() {
      // MASSIVE galaxy density - insanely large particle count (but performant)
      const count = Math.min(100000000, (this.width * this.height) / 200);
      this.particles = [];
      for (let i = 0; i < count; i++) {
        this.particles.push(this.createParticle());
      }
    }

    createParticle() {
      // Galaxy Palette: Dark Metal + Shine (Stars)
      const isStar = Math.random() < 0.15; // 15% are bright stars
      const colors = isStar 
        ? ["#FFFFFF", "#E2E8F0", "#38BDF8", "#0EA5E9"] // Bright: White, Slate-200, Sky-400, Sky-500
        : ["#0F172A", "#1E293B", "#334155", "#475569"]; // Dark: Slate-900 to Slate-600
      
      const angle = Math.random() * Math.PI * 2;
      const maxDimension = Math.sqrt(this.width * this.width + this.height * this.height); // Diagonal
      const radius = Math.random() * maxDimension * 5.5; // MASSIVE galaxy - 5.5x screen diagonal

      // Calculate initial orbital velocity so galaxy is already rotating
      const orbitalSpeed = 0.3; // Base speed
      const tangentVx = -Math.sin(angle) * orbitalSpeed;
      const tangentVy = Math.cos(angle) * orbitalSpeed;

      return {
        x: this.width / 2 + Math.cos(angle) * radius,
        y: this.height / 2 + Math.sin(angle) * radius,
        vx: tangentVx + (Math.random() - 0.5) * 0.2, // Initial orbital velocity + randomness
        vy: tangentVy + (Math.random() - 0.5) * 0.2,
        size: isStar ? Math.random() * 3 + 2 : Math.random() * 5 + 5, // Stars are smaller but bright
        color: colors[Math.floor(Math.random() * colors.length)],
        baseRadius: radius, // Remember orbit
        angle: angle,
        speed: (Math.random() * 0.002) + 0.001, // Orbital speed
        isStar: isStar
      };
    }

    setupInteraction() {
      this.mouse = { x: -1000, y: -1000 }; // Off-screen default

      window.addEventListener("mousemove", (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });

      window.addEventListener("touchmove", (e) => {
        const t = e.touches[0];
        this.mouse.x = t.clientX;
        this.mouse.y = t.clientY;
      }, { passive: true });
    }

    update() {
      if (!this.running) return;

      // Deep space background trail
      this.ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-page');
      this.ctx.fillRect(0, 0, this.width, this.height);

      const centerX = this.width / 2;
      const centerY = this.height / 2;
      
      // Mouse Deformer Logic
      const mouseX = this.mouse.x;
      const mouseY = this.mouse.y;
      const hasMouse = mouseX > 0 && mouseY > 0;

      this.particles.forEach(p => {
        // 1. HARMONIC GALAXY ROTATION (Base State)
        // Orbit around center
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        
        // Tangential force for rotation
        const orbitAngle = Math.atan2(dy, dx);
        const rotationForce = 0.05;
        
        p.vx += -Math.sin(orbitAngle) * rotationForce * 0.5;
        p.vy += Math.cos(orbitAngle) * rotationForce * 0.5;

        // Centripetal force (Gravity holding galaxy together)
        const gravity = 0.02;
        p.vx -= Math.cos(orbitAngle) * gravity;
        p.vy -= Math.sin(orbitAngle) * gravity;

        // 2. MOUSE DEFORMER (Distortion Field)
        if (hasMouse) {
          const mdx = mouseX - p.x;
          const mdy = mouseY - p.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          
          if (mDist < 300) {
            // Mouse acts as a heavy mass bending space (smoother)
            const deformForce = (300 - mDist) / 300 * 0.3; // Reduced from 0.8 to 0.3
            const mAngle = Math.atan2(mdy, mdx);
            
            // Pull towards mouse (Gravity Well)
            p.vx += Math.cos(mAngle) * deformForce;
            p.vy += Math.sin(mAngle) * deformForce;
          }
        }

        // Friction (Space drag)
        p.vx *= 0.96;
        p.vy *= 0.96;
        
        p.x += p.vx;
        p.y += p.vy;

        // Screen Wrap (Galaxy boundaries)
        if (p.x < -100) p.x = this.width + 100;
        if (p.x > this.width + 100) p.x = -100;
        if (p.y < -100) p.y = this.height + 100;
        if (p.y > this.height + 100) p.y = -100;

        // DRAW
        const velocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        // Longer trails for stars to simulate light streaks
        const trailLen = p.isStar ? 4 : 3;
        this.ctx.lineTo(p.x - p.vx * trailLen, p.y - p.vy * trailLen);
        
        this.ctx.strokeStyle = p.color;
        // Stars are thinner but brighter
        this.ctx.lineWidth = p.isStar ? Math.min(2, velocity * 2) : Math.min(3, velocity * 1.5);
        this.ctx.stroke();
      });

      requestAnimationFrame(() => this.update());
    }

    start() {
      if (!this.running) {
        this.running = true;
        this.update();
      }
    }

    stop() {
      this.running = false;
    }
  }

  // =============================================
  // 5. APP LOGIC
  // =============================================
  
  function init() {
    initTheme();
    populateSelects();
    setupListeners();
    loadSession();
    
    // Inicializar AnimatedSky (céu animado modular)
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    gravityEngine = new AnimatedSky({
      canvasId: "gravityCanvas",
      theme: currentTheme,
      enableParallax: true,
      respectReducedMotion: true
    });
    gravityEngine.init();
    
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
  }

  function handleHashChange() {
    const hash = window.location.hash || "#home";
    if (hash === "#app") {
      elements.homeView.classList.add("d-none");
      elements.appView.classList.remove("d-none");
      // Manter animação rodando no app também
      if (gravityEngine && gravityEngine.resume) {
        gravityEngine.resume();
      }
    } else {
      elements.appView.classList.add("d-none");
      elements.homeView.classList.remove("d-none");
      if (gravityEngine && gravityEngine.resume) {
        gravityEngine.resume();
      }
    }
  }

  function populateSelects() {
    let html = '<option value="">Selecione...</option>';
    locaisSaoJorge.forEach(l => html += `<option value="${l}">${l}</option>`);
    html += '<option value="outro">Outro (Digitar)...</option>';
    elements.localSelect.innerHTML = html;

    html = '<option value="">Selecione...</option>';
    tiposAtividade.forEach(a => html += `<option value="${a}">${a}</option>`);
    html += '<option value="outro">Outro (Digitar)...</option>';
    elements.atividadeSelect.innerHTML = html;
  }

  function setupListeners() {
    // Theme Toggles
    elements.landingThemeToggle.addEventListener("click", toggleTheme);
    elements.appThemeToggle.addEventListener("click", toggleTheme);

    // Inputs
    [elements.equipeInput, elements.enderecoInput, elements.localPersonalizadoInput, elements.atividadeInput].forEach(el => {
      el.addEventListener("input", () => { saveSession(); updatePreview(); });
    });

    elements.localSelect.addEventListener("change", (e) => {
      if (e.target.value === "outro") {
        elements.localPersonalizadoDiv.classList.remove("d-none");
      } else {
        elements.localPersonalizadoDiv.classList.add("d-none");
        elements.localPersonalizadoInput.value = "";
      }
      saveSession();
      updatePreview();
    });

    elements.atividadeSelect.addEventListener("change", (e) => {
      if (e.target.value === "outro") {
        elements.atividadeInput.disabled = false;
        elements.atividadeInput.value = "";
        elements.atividadeInput.focus();
      } else if (e.target.value) {
        elements.atividadeInput.disabled = true;
        elements.atividadeInput.value = e.target.value;
      } else {
        elements.atividadeInput.disabled = true;
        elements.atividadeInput.value = "";
      }
      saveSession();
      updatePreview();
    });

    // Photo
    elements.uploadArea.addEventListener("click", () => elements.fileInput.click());
    elements.cameraBtn.addEventListener("click", () => {
      elements.fileInput.setAttribute("capture", "environment");
      elements.fileInput.click();
    });
    elements.galleryBtn.addEventListener("click", () => {
      elements.fileInput.removeAttribute("capture");
      elements.fileInput.click();
    });
    elements.fileInput.addEventListener("change", handleFileSelect);
    elements.removePhotoBtn.addEventListener("click", removePhoto);

    // Actions
    elements.copyBtn.addEventListener("click", copyReport);
    elements.whatsappBtn.addEventListener("click", shareWhatsapp);
    elements.clearSessionBtn.addEventListener("click", clearSession);
  }

  // =============================================
  // 6. CORE LOGIC (REPORT & FILES)
  // =============================================

  function generateReport() {
    const equipe = elements.equipeInput.value.trim();
    const local = elements.localSelect.value === "outro" ? elements.localPersonalizadoInput.value : elements.localSelect.value;
    const endereco = elements.enderecoInput.value.trim();
    const atividade = elements.atividadeInput.value.trim();

    if (!equipe || !endereco || !atividade) return "";

    const isPE = atividade === "PE/PTR";
    const baseText = `🚨🚔🚨🚔🚨🚔🚨🚔
*${atividade}:* ${local || "N/A"}
*Equipe*: ${equipe}
*Endereço:* ${endereco}

Foi ${isPE ? "realizado" : "feito"} ${atividade}${isPE ? "" : ", bem como PE/PTR"} no local e nas imediações.`;

    return baseText;
  }

  function updatePreview() {
    const text = generateReport();
    elements.reportPreview.value = text;
    
    const isValid = text.length > 0;
    elements.copyBtn.disabled = !isValid;
    elements.whatsappBtn.disabled = !isValid || !currentFile;
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      currentFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => {
        elements.preview.src = ev.target.result;
        elements.previewSection.classList.remove("d-none");
        elements.uploadArea.classList.add("d-none");
        updatePreview();
      };
      reader.readAsDataURL(file);
    }
  }

  function removePhoto() {
    currentFile = null;
    elements.fileInput.value = "";
    elements.previewSection.classList.add("d-none");
    elements.uploadArea.classList.remove("d-none");
    updatePreview();
  }

  // =============================================
  // 7. SESSION
  // =============================================

  function saveSession() {
    const data = {
      equipe: elements.equipeInput.value,
      localIdx: elements.localSelect.selectedIndex,
      localCustom: elements.localPersonalizadoInput.value,
      endereco: elements.enderecoInput.value,
      ativIdx: elements.atividadeSelect.selectedIndex,
      ativCustom: elements.atividadeInput.value
    };
    localStorage.setItem("proativas_v2", JSON.stringify(data));
  }

  function loadSession() {
    const saved = localStorage.getItem("proativas_v2");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        elements.equipeInput.value = data.equipe || "";
        elements.localSelect.selectedIndex = data.localIdx || 0;
        elements.localPersonalizadoInput.value = data.localCustom || "";
        elements.enderecoInput.value = data.endereco || "";
        elements.atividadeSelect.selectedIndex = data.ativIdx || 0;
        elements.atividadeInput.value = data.ativCustom || "";

        elements.localSelect.dispatchEvent(new Event("change"));
        elements.atividadeSelect.dispatchEvent(new Event("change"));
      } catch (e) { console.error(e); }
    }
  }

  function clearSession() {
    if (confirm("Limpar todos os dados?")) {
      localStorage.removeItem("proativas_v2");
      location.reload();
    }
  }

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(elements.reportPreview.value);
      alert("Copiado!");
    } catch (e) { alert("Erro ao copiar"); }
  }

  async function shareWhatsapp() {
    if (!currentFile) return alert("Anexe uma foto!");
    try {
      if (navigator.canShare && navigator.canShare({ files: [currentFile] })) {
        await navigator.share({
          files: [currentFile],
          title: "Proativa",
          text: elements.reportPreview.value
        });
      } else {
        alert("Compartilhamento não suportado neste navegador.");
      }
    } catch (e) { console.log(e); }
  }

  init();
});
