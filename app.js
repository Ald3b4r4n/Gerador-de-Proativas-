document.addEventListener("DOMContentLoaded", function () {
  // =============================================
  // DADOS DA APLICAÇÃO (Listas)
  // =============================================
  const locaisSaoJorge = [
    "Loquinhas",
    "São Bento",
    "Vale da Lua",
    "Volta da Serra",
    "Parque Nacional",
    "Centro",
    "Praça do Coreto",
    "Mirante do Por do Sol",
    "Mirante do Morro da Baleia",
  ].sort();

  const tiposAtividade = [
    "PE/PTR",
    "Visita Escolar",
    "Visita ao Comércio",
    "Visita solidária",
    "Policiamento de Eventos",
    "Bloqueio",
    "Abordagem Estática",
  ].sort();

  // =============================================
  // ESTADO DA APLICAÇÃO
  // =============================================
  let currentFile = null;

  // =============================================
  // CACHE DE ELEMENTOS DOM
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
    previewSection: document.getElementById("previewSection"),
    preview: document.getElementById("preview"),
    reportPreview: document.getElementById("reportPreview"),
    copyBtn: document.getElementById("copyBtn"),
    whatsappBtn: document.getElementById("whatsappBtn"),
    clearSessionBtn: document.getElementById("clearSessionBtn"),
  };

  // =============================================
  // INICIALIZAÇÃO
  // =============================================
  function init() {
    populateLocais();
    populateAtividades();
    setupEventListeners();
    loadSession(); // Carregar sessão salva
    updateReportPreview();
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
  // SALVAMENTO DE SESSÃO
  // =============================================
  function saveSession() {
    const sessionData = {
      equipe: elements.equipeInput.value,
      localSelect: elements.localSelect.value,
      localPersonalizado: elements.localPersonalizadoInput.value,
      endereco: elements.enderecoInput.value,
      atividadeSelect: elements.atividadeSelect.value,
      atividade: elements.atividadeInput.value,
    };
    localStorage.setItem("proativasSession", JSON.stringify(sessionData));
  }

  function loadSession() {
    const saved = localStorage.getItem("proativasSession");
    if (saved) {
      try {
        const sessionData = JSON.parse(saved);
        elements.equipeInput.value = sessionData.equipe || "";
        elements.localSelect.value = sessionData.localSelect || "";
        elements.localPersonalizadoInput.value =
          sessionData.localPersonalizado || "";
        elements.enderecoInput.value = sessionData.endereco || "";
        elements.atividadeSelect.value = sessionData.atividadeSelect || "";
        elements.atividadeInput.value = sessionData.atividade || "";

        // Ajustar visibilidade do campo personalizado
        if (sessionData.localSelect === "outro") {
          elements.localPersonalizadoDiv.style.display = "block";
        }

        // Ajustar estado do campo de atividade
        if (sessionData.atividadeSelect === "outro") {
          elements.atividadeInput.disabled = false;
        } else if (sessionData.atividadeSelect) {
          elements.atividadeInput.disabled = true;
        }
      } catch (e) {
        console.error("Erro ao carregar sessão:", e);
      }
    }
  }

  function clearSession() {
    if (confirm("Deseja realmente limpar todos os dados salvos?")) {
      localStorage.removeItem("proativasSession");
      elements.equipeInput.value = "";
      elements.localSelect.value = "";
      elements.localPersonalizadoInput.value = "";
      elements.localPersonalizadoDiv.style.display = "none";
      elements.enderecoInput.value = "";
      elements.atividadeSelect.value = "";
      elements.atividadeInput.value = "";
      elements.atividadeInput.disabled = true;
      elements.preview.src = "";
      elements.previewSection.classList.add("d-none");
      currentFile = null;
      updateReportPreview();
    }
  }

  // =============================================
  // EVENT LISTENERS
  // =============================================
  function setupEventListeners() {
    elements.equipeInput.addEventListener("input", () => {
      saveSession();
      updateReportPreview();
    });

    elements.localSelect.addEventListener("change", handleLocalChange);

    elements.localPersonalizadoInput.addEventListener("input", () => {
      saveSession();
      updateReportPreview();
    });

    elements.enderecoInput.addEventListener("input", () => {
      saveSession();
      updateReportPreview();
    });

    elements.atividadeSelect.addEventListener("change", handleAtividadeChange);

    elements.atividadeInput.addEventListener("input", () => {
      saveSession();
      updateReportPreview();
    });

    elements.cameraBtn.addEventListener("click", () =>
      openFileSelector("environment")
    );
    elements.galleryBtn.addEventListener("click", () => openFileSelector());
    elements.fileInput.addEventListener("change", handleFileSelect);
    elements.copyBtn.addEventListener("click", copyReport);
    elements.whatsappBtn.addEventListener("click", shareToWhatsApp);
    elements.clearSessionBtn.addEventListener("click", clearSession);
  }

  // =============================================
  // FUNÇÕES PRINCIPAIS E LÓGICA
  // =============================================

  function handleLocalChange() {
    const selectedValue = elements.localSelect.value;
    if (selectedValue === "outro") {
      elements.localPersonalizadoDiv.style.display = "block";
      elements.localPersonalizadoInput.focus();
    } else {
      elements.localPersonalizadoDiv.style.display = "none";
      elements.localPersonalizadoInput.value = "";
    }
    saveSession();
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
      elements.atividadeInput.placeholder =
        "Selecione uma atividade ou digite aqui";
    }
    saveSession();
    updateReportPreview();
  }

  function getEquipeText() {
    const equipeValue = elements.equipeInput.value.trim();
    if (!equipeValue) return "";

    // Dividir por vírgula e limpar espaços
    const membros = equipeValue
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m);

    if (membros.length === 0) return "";
    if (membros.length === 1) return membros[0];

    // Juntar com " e " entre os membros
    return membros.join(" e ");
  }

  function getLocalText() {
    if (elements.localSelect.value === "outro") {
      return elements.localPersonalizadoInput.value.trim();
    }
    return elements.localSelect.value;
  }

  function generateReportText() {
    const equipe = getEquipeText();
    const local = getLocalText();
    const endereco = elements.enderecoInput.value.trim();
    const atividade = elements.atividadeInput.value.trim();

    if (!equipe || !endereco || !atividade) {
      return "";
    }

    if (atividade === "PE/PTR") {
      return `🚨🚔🚨🚔🚨🚔🚨🚔
*${atividade}:* ${local || "N/A"}
*Equipe*: ${equipe}
*Endereço:* ${endereco}

Foi realizado ${atividade} no local e nas imediações.`;
    } else {
      return `🚨🚔🚨🚔🚨🚔🚨🚔
*${atividade}:* ${local || "N/A"}
*Equipe*: ${equipe}
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
    const equipe = getEquipeText();
    const endereco = elements.enderecoInput.value.trim();
    const atividade = elements.atividadeInput.value.trim();
    const isFormValid = equipe !== "" && endereco !== "" && atividade !== "";

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
        elements.copyBtn.innerHTML =
          '<i class="bi bi-clipboard-check me-2"></i>Copiar Relatório';
      }, 2000);
    } catch (err) {
      console.error("Falha ao copiar:", err);
      alert("Erro ao copiar o texto.");
    }
  }

  async function shareToWhatsApp() {
    const text = elements.reportPreview.value;
    if (!text || !currentFile) {
      alert(
        "É necessário preencher a equipe, o local, a atividade e anexar uma foto para compartilhar."
      );
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
        alert(
          "Seu navegador não suporta o compartilhamento de arquivos. O texto foi copiado. Anexe a imagem manualmente no WhatsApp."
        );
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Erro ao compartilhar:", error);
        alert(
          "Falha ao compartilhar. O texto foi copiado para a área de transferência."
        );
      }
    }
  }

  // Inicia a aplicação
  init();
});
