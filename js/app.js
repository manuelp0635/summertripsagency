/* ================= LANGUAGE TOGGLE ================= */
let currentLang = "es";
const langBtn = document.getElementById("langToggle");

langBtn.onclick = () => {
  currentLang = currentLang === "es" ? "en" : "es";
  langBtn.textContent = currentLang.toUpperCase();

  document.querySelectorAll("[data-es]").forEach(el => {
    el.textContent = el.dataset[currentLang];
  });
};

/* ================= CAROUSEL ================= */
const track = document.getElementById("carouselTrack");
let index = 0;

setInterval(() => {
  index = (index + 1) % track.children.length;
  track.style.transform = `translateX(-${index * 100}%)`;
}, 4000);

/* ================= FILTERS ================= */
function filterTours(category) {
  document.querySelectorAll(".filters button").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");

  document.querySelectorAll(".card").forEach(card => {
    card.style.display =
      category === "all" || card.dataset.category === category
        ? "block"
        : "none";
  });
}

/* ================= CART ================= */
const WHATSAPP_NUMBER = "573128462567"; // WhatsApp del cliente
let cart = [];

const cartEl = document.getElementById("cart");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");

document.getElementById("cart-btn").onclick = () => toggleCart();

function toggleCart(forceOpen = false) {
  if (forceOpen) cartEl.classList.add("open");
  else cartEl.classList.toggle("open");
}

/* ================= ADD TOUR ================= */
function addToCart(tour) {
  cart.push(tour);
  renderCart();
  toggleCart(true);
}

/* ================= RENDER CART ================= */
function renderCart() {
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    cartItems.innerHTML += `
      <div class="cart-item">
        <strong>${item.name}</strong>
        <p>${item.description}</p>
        <span>$${item.price.toLocaleString()} COP</span>
        <button onclick="removeItem(${index})">✕</button>
      </div>
    `;
  });

  cartTotal.textContent = `$${total.toLocaleString()} COP`;
  cartCount.textContent = cart.length;
}

/* ================= REMOVE ITEM ================= */
function removeItem(index) {
  cart.splice(index, 1);
  renderCart();
}

/* ================= CHECKOUT WHATSAPP ================= */
function checkout() {
  if (!cart.length) {
    alert("No has seleccionado ningún tour.");
    return;
  }

  let message = `🌴 *Hola! Estoy interesado en los siguientes tours:*%0A%0A`;
  let total = 0;

  cart.forEach((item, i) => {
    message += `📍 *${i + 1}. ${item.name}*%0A`;
    message += `${item.description}%0A`;
    message += `💲 Precio: $${item.price.toLocaleString()} COP%0A%0A`;
    total += item.price;
  });

  message += `💰 *Total estimado:* $${total.toLocaleString()} COP%0A%0A`;
  message += `📅 Quedo atento a disponibilidad y horarios.`;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,
    "_blank"
  );
}
