document.getElementById("contactForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const dest = document.getElementById("dest").value;
    const msg = document.getElementById("msg").value;

    const number = "573128462567"; // WhatsApp

    const text =
      `🌴 Nueva solicitud de contacto\n\n` +
      `👤 Nombre: ${name}\n` +
      `📧 Email: ${email}\n` +
      `📍 Destino de interés: ${dest}\n` +
      `📝 Mensaje: ${msg}`;

    const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank");
  });
