/* ============================================================
   Maria & Michael — interactividad de la invitación
   ============================================================ */

(function () {
  "use strict";

  /* ---------- CONFIGURACIÓN ---------- */

  // Fecha y hora de la ceremonia (Lima, UTC-5)
  var WEDDING_DATE = new Date("2026-09-26T16:00:00-05:00");

  // URL del Web App de Google Apps Script (ver apps-script.gs para instalarlo).
  // Con esta URL configurada, las confirmaciones se guardan en Google Sheets.
  var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzlNQX-rL0uVJw-WLbIh6GnswK5VPnym7Hs1x9WHbfvacE1p82WRil4HxAmdGWXBRVQkQ/exec";

  // WhatsApp de respaldo para RSVP si Apps Script no está configurado o falla.
  var RSVP_WHATSAPP = "51999889033";

  /* ---------- SOBRE DE APERTURA ---------- */

  var intro = document.getElementById("intro");
  var openBtn = document.getElementById("openBtn");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.body.style.overflow = "hidden";

  openBtn.addEventListener("click", function () {
    intro.classList.add("is-open");
    startMusic();

    // Fase 2: cuando la carta ya salió, retirar el overlay completo
    var delay = reducedMotion ? 150 : 3200;
    setTimeout(function () {
      intro.classList.add("is-done");
      intro.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }, delay);
  });

  /* ---------- MÚSICA ---------- */

  var music = document.getElementById("bgMusic");
  var musicToggle = document.getElementById("musicToggle");
  var musicAvailable = true;

  music.addEventListener("error", function () {
    musicAvailable = false;
    musicToggle.hidden = true;
  });

  music.volume = 0.55;

  function startMusic() {
    if (!musicAvailable) return;
    music.play().then(function () {
      musicToggle.hidden = false;
      setToggleState(true);
    }).catch(function () {
      // Distinguir: archivo ausente/corrupto vs autoplay bloqueado
      if (music.error || music.networkState === 3) {
        musicAvailable = false;
        musicToggle.hidden = true;
      } else if (musicAvailable) {
        musicToggle.hidden = false;
        setToggleState(false);
      }
    });
  }

  function setToggleState(playing) {
    musicToggle.classList.toggle("is-paused", !playing);
    musicToggle.setAttribute("aria-pressed", String(playing));
    musicToggle.setAttribute("aria-label", playing ? "Pausar música" : "Reproducir música");
  }

  musicToggle.addEventListener("click", function () {
    if (music.paused) {
      music.play().then(function () { setToggleState(true); }).catch(function () {});
    } else {
      music.pause();
      setToggleState(false);
    }
  });

  /* ---------- COUNTDOWN ---------- */

  var cdDays = document.getElementById("cdDays");
  var cdHours = document.getElementById("cdHours");
  var cdMins = document.getElementById("cdMins");
  var cdSecs = document.getElementById("cdSecs");

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function updateCountdown() {
    var diff = WEDDING_DATE.getTime() - Date.now();

    if (diff <= 0) {
      cdDays.textContent = cdHours.textContent = cdMins.textContent = cdSecs.textContent = "00";
      return;
    }

    var secs = Math.floor(diff / 1000);
    cdDays.textContent = pad(Math.floor(secs / 86400));
    cdHours.textContent = pad(Math.floor((secs % 86400) / 3600));
    cdMins.textContent = pad(Math.floor((secs % 3600) / 60));
    cdSecs.textContent = pad(secs % 60);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- GALERÍA (oculta fotos ausentes) ---------- */

  var gallery = document.getElementById("nosotros");
  var galleryImgs = gallery.querySelectorAll("img");
  var missing = 0;

  function hideBroken(img) {
    img.closest(".g-item").style.display = "none";
    missing += 1;
    if (missing === galleryImgs.length) gallery.classList.add("is-empty");
  }

  // Probar cada foto de inmediato (las <img> son lazy y no cargan hasta el scroll):
  // si el archivo no existe, se oculta su recuadro; si ninguna existe, toda la sección.
  galleryImgs.forEach(function (img) {
    var probe = new Image();
    probe.onerror = function () { hideBroken(img); };
    probe.src = img.getAttribute("src");
  });

  /* ---------- REVEAL ON SCROLL ---------- */

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  document.querySelectorAll(".reveal, [data-draw]").forEach(function (el) {
    observer.observe(el);
  });

  /* ---------- COPIAR CUENTAS ---------- */

  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");

      function feedback() {
        var original = btn.textContent;
        btn.textContent = "Copiado ✓";
        btn.classList.add("copied");
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove("copied");
        }, 1800);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(feedback, function () {
          fallbackCopy(value, feedback);
        });
      } else {
        fallbackCopy(value, feedback);
      }
    });
  });

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* sin soporte */ }
    document.body.removeChild(ta);
    done();
  }

  /* ---------- RSVP ---------- */

  var form = document.getElementById("rsvpForm");
  var successMsg = document.getElementById("rsvpSuccess");
  var submitBtn = document.getElementById("rsvpSubmit");
  var hint = document.getElementById("rsvpHint");
  var conditionalFields = ["companionField", "allergyField", "songField"].map(function (id) {
    return document.getElementById(id);
  });

  if (APPS_SCRIPT_URL) {
    hint.textContent = "Tu confirmación se registra al instante en nuestra lista de invitados.";
  }

  // Si no asiste, ocultar campos que solo aplican a asistentes
  form.addEventListener("change", function (e) {
    if (e.target.name !== "asistencia") return;
    var attending = e.target.value.indexOf("Sí") === 0;
    conditionalFields.forEach(function (field) {
      field.classList.toggle("is-hidden", !attending);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var data = {
      nombre: form.nombre.value.trim(),
      asistencia: (form.asistencia.value || "").trim(),
      acompanante: form.acompanante.value.trim(),
      alergias: form.alergias.value.trim(),
      cancion: form.cancion.value.trim()
    };

    if (!data.nombre || !data.asistencia) {
      form.reportValidity();
      return;
    }

    if (APPS_SCRIPT_URL) {
      sendToSheet(data);
    } else {
      sendToWhatsApp(data);
    }
  });

  function sendToWhatsApp(data) {
    var lines = [
      "*Confirmación de asistencia — Boda Maria & Michael*",
      "",
      "Nombre: " + data.nombre,
      "Asistencia: " + data.asistencia
    ];

    if (data.asistencia.indexOf("Sí") === 0) {
      if (data.acompanante) lines.push("Acompañante: " + data.acompanante);
      if (data.alergias) lines.push("Alergias alimentarias: " + data.alergias);
      if (data.cancion) lines.push("Canción para la pista: " + data.cancion);
    }

    var url = "https://wa.me/" + RSVP_WHATSAPP + "?text=" + encodeURIComponent(lines.join("\n"));
    window.open(url, "_blank", "noopener");
    showSuccess();
  }

  function sendToSheet(data) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando…";

    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data)
    })
      .then(showSuccess)
      .catch(function () {
        // Respaldo: si el endpoint falla, la confirmación sale por WhatsApp
        sendToWhatsApp(data);
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Enviar confirmación";
      });
  }

  function showSuccess() {
    successMsg.hidden = false;
    successMsg.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
})();
