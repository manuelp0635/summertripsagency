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
let cart = [];

const cartEl = document.getElementById("cart");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");

document.getElementById("cart-btn").onclick = () => toggleCart();

function toggleCart() {
  cartEl.classList.toggle("open");
}

function addToCart(name, price) {
  cart.push({ name, price });
  renderCart();
  cartEl.classList.add("open");
}

function renderCart() {
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price;
    cartItems.innerHTML += `<p>${item.name} - $${item.price.toLocaleString()} COP</p>`;
  });

  cartTotal.textContent = `$${total.toLocaleString()} COP`;
  cartCount.textContent = cart.length;
}

/* ================= CHECKOUT WHATSAPP ================= */
function checkout() {
  if (!cart.length) return;

  let msg = "Hello 👋 I want to book:%0A";
  cart.forEach(i => msg += `- ${i.name}%0A`);

  window.open(
    `https://wa.me/573128462567?text=${msg}`,
    "_blank"
  );
}
