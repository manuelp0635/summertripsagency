/* =========================
   CONSTANTES GLOBALES
   ========================= */
const WHATSAPP_NUMBER = "+573113212221";

/* Possible element IDs used in different HTML variants:
   - exam-list (used by earlier app code)
   - examenes (used by grid/list code)
   Chat elements:
   - chatbox, chat-toggle, chat-close, input, chat-messages, send
   We'll attempt to bind to whichever exist.
*/

/* =========================
   HELPERS / UTILIDADES
   ========================= */
function formatCurrency(num) {
  if (num === undefined || num === null) return "-";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(num);
}
function truncate(text, len = 120) {
  if (!text) return "";
  return text.length > len ? text.slice(0, len).trim() + "…" : text;
}
function escapeHtml(s) {
  if (s === undefined || s === null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* =========================
   DOM ELEMENT REFERENCES (robust selectors)
   ========================= */
const el = {
  // exam containers (support both 'exam-list' and 'examenes')
  examList: document.getElementById("exam-list") || document.getElementById("examenes") || null,
  // category list (ul)
  categoryList: document.getElementById("category-list") || null,
  // search input
  searchInput: document.getElementById("search-input") || null,
  // compare footer + buttons + modal
  bottomCompareInfo: document.getElementById("bottom-compare-info") || null,
  compareBtn: document.getElementById("compare-btn") || null,
  footerRequestBtn: document.getElementById("modal-request") || null,
  compareModal: document.getElementById("compare-modal") || null,
  compareModalBody: document.getElementById("modal-body") || null,
  // detail modal
  detailModal: document.getElementById("detail-modal") || null,
  detailImg: document.getElementById("detail-img") || null,
  detailBody: document.getElementById("detail-body") || null,
  detailWhatsappBtn: document.getElementById("detail-whatsapp") || null,
  // grid/list toggle
  vistaGridBtn: document.getElementById("vista-grid") || null,
  vistaListBtn: document.getElementById("vista-list") || null,
  examenesContainer: document.getElementById("examenes") || document.getElementById("exam-list") || null,
  // chat elements (multiple html versions supported)
  chatBox: document.getElementById("chatbox") || null,
  chatToggle: document.getElementById("chat-toggle") || null,
  chatClose: document.getElementById("chat-close") || null,
  chatInput: document.getElementById("input") || document.getElementById("chat-input") || null,
  chatMessages: document.getElementById("chat-messages") || null,
  chatSend: document.getElementById("send") || null
};

/* =========================
   STATE
   ========================= */
const state = {
  currentView: "grid", // 'grid' or 'list'
  compareSet: new Set()
};

/* =========================
   INICIALIZACIÓN AL CARGAR DOM
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  // initial render: use examList (if exists) or examenesContainer
  renderExams(examData);

  // category counters if categoryList exists
  if (el.categoryList) updateCategoryCounters(examData);

  // setup interactions
  setupCategoryClicks();
  setupSearch();
  setupDetailModalLogic();
  setupCompareLogic();
  setupGridListToggle();
  setupChatIntegration(); // Taboplus chat (auto open, history, sound)
});

/* =========================
   RENDERIZADO UNIVERSAL DE EXÁMENES
   - this function writes into el.examList (or el.examenesContainer)
   - it respects current view: grid / list (class on container)
   ========================= */
function renderExams(data) {
  const container = el.examenesContainer;
  if (!container) return;

  // ensure correct class exists for layout
  if (state.currentView === "grid") {
    container.classList.remove("lista");
    container.classList.add("cuadricula");
  } else {
    container.classList.remove("cuadricula");
    container.classList.add("lista");
  }

  container.innerHTML = ""; // clear

  if (!data || data.length === 0) {
    const p = document.createElement("p");
    p.textContent = "No se encontraron exámenes.";
    container.appendChild(p);
    return;
  }

  // create cards (structure works for both grid and list styles)
  data.forEach(exam => {
    const card = document.createElement("div");
    card.className = "examen-card exam-item";
    card.dataset.id = exam.id;

    // fallback image
    const imgSrc = exam.img || "https://via.placeholder.com/300x180?text=Examen";

    // inner HTML for card
    card.innerHTML = `
      <div class="card-media">
        <img src="${imgSrc}" alt="${escapeHtml(exam.name)}" class="card-img" />
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(exam.name)}</h3>
        <p class="card-desc">${escapeHtml(truncate(exam.desc, 160))}</p>
        <div class="card-meta">
          <small><b>Preparación:</b> ${escapeHtml(exam.prep || "No requiere")}</small><br/>
          <small><b>Entrega:</b> ${escapeHtml(exam.time)}</small> · <small><b>Precio:</b> ${formatCurrency(exam.price)}</small>
        </div>
        <div class="card-actions">
          <button class="btn btn-detail" data-id="${exam.id}">Detalle</button>
          <button class="btn btn-compare" data-id="${exam.id}">Comparar</button>
          <button class="btn btn-ws" data-id="${exam.id}">Solicitar</button>
        </div>
      </div>
    `;

    // append to container
    container.appendChild(card);
  });

  // attach event listeners on generated buttons
  container.querySelectorAll(".btn-detail").forEach(b => b.addEventListener("click", e => {
    const id = Number(e.currentTarget.dataset.id);
    openDetailModal(id);
  }));
  container.querySelectorAll(".btn-compare").forEach(b => b.addEventListener("click", e => {
    const id = Number(e.currentTarget.dataset.id);
    toggleCompare(id);
  }));
  container.querySelectorAll(".btn-ws").forEach(b => b.addEventListener("click", e => {
    const id = Number(e.currentTarget.dataset.id);
    openWhatsAppForExam(id);
  }));
}

/* =========================
   CONTADORES POR CATEGORÍA
   - updateCategoryCounters: writes counts into <li><span> inside categoryList
   ========================= */
function updateCategoryCounters(data) {
  if (!el.categoryList) return;
  const lis = el.categoryList.querySelectorAll("li");
  lis.forEach(li => {
    const cat = li.dataset.category || "all";
    const count = (cat === "all") ? data.length : data.filter(x => x.category === cat).length;
    // ensure there is a span (assumes <li>Title <span></span></li>)
    let span = li.querySelector("span");
    if (!span) {
      span = document.createElement("span");
      li.appendChild(span);
    }
    span.textContent = ` (${count})`;
  });
}

/* =========================
   FILTROS POR CATEGORÍA (clic)
   - if no categoryList in DOM, this does nothing
   ========================= */
function setupCategoryClicks() {
  if (!el.categoryList) return;
  const lis = el.categoryList.querySelectorAll("li");
  lis.forEach(li => {
    li.addEventListener("click", () => {
      // toggle active
      lis.forEach(x => x.classList.remove("active"));
      li.classList.add("active");

      const cat = li.dataset.category || "all";
      if (cat === "all") {
        renderExams(examData);
        updateCategoryCounters(examData);
      } else {
        const filtered = examData.filter(e => e.category === cat);
        renderExams(filtered);
        updateCategoryCounters(filtered);
      }
    });
  });
}

/* =========================
   BUSCADOR (input listening)
   - if no searchInput in DOM, this does nothing
   ========================= */
function setupSearch() {
  const input = el.searchInput;
  if (!input) return;

  let timer = null;
  input.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    clearTimeout(timer);
    timer = setTimeout(() => {
      const filtered = examData.filter(ex =>
        ex.name.toLowerCase().includes(q) ||
        ex.desc.toLowerCase().includes(q) ||
        (ex.category || "").toLowerCase().includes(q)
      );
      renderExams(filtered);
      updateCategoryCounters(filtered);
    }, 180);
  });
}

