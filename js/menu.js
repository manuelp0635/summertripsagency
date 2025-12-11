/* ======================================================
   MENÚ MÓVIL (VERSIÓN PREMIUM LIMPIA)
====================================================== */

// Elementos principales
const btn = document.getElementById("menuBtn");
const menu = document.getElementById("mobileMenu");
const overlay = document.getElementById("menuOverlay");
const mq = window.matchMedia("(max-width:1000px)");
const mainNav = document.getElementById("mainNav");

// Adaptar menú según resolución (mostrar desktop / móvil)
function adaptMenu() {
  if (mq.matches) {
    // MÓVIL
    mainNav.style.display = "none";   // ocultar menú desktop
    btn.style.display = "flex";       // mostrar hamburguesa
  } else {
    // DESKTOP
    mainNav.style.display = "flex";   // mostrar menú desktop
    btn.style.display = "none";       // ocultar hamburguesa

    // Si estaba abierto en móvil, lo cerramos
    btn.classList.remove("active");
    menu.classList.remove("show");
    overlay.classList.remove("show");
  }
}

adaptMenu();
window.addEventListener("resize", adaptMenu);

// Toggle del menú móvil
function toggleMenu() {
  btn.classList.toggle("active");   // animación hamburguesa
  menu.classList.toggle("show");    // panel lateral
  overlay.classList.toggle("show"); // fondo oscuro/blur
}

btn.addEventListener("click", toggleMenu);
overlay.addEventListener("click", toggleMenu);

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll(".mobile-menu a").forEach((a) => {
  a.addEventListener("click", toggleMenu);
});
