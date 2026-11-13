/* ==========================================================================
   Música de fondo opcional (C-06g, musica-fondo)
   - Capa pura (sin `document`): máquina de estados y vista del botón, probadas
     con `node --test`.
   - Capa DOM: arranca con la primera interacción del usuario (los navegadores
     bloquean el audio automático), alterna con #boton-musica y pausa mientras la
     pestaña está oculta. Sin localStorage: la preferencia dura lo que la visita.
   Script clásico: IIFE con "use strict" y `var`, sin módulos ni librerías.
   ========================================================================== */
(function () {
  "use strict";

  var VOLUMEN_INICIAL = 0.3;
  var EVENTOS_PRIMERA_INTERACCION = ["pointerdown", "keydown", "touchstart"];

  // Estados: espera (todavía no arrancó), sonando, silenciada (por el usuario o
  // porque el navegador rechazó play()) y oculta (pausada solo porque la pestaña
  // no se ve). Un estado o evento desconocido no cambia nada.
  var TRANSICIONES = {
    espera: { interaccion: "sonando", boton: "sonando", rechazo: "silenciada" },
    sonando: { boton: "silenciada", ocultar: "oculta", rechazo: "silenciada" },
    silenciada: { boton: "sonando" },
    oculta: { boton: "silenciada", mostrar: "sonando", rechazo: "silenciada" }
  };

  // La etiqueta accesible es fija; el estado lo comunica solo aria-pressed
  // (true = sonando). El title es un tooltip visual con la acción.
  var ETIQUETA_BOTON = "Música de fondo";
  var VISTA_ENCENDIDA = { icono: "🔊", titulo: "Silenciar música", presionado: "true" };
  var VISTA_APAGADA = { icono: "🔇", titulo: "Activar música", presionado: "false" };

  /* ----- Capa pura ----- */

  function siguienteEstado(estado, evento) {
    var desde = Object.prototype.hasOwnProperty.call(TRANSICIONES, estado) ? TRANSICIONES[estado] : null;
    if (desde && Object.prototype.hasOwnProperty.call(desde, evento)) {
      return desde[evento];
    }
    return estado;
  }

  function estaSonando(estado) {
    return estado === "sonando";
  }

  // «oculta» se ve como encendida: la música solo está en pausa por la pestaña.
  function vistaBoton(estado) {
    var vista = estado === "sonando" || estado === "oculta" ? VISTA_ENCENDIDA : VISTA_APAGADA;
    return { icono: vista.icono, titulo: vista.titulo, presionado: vista.presionado };
  }

  /* ----- Capa DOM ----- */

  function iniciar() {
    var audio = document.getElementById("musica-fondo");
    var boton = document.getElementById("boton-musica");
    var icono = boton ? boton.querySelector(".boton-musica__icono") : null;
    var estado = "espera";

    if (!audio || !boton || !icono) {
      return;
    }

    function pintarBoton() {
      var vista = vistaBoton(estado);
      icono.textContent = vista.icono;
      boton.setAttribute("aria-label", ETIQUETA_BOTON);
      boton.setAttribute("title", vista.titulo);
      boton.setAttribute("aria-pressed", vista.presionado);
    }

    async function reproducir() {
      try {
        audio.volume = VOLUMEN_INICIAL;
        await audio.play();
      } catch (error) {
        // Navegador que bloquea el audio o archivo que no carga: queda silenciada.
        if (estaSonando(estado)) {
          estado = siguienteEstado(estado, "rechazo");
          pintarBoton();
        }
      }
    }

    function aplicar(evento) {
      var anterior = estado;
      estado = siguienteEstado(estado, evento);
      if (estado === anterior) {
        return;
      }
      pintarBoton();
      if (estaSonando(estado)) {
        reproducir();
      } else {
        audio.pause();
      }
    }

    function quitarPrimeraInteraccion() {
      EVENTOS_PRIMERA_INTERACCION.forEach(function (tipo) {
        document.removeEventListener(tipo, primeraInteraccion, true);
      });
    }

    function primeraInteraccion(evento) {
      // El propio botón ya alterna con su click: si lo contáramos acá, el
      // pointerdown la encendería y el click la apagaría en el mismo toque.
      if (evento.target && typeof evento.target.closest === "function" && evento.target.closest("#boton-musica")) {
        return;
      }
      quitarPrimeraInteraccion();
      aplicar("interaccion");
    }

    EVENTOS_PRIMERA_INTERACCION.forEach(function (tipo) {
      document.addEventListener(tipo, primeraInteraccion, { capture: true, passive: true });
    });

    boton.addEventListener("click", function () {
      quitarPrimeraInteraccion();
      aplicar("boton");
    });

    document.addEventListener("visibilitychange", function () {
      aplicar(document.hidden ? "ocultar" : "mostrar");
    });

    audio.addEventListener("error", function () {
      if (estaSonando(estado)) {
        estado = siguienteEstado(estado, "rechazo");
        pintarBoton();
      }
    });

    pintarBoton();
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", iniciar);
  }

  // Exportación condicional solo para tests unitarios con `node --test`.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      siguienteEstado: siguienteEstado,
      estaSonando: estaSonando,
      vistaBoton: vistaBoton,
      ETIQUETA_BOTON: ETIQUETA_BOTON,
      VOLUMEN_INICIAL: VOLUMEN_INICIAL
    };
  }
})();
