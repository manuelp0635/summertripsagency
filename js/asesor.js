/* =========================
   IDENTIDAD DEL ASESOR VIRTUAL
========================= */
const BOT_NAME = "🌴 Summer Bot – Asesor Virtual";

/* =========================
   DATA DE TOURS
========================= */
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
   CONSTANTES
========================= */
const WHATSAPP_NUMBER = "+57 312 8462567";

/* =========================
   HELPERS
========================= */
function formatCurrency(num) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP"
  }).format(num);
}

/* =========================
   ELEMENTOS DOM
========================= */
const el = {
  examenesContainer: document.getElementById("examenes"),
  chatBox: document.getElementById("chatbox"),
  chatToggle: document.getElementById("chat-toggle"),
  chatClose: document.getElementById("chat-close"),
  chatInput: document.getElementById("chat-input"),
  chatMessages: document.getElementById("chat-messages"),
  chatSend: document.getElementById("send")
};

/* =========================
   RENDER TOURS (CATÁLOGO)
========================= */
function renderExams(data) {
  if (!el.examenesContainer) return;
  el.examenesContainer.innerHTML = "";

  data.forEach(tour => {
    const card = document.createElement("div");
    card.className = "examen-card";
    card.innerHTML = `
      <img src="${tour.img}">
      <h3>${tour.name}</h3>
      <p>${tour.desc}</p>
      <p><b>Duración:</b> ${tour.time}</p>
      <p><b>Precio:</b> ${formatCurrency(tour.price)}</p>
      <button onclick="openWhatsAppForExam(${tour.id})">Reservar</button>
    `;
    el.examenesContainer.appendChild(card);
  });
}

/* =========================
   WHATSAPP
========================= */
function openWhatsAppForExam(id) {
  const tour = tourData.find(t => t.id === id);
  if (!tour) return;

  const msg = encodeURIComponent(
    `🌴 Hola Summer Trips Agency, estoy interesado en el tour "${tour.name}".\n` +
    `Duración: ${tour.time}\nPrecio: ${formatCurrency(tour.price)}`
  );

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${msg}`,
    "_blank"
  );
}

/* =========================
   CHAT – MENSAJES
========================= */
function agregarMensaje(texto, tipo = "bot") {
  if (!el.chatMessages) return;

  const msg = document.createElement("div");
  msg.className = `msg ${tipo}`;
  msg.innerHTML = tipo === "bot"
    ? `<b>${BOT_NAME}:</b><br>${texto}`
    : texto;

  el.chatMessages.appendChild(msg);
  el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
}

/* =========================
   OPCIONES MÚLTIPLES
========================= */
function agregarOpciones(opciones = []) {
  const wrap = document.createElement("div");
  wrap.className = "msg bot options";

  opciones.forEach(op => {
    const btn = document.createElement("button");
    btn.className = "chat-option";
    btn.textContent = op.label;
    btn.onclick = op.action;
    wrap.appendChild(btn);
  });

  el.chatMessages.appendChild(wrap);
  el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
}

/* =========================
   MENÚ PRINCIPAL
========================= */
function mostrarMenuPrincipal() {
  agregarMensaje("¿Cómo puedo ayudarte hoy? ✈️🌴");

  agregarOpciones([
    {
      label: "🕒 Horarios de atención",
      action: () => {
        agregarMensaje("🕒 Lun–Vie 8am–6pm | Sáb 8am–2pm");
        mostrarMenuPrincipal();
      }
    },
    {
      label: "🏖 Ver tours disponibles",
      action: mostrarToursBot
    },
    {
      label: "📲 Reservar por WhatsApp",
      action: () =>
        window.open(
          `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`,
          "_blank"
        )
    },
    {
      label: "👩‍💼 Hablar con un asesor",
      action: () =>
        window.open(
          `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`,
          "_blank"
        )
    }
  ]);
}

/* =========================
   LISTADO DE TOURS (BOT)
========================= */
function mostrarToursBot() {
  agregarMensaje("Estos son nuestros tours disponibles 🌴");

  agregarOpciones(
    tourData.map(tour => ({
      label: `🏖 ${tour.name}`,
      action: () => mostrarDetalleTour(tour)
    }))
  );
}

/* =========================
   DETALLE DE TOUR
========================= */
function mostrarDetalleTour(tour) {
  agregarMensaje(
    `<b>${tour.name}</b><br>
     ${tour.desc}<br><br>
     ⏱ ${tour.time}<br>
     💰 ${formatCurrency(tour.price)}`
  );

  agregarOpciones([
    {
      label: "✅ Reservar este tour",
      action: () => openWhatsAppForExam(tour.id)
    },
    {
      label: "🔙 Volver a tours",
      action: mostrarToursBot
    },
    {
      label: "🏠 Menú principal",
      action: mostrarMenuPrincipal
    }
  ]);
}

/* =========================
   INICIAR CHAT
========================= */
function iniciarChat() {
  if (el.chatMessages.children.length > 0) return;

  agregarMensaje(
    `¡Hola! Soy tu asesor virtual 🌞<br>
     Selecciona una opción para comenzar 👇`
  );

  mostrarMenuPrincipal();
}

/* =========================
   RESPONSIVE POR JS
   (NO TOCA TUS ESTILOS)
========================= */
function aplicarResponsiveChat() {
  if (!el.chatBox) return;

  const w = window.innerWidth;

  if (w <= 480) {
    el.chatBox.style.width = "100%";
    el.chatBox.style.height = "100dvh";
    el.chatBox.style.bottom = "0";
    el.chatBox.style.right = "0";
    el.chatBox.style.borderRadius = "0";
  } else if (w <= 768) {
    el.chatBox.style.width = "92%";
    el.chatBox.style.height = "70vh";
    el.chatBox.style.bottom = "80px";
    el.chatBox.style.right = "4%";
    el.chatBox.style.borderRadius = "20px";
  } else {
    el.chatBox.style.width = "";
    el.chatBox.style.height = "";
    el.chatBox.style.bottom = "";
    el.chatBox.style.right = "";
    el.chatBox.style.borderRadius = "";
  }
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  renderExams(tourData);
  aplicarResponsiveChat();

  window.addEventListener("resize", aplicarResponsiveChat);

  // Input deshabilitado (solo botones)
  if (el.chatInput) {
    el.chatInput.disabled = true;
    el.chatInput.placeholder = "Selecciona una opción 👇";
  }

  // Toggle chat
  if (el.chatToggle && el.chatBox) {
    el.chatToggle.addEventListener("click", () => {
      const abierto = el.chatBox.style.display === "flex";
      el.chatBox.style.display = abierto ? "none" : "flex";
      if (!abierto) iniciarChat();
    });
  }

  // Cerrar chat
  if (el.chatClose && el.chatBox) {
    el.chatClose.addEventListener("click", () => {
      el.chatBox.style.display = "none";
    });
  }
});
