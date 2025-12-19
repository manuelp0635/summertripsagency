const tourData = [
  {
    id: 1,
    name: "Tour 5 Islas",
    desc: "Recorrido en lancha deportiva por islas paradisíacas, aguas cristalinas y ambiente caribeño.",
    prep: "Traje de baño, bloqueador solar",
    time: "8 horas",
    includes: "Lancha deportiva, guía, almuerzo",
    price: 350000,
    img: "https://via.placeholder.com/300x180?text=Tour+5+Islas"
  },
  {
    id: 2,
    name: "Playa Blanca",
    desc: "Día de descanso en playa de arena blanca y mar turquesa.",
    prep: "Ropa cómoda y bloqueador",
    time: "6 horas",
    includes: "Transporte, almuerzo",
    price: 180000,
    img: "https://via.placeholder.com/300x180?text=Playa+Blanca"
  },
  {
    id: 3,
    name: "City Tour Cartagena",
    desc: "Recorrido cultural por la ciudad amurallada y sitios históricos.",
    prep: "Calzado cómodo",
    time: "4 horas",
    includes: "Guía profesional, transporte",
    price: 120000,
    img: "https://via.placeholder.com/300x180?text=City+Tour"
  }
];

/* =========================
   CONSTANTES GLOBALES
   ========================= */
const WHATSAPP_NUMBER = "+57 312 8462567";

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
  renderExams(tourData);

  // category counters if categoryList exists
  if (el.categoryList) updateCategoryCounters(tourData);

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

  // ensure correct class exists for layout (NO SE TOCA)
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
    p.textContent = "No se encontraron tours disponibles.";
    container.appendChild(p);
    return;
  }

  // create cards (MISMA estructura para grid y lista)
  data.forEach(exam => {
    const card = document.createElement("div");
    card.className = "examen-card exam-item"; // CLASES INTACTAS
    card.dataset.id = exam.id;

    // fallback image
    const imgSrc = exam.img || "https://via.placeholder.com/300x180?text=Tour";

    // inner HTML for card (SOLO TEXTO ACTUALIZADO)
    card.innerHTML = `
      <div class="card-media">
        <img src="${imgSrc}" alt="${escapeHtml(exam.name)}" class="card-img" />
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(exam.name)}</h3>
        <p class="card-desc">${escapeHtml(truncate(exam.desc, 160))}</p>
        <div class="card-meta">
          <small><b>Qué llevar:</b> ${escapeHtml(exam.prep || "Ropa cómoda y bloqueador solar")}</small><br/>
          <small><b>Duración:</b> ${escapeHtml(exam.time)}</small> · 
          <small><b>Precio:</b> ${formatCurrency(exam.price)}</small>
        </div>
        <div class="card-actions">
          <button class="btn btn-detail" data-id="${exam.id}">Detalle</button>
          <button class="btn btn-compare" data-id="${exam.id}">Comparar</button>
          <button class="btn btn-ws" data-id="${exam.id}">Reservar</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  // attach event listeners (NO SE TOCAN)
  container.querySelectorAll(".btn-detail").forEach(b =>
    b.addEventListener("click", e => {
      const id = Number(e.currentTarget.dataset.id);
      openDetailModal(id);
    })
  );

  container.querySelectorAll(".btn-compare").forEach(b =>
    b.addEventListener("click", e => {
      const id = Number(e.currentTarget.dataset.id);
      toggleCompare(id);
    })
  );

  container.querySelectorAll(".btn-ws").forEach(b =>
    b.addEventListener("click", e => {
      const id = Number(e.currentTarget.dataset.id);
      openWhatsAppForExam(id);
    })
  );
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
      // activar categoría seleccionada
      lis.forEach(x => x.classList.remove("active"));
      li.classList.add("active");

      const cat = li.dataset.category || "all";

      // mostrar todos los tours
      if (cat === "all") {
        renderExams(tourData);
        updateCategoryCounters(tourData);
      } 
      // filtrar por tipo de tour (islas, playas, city tour, etc.)
      else {
        const filtered = tourData.filter(tour => tour.category === cat);
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
      const filtered = tourData.filter(ex =>
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
    const tour = tourData.find(x => x.id === id);
    alert(
      `${tour.name}\n\n${tour.desc}\n\n` +
      `Qué llevar: ${tour.prep || "Ropa cómoda y bloqueador solar"}\n` +
      `Duración: ${tour.time}\n` +
      `Precio: ${formatCurrency(tour.price)}`
    );
    return;
  }

  const tour = tourData.find(x => x.id === id);
  if (!tour) return;

  if (el.detailImg) {
    el.detailImg.src = tour.img || "https://via.placeholder.com/150";
  }

  if (el.detailBody) {
    el.detailBody.innerHTML = `
      <h2>${escapeHtml(tour.name)}</h2>
      <p>${escapeHtml(tour.desc)}</p>
      <p><b>Qué llevar:</b> ${escapeHtml(tour.prep || "Ropa cómoda y bloqueador solar")}</p>
      <p><b>Duración:</b> ${escapeHtml(tour.time)}</p>
      <p><b>Precio:</b> ${formatCurrency(tour.price)}</p>
      <div style="margin-top:10px;">
        <button class="btn" id="detail-ws-btn">Reservar por WhatsApp</button>
      </div>
    `;

    // attach whatsapp handler
    const bw = document.getElementById("detail-ws-btn");
    if (bw) {
      bw.addEventListener("click", () => openWhatsAppForExam(id));
    }
  }

  modal.dataset.currentId = id;
  modal.style.display = "block";
}

/* =========================
   WHATSAPP helpers
   ========================= */
function openWhatsAppForExam(idOrExam) {
  const tour = typeof idOrExam === "number"
    ? tourData.find(e => e.id === idOrExam)
    : idOrExam;

  if (!tour) return;

  const txt = encodeURIComponent(
    `🌴 Hola SummerTripsAgency, estoy interesado en el tour "${tour.name}".\n\n` +
    `📍 Descripción: ${tour.desc}\n` +
    `⏰ Duración: ${tour.time}\n` +
    `🎒 Qué llevar: ${tour.prep || "Ropa cómoda y bloqueador solar"}\n` +
    `💰 Precio: ${formatCurrency(tour.price)}\n\n` +
    `¿Podrían confirmarme disponibilidad y forma de pago?`
  );

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${txt}`,
    "_blank"
  );
}

