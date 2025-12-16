// Año automático
document.getElementById("year").textContent = new Date().getFullYear();

/* ======================================================
   GALERÍA MODAL
====================================================== */
document.querySelectorAll(".gallery .g").forEach((g) => {
  g.addEventListener("click", () => {
    let src = g.getAttribute("data-img");

    // Fallback si data-img NO existe
    if (!src) {
      const bg = getComputedStyle(g).backgroundImage;
      if (bg && bg !== "none") {
        src = bg.slice(5, -2); // obtiene URL del background
      }
    }

    if (!src) return; // evita error si no hay imagen disponible

    document.getElementById("mimg").src = src;
    document.getElementById("modal").classList.add("show");
  });
});

// Cerrar modal clickeando afuera
document.getElementById("modal").addEventListener("click", () => {
  document.getElementById("modal").classList.remove("show");
  document.getElementById("mimg").src = "";
});

/* ======================================================
   FORMULARIO (simulación)
====================================================== */
function submitForm(e) {
  e.preventDefault();
  const name = document.getElementById("name").value || "Cliente";

  alert("Gracias, " + name + ". Hemos recibido tu solicitud. Te contactamos pronto.");

  e.target.reset && e.target.reset();
}

/* ======================================================
   MENÚ MÓVIL (MEJORADO)
====================================================== */
const mq = window.matchMedia("(max-width:1000px)");
const nav = document.querySelector("nav");
const pill = document.getElementById("menuBtn");

function adaptMenu() {
  if (mq.matches) {
    nav.style.display = "none"; // oculto por defecto
    pill.style.display = "inline-block";
  } else {
    nav.style.display = "flex"; // desktop
    pill.style.display = "none";
  }
}

adaptMenu();
window.addEventListener("resize", adaptMenu);

// Toggle real del menú móvil
pill.addEventListener("click", () => {
  if (nav.style.display === "none" || nav.style.display === "") {
    nav.style.display = "flex"; // abrir
  } else {
    nav.style.display = "none"; // cerrar
  }
});