/* =========================
   GRID / LIST TOGGLE
   - supports buttons with ids: vista-grid, vista-list
   - if buttons missing, tries to react to chat commands that requested change
   ========================= */
function setupGridListToggle() {
  const btnGrid = el.vistaGridBtn;
  const btnList = el.vistaListBtn;
  const container = el.examenesContainer;
  if (!container) return;

  // init classes
  if (state.currentView === "grid") {
    container.classList.add("cuadricula");
    container.classList.remove("lista");
  } else {
    container.classList.add("lista");
    container.classList.remove("cuadricula");
  }

  function setView(view) {
    state.currentView = view;
    if (view === "grid") {
      container.classList.remove("lista");
      container.classList.add("cuadricula");
    } else {
      container.classList.remove("cuadricula");
      container.classList.add("lista");
    }
    // update active class on buttons
    if (btnGrid) btnGrid.classList.toggle("active", view === "grid");
    if (btnList) btnList.classList.toggle("active", view === "list");
  }

  // bind ui buttons if they exist
  if (btnGrid) btnGrid.addEventListener("click", () => setView("grid"));
  if (btnList) btnList.addEventListener("click", () => setView("list"));
}

/* =========================
   MODAL DETALLE
   ========================= */
function setupDetailModalLogic() {
  const modal = el.detailModal;
  if (!modal) return;
  const closeBtn = document.getElementById("close-detail") || document.getElementById("detail-close") || null;

  if (closeBtn) closeBtn.addEventListener("click", () => modal.style.display = "none");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // detail whatsapp button handled in openDetailModal (uses el.detailWhatsappBtn if present)
}

function openDetailModal(id) {
  const modal = el.detailModal;
  if (!modal) {
    // fallback: show alert
    const ex = examData.find(x => x.id === id);
    alert(`${ex.name}\n\n${ex.desc}\n\nPreparación: ${ex.prep}\nEntrega: ${ex.time}\nPrecio: ${formatCurrency(ex.price)}`);
    return;
  }

  const ex = examData.find(x => x.id === id);
  if (!ex) return;

  if (el.detailImg) el.detailImg.src = ex.img || "https://via.placeholder.com/150";
  if (el.detailBody) {
    el.detailBody.innerHTML = `
      <h2>${escapeHtml(ex.name)}</h2>
      <p>${escapeHtml(ex.desc)}</p>
      <p><b>Preparación:</b> ${escapeHtml(ex.prep)}</p>
      <p><b>Entrega:</b> ${escapeHtml(ex.time)}</p>
      <p><b>Precio:</b> ${formatCurrency(ex.price)}</p>
      <div style="margin-top:10px;">
        <button class="btn" id="detail-ws-btn">Solicitar por WhatsApp</button>
      </div>
    `;
    // attach whatsapp handler
    const bw = document.getElementById("detail-ws-btn");
    if (bw) bw.addEventListener("click", () => openWhatsAppForExam(id));
  }

  modal.dataset.currentId = id;
  modal.style.display = "block";
}

/* =========================
   WHATSAPP helpers
   ========================= */
function openWhatsAppForExam(idOrExam) {
  // accept either id or exam object
  const ex = typeof idOrExam === "number" ? examData.find(e => e.id === idOrExam) : idOrExam;
  if (!ex) return;
  const txt = encodeURIComponent(
    `Hola, deseo información del examen "${ex.name}".\n\nDescripción: ${ex.desc}\nPreparación: ${ex.prep}\nTiempo: ${ex.time}\nPrecio: ${formatCurrency(ex.price)}`
  );
  window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g,'')}?text=${txt}`, "_blank");
}

function openWhatsAppForMultiple(exams) {
  if (!exams || !exams.length) return;
  let text = "Hola, deseo información sobre los siguientes exámenes:\n";
  exams.forEach(ex => {
    text += `\n- ${ex.name} (${formatCurrency(ex.price)}) - ${ex.time}`;
  });
  window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g,'')}?text=${encodeURIComponent(text)}`, "_blank");
}

/* =========================
   COMPARADOR
   ========================= */
function setupCompareLogic() {
  // compare UI elements may be missing; guard
  if (el.compareBtn) el.compareBtn.addEventListener("click", () => {
    if (state.compareSet.size < 2) return alert("Selecciona al menos 2 exámenes para comparar.");
    showCompareModal();
  });
  if (el.footerRequestBtn) el.footerRequestBtn.addEventListener("click", () => {
    const exams = [...state.compareSet].map(id => examData.find(e => e.id === id)).filter(Boolean);
    openWhatsAppForMultiple(exams);
  });
  // update footer display initially
  updateCompareFooter();
}
function toggleCompare(id) {
  if (state.compareSet.has(id)) state.compareSet.delete(id);
  else state.compareSet.add(id);
  updateCompareFooter();
}
function updateCompareFooter() {
  if (!el.bottomCompareInfo && !el.compareBtn && !el.footerRequestBtn) return;
  const count = state.compareSet.size;
  if (el.bottomCompareInfo) el.bottomCompareInfo.textContent = count ? `${count} en comparación` : "";
  if (el.compareBtn) el.compareBtn.disabled = count < 2;
  if (el.footerRequestBtn) el.footerRequestBtn.textContent = count ? `Solicitar ${count} examen(es)` : "";
}
function showCompareModal() {
  if (!el.compareModal || !el.compareModalBody) {
    // fallback: open a simple window
    const exams = [...state.compareSet].map(id => examData.find(e => e.id === id));
    let text = "Comparación:\n\n";
    exams.forEach(ex => {
      text += `${ex.name}\n  Preparación: ${ex.prep}\n  Tiempo: ${ex.time}\n  Precio: ${formatCurrency(ex.price)}\n\n`;
    });
    alert(text);
    return;
  }

  const exams = [...state.compareSet].map(id => examData.find(e => e.id === id));
  el.compareModalBody.innerHTML = `
    <div class="compare-grid">
      ${exams.map(ex => `
        <div class="compare-card">
          <h4>${escapeHtml(ex.name)}</h4>
          <p>${escapeHtml(ex.desc)}</p>
          <p><b>Preparación:</b> ${escapeHtml(ex.prep)}</p>
          <p><b>Tiempo:</b> ${escapeHtml(ex.time)}</p>
          <p><b>Precio:</b> ${formatCurrency(ex.price)}</p>
        </div>
      `).join("")}
    </div>
  `;
  el.compareModal.style.display = "block";

  // attach modal close (if modal has close button with id modal-close or close-modal)
  const modalClose = document.getElementById("modal-close") || document.getElementById("close-modal");
  if (modalClose) modalClose.addEventListener("click", () => el.compareModal.style.display = "none");
}

/* =========================
   CHAT TABOPLUS — INTEGRACIÓN COMPLETA
   - Supports older provided script features:
     * auto open on load after delay
     * save history in localStorage (chatHistorial)
     * sound notification for bot messages
     * enviar()/agregarMensaje() etc.
   ========================= */

/* sound for bot messages */
const taboSound = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_f54f6c3b7b.mp3?filename=notification-3-125447.mp3");

/* Helper to add message to chat UI and optionally save */
function agregarMensaje(texto, tipo = "bot", guardar = true) {
  if (!el.chatMessages) return;
  const msg = document.createElement("div");
  msg.className = `msg ${tipo}`;
  // allow HTML in bot responses (for links)
  msg.innerHTML = texto;
  el.chatMessages.appendChild(msg);
  el.chatMessages.scrollTop = el.chatMessages.scrollHeight;

  if (tipo === "bot") {
    // play sound
    try { taboSound.play(); } catch (e) { /* ignore autoplay errors */ }
  }

  if (guardar) guardarMensaje(texto, tipo);
}

/* Save chat history item (simple array of {texto,tipo}) */
function guardarMensaje(texto, tipo) {
  try {
    const historial = JSON.parse(localStorage.getItem("chatHistorial")) || [];
    historial.push({ texto, tipo });
    localStorage.setItem("chatHistorial", JSON.stringify(historial));
  } catch (e) {
    console.warn("No se pudo guardar historial:", e);
  }
}

/* restore history on load (called by initChat) */
function restaurarHistorial() {
  if (!el.chatMessages) return;
  try {
    const historial = JSON.parse(localStorage.getItem("chatHistorial")) || [];
    historial.forEach(msg => {
      const item = document.createElement("div");
      item.className = `msg ${msg.tipo}`;
      item.innerHTML = msg.texto;
      el.chatMessages.appendChild(item);
    });
    el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
  } catch (e) {
    console.warn("Error restaurando historial", e);
  }
}

/* remove history */
function reiniciarConversacion() {
  localStorage.removeItem("chatHistorial");
  localStorage.removeItem("chatIniciado");
  if (el.chatMessages) el.chatMessages.innerHTML = "";
  iniciarChat(true);
}

/* Start chat with welcome message once */
function iniciarChat(force = false) {
  if (!el.chatMessages || !el.chatBox) return;
  if (!force && localStorage.getItem("chatIniciado")) return;
  const welcome = 
    "👋 ¡Hola! Soy <b>Taboplus</b>, tu asesor virtual. ¿Qué deseas hacer?<br/><br/>" +
    "1️⃣ Consultar horarios<br/>" +
    "2️⃣ Agendar cita<br/>" +
    "3️⃣ Requisitos de exámenes<br/>" +
    "4️⃣ Resultados<br/>" +
    "5️⃣ Hablar con un agente";
  agregarMensaje(welcome, "bot");
  localStorage.setItem("chatIniciado", "1");
}

/* The main response handler (improved/responsive) */
function respuestaAutomatica(texto) {
  // basic normalization
  const t = (texto || "").toLowerCase();

  // shortcuts (numbers 1-5)
  if (t === "1" || t.includes("horario") || t.includes("hora")) {
    return "🕒 Nuestro horario de atención es:<br/>Lun-Vie: 7:00 a.m. - 4:00 p.m.<br/>Sábados: 7:00 a.m. - 12:00 p.m.<br/>Domingos y festivos con cita previa.";
  }
  if (t === "2" || t.includes("agendar") || t.includes("cita")) {
    return "📅 Puedes agendar tu cita escribiéndonos por WhatsApp al <a href='https://api.whatsapp.com/send?phone=573113212221' target='_blank'>+57 311 321 2221</a> o a través de nuestra página web.";
  }
  if (t === "3" || t.includes("requisito") || t.includes("preparaci") || t.includes("preparación")) {
    return "📋 Cada examen tiene requisitos específicos. Por ejemplo, para exámenes de sangre se recomienda ayuno de 8 horas. ¿Deseas conocer los requisitos de un examen específico?";
  }
  if (t === "4" || t.includes("resultado")) {
    return "📑 Puedes consultar tus resultados en línea o solicitarlos por WhatsApp. Generalmente están disponibles entre 24 y 48 horas después del examen.";
  }
  if (t === "5" || t.includes("agente") || t.includes("humano")) {
    return "👩‍💼 Un agente humano te atenderá en breve. También puedes contactarnos por WhatsApp aquí: <a href='https://api.whatsapp.com/send?phone=573113212221' target='_blank'>Contactar</a>.";
  }
  if (t.includes("reiniciar") || t.includes("nuevo chat")) {
    reiniciarConversacion();
    return null; // reiniciarConversacion already displays welcome
  }

  // grid/list commands
  if (t.includes("cuadr") || t.includes("grid")) {
    // switch view to grid
    if (el.vistaGridBtn) el.vistaGridBtn.classList.add("active");
    if (el.vistaListBtn) el.vistaListBtn.classList.remove("active");
    state.currentView = "grid";
    if (el.examenesContainer) {
      el.examenesContainer.classList.remove("lista");
      el.examenesContainer.classList.add("cuadricula");
    }
    return "✅ Ahora estás en vista de Cuadrícula.";
  }
  if (t.includes("lista") || t.includes("list")) {
    if (el.vistaListBtn) el.vistaListBtn.classList.add("active");
    if (el.vistaGridBtn) el.vistaGridBtn.classList.remove("active");
    state.currentView = "list";
    if (el.examenesContainer) {
      el.examenesContainer.classList.remove("cuadricula");
      el.examenesContainer.classList.add("lista");
    }
    return "✅ Ahora estás en vista de Lista.";
  }

  // attempt to detect exam name and reply specific info
  for (const ex of examData) {
    // check if message includes significant word of exam name
    const nameLower = ex.name.toLowerCase();
    const nameWords = nameLower.split(/\s+/).filter(w => w.length > 3); // longer words
    if (nameWords.some(w => t.includes(w)) || t.includes(nameLower)) {
      // return a specific, humanized response
      return `Con gusto te explico sobre <b>${escapeHtml(ex.name)}</b>.<br/><br/>` +
             `${escapeHtml(ex.desc)}<br/><br/>` +
             `<b>Preparación:</b> ${escapeHtml(ex.prep || "No requiere")}<br/>` +
             `<b>Tiempo:</b> ${escapeHtml(ex.time)} — <b>Precio aproximado:</b> ${formatCurrency(ex.price)}<br/><br/>` +
             `¿Quieres que te lo solicite por WhatsApp?`;
    }
  }

  // fallback
  return "🤖 Disculpa, no entendí del todo. Puedes escribir: 1 (horarios), 2 (agendar), 3 (requisitos), 4 (resultados), 5 (agente), o pedir que muestre la vista 'lista' o 'cuadrícula'.";
}

/* Set up chat event bindings and auto-open/historic restore */
function setupChatIntegration() {
  // if no chatBox present, do nothing
  if (!el.chatBox) return;

  // restore history
  restaurarHistorial();

  // auto-open on load with small delay (if not open)
  window.addEventListener("load", () => {
    setTimeout(() => {
      // show chat
      try { el.chatBox.style.display = "flex"; } catch (e) {}
      iniciarChat();
    }, 600);
  });

  // bind close toggle if available
  if (el.chatClose) el.chatClose.addEventListener("click", () => { el.chatBox.style.display = "none"; });

  // bind toggle button if available
  if (el.chatToggle) el.chatToggle.addEventListener("click", () => {
    if (el.chatBox.style.display === "flex") el.chatBox.style.display = "none";
    else {
      el.chatBox.style.display = "flex";
      iniciarChat();
    }
  });

  // send on Enter key for input if present
  if (el.chatInput) {
    el.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") enviarChat();
    });
  }

  // bind explicit send button if exists (id 'send')
  if (el.chatSend) el.chatSend.addEventListener("click", enviarChat);
}

/* Unified send function for chat UI (compatible with older 'enviar' naming) */
function enviarChat() {
  if (!el.chatInput || !el.chatMessages) return;
  const texto = el.chatInput.value.trim();
  if (!texto) return;

  // display user message and save
  agregarMensaje(escapeHtml(texto), "user", true);

  // clear input
  el.chatInput.value = "";

  // compute bot reply
  setTimeout(() => {
    const reply = respuestaAutomatica(texto.toLowerCase());
    if (reply !== null && reply !== undefined) agregarMensaje(reply, "bot", true);
  }, 650);
}

/* Also expose a global enviar() for HTML that uses onclick="enviar()" */
function enviar() { enviarChat(); }

/* =========================
   EXPOSICIÓN GLOBAL
   ========================= */
window.App = window.App || {};
window.App.examData = examData;
window.App.renderExams = renderExams;
window.App.openDetailModal = openDetailModal;
window.App.openWhatsAppForExam = openWhatsAppForExam;
window.App.toggleCompare = toggleCompare;
window.App.reiniciarConversacion = reiniciarConversacion;

/* =========================
   FIN DEL ARCHIVO
   ========================= */
