// ==============================
// TABOSUMMER - CHATBOT MODAL JS
// ==============================

// Elementos
const openChatBtn = document.getElementById("openChat");
const closeChatBtn = document.getElementById("closeChat");
const chatbot = document.getElementById("chatbot");
const chatBody = document.getElementById("chatBody");
const options = document.getElementById("options");

// Abrir chat
openChatBtn.addEventListener("click", () => {
  chatbot.style.display = "block";
  openChatBtn.style.display = "none";
});

// Cerrar chat
closeChatBtn.addEventListener("click", () => {
  chatbot.style.display = "none";
  openChatBtn.style.display = "flex";
});

// Mensaje del bot
function botMessage(text) {
  const msg = document.createElement("div");
  msg.className = "bot";
  msg.innerHTML = text;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Limpiar opciones
function clearOptions() {
  options.innerHTML = "";
}

// Crear opción
function createOption(text, action) {
  const btn = document.createElement("button");
  btn.innerHTML = text;
  btn.onclick = action;
  options.appendChild(btn);
}

// Inicio
function startChat() {
  chatBody.innerHTML = "";
  botMessage("👋 ¡Hola! Soy <strong>Tabosummer</strong>, tu asesor virtual.");
  botMessage("¿Qué deseas hacer?");
  clearOptions();

  createOption("1️⃣ Consultar horarios", horarios);
  createOption("2️⃣ Agendar cita", cita);
  createOption("3️⃣ Requisitos de exámenes", requisitos);
  createOption("4️⃣ Resultados", resultados);
  createOption("5️⃣ Hablar con un agente", agente);
}

// Flujos
function horarios() {
  botMessage("🕒 Atendemos de lunes a sábado de 8:00 a.m. a 6:00 p.m.");
}

function cita() {
  botMessage("📅 Te conectaré con un asesor para agendar tu cita.");
  agente();
}

function requisitos() {
  botMessage("📋 Los requisitos varían según el servicio.");
  clearOptions();
  createOption("📲 Hablar con un agente", agente);
  createOption("🔙 Volver al inicio", startChat);
}

function resultados() {
  botMessage("📄 Para consultar resultados es necesario validarlo con un asesor.");
  agente();
}

function agente() {
  botMessage("👉 Te redirigiré a WhatsApp para atención personalizada.");
  setTimeout(() => {
    window.open("https://wa.me/573128462567", "_blank");
  }, 800);
}

// Inicializar
startChat();
