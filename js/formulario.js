function submitForm(e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const dest = document.getElementById("dest").value;
    const msg = document.getElementById("msg").value.trim();

    // ✅ WhatsApp del cliente (312 8462567)
    const phone = "573128462567";

    if (!name || !email) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    const text =
      `🌴 Nueva solicitud de contacto\n\n` +
      `👤 Nombre: ${name}\n` +
      `📧 Email: ${email}\n` +
      `📍 Destino de interés: ${dest}\n` +
      `📝 Mensaje: ${msg || "Sin mensaje adicional"}`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank");
  }
