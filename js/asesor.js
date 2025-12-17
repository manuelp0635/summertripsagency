// ==============================
// TABOSUMMER - CHATBOT MODAL JS
// ==============================

      const toggle = document.getElementById("toggleMenu");
const menu = document.getElementById("menu");
const links = document.querySelectorAll(".menu a");

toggle.addEventListener("click", () => {
  toggle.classList.toggle("active");
  menu.classList.toggle("active");

  const expanded = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", !expanded);
});

// Cerrar menú al hacer click en un link
links.forEach(link => {
  link.addEventListener("click", () => {
    toggle.classList.remove("active");
    menu.classList.remove("active");
    toggle.setAttribute("aria-expanded", "false");
  });
});


