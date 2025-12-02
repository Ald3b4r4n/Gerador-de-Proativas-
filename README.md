# Gerador de Proativas 🛡️

> **Sistema Profissional de Geração de Relatórios Operacionais para Segurança Pública**

Uma Progressive Web Application (PWA) desenvolvida para otimizar o fluxo de trabalho de policiais militares na criação de relatórios padronizados de atividades operacionais (Proativas), com foco em usabilidade mobile, persistência de dados e design moderno.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Stack Tecnológica](#-stack-tecnológica)
- [Arquitetura e Padrões](#-arquitetura-e-padrões)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação e Deploy](#-instalação-e-deploy)
- [Desafios de Desenvolvimento](#-desafios-de-desenvolvimento)
- [Aprendizados Técnicos](#-aprendizados-técnicos)

---

## 🎯 Visão Geral

O **Gerador de Proativas** é uma solução web moderna que elimina a necessidade de digitação manual repetitiva de relatórios operacionais. A aplicação foi projetada com arquitetura **Mobile-First** e utiliza tecnologias web nativas para garantir máxima compatibilidade e performance.

### Contexto de Uso
- **Usuários:** Policiais militares em operações de campo
- **Ambiente:** Dispositivos móveis (Android/iOS) com conectividade intermitente
- **Objetivo:** Reduzir tempo de documentação de 5-10 minutos para menos de 1 minuto

---

## 🛠️ Stack Tecnológica

### Frontend Core
- **HTML5 Semântico**
  - Uso de tags semânticas (`<section>`, `<nav>`, `<main>`, `<footer>`)
  - Acessibilidade via ARIA labels
  - Estrutura modular com separação de views (Landing/App)

- **CSS3 Moderno**
  - **Custom Properties (CSS Variables):** Sistema de design tokens para cores, sombras e transições
  - **Glassmorphism:** Efeito de vidro fosco usando `backdrop-filter: blur()`
  - **Flexbox & Grid:** Layout responsivo sem media queries complexas
  - **Animations:** Keyframes para transições suaves (`fadeInUp`, `rotate`)
  - **Mobile-First:** Breakpoints em `768px` e `375px` para otimização progressiva

- **JavaScript (ES6+)**
  - **Vanilla JS:** Zero dependências de frameworks (React/Vue/Angular)
  - **Módulos ES6:** Organização funcional com closures
  - **Async/Await:** Operações assíncronas para Clipboard API e File API
  - **Event Delegation:** Otimização de listeners de eventos
  - **LocalStorage API:** Persistência de estado sem backend

### Bibliotecas Externas
- **Bootstrap 5.3.3**
  - Grid System para responsividade
  - Componentes (Modal, Toast, Navbar)
  - Utilities para spacing e display
  
- **Bootstrap Icons 1.11.3**
  - Ícones vetoriais (SVG) para interface

### APIs Web Modernas
- **Service Worker API:** Funcionamento offline (PWA)
- **Web Share API:** Compartilhamento nativo de arquivos
- **Clipboard API:** Cópia de texto sem `document.execCommand`
- **File API:** Leitura e preview de imagens
- **Media Capture API:** Acesso direto à câmera via `capture="environment"`
- **LocalStorage API:** Persistência de sessão
- **Canvas API:** Animações de background em tempo real

### Sistema de Background Animado
- **AnimatedSky.js**
  - Engine de animação canvas com 60 FPS
  - Modo Dark: Céu noturno com Via Láctea, estrelas cadentes e lua
  - Modo Light: Céu diurno com sol, nuvens e partículas
  - Easter Eggs interativos:
    - 🛸 UAP/OVNI (5% chance - dark mode)
    - 🎅 Trenó do Papai Noel (3-15% chance - dark mode, maior em dezembro)
    - 🦅 Pássaros voando (8% chance - light mode)
    - ✈️ Avião com banner motivacional (4% chance - light mode)
  - Otimizações: Page Visibility API, detecção de mobile, parallax mouse
  - Acessibilidade: Respeita `prefers-reduced-motion`

---

## 🏗️ Arquitetura e Padrões

### Padrão de Navegação: Hash-Based SPA
A aplicação utiliza **Hash Routing** para criar uma Single Page Application sem necessidade de servidor ou bundler:

```javascript
// Roteamento baseado em hash (#home, #app)
function handleNavigation() {
  const hash = window.location.hash || "#home";
  // Alterna visibilidade das views sem recarregar a página
  if (hash === "#app") {
    showAppView();
  } else {
    showHomeView();
  }
}

window.addEventListener("hashchange", handleNavigation);
```

**Vantagens:**
- ✅ Funciona sem servidor (pode ser hospedado em GitHub Pages)
- ✅ Botão "Voltar" do navegador funciona nativamente
- ✅ URLs compartilháveis (`site.com/#app`)

### Gerenciamento de Estado
**Padrão:** Unidirectional Data Flow com LocalStorage como "banco de dados"

```javascript
// Fluxo: Input → saveSession() → LocalStorage → loadSession() → UI
function saveSession() {
  const sessionData = {
    equipe: elements.equipeInput.value,
    localSelect: elements.localSelect.value,
    // ... outros campos
  };
  localStorage.setItem("proativasSession", JSON.stringify(sessionData));
}
```

**Persistência:**
- Dados salvos automaticamente a cada digitação (`input` event)
- Recuperação automática ao reabrir o app
- Limpeza manual via Modal de Confirmação

### Padrão de UI: Toast & Modal
Substituição de `alert()` e `confirm()` nativos por componentes Bootstrap:

```javascript
function showToast(message, type = 'info') {
  elements.toastBody.textContent = message;
  elements.toastElement.className = `toast align-items-center border-0 text-white bg-${type}`;
  toastInstance.show();
}

function showConfirmModal(message, onConfirm) {
  elements.confirmMessage.textContent = message;
  elements.confirmActionBtn.addEventListener("click", () => {
    onConfirm();
    confirmModalInstance.hide();
  });
  confirmModalInstance.show();
}
```

---

## ⚙️ Funcionalidades Principais

### 1. Geração Automática de Relatórios
**Tecnologia:** Template Literals (ES6)

```javascript
function generateReportText() {
  const equipe = getEquipeText();
  const local = getLocalText();
  const endereco = elements.enderecoInput.value.trim();
  const atividade = elements.atividadeInput.value.trim();

  return `🚨🚔🚨🚔🚨🚔🚨🚔
*${atividade}:* ${local || "N/A"}
*Equipe*: ${equipe}
*Endereço:* ${endereco}

Foi realizado ${atividade} no local e nas imediações.`;
}
```

**Lógica de Formatação:**
- Concatenação de múltiplos membros da equipe com " e "
- Fallback para "N/A" em campos opcionais
- Emojis para identificação visual rápida

### 2. Anexo de Fotos
**Tecnologia:** File API + FileReader + Media Capture

```javascript
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  currentFile = file; // Armazena referência para compartilhamento

  const reader = new FileReader();
  reader.onload = (ev) => {
    elements.preview.src = ev.target.result; // Base64 para preview
    elements.previewSection.classList.remove("d-none");
  };
  reader.readAsDataURL(file);
}
```

**Diferencial Mobile:**
- Atributo `capture="environment"` abre câmera traseira diretamente
- Preview instantâneo sem upload para servidor

### 3. Compartilhamento via WhatsApp
**Tecnologia:** Web Share API + Clipboard API

```javascript
async function shareToWhatsApp() {
  const text = elements.reportPreview.value;
  
  // Copia texto para área de transferência
  await navigator.clipboard.writeText(text);

  // Tenta compartilhar arquivo nativamente
  if (navigator.canShare && navigator.canShare({ files: [currentFile] })) {
    await navigator.share({
      files: [currentFile],
      title: "Relatório de Proativa",
    });
  } else {
    showToast("Compartilhamento de arquivos não suportado. Texto copiado.", "info");
  }
}
```

**Fallback Strategy:**
1. Tenta `navigator.share()` (Android/iOS)
2. Se falhar, copia texto e instrui usuário a anexar foto manualmente

### 4. Persistência de Sessão
**Tecnologia:** LocalStorage API

**Ciclo de Vida:**
```
Usuário digita → Event "input" → saveSession() → JSON.stringify() → localStorage.setItem()
                                                                              ↓
Usuário reabre app ← loadSession() ← JSON.parse() ← localStorage.getItem() ←
```

**Segurança:**
- Dados armazenados apenas no dispositivo (não há servidor)
- Limpeza via Modal de Confirmação

---

## 📁 Estrutura do Projeto

```
Gerador-de-Proativas-/
├── index.html          # Estrutura HTML (Landing + App views)
├── app.css             # Estilos (Glassmorphism + Responsividade)
├── app.js              # Lógica da aplicação (Vanilla JS)
├── animated-sky.js     # Engine de animação de background (Canvas)
├── sw.js               # Service Worker (PWA offline)
├── manifest.json       # Metadados PWA (ícones, cores)
└── README.md           # Documentação técnica
```

---

## 🚀 Instalação e Deploy

### Desenvolvimento Local
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/Gerador-de-Proativas-.git

# Navegue até a pasta
cd Gerador-de-Proativas-

# Abra com Live Server (VS Code) ou qualquer servidor HTTP
# Exemplo com Python:
python -m http.server 8000

# Acesse: http://localhost:8000
```

### Deploy em Produção
**Opções de Hospedagem Gratuita:**

1. **GitHub Pages**
   ```bash
   git push origin main
   # Ative GitHub Pages em Settings → Pages → Source: main branch
   ```

2. **Vercel**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

3. **Netlify**
   - Arraste a pasta para [app.netlify.com/drop](https://app.netlify.com/drop)

**Requisitos:**
- ✅ HTTPS obrigatório (Clipboard API e Service Worker)
- ✅ Sem build step necessário (arquivos estáticos)

---

## 🔧 Desafios de Desenvolvimento

### 1. **Compatibilidade Mobile com Input de Arquivo**
**Problema:** Botão "Tirar Foto" não abria a câmera diretamente em dispositivos móveis.

**Solução:**
```html
<!-- Atributo capture="environment" força abertura da câmera traseira -->
<input type="file" accept="image/*" capture="environment" />
```

**Aprendizado:** A especificação HTML Media Capture permite controle fino sobre a origem da mídia.

---

### 2. **Permissões da Clipboard API**
**Problema:** `navigator.clipboard.writeText()` falhava silenciosamente em contextos não-HTTPS.

**Solução:**
```javascript
try {
  await navigator.clipboard.writeText(text);
  showToast("Copiado!", "success");
} catch (err) {
  // Fallback para document.execCommand (deprecated mas funciona em HTTP)
  console.error("Clipboard API falhou:", err);
  showToast("Erro ao copiar.", "error");
}
```

**Aprendizado:** APIs modernas exigem contexto seguro (HTTPS) e interação do usuário.

---

### 3. **CSS Duplicado Durante Migração**
**Problema:** Ao refatorar de tema claro para escuro, houve duplicação de regras CSS, causando conflitos.

**Solução:**
- Uso de `grep` para identificar duplicatas
- Remoção cirúrgica via script Python:
  ```python
  lines = open('app.css').readlines()
  open('app.css', 'w').write(''.join(lines[:1590] + lines[1927:]))
  ```

**Aprendizado:** Ferramentas de linha de comando (grep, sed, awk) são essenciais para manutenção de código legado.

---

### 4. **Glassmorphism em Navegadores Antigos**
**Problema:** `backdrop-filter` não é suportado em Safari < 14 e Firefox < 103.

**Solução:**
```css
.card {
  background: rgba(15, 23, 42, 0.8); /* Fallback sólido */
  backdrop-filter: blur(10px); /* Efeito glassmorphism */
}

/* Fallback para navegadores sem suporte */
@supports not (backdrop-filter: blur(10px)) {
  .card {
    background: rgba(15, 23, 42, 0.95); /* Mais opaco */
  }
}
```

**Aprendizado:** Progressive Enhancement garante funcionalidade em todos os navegadores.

---

### 5. **Prevenção de Zoom no iOS**
**Problema:** Inputs com `font-size < 16px` causam zoom automático no iOS Safari.

**Solução:**
```css
.form-control {
  font-size: 16px !important; /* Mínimo para evitar zoom */
}

@supports (-webkit-touch-callout: none) {
  input, select, textarea {
    font-size: 16px !important;
  }
}
```

**Aprendizado:** Quirks do iOS Safari exigem atenção especial em apps mobile-first.

---

### 6. **Implementação de Animações Canvas com Performance**
**Problema:** Criar um sistema de background animado que não impactasse a performance da aplicação principal.

**Solução:**
```javascript
class AnimatedSky {
  constructor(options) {
    this.fps = 60;
    this.frameInterval = 1000 / this.fps;
    this.lastFrameTime = 0;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  animate(currentTime = 0) {
    if (!this.running) return;

    // Controle de FPS
    const elapsed = currentTime - this.lastFrameTime;
    if (elapsed < this.frameInterval) {
      this.animationId = requestAnimationFrame((t) => this.animate(t));
      return;
    }
    this.lastFrameTime = currentTime - (elapsed % this.frameInterval);

    // Renderizar frame
    this.render();
    this.animationId = requestAnimationFrame((t) => this.animate(t));
  }

  // Page Visibility API - pausar quando aba não está visível
  init() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }
}
```

**Otimizações Implementadas:**
- ✅ Controle de FPS (60 constante)
- ✅ Redução de partículas em mobile (50%)
- ✅ Pausa automática quando aba não está visível (Page Visibility API)
- ✅ Respeito a `prefers-reduced-motion` para acessibilidade
- ✅ Detecção de dispositivo móvel para ajustes automáticos

**Aprendizado:** Animações canvas podem ser performáticas se implementadas com controle de frame rate e otimizações baseadas em contexto (mobile, visibilidade, preferências do usuário).

---

## 📚 Aprendizados Técnicos

### 1. **Hash Routing vs. History API**
**Escolha:** Hash Routing (`#home`, `#app`)

**Justificativa:**
- ✅ Funciona sem servidor (GitHub Pages)
- ✅ Sem necessidade de configuração de fallback routes
- ❌ URLs menos "limpas" (mas aceitável para PWA)

**Alternativa:** History API (`pushState`) exigiria servidor para redirecionar todas as rotas para `index.html`.

---

### 2. **LocalStorage vs. IndexedDB**
**Escolha:** LocalStorage

**Justificativa:**
- ✅ API síncrona e simples
- ✅ Dados pequenos (< 5MB)
- ❌ Não suporta queries complexas (mas não necessário aqui)

**Alternativa:** IndexedDB seria overkill para armazenar apenas um objeto JSON de sessão.

---

### 3. **Bootstrap vs. Tailwind CSS**
**Escolha:** Bootstrap 5

**Justificativa:**
- ✅ Componentes prontos (Modal, Toast, Navbar)
- ✅ Grid system robusto
- ✅ Sem necessidade de build step (CDN)
- ❌ Arquivo CSS maior (mas aceitável com CDN)

**Alternativa:** Tailwind exigiria PostCSS e build, aumentando complexidade.

---

### 4. **Service Worker: Estratégia de Cache**
**Implementação:** Cache-First com Network Fallback

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**Aprendizado:** PWAs offline-first melhoram UX em áreas com conectividade ruim.

---

## 👨‍💻 Autor

**CB Antônio Rafael**  
Desenvolvedor focado em soluções tecnológicas para segurança pública.

📧 Contato: [WhatsApp](https://wa.me/5561982887294)

---

## 📄 Licença

Este projeto é de código aberto para uso em instituições de segurança pública.
