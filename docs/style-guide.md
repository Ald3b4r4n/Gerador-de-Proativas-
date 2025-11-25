# Guia de Estilo - Gerador de Proativas

## 🎨 Paleta de Cores

### Cores Principais

#### Primary (Azul Vibrante)
- **Primary**: `#3B82F6` - Cor principal, usada em botões primários, links e destaques
- **Primary Light**: `#60A5FA` - Variante clara para hover states
- **Primary Dark**: `#1E40AF` - Variante escura para gradientes
- **Primary Glow**: `rgba(59, 130, 246, 0.35)` - Efeito de brilho/sombra

**Uso recomendado:**
```css
.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
}
```

#### Secondary (Roxo Médio)
- **Secondary**: `#8B5CF6` - Cor secundária, mantém identidade visual policial
- **Secondary Light**: `#A78BFA` - Variante clara
- **Secondary Dark**: `#6D28D9` - Variante escura

**Uso recomendado:**
```css
.badge-secondary {
  background: var(--secondary);
  color: white;
}
```

#### Accent (Verde Esmeralda)
- **Accent**: `#10B981` - Cor de sucesso e confirmação
- **Accent Light**: `#34D399` - Variante clara
- **Accent Dark**: `#059669` - Variante escura

**Uso recomendado:**
```css
.btn-success {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
}
```

### Cores de Estado

- **Warning**: `#F59E0B` - Avisos e alertas
- **Danger**: `#EF4444` - Erros e ações destrutivas
- **Info**: `#06B6D4` - Informações e dicas

### Fundos (Mesclados Claro/Escuro)

- **bg-dark**: `#1E293B` - Fundo escuro principal
- **bg-medium**: `#334155` - Fundo médio
- **bg-light**: `#F1F5F9` - Fundo claro principal
- **bg-white**: `#FFFFFF` - Branco puro

**Guia de uso:**
- **Landing page**: Fundo claro com gradiente
- **Cards de formulário**: Fundo branco com glassmorphism
- **Áreas de preview**: Fundo médio ou escuro para contraste

### Texto (Adaptativo)

- **text-dark**: `#0F172A` - Texto em fundos claros (contraste 16:1)
- **text-medium**: `#475569` - Texto secundário
- **text-light**: `#F1F5F9` - Texto em fundos escuros (contraste 14:1)
- **text-muted**: `#94A3B8` - Texto desativado/placeholders

### Bordas

- **border-light**: `#E2E8F0` - Bordas em fundos claros
- **border-dark**: `#475569` - Bordas em fundos escuros

---

## 📐 Hierarquia Tipográfica

### Fonte Principal
```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

### Tamanhos e Pesos

| Elemento | Tamanho | Peso | Uso |
|----------|---------|------|-----|
| H1 (display-4) | 2.5rem | 800 | Título principal da landing page |
| H5 (card-header) | 0.9rem | 700 | Títulos de cards |
| Body | 1rem | 400 | Texto padrão |
| Label | 0.9rem | 500 | Labels de formulários |
| Small | 0.875rem | 400 | Textos secundários |

### Espaçamento Tipográfico

```css
line-height: 1.6; /* Texto padrão */
letter-spacing: 0.5px; /* Títulos de cards */
letter-spacing: -1px; /* Display headings */
```

---

## 🎭 Componentes

### Cards

**Estrutura básica:**
```html
<div class="card shadow-sm mb-4">
  <div class="card-header">
    <h5 class="mb-0">Título do Card</h5>
  </div>
  <div class="card-body">
    <!-- Conteúdo -->
  </div>
</div>
```

**Estilos:**
- Background: Glassmorphism com `backdrop-filter: blur(16px)`
- Border radius: `16px`
- Hover: Eleva 4px e aumenta sombra
- Animação: `fadeInUp` com delay escalonado

### Botões

**Variantes disponíveis:**

```html
<!-- Primary -->
<button class="btn btn-primary">
  <i class="bi bi-check-circle"></i> Confirmar
</button>

<!-- Success -->
<button class="btn btn-success">
  <i class="bi bi-clipboard-check"></i> Copiar
</button>

