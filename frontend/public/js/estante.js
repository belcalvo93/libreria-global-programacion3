/* ==========================================================================
   Estantería de libros y navegación activa (C-06, estante-estetica)
   - Capa pura (sin `document`): se prueba con `node --test`.
   - Capa DOM: carga los libros de lomo desde la API y marca la sección activa del nav.
   Script clásico: IIFE con "use strict" y `var`, sin módulos ni librerías.
   ========================================================================== */
(function () {
  "use strict";

  var CANTIDAD_COLORES = 5;
  // Límites de largo de título (en caracteres) de cada categoría: corto, medio,
  // largo y muy largo. Más allá del último, "extra".
  var LIMITES_LARGO = [14, 30, 50, 60];
  // Tamaño de letra por categoría (rem): nunca baja de 0.85 salvo en más de 60 caracteres (0.8).
  var TAMANOS_LETRA_REM = [1.1, 1.05, 1, 0.9, 0.8];
  // Clase mínima de grosor de lomo (14 a 18 % del alto) y de alto (34 % a 100 % del alto máximo, en dvh) por categoría.
  var ANCHO_MINIMO = [0, 3, 3, 4, 4];
  var ALTO_MINIMO = [0, 1, 2, 3, 4];
  var MAXIMA_CLASE_TAMANO = 5;
  var MODULO_INCLINADOS = 7;
  var RESTO_INCLINADO = 3;
  var LIMITE_ESTANTE = 12;
  var CARPETA_PORTADAS = "img/portadas/";
  // Archivos de portada que existen en frontend/public/img/portadas/ (hoy ninguno):
  // solo se piden las de esta lista para no generar errores 404.
  var PORTADAS_DISPONIBLES = [];
  var PARAMETROS_ESTANTE = { limit: LIMITE_ESTANTE };
  var TITULO_VACIO = "Sin título";

  /* ----- Capa pura ----- */

  function esIdValido(id) {
    return typeof id === "number" && Number.isInteger(id) && id >= 0;
  }

  // Variantes de aspecto por id: siempre las mismas para el mismo id.
  // Un id inválido usa la primera variante (índice 0).
  function variante(id, cantidad) {
    return esIdValido(id) ? id % cantidad : 0;
  }

  // Color de cuero: marrón, bordó, marino, bosque o mostaza.
  function claseColorLibro(id) {
    return "libro--c" + variante(id, CANTIDAD_COLORES);
  }

  function categoriaLargoTitulo(titulo) {
    var largo = typeof titulo === "string" ? titulo.length : 0;
    var i;
    for (i = 0; i < LIMITES_LARGO.length; i += 1) {
      if (largo <= LIMITES_LARGO[i]) {
        return i;
      }
    }
    return LIMITES_LARGO.length;
  }

  // Tamaño de letra según el largo del título (el título nunca se recorta).
  function claseLetraLibro(titulo) {
    return "libro--t" + categoriaLargoTitulo(titulo);
  }

  // Los títulos largos ocupan lomos más anchos y más altos; el id suma una
  // variación estable y las alturas quedan desparejas a propósito.
  function claseAnchoLibro(id, titulo) {
    var n = ANCHO_MINIMO[categoriaLargoTitulo(titulo)] + variante(id, 2);
    return "libro--w" + Math.min(n, MAXIMA_CLASE_TAMANO);
  }

  function claseAlturaLibro(id, titulo) {
    var n = ALTO_MINIMO[categoriaLargoTitulo(titulo)] + variante(id, 3);
    return "libro--h" + Math.min(n, MAXIMA_CLASE_TAMANO);
  }

  // Algunos libros, siempre los mismos, se apoyan inclinados contra el vecino.
  function claseInclinacionLibro(id) {
    return esIdValido(id) && id % MODULO_INCLINADOS === RESTO_INCLINADO ? "libro--inclinado" : "";
  }

  function clasesLibro(id, titulo) {
    return ["libro", claseColorLibro(id), claseLetraLibro(titulo), claseAnchoLibro(id, titulo),
            claseAlturaLibro(id, titulo), claseInclinacionLibro(id)]
      .filter(Boolean)
      .join(" ");
  }

  // Ruta de la portada real si el ISBN tiene archivo en la lista; si no, null.
  function rutaPortada(isbn, disponibles) {
    var i;
    if (typeof isbn !== "string" || !/^[0-9A-Za-z-]+$/.test(isbn) || !Array.isArray(disponibles)) {
      return null;
    }
    for (i = 0; i < disponibles.length; i += 1) {
      if (typeof disponibles[i] === "string" && disponibles[i].indexOf(isbn + ".") === 0 &&
          disponibles[i].indexOf(".", isbn.length + 1) === -1) {
        return CARPETA_PORTADAS + disponibles[i];
      }
    }
    return null;
  }

  function tituloLibro(libro) {
    var titulo = libro && typeof libro.titulo === "string" ? libro.titulo.trim() : "";
    return titulo === "" ? TITULO_VACIO : titulo;
  }

  // El nombre accesible empieza por el texto visible (WCAG 2.5.3).
  function etiquetaLibro(titulo) {
    return titulo + ", ver detalle";
  }

  function decidirVistaEstante(lista) {
    return Array.isArray(lista) && lista.length > 0 ? "libros" : "vacio";
  }

  // Devuelve el id de la sección con mayor intersectionRatio; en empate, la primera.
  function elegirSeccionActiva(entradas) {
    var mejor = null;
    var mejorRatio = 0;
    var i;
    if (!Array.isArray(entradas)) {
      return null;
    }
    for (i = 0; i < entradas.length; i += 1) {
      if (entradas[i].isIntersecting && (mejor === null || entradas[i].intersectionRatio > mejorRatio)) {
        mejor = entradas[i].target.id;
        mejorRatio = entradas[i].intersectionRatio;
      }
    }
    return mejor;
  }

  /* ----- Capa DOM ----- */

  var MENSAJE_SIN_DETALLE = "No se pudo abrir el detalle del libro.";
  var ID_DETALLE_TITULO = "catalogo-detalle-titulo";

  function elemento(id) {
    return document.getElementById(id);
  }

  function ocultarMensajes() {
    elemento("mensaje-estante-cargando").hidden = true;
    elemento("mensaje-estante-vacio").hidden = true;
    elemento("mensaje-estante-error").hidden = true;
  }

  function mostrarError(texto) {
    ocultarMensajes();
    elemento("mensaje-estante-error").textContent = texto;
    elemento("mensaje-estante-error").hidden = false;
  }

  function vaciarRepisa() {
    var repisa = document.querySelector(".estante__repisa");
    while (repisa.firstChild) {
      repisa.removeChild(repisa.firstChild);
    }
    return repisa;
  }

  function abrirDetalle(id, boton) {
    if (typeof window.mostrarDetalleLibro !== "function") {
      mostrarError(MENSAJE_SIN_DETALLE);
      return;
    }
    elemento("mensaje-estante-error").hidden = true;
    window.mostrarDetalleLibro(id, boton);
    // Defensa: si el catálogo no movió el foco, se lleva al encabezado del detalle.
    var titulo = elemento(ID_DETALLE_TITULO);
    if (titulo && document.activeElement !== titulo) {
      titulo.focus();
    }
  }

  function crearCara(clase) {
    var cara = document.createElement("span");
    cara.className = clase;
    return cara;
  }

  // Etiqueta única con el título completo, fuera del contenedor con scroll.
  function mostrarEtiqueta(titulo) {
    var etiqueta = elemento("estante-etiqueta");
    etiqueta.textContent = titulo;
    etiqueta.hidden = false;
  }

  function ocultarEtiqueta() {
    var etiqueta = elemento("estante-etiqueta");
    etiqueta.hidden = true;
    etiqueta.textContent = "";
  }

  // La portada real solo se crea cuando el libro sale al frente, nunca en reposo.
  function agregarPortada(tapa, isbn) {
    var ruta = rutaPortada(isbn, PORTADAS_DISPONIBLES);
    var portada;
    if (ruta === null || tapa.querySelector(".libro__portada")) {
      return;
    }
    portada = document.createElement("img");
    portada.className = "libro__portada";
    portada.src = ruta;
    portada.width = 88;
    portada.height = 132;
    portada.alt = "";
    portada.loading = "lazy";
    tapa.appendChild(portada);
  }

  function crearLibro(libro) {
    var item = document.createElement("li");
    var boton = document.createElement("button");
    var lomo = crearCara("libro__lomo");
    var textoLomo = crearCara("libro__titulo");
    var tapa = crearCara("libro__tapa");
    var titulo = tituloLibro(libro);

    textoLomo.textContent = titulo;
    lomo.appendChild(textoLomo);
    boton.type = "button";
    boton.className = clasesLibro(libro.id, titulo);
    boton.setAttribute("aria-label", etiquetaLibro(titulo));
    boton.appendChild(lomo);
    boton.appendChild(tapa);
    boton.appendChild(crearCara("libro__tope"));

    function salir() {
      mostrarEtiqueta(titulo);
      agregarPortada(tapa, libro.isbn);
    }

    boton.addEventListener("mouseenter", salir);
    boton.addEventListener("focus", salir);
    boton.addEventListener("mouseleave", ocultarEtiqueta);
    boton.addEventListener("blur", ocultarEtiqueta);
    boton.addEventListener("click", function () {
      abrirDetalle(libro.id, boton);
    });
    item.appendChild(boton);
    return item;
  }

  async function cargarEstante() {
    var repisa = vaciarRepisa();
    ocultarMensajes();
    elemento("mensaje-estante-cargando").hidden = false;
    try {
      var libros = await Api.get("/libros/", PARAMETROS_ESTANTE);
      ocultarMensajes();
      if (decidirVistaEstante(libros) === "libros") {
        libros.forEach(function (libro) {
          repisa.appendChild(crearLibro(libro));
        });
      } else {
        elemento("mensaje-estante-vacio").hidden = false;
      }
    } catch (error) {
      mostrarError(error.message);
    }
  }

  /* ----- Cola del gato (C-06g) ----- */

  // Niveles de la cola, de quieta a agitada. Con el cursor a menos de 1.2 altos
  // del gato, la punta da golpecitos; a menos de 0.4, toda la cola se agita.
  var NIVELES_COLA = ["calma", "atenta", "inquieta"];
  var DISTANCIA_ATENTA = 1.2;
  var DISTANCIA_INQUIETA = 0.4;
  var ESPERA_CALMA_MS = 3000;
  // Punto de referencia de la cola dentro del gato (fracción de su caja): la
  // mitad de la curva, debajo de las patas a la izquierda.
  var CENTRO_COLA = { x: 0.3, y: 0.86 };
  // Animación que agrega cada nivel: al bajar se espera a que termine un ciclo
  // (vale 0°) para quitarla sin salto.
  var ANIMACION_DEL_NIVEL = { atenta: "punta-golpe", inquieta: "cola-latigo" };

  function estadoColaPorDistancia(distancia, altoGato) {
    if (typeof distancia !== "number" || !isFinite(distancia) || !(altoGato > 0)) {
      return "calma";
    }
    if (distancia < altoGato * DISTANCIA_INQUIETA) {
      return "inquieta";
    }
    if (distancia < altoGato * DISTANCIA_ATENTA) {
      return "atenta";
    }
    return "calma";
  }

  // Subir es inmediato (las animaciones nuevas arrancan en 0°); bajar, de a un nivel.
  function pasoCola(actual, deseado) {
    var a = NIVELES_COLA.indexOf(actual);
    var d = NIVELES_COLA.indexOf(deseado);
    if (a === -1 || d === -1 || d === a) {
      return actual;
    }
    return d > a ? deseado : NIVELES_COLA[a - 1];
  }

  function conectarColaGato() {
    var gato = document.querySelector(".gato");
    var actual = "calma";
    var deseado = "calma";
    var cuadroPendiente = false;
    var ultimoPuntero = null;
    var temporizador = null;

    if (!gato || typeof window.matchMedia !== "function" ||
        !window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
      return;
    }

    function mostrar(nivel) {
      actual = nivel;
      gato.setAttribute("data-cola", nivel);
    }

    function querer(nivel) {
      deseado = nivel;
      if (NIVELES_COLA.indexOf(deseado) > NIVELES_COLA.indexOf(actual)) {
        mostrar(pasoCola(actual, deseado));
      }
    }

    function medir() {
      var caja;
      var dx;
      var dy;
      cuadroPendiente = false;
      if (!ultimoPuntero) {
        return;
      }
      caja = gato.getBoundingClientRect();
      dx = ultimoPuntero.x - (caja.left + caja.width * CENTRO_COLA.x);
      dy = ultimoPuntero.y - (caja.top + caja.height * CENTRO_COLA.y);
      querer(estadoColaPorDistancia(Math.sqrt(dx * dx + dy * dy), caja.height));
      if (temporizador !== null) {
        window.clearTimeout(temporizador);
      }
      // Sin movimiento durante un rato, el gato se tranquiliza aunque el cursor siga cerca.
      temporizador = window.setTimeout(function () {
        querer("calma");
      }, ESPERA_CALMA_MS);
    }

    document.addEventListener("pointermove", function (evento) {
      ultimoPuntero = { x: evento.clientX, y: evento.clientY };
      if (!cuadroPendiente) {
        cuadroPendiente = true;
        window.requestAnimationFrame(medir);
      }
    }, { passive: true });

    document.documentElement.addEventListener("pointerleave", function () {
      querer("calma");
    });

    // Al terminar un ciclo de la animación del nivel actual, baja un nivel si hace falta.
    gato.addEventListener("animationiteration", function (evento) {
      if (evento.animationName === ANIMACION_DEL_NIVEL[actual] && deseado !== actual) {
        mostrar(pasoCola(actual, deseado));
      }
    });

    mostrar("calma");
  }

  // Marca aria-current="location" solo en el enlace de la sección activa.
  function marcarSeccionActiva(enlaces, id) {
    enlaces.forEach(function (enlace) {
      if (id !== null && enlace.getAttribute("href") === "#" + id) {
        enlace.setAttribute("aria-current", "location");
      } else {
        enlace.removeAttribute("aria-current");
      }
    });
  }

  function conectarNavegacion() {
    var enlaces = Array.prototype.slice.call(document.querySelectorAll('nav[aria-label="Navegación principal"] a[href^="#"]'));
    var ultimas = {};
    var observador;

    function desdeHash() {
      var id = window.location.hash.replace("#", "");
      marcarSeccionActiva(enlaces, id === "" ? null : id);
    }

    enlaces.forEach(function (enlace) {
      enlace.addEventListener("click", function () {
        marcarSeccionActiva(enlaces, enlace.getAttribute("href").slice(1));
      });
    });
    window.addEventListener("hashchange", desdeHash);
    if (window.location.hash) {
      desdeHash();
    }

    if (typeof IntersectionObserver === "function") {
      observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          ultimas[entrada.target.id] = entrada;
        });
        marcarSeccionActiva(enlaces, elegirSeccionActiva(Object.keys(ultimas).map(function (clave) {
          return ultimas[clave];
        })));
      }, { rootMargin: "-10% 0px -80% 0px" });
      enlaces.forEach(function (enlace) {
        var seccion = document.getElementById(enlace.getAttribute("href").slice(1));
        if (seccion) {
          observador.observe(seccion);
        }
      });
    }
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
      cargarEstante();
      conectarNavegacion();
      conectarColaGato();
    });
  }

  // Exportación condicional solo para tests unitarios con `node --test`.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      claseColorLibro: claseColorLibro,
      categoriaLargoTitulo: categoriaLargoTitulo,
      claseLetraLibro: claseLetraLibro,
      TAMANOS_LETRA_REM: TAMANOS_LETRA_REM,
      claseAlturaLibro: claseAlturaLibro,
      claseAnchoLibro: claseAnchoLibro,
      claseInclinacionLibro: claseInclinacionLibro,
      clasesLibro: clasesLibro,
      rutaPortada: rutaPortada,
      PORTADAS_DISPONIBLES: PORTADAS_DISPONIBLES,
      tituloLibro: tituloLibro,
      etiquetaLibro: etiquetaLibro,
      decidirVistaEstante: decidirVistaEstante,
      elegirSeccionActiva: elegirSeccionActiva,
      estadoColaPorDistancia: estadoColaPorDistancia,
      pasoCola: pasoCola,
      PARAMETROS_ESTANTE: PARAMETROS_ESTANTE
    };
  }
})();