/* =========================
   COMPARADOR
   ========================= */
function setupCompareLogic() {
  // compare UI elements may be missing; guard
  if (el.compareBtn) el.compareBtn.addEventListener("click", () => {
    if (state.compareSet.size < 2) {
      return alert("Selecciona al menos 2 tours para comparar.");
    }
    showCompareModal();
  });

  if (el.footerRequestBtn) el.footerRequestBtn.addEventListener("click", () => {
    const tours = [...state.compareSet]
      .map(id => tourData.find(e => e.id === id))
      .filter(Boolean);

    openWhatsAppForMultiple(tours);
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

  if (el.bottomCompareInfo) {
    el.bottomCompareInfo.textContent = count ? `${count} tour(es) en comparación` : "";
  }

  if (el.compareBtn) {
    el.compareBtn.disabled = count < 2;
  }

  if (el.footerRequestBtn) {
    el.footerRequestBtn.textContent = count
      ? `Reservar ${count} tour(es)`
      : "";
  }
}

function showCompareModal() {
  if (!el.compareModal || !el.compareModalBody) {
    // fallback: open a simple window
    const tours = [...state.compareSet].map(id => tourData.find(e => e.id === id));

    let text = "Comparación de tours:\n\n";
    tours.forEach(ex => {
      text += `${ex.name}\n` +
              `  Qué llevar: ${ex.prep}\n` +
              `  Duración: ${ex.time}\n` +
              `  Precio: ${formatCurrency(ex.price)}\n\n`;
    });

    alert(text);
    return;
  }

  const tours = [...state.compareSet].map(id => tourData.find(e => e.id === id));

  el.compareModalBody.innerHTML = `
    <div class="compare-grid">
      ${tours.map(ex => `
        <div class="compare-card">
          <h4>${escapeHtml(ex.name)}</h4>
          <p>${escapeHtml(ex.desc)}</p>
          <p><b>Qué llevar:</b> ${escapeHtml(ex.prep)}</p>
          <p><b>Duración:</b> ${escapeHtml(ex.time)}</p>
          <p><b>Precio:</b> ${formatCurrency(ex.price)}</p>
        </div>
      `).join("")}
    </div>
  `;

  el.compareModal.style.display = "block";

  // attach modal close
  const modalClose =
    document.getElementById("modal-close") ||
    document.getElementById("close-modal");

  if (modalClose) {
    modalClose.addEventListener("click", () => {
      el.compareModal.style.display = "none";
    });
  }
}

/* =========================
   CHAT TABOPLUS — INTEGRACIÓN COMPLETA
   - Supports older provided script features:
     * auto open on load after delay
     * save history in localStorage (chatHistorial)
     * sound notification for bot messages
     * enviar()/agregarMensaje() etc.
   ========================= */

const taboSound = new Audio(
  "https://cdn.pixabay.com/download/audio/2022/03/15/audio_f54f6c3b7b.mp3?filename=notification-3-125447.mp3"
);

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
    try {
      taboSound.play();
    } catch (e) {
      /* ignore autoplay errors */
    }
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

/* remove history and restart chat */
function reiniciarConversacion() {
  localStorage.removeItem("chatHistorial");
  localStorage.removeItem("chatIniciado");

  if (el.chatMessages) el.chatMessages.innerHTML = "";

  iniciarChat(true);
}

/* =========================
   WHATSAPP DINÁMICO POR TOUR
   ========================= */
function abrirWhatsAppTour(nombreTour) {
  const phone = "573128462567";
  const mensaje = encodeURIComponent(
    `🌴 Hola SummerTripsAgency, estoy interesado en el tour "${nombreTour}". ` +
    `Me gustaría recibir más información y realizar la reserva.`
  );
  window.open(
    `https://api.whatsapp.com/send?phone=${phone}&text=${mensaje}`,
    "_blank"
  );
}

/* The main response handler (improved/responsive) */
function respuestaAutomatica(texto) {
  // basic normalization
  const t = (texto || "").toLowerCase();

  // shortcuts (numbers 1-5)
  if (t === "1" || t.includes("horario") || t.includes("hora")) {
    return "🕒 Nuestro horario de atención es:<br/>" +
           "Lun-Vie: 8:00 a.m. - 6:00 p.m.<br/>" +
           "Sábados: 8:00 a.m. - 2:00 p.m.<br/>" +
           "Domingos y festivos solo por WhatsApp.";
  }

  if (t === "2" || t.includes("reserv") || t.includes("agendar")) {
    return "📅 Puedes reservar tu tour fácilmente escribiéndonos por WhatsApp al " +
           "<a href='https://api.whatsapp.com/send?phone=573128462567' target='_blank'>+57 312 8462567</a>. " +
           "Un asesor te ayudará a elegir el mejor plan.";
  }

  if (t === "3" || t.includes("incluye") || t.includes("llevar") || t.includes("requisito")) {
    return "🎒 Cada tour incluye servicios específicos como transporte, guía y alimentación. " +
           "Normalmente recomendamos llevar traje de baño, bloqueador solar y ropa cómoda. " +
           "¿Deseas información de un tour en particular?";
  }

  if (t === "4" || t.includes("información") || t.includes("detalle")) {
    return "ℹ️ Te brindamos toda la información del tour antes de reservar: duración, horario, " +
           "punto de encuentro e incluye. Escríbenos el nombre del tour que te interesa.";
  }

  if (t === "5" || t.includes("asesor") || t.includes("humano")) {
    return "👩‍💼 Un asesor de SummerTripsAgency te atenderá en breve. " +
           "También puedes escribirnos directamente por WhatsApp aquí: " +
           "<a href='https://api.whatsapp.com/send?phone=573128462567' target='_blank'>Contactar</a>.";
  }

  if (t.includes("reiniciar") || t.includes("nuevo chat")) {
    reiniciarConversacion();
    return null;
  }

  // grid/list commands (NO SE TOCAN)
  if (t.includes("cuadr") || t.includes("grid")) {
    if (el.vistaGridBtn) el.vistaGridBtn.classList.add("active");
    if (el.vistaListBtn) el.vistaListBtn.classList.remove("active");
    state.currentView = "grid";
    if (el.examenesContainer) {
      el.examenesContainer.classList.remove("lista");
      el.examenesContainer.classList.add("cuadricula");
    }
    return "✅ Ahora estás viendo los tours en formato Cuadrícula.";
  }

  if (t.includes("lista") || t.includes("list")) {
    if (el.vistaListBtn) el.vistaListBtn.classList.add("active");
    if (el.vistaGridBtn) el.vistaGridBtn.classList.remove("active");
    state.currentView = "list";
    if (el.examenesContainer) {
      el.examenesContainer.classList.remove("cuadricula");
      el.examenesContainer.classList.add("lista");
    }
    return "✅ Ahora estás viendo los tours en formato Lista.";
  }

  // detectar nombre del tour
  for (const ex of tourData) {
    const nameLower = ex.name.toLowerCase();
    const nameWords = nameLower.split(/\s+/).filter(w => w.length > 3);

    if (nameWords.some(w => t.includes(w)) || t.includes(nameLower)) {
      return `🌴 Con gusto te cuento sobre <b>${escapeHtml(ex.name)}</b>.<br/><br/>` +
             `${escapeHtml(ex.desc)}<br/><br/>` +
             `<b>Qué llevar:</b> ${escapeHtml(ex.prep || "Ropa cómoda")}<br/>` +
             `<b>Duración:</b> ${escapeHtml(ex.time)}<br/>` +
             `<b>Precio:</b> ${formatCurrency(ex.price)}<br/><br/>` +
             `¿Deseas reservar este tour por WhatsApp?`;
    }
  }

  // fallback
  return "🌴 No entendí del todo tu mensaje.<br/><br/>" +
         "Puedes escribir:<br/>" +
         "1️⃣ Horarios<br/>" +
         "2️⃣ Reservar un tour<br/>" +
         "3️⃣ Qué incluye / qué llevar<br/>" +
         "4️⃣ Información del tour<br/>" +
         "5️⃣ Hablar con un asesor<br/><br/>" +
         "O escribe el nombre del tour que te interesa.";
}

/* Set up chat event bindings and auto-open/historic restore */
function setupChatIntegration() {
  // if no chatBox present, do nothing
  if (!el.chatBox) return;

  // restore history
  restaurarHistorial();

  // auto-open on load with small delay (only once)
  window.addEventListener("load", () => {
    setTimeout(() => {
      try {
        el.chatBox.style.display = "flex";
      } catch (e) {}

      // inicia chat solo si no existe historial activo
      iniciarChat();
      
      // mejora UX: foco automático en el input
      if (el.chatInput) el.chatInput.focus();
    }, 600);
  }, { once: true });

  // bind close toggle if available
  if (el.chatClose) {
    el.chatClose.addEventListener("click", () => {
      el.chatBox.style.display = "none";
    });
  }

  // bind toggle button if available
  if (el.chatToggle) {
    el.chatToggle.addEventListener("click", () => {
      const isOpen = el.chatBox.style.display === "flex";

      if (isOpen) {
        el.chatBox.style.display = "none";
      } else {
        el.chatBox.style.display = "flex";
        iniciarChat();
        if (el.chatInput) el.chatInput.focus();
      }
    });
  }

  // send on Enter key
  if (el.chatInput) {
    el.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        enviarChat();
      }
    });
  }

  // bind explicit send button
  if (el.chatSend) {
    el.chatSend.addEventListener("click", enviarChat);
  }
}

/* Unified send function for chat UI */
function enviarChat() {
  if (!el.chatInput || !el.chatMessages) return;

  const texto = el.chatInput.value.trim();
  if (!texto) return;

  // mostrar mensaje del usuario
  agregarMensaje(escapeHtml(texto), "user", true);

  // limpiar input
  el.chatInput.value = "";

  // respuesta automática
  setTimeout(() => {
    const reply = respuestaAutomatica(texto.toLowerCase());
    if (reply !== null && reply !== undefined) {
      agregarMensaje(reply, "bot", true);
    }
  }, 650);
}

/* Compatibilidad con HTML antiguo */
function enviar() {
  enviarChat();
}

/* =========================
   EXPOSICIÓN GLOBAL
   ========================= */
window.App = window.App || {};
window.App.tourData = tourData;
window.App.renderExams = renderExams;
window.App.openDetailModal = openDetailModal;
window.App.openWhatsAppForExam = openWhatsAppForExam;
window.App.toggleCompare = toggleCompare;
window.App.reiniciarConversacion = reiniciarConversacion;

/* =========================
   FIN DEL ARCHIVO
   ========================= */