<!-- WhatsApp -->
<button class="btn whatsapp-btn">
  <i class="bi bi-whatsapp"></i> Enviar
</button>
```

**Características:**
- Border radius: `8px`
- Padding: `0.8rem 1.5rem`
- Font weight: `600`
- Text transform: `uppercase`
- Hover: Eleva 2px com box-shadow aumentado

### Formulários

**Input/Select:**
```html
<div class="mb-3">
  <label for="input-id" class="form-label">Label</label>
  <input type="text" id="input-id" class="form-control" placeholder="Placeholder">
</div>
```

**Focus state:**
- Border: `var(--primary)`
- Box shadow: `0 0 0 3px var(--primary-glow)`

---

## ✨ Animações

### Micro-animações Disponíveis

#### fadeInUp
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Uso:** Cards aparecem com delay escalonado

#### float
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
```

**Uso:** Ícone principal da landing page

#### pulseGlow
```css
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
}
```

**Uso:** Elementos interativos especiais

### Acessibilidade de Movimento

Para usuários que preferem movimento reduzido:
```css
@media (prefers-reduced-motion: reduce) {
  .card {
    animation: none;
  }
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📏 Espaçamento e Grid

### Container
```css
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
```

### Espaçamentos Padrão

| Classe | Valor | Uso |
|--------|-------|-----|
| `.mb-3` | 1rem | Espaçamento entre elementos de formulário |
| `.mb-4` | 1.5rem | Espaçamento entre cards |
| `.py-3` | 0.8rem | Padding vertical de botões |
| `.px-5` | 3rem | Padding horizontal de botões grandes |

### Sombras

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);
```

---

## 📱 Responsividade

### Breakpoints

```css
/* Mobile First */
@media (max-width: 768px) {
  .display-1 { font-size: 4rem; }
  h1.display-4 { font-size: 2.5rem; }
  .container { padding: 0 1rem; }
  .btn { width: 100%; }
}
```

### Mobile-specific

- Botões ocupam largura total
- Font size mínimo de 16px para evitar zoom no iOS
- Touch targets mínimos de 44x44px

---

## 🎨 Glassmorphism

**Receita para efeitos de vidro:**
```css
.glass-element {
  background: var(--glass-bg); /* rgba(255, 255, 255, 0.85) */
  backdrop-filter: var(--glass-blur); /* blur(16px) */
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}
```

**Fallback para navegadores antigos:**
```css
@supports not (backdrop-filter: blur(10px)) {
  .glass-element {
    background: rgba(255, 255, 255, 0.95);
  }
}
```

---

## 🔍 Contraste e Acessibilidade

### Diretrizes WCAG AAA

Todos os pares de cores garantem contraste mínimo de 7:1:

✅ `--text-dark` em `--bg-white`: 16:1  
✅ `--text-light` em `--bg-dark`: 14:1  
✅ `--primary` em branco: 4.5:1 (AA)

### Checklist de Acessibilidade

- [ ] Todos os botões têm estados de foco visíveis
- [ ] Labels associados a todos os inputs
- [ ] Hierarquia de headings correta (H1 → H5)
- [ ] Animações respeitam `prefers-reduced-motion`
- [ ] Contraste de cores >= 7:1 (AAA)

---

## 🛠️ Manutenção

### Alterando Cores do Tema

1. Edite apenas as variáveis em `:root` (linhas 4-66 do `app.css`)
2. Teste contraste com [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
3. Verifique em modo escuro e claro

### Adicionando Novos Componentes

1. Siga a estrutura de comentários existente
2. Use variáveis CSS ao invés de valores fixos
3. Adicione animação `fadeInUp` para entrada
4. Teste responsividade em mobile

### Performance CSS

- Evite seletores complexos (`div > ul > li > a`)
- Use classes ao invés de IDs para estilização
- Minimize uso de `!important`
- Prefira `transform` e `opacity` para animações (GPU accelerated)

---

## 📚 Referências

- **Design System**: Material Design 3 + Tailwind principles
- **Fonts**: [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)
- **Icons**: [Bootstrap Icons](https://icons.getbootstrap.com/)
- **Glassmorphism**: [Glass UI Generator](https://ui.glass/)

---

*Última atualização: 25 de novembro de 2025*
