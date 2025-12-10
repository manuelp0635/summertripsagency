  // Pequeñas interacciones: nav (para pantallas pequeñas), galería modal y envío de formulario simulado
      document.getElementById("year").textContent = new Date().getFullYear();

      // Gallery modal
      document.querySelectorAll(".gallery .g").forEach((g) => {
        g.addEventListener("click", () => {
          const src =
            g.getAttribute("data-img") ||
            getComputedStyle(g).backgroundImage.slice(5, -2);
          document.getElementById("mimg").src = src;
          document.getElementById("modal").classList.add("show");
        });
      });
      document.getElementById("modal").addEventListener("click", () => {
        document.getElementById("modal").classList.remove("show");
        document.getElementById("mimg").src = "";
      });

      function submitForm(e) {
        e.preventDefault();
        const name = document.getElementById("name").value || "Cliente";
        // Simulación de envío: reemplazar por llamada a API o servicio de email
        alert(
          "Gracias, " +
            name +
            ". Hemos recibido tu solicitud. Te contactamos pronto."
        );
        e.target.reset && e.target.reset();
      }

      // Mobile menu: mostrar simple indicación si necesario
      const mq = window.matchMedia("(max-width:1000px)");
      function adaptMenu() {
        const nav = document.querySelector("nav");
        const pill = document.getElementById("menuBtn");
        if (mq.matches) {
          nav.style.display = "none";
          pill.style.display = "inline-block";
          pill.onclick = () => {
            alert(
              "En versión demo copia los enlaces. Para menú móvil impleméntalo con tu framework preferido."
            );
          };
        } else {
          nav.style.display = "flex";
          pill.style.display = "none";
        }
      }
      adaptMenu();
      window.addEventListener("resize", adaptMenu);