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
  // Fundido (C-06h): sube en 1.5 s al empezar o retomar y baja en 0.6 s antes de pausar.
  var FUNDIDO_SUBIDA_MS = 1500;
  var FUNDIDO_BAJADA_MS = 600;
  var MS_POR_CUADRO = 1000 / 60;
  var MS_CUADRO_MAXIMO = 100; // tras una pausa larga del navegador, no saltar de golpe
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

  // Acerca `actual` a `objetivo` en `paso` sin pasarse, redondeado a 3 decimales.
  // Con datos inválidos va directo al objetivo.
  function siguienteVolumen(actual, objetivo, paso) {
    var diferencia;
    if (typeof actual !== "number" || !isFinite(actual) || !(paso > 0)) {
      return objetivo;
    }
    diferencia = objetivo - actual;
    if (Math.abs(diferencia) <= paso) {
      return objetivo;
    }
    return Math.round((actual + (diferencia > 0 ? paso : -paso)) * 1000) / 1000;
  }

  // Paso de volumen para un cuadro de `msPorCuadro`, recorriendo de `desde` a
  // `hasta` en `duracionMs`. Menos de un cuadro: todo en un paso.
  function pasoPorCuadro(desde, hasta, duracionMs, msPorCuadro) {
    var cuadros = Math.max(1, Math.round(duracionMs / msPorCuadro));
    return Math.abs(hasta - desde) / cuadros;
  }

  /* ----- Capa DOM ----- */

  function iniciar() {
    var audio = document.getElementById("musica-fondo");
    var boton = document.getElementById("boton-musica");
    var icono = boton ? boton.querySelector(".boton-musica__icono") : null;
    var estado = "espera";
    var fundido = null; // id del requestAnimationFrame en curso (uno solo a la vez)

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

    function cancelarFundido() {
      if (fundido !== null) {
        window.cancelAnimationFrame(fundido);
        fundido = null;
      }
    }

    // Lleva el volumen a `objetivo` a velocidad constante (la de recorrer de 0 a
    // VOLUMEN_INICIAL en `duracionMs`), cancelando cualquier fundido anterior.
    function fundir(objetivo, duracionMs, alTerminar) {
      var ultimo = null;
      cancelarFundido();

      function cuadro(ahora) {
        var ms = ultimo === null ? MS_POR_CUADRO : Math.min(Math.max(ahora - ultimo, 1), MS_CUADRO_MAXIMO);
        ultimo = ahora;
        audio.volume = siguienteVolumen(audio.volume, objetivo, pasoPorCuadro(0, VOLUMEN_INICIAL, duracionMs, ms));
        if (audio.volume === objetivo) {
          fundido = null;
          if (alTerminar) {
            alTerminar();
          }
          return;
        }
        fundido = window.requestAnimationFrame(cuadro);
      }

      fundido = window.requestAnimationFrame(cuadro);
    }

    async function reproducir() {
      cancelarFundido();
      try {
        // Desde la pausa arranca en silencio; si estaba bajando, sube desde ahí.
        if (audio.paused) {
          audio.volume = 0;
        }
        await audio.play();
        if (estaSonando(estado)) {
          fundir(VOLUMEN_INICIAL, FUNDIDO_SUBIDA_MS);
        }
      } catch (error) {
        // Navegador que bloquea el audio o archivo que no carga: queda silenciada.
        cancelarFundido();
        if (estaSonando(estado)) {
          estado = siguienteEstado(estado, "rechazo");
          pintarBoton();
        }
      }
    }

    // Con la pestaña oculta se pausa al instante (nadie la escucha y el navegador
    // frena requestAnimationFrame); si no, baja el volumen y recién ahí pausa.
    function detener(evento) {
      if (evento === "ocultar") {
        cancelarFundido();
        audio.pause();
        return;
      }
      fundir(0, FUNDIDO_BAJADA_MS, function () {
        audio.pause();
      });
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
        detener(evento);
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
        cancelarFundido();
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
      siguienteVolumen: siguienteVolumen,
      pasoPorCuadro: pasoPorCuadro,
      FUNDIDO_SUBIDA_MS: FUNDIDO_SUBIDA_MS,
      FUNDIDO_BAJADA_MS: FUNDIDO_BAJADA_MS,
      VOLUMEN_INICIAL: VOLUMEN_INICIAL
    };
  }
})();
