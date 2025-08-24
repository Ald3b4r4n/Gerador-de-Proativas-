document.addEventListener("DOMContentLoaded", function () {
  // =============================================
  // DADOS DA APLICAÇÃO (Listas)
  // =============================================
  const policiais = [
    "Subtenente Douglas", "Subtenente Fabiana", "1º Sgt Nilton", "1º Sgt Spíndola",
    "2° Sgt Elwis", "2° Sgt Nóbriga", "2° Sgt Valdivino", "2° Sgt Wilton", 
    "3º Sgt Aurélio", "3º Sgt De Castro", "3º Sgt Feitosa", "3º Sgt Gomes Rocha", 
    "3º Sgt J. Vieira", "3º Sgt Jones", "3º Sgt Menezes", "3º Sgt R. Meira", 
    "3º Sgt Silvania", "3º Sgt Valadares", "3º Sgt Valverde", "3º Sgt Vinicius", 
    "Cb Alves", "Cb Antônio Rafael", "Cb Barbosa", "Cb Bezerra", "Cb Carvalho", 
    "Cb Esser", "Cb Giovani", "Cb Gonzaga", "Cb Guilherme", "Cb J. Freire", 
    "Cb Junior Barbosa", "Cb Kamila", "Cb Max Douglas", "Cb Nascimento", "Cb Neri", 
    "Cb Odon", "Cb Pinheiro", "Cb Ponte", "Cb Portugal", "Cb Rodrigues", "Cb Rodrigo", 
    "Cb Teixeira", "Cb Thiago Junio", "Cb Tunes", "Sd Jônatas", "Sd Wunder"
  ].sort();

  const locaisSaoJorge = [
    "Loquinhas", "São Bento", "Vale da Lua", "Volta da Serra",
    "Parque Nacional", "Centro", "Praça do Coreto", "Mirante do Por do Sol",
    "Mirante do Morro da Baleia",
  ].sort();

  const tiposAtividade = [
    "PE/PTR", "Visita Escolar", "Visita ao Comércio", "Visita solidária",
    "Policiamento de Eventos", "Bloqueio", "Abordagem Estática"
  ].sort();

  // =============================================
  // ESTADO DA APLICAÇÃO
  // =============================================
  let currentFile = null;
  let equipeSelecionada = [];

  // =============================================
  // CACHE DE ELEMENTOS DOM
  // =============================================
  const elements = {
    policiaisList: document.getElementById("policiaisList"),
    clearEquipeBtn: document.getElementById("clearEquipeBtn"),
    localSelect: document.getElementById("localSelect"),
    enderecoInput: document.getElementById("enderecoInput"),
    atividadeSelect: document.getElementById("atividadeSelect"),
    atividadeInput: document.getElementById("atividadeInput"),
    cameraBtn: document.getElementById("cameraBtn"),
    galleryBtn: document.getElementById("galleryBtn"),
    fileInput: document.getElementById("fileInput"),
    previewSection: document.getElementById("previewSection"),
    preview: document.getElementById("preview"),
    reportPreview: document.getElementById("reportPreview"),
    copyBtn: document.getElementById("copyBtn"),
    whatsappBtn: document.getElementById("whatsappBtn"),
  };

  // =============================================
  // INICIALIZAÇÃO
  // =============================================
  function init() {
    populatePoliciais();
    populateLocais();
    populateAtividades();
    setupEventListeners();
    updateReportPreview();
  }

  function populatePoliciais() {
    policiais.forEach((nome) => {
      const div = document.createElement("div");
      div.className = "list-group-item";
      div.innerHTML = `
        <input class="form-check-input me-2" type="checkbox" value="${nome}" id="${nome.replace(/\s/g, '')}">
        <label class="form-check-label" for="${nome.replace(/\s/g, '')}">${nome}</label>
      `;
      elements.policiaisList.appendChild(div);
    });
  }

  function populateLocais() {
    elements.localSelect.innerHTML = `<option value="">Selecione um local...</option>`;
    locaisSaoJorge.forEach((local) => {
      elements.localSelect.innerHTML += `<option value="${local}">${local}</option>`;
    });
    elements.localSelect.innerHTML += `<option value="outro">Outro (Digitar Manualmente)...</option>`;
  }

  function populateAtividades() {
    elements.atividadeSelect.innerHTML = `<option value="">Selecione uma atividade...</option>`;
    tiposAtividade.forEach((atividade) => {
      elements.atividadeSelect.innerHTML += `<option value="${atividade}">${atividade}</option>`;
    });
    elements.atividadeSelect.innerHTML += `<option value="outro">Outro (Digitar Manualmente)...</option>`;
  }

  // =============================================
  // EVENT LISTENERS
  // =============================================
  function setupEventListeners() {
    elements.policiaisList.addEventListener("change", handleEquipeChange);
    
    elements.clearEquipeBtn.addEventListener("click", () => {
      elements.policiaisList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      equipeSelecionada = [];
      updateReportPreview();
    });

    elements.localSelect.addEventListener("change", handleLocalChange);
    elements.enderecoInput.addEventListener("input", updateReportPreview);
    elements.atividadeSelect.addEventListener("change", handleAtividadeChange);
    elements.atividadeInput.addEventListener("input", updateReportPreview);
    elements.cameraBtn.addEventListener("click", () => openFileSelector("environment"));
    elements.galleryBtn.addEventListener("click", () => openFileSelector());
    elements.fileInput.addEventListener("change", handleFileSelect);
    elements.copyBtn.addEventListener("click", copyReport);
    elements.whatsappBtn.addEventListener("click", shareToWhatsApp);
  }

  // =============================================
  // FUNÇÕES PRINCIPAIS E LÓGICA
  // =============================================
  
  function handleEquipeChange(e) {
    if (e.target.type === 'checkbox') {
        const nome = e.target.value;
        if (e.target.checked) {
            if (!equipeSelecionada.includes(nome)) {
                equipeSelecionada.push(nome);
            }
        } else {
            equipeSelecionada = equipeSelecionada.filter(p => p !== nome);
        }
        updateReportPreview();
    }
  }

  function handleLocalChange() {
    const selectedValue = elements.localSelect.value;
    if (selectedValue === "outro") {
      elements.enderecoInput.value = "";
      elements.enderecoInput.disabled = false;
      elements.enderecoInput.placeholder = "Digite o endereço completo aqui";
      elements.enderecoInput.focus();
    } else if (selectedValue) {
      elements.enderecoInput.value = `${selectedValue}, São Jorge`;
      elements.enderecoInput.disabled = true;
    } else {
      elements.enderecoInput.value = "";
      elements.enderecoInput.disabled = true;
      elements.enderecoInput.placeholder = "Selecione um local ou digite aqui";
    }
    updateReportPreview();
  }

  function handleAtividadeChange() {
    const selectedValue = elements.atividadeSelect.value;
    if (selectedValue === "outro") {
      elements.atividadeInput.value = "";
      elements.atividadeInput.disabled = false;
      elements.atividadeInput.placeholder = "Digite o tipo de atividade aqui";
      elements.atividadeInput.focus();
    } else if (selectedValue) {
      elements.atividadeInput.value = selectedValue;
      elements.atividadeInput.disabled = true;
    } else {
      elements.atividadeInput.value = "";
      elements.atividadeInput.disabled = true;
      elements.atividadeInput.placeholder = "Selecione uma atividade ou digite aqui";
    }
    updateReportPreview();
  }
  
  function getSelectedEquipe() {
    return equipeSelecionada;
  }

  function generateReportText() {
  const equipe = getSelectedEquipe();
  const local = elements.localSelect.value === 'outro' 
    ? elements.enderecoInput.value.split(',')[0].trim() 
    : elements.localSelect.value;
  const endereco = elements.enderecoInput.value;
  const atividade = elements.atividadeInput.value;

  if (equipe.length === 0 || !endereco || !atividade) {
    return "";
  }

  const equipeText = equipe.join(' e ');
  
  if (atividade === "PE/PTR") {
    return `🚨🚔🚨🚔🚨🚔🚨🚔
*${atividade}:* ${local || 'N/A'}
*Equipe*: ${equipeText}
*Endereço:* ${endereco}

Foi realizado ${atividade} no local e nas imediações.`;
  } else {
    return `🚨🚔🚨🚔🚨🚔🚨🚔
*${atividade}:* ${local || 'N/A'}
*Equipe*: ${equipeText}
*Endereço:* ${endereco}

Foi feito ${atividade}, bem como PE/PTR no local e nas imediaçoes.`;
  }
}

  function updateReportPreview() {
    const reportText = generateReportText();
    elements.reportPreview.value = reportText;
    validateForm();
  }

  function validateForm() {
    const equipe = getSelectedEquipe();
    const endereco = elements.enderecoInput.value.trim();
    const atividade = elements.atividadeInput.value.trim();
    const isFormValid = equipe.length > 0 && endereco !== "" && atividade !== "";
    
    elements.copyBtn.disabled = !isFormValid;
    elements.whatsappBtn.disabled = !isFormValid || !currentFile;
  }

  // =============================================
  // FUNÇÕES DE AÇÃO (Copiar, WhatsApp, Foto)
  // =============================================
  
  function openFileSelector(captureMode) {
    if (captureMode) {
      elements.fileInput.setAttribute("capture", captureMode);
    } else {
      elements.fileInput.removeAttribute("capture");
    }
    elements.fileInput.click();
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    currentFile = file;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      elements.preview.src = ev.target.result;
      elements.previewSection.classList.remove("d-none");
    };
    reader.readAsDataURL(file);
    validateForm();
  }

  async function copyReport() {
    const text = elements.reportPreview.value;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      elements.copyBtn.innerText = "Copiado!";
      setTimeout(() => {
        elements.copyBtn.innerHTML = '<i class="bi bi-clipboard-check me-2"></i>Copiar Relatório';
      }, 2000);
    } catch (err) {
      console.error("Falha ao copiar:", err);
      alert("Erro ao copiar o texto.");
    }
  }

  async function shareToWhatsApp() {
    const text = elements.reportPreview.value;
    if (!text || !currentFile) {
        alert("É necessário preencher a equipe, o local, a atividade e anexar uma foto para compartilhar.");
        return;
    }
    
    try {
        await navigator.clipboard.writeText(text);
        
        if (navigator.canShare && navigator.canShare({ files: [currentFile] })) {
            await navigator.share({
                files: [currentFile],
                title: "Relatório de Proativa",
            });
        } else {
            alert("Seu navegador não suporta o compartilhamento de arquivos. O texto foi copiado. Anexe a imagem manualmente no WhatsApp.");
        }
    } catch (error) {
        if (error.name !== "AbortError") {
            console.error("Erro ao compartilhar:", error);
            alert("Falha ao compartilhar. O texto foi copiado para a área de transferência.");
        }
    }
  }

  // Inicia a aplicação
  init();
});