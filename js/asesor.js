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
