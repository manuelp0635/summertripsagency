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
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(num);
}
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
   RENDER TOURS
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
   CHAT
   ========================= */
const taboSound = new Audio(
  "https://cdn.pixabay.com/download/audio/2022/03/15/audio_f54f6c3b7b.mp3"
);

function agregarMensaje(texto, tipo = "bot") {
  if (!el.chatMessages) return;

  const msg = document.createElement("div");
  msg.className = `msg ${tipo}`;

  if (tipo === "bot") {
    msg.innerHTML = `<b>${BOT_NAME}:</b><br/>${texto}`;
    try { taboSound.play(); } catch {}
  } else {
    msg.textContent = texto;
  }

  el.chatMessages.appendChild(msg);
  el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
}

function iniciarChat() {
  // evita duplicar mensaje de bienvenida
  if (el.chatMessages.children.length > 0) return;

  agregarMensaje(
    `¡Hola! Soy <b>${BOT_NAME}</b> ✈️🌞<br/><br/>
     Estoy aquí para ayudarte a planear tu próxima aventura.<br/><br/>
     Puedes escribir:<br/>
     1️⃣ Horarios<br/>
     2️⃣ Reservar un tour<br/>
     3️⃣ Información de un tour<br/>
     4️⃣ Hablar con un asesor humano`,
    "bot"
  );
}

function respuestaAutomatica(texto) {
  const t = texto.toLowerCase();

  if (t === "1") return "🕒 Atención: Lun–Vie 8am–6pm | Sáb 8am–2pm";
  if (t === "2") return "📲 Escríbenos por WhatsApp: +57 312 8462567";
  if (t === "4") return "👩‍💼 Un asesor humano te atenderá por WhatsApp.";

  for (const tour of tourData) {
    if (t.includes(tour.name.toLowerCase())) {
      return `🌴 <b>${tour.name}</b><br/>
              ${tour.desc}<br/>
              💰 ${formatCurrency(tour.price)}`;
    }
  }

  return "🤖 No entendí tu mensaje. Escribe una opción o el nombre del tour.";
}

function enviarChat() {
  const texto = el.chatInput.value.trim();
  if (!texto) return;

  agregarMensaje(escapeHtml(texto), "user");
  el.chatInput.value = "";

  setTimeout(() => {
    agregarMensaje(respuestaAutomatica(texto), "bot");
  }, 600);
}

/* =========================
   INIT
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  renderExams(tourData);

  // eventos de envío
  if (el.chatSend) el.chatSend.addEventListener("click", enviarChat);
  if (el.chatInput) {
    el.chatInput.addEventListener("keypress", e => {
      if (e.key === "Enter") enviarChat();
    });
  }

  // toggle del chat (NO auto-open)
  if (el.chatToggle && el.chatBox) {
    el.chatToggle.addEventListener("click", () => {
      const abierto = el.chatBox.style.display === "flex";

      if (!abierto) {
        el.chatBox.style.display = "flex";
        iniciarChat();
        el.chatInput?.focus();
      } else {
        el.chatBox.style.display = "none";
      }
    });
  }

  // botón cerrar si existe
  if (el.chatClose && el.chatBox) {
    el.chatClose.addEventListener("click", () => {
      el.chatBox.style.display = "none";
    });
  }
});
