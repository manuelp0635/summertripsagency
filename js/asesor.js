/* =========================
   CHAT SUMMERTRIPSAGENCY
   Asesor Virtual Turístico
   ========================= */

/* =========================
   SONIDO MENSAJES BOT
   ========================= */
const taboSound = new Audio(
  "https://cdn.pixabay.com/download/audio/2022/03/15/audio_f54f6c3b7b.mp3"
);

/* =========================
   DATOS DE TOURS
   ========================= */
const tourData = [
  {
    name: "Tour 5 Islas",
    desc: "Recorrido en lancha deportiva por islas paradisíacas, aguas cristalinas y ambiente caribeño.",
    includes: "Lancha deportiva, guía, almuerzo",
    duration: "8 horas",
    price: 350000
  },
  {
    name: "Playa Blanca",
    desc: "Día de descanso en playa de arena blanca y mar turquesa.",
    includes: "Transporte, almuerzo",
    duration: "6 horas",
    price: 180000
  },
  {
    name: "City Tour Cartagena",
    desc: "Recorrido cultural por la ciudad amurallada y sitios históricos.",
    includes: "Guía profesional, transporte",
    duration: "4 horas",
    price: 120000
  }
];

/* =========================
   UTILIDADES
   ========================= */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.innerText = text;
  return div.innerHTML;
}

function formatCurrency(value) {
  return value.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP"
  });
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

/* =========================
   MENSAJES Y HISTORIAL
   ========================= */
function agregarMensaje(texto, tipo = "bot", guardar = true) {
  if (!el.chatMessages) return;

  const msg = document.createElement("div");
  msg.className = `msg ${tipo}`;
  msg.innerHTML = texto;
  el.chatMessages.appendChild(msg);
  el.chatMessages.scrollTop = el.chatMessages.scrollHeight;

  if (tipo === "bot") {
    try { taboSound.play(); } catch (e) {}
  }

  if (guardar) guardarMensaje(texto, tipo);
}

function guardarMensaje(texto, tipo) {
  try {
    const historial = JSON.parse(localStorage.getItem("chatHistorial")) || [];
    historial.push({ texto, tipo });
    localStorage.setItem("chatHistorial", JSON.stringify(historial));
  } catch (e) {}
}

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
  } catch (e) {}
}

function reiniciarConversacion() {
  localStorage.removeItem("chatHistorial");
  localStorage.removeItem("chatIniciado");
  if (el.chatMessages) el.chatMessages.innerHTML = "";
  iniciarChat(true);
}

/* =========================
   MENSAJE DE BIENVENIDA
   ========================= */
function iniciarChat(force = false) {
  if (!el.chatMessages || !el.chatBox) return;
  if (!force && localStorage.getItem("chatIniciado")) return;

  const welcome =
    "🌴 <b>Somos SummerTripsAgency</b> ✈️<br/><br/>" +
    "Estamos para asesorarte en tus aventuras a <b>nivel nacional</b>.<br/><br/>" +
    "Descubre destinos increíbles y experiencias inolvidables en Colombia.<br/><br/>" +
    "¿Cómo deseas comenzar?<br/><br/>" +
    "1️⃣ Ver tours y experiencias<br/>" +
    "2️⃣ Promociones y precios<br/>" +
    "3️⃣ Qué incluye cada plan<br/>" +
    "4️⃣ Reservar ahora<br/>" +
    "5️⃣ Hablar con un asesor humano";

  agregarMensaje(welcome, "bot");
  localStorage.setItem("chatIniciado", "1");
}

/* =========================
   RESPUESTAS AUTOMÁTICAS
   ========================= */
function respuestaAutomatica(texto) {
  const t = (texto || "").toLowerCase();

  if (t === "1" || t.includes("tour")) {
    let list = "<b>🌎 Tours disponibles:</b><br/><br/>";
    tourData.forEach(tour => {
      list += `• <b>${tour.name}</b> – desde ${formatCurrency(tour.price)}<br/>`;
    });
    list += "<br/>Escribe el nombre del tour para más detalles.";
    return list;
  }

  if (t === "2" || t.includes("precio") || t.includes("promo")) {
    return (
      "💰 Contamos con promociones especiales por temporada.<br/><br/>" +
      "<a href='https://api.whatsapp.com/send?phone=573128462567' target='_blank'>" +
      "👉 Solicitar promoción por WhatsApp</a>"
    );
  }

  if (t === "3" || t.includes("incluye")) {
    return "📋 Todos nuestros planes incluyen guía certificado y acompañamiento durante la experiencia.";
  }

  if (t === "4" || t.includes("reserv")) {
    return (
      "📲 <b>Reserva fácil y segura</b><br/><br/>" +
      "<a href='https://api.whatsapp.com/send?phone=573128462567' target='_blank'>" +
      "👉 Reservar ahora por WhatsApp</a>"
    );
  }

  if (t === "5" || t.includes("asesor") || t.includes("humano")) {
    return (
      "👩‍💼 Un asesor humano te atenderá enseguida.<br/><br/>" +
      "<a href='https://api.whatsapp.com/send?phone=573128462567' target='_blank'>" +
      "👉 Hablar con asesor</a>"
    );
  }

  if (t.includes("reiniciar")) {
    reiniciarConversacion();
    return null;
  }

  /* DETECTAR TOUR ESPECÍFICO (VENTAS AIDA) */
  for (const tour of tourData) {
    if (t.includes(tour.name.toLowerCase())) {
      return (
        `✨ <b>${tour.name}</b><br/><br/>` +
        `${tour.desc}<br/><br/>` +
        `<b>Incluye:</b> ${tour.includes}<br/>` +
        `<b>Duración:</b> ${tour.duration}<br/>` +
        `<b>Precio desde:</b> ${formatCurrency(tour.price)}<br/><br/>` +
        `🔥 <b>Cupos limitados</b> — No te quedes sin vivir esta experiencia.<br/><br/>` +
        `<button onclick="abrirWhatsAppTour('${tour.name}')" 
          style="background:#00c3a3;color:#fff;border:none;padding:10px 16px;border-radius:10px;cursor:pointer;">
          Reservar por WhatsApp
        </button>`
      );
    }
  }

  return "🤖 No logré entender tu mensaje.<br/>Escribe <b>1</b> para tours, <b>4</b> para reservar o el nombre del tour.";
}

/* =========================
   ENVÍO DE MENSAJES
   ========================= */
function enviarChat() {
  if (!el.chatInput) return;
  const texto = el.chatInput.value.trim();
  if (!texto) return;

  agregarMensaje(escapeHtml(texto), "user", true);
  el.chatInput.value = "";

  setTimeout(() => {
    const reply = respuestaAutomatica(texto);
    if (reply !== null) agregarMensaje(reply, "bot", true);
  }, 600);
}

function enviar() { enviarChat(); }

/* =========================
   INICIALIZACIÓN
   ========================= */
function setupChatIntegration() {
  if (!el.chatBox) return;

  restaurarHistorial();

  window.addEventListener("load", () => {
    setTimeout(() => {
      el.chatBox.style.display = "flex";
      iniciarChat();
    }, 600);
  });

  if (el.chatSend) el.chatSend.addEventListener("click", enviarChat);

  if (el.chatInput) {
    el.chatInput.addEventListener("keypress", e => {
      if (e.key === "Enter") enviarChat();
    });
  }
}

/* =========================
   FIN DEL ARCHIVO
   ========================= */
