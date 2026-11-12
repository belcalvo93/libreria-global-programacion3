/* ==========================================================================
   Librería Página Viva — Catálogo desde la API (Global, Ejercicio 1)
   Consume GET /libros/ y GET /libros/{id} a través de window.Api.
   Inserción solo como texto (textContent, nunca como HTML).
   ========================================================================== */
(function () {
  "use strict";

  function textoGenero(libro) {
    if (!libro || !libro.genero || !libro.genero.nombre) {
      return "Sin clasificar";
    }
    return String(libro.genero.nombre);
  }

  function formatearPrecio(precio) {
    if (precio === null || precio === undefined || precio === "") {
      return "";
    }
    var numero = Api.numero(precio);
    return Number.isFinite(numero) ? numero.toFixed(2) : "";
  }

  function autoriasOrdenadas(autores) {
    if (!Array.isArray(autores)) {
      return [];
    }
    return autores.slice().sort(function (a, b) {
      return Number(a.orden) - Number(b.orden);
    });
  }

  function limpiarTexto(valor) {
    return String(valor || "").trim();
  }

  function parametrosListado(estado) {
    var parametros = {
      limit: estado.limite,
      offset: estado.offset
    };
    var titulo = limpiarTexto(estado.titulo);
    if (titulo !== "") {
      parametros.titulo = titulo;
    }
    return parametros;
  }

  function decidirVista(cantidad, estado) {
    if (cantidad > 0) {
      return "tabla";
    }
    if (estado.offset > 0) {
      return "fin";
    }
    if (limpiarTexto(estado.titulo) !== "") {
      return "sin-resultados";
    }
    return "vacia";
  }

  function hayMas(cantidad, limite) {
    return limite > 0 && cantidad >= limite;
  }

  var LIMITE = 5;
  var estado = {
    titulo: "",
    offset: 0,
    limite: LIMITE,
    peticion: 0
  };
  var ultimoHayMas = false;
  var detallePeticion = 0;
  var botonDetalleOrigen = null;

  function resolverOrigenDetalle(botonOrigen, doc) {
    if (botonOrigen && typeof botonOrigen.focus === "function") {
      return botonOrigen;
    }
    if (
      doc &&
      doc.activeElement &&
      doc.activeElement !== doc.body &&
      typeof doc.activeElement.focus === "function"
    ) {
      return doc.activeElement;
    }
    return null;
  }

  function enfocarOrigenDetalle(botonOrigen, doc) {
    if (
      botonOrigen &&
      typeof botonOrigen.focus === "function" &&
      doc &&
      doc.body &&
      typeof doc.body.contains === "function" &&
      doc.body.contains(botonOrigen)
    ) {
      botonOrigen.focus();
      return true;
    }
    return false;
  }

  function obtenerElementos() {
    if (typeof document === "undefined") {
      return {};
    }
    return {
      form: document.getElementById("form-catalogo"),
      campoBusqueda: document.getElementById("catalogo-busqueda"),
      btnBuscar: document.getElementById("catalogo-buscar"),
      tabla: document.getElementById("tabla-catalogo"),
      tbody: document.querySelector("#tabla-catalogo tbody"),
      mensajeCargando: document.getElementById("mensaje-catalogo-cargando"),
      mensajeError: document.getElementById("mensaje-catalogo-error"),
      mensajeVacia: document.getElementById("mensaje-catalogo-vacia"),
      mensajeSinResultados: document.getElementById("mensaje-catalogo-sin-resultados"),
      paginaSalida: document.getElementById("catalogo-pagina"),
      btnAnterior: document.getElementById("catalogo-anterior"),
      btnSiguiente: document.getElementById("catalogo-siguiente"),
      panelDetalle: document.getElementById("catalogo-detalle"),
      tituloDetalle: document.getElementById("catalogo-detalle-titulo"),
      detalleCargando: document.getElementById("mensaje-catalogo-detalle-cargando"),
      detalleError: document.getElementById("mensaje-catalogo-detalle-error"),
      detalleContenido: document.getElementById("catalogo-detalle-contenido"),
      detalleTitulo: document.getElementById("detalle-libro-titulo"),
      detalleIsbn: document.getElementById("detalle-libro-isbn"),
      detallePrecio: document.getElementById("detalle-libro-precio"),
      detalleStock: document.getElementById("detalle-libro-stock"),
      detalleEditorial: document.getElementById("detalle-libro-editorial"),
      detalleGenero: document.getElementById("detalle-libro-genero"),
      detalleAutoresTabla: document.getElementById("tabla-detalle-autores"),
      detalleAutoresBody: document.querySelector("#tabla-detalle-autores tbody"),
      detalleSinAutores: document.getElementById("mensaje-detalle-sin-autores"),
      btnCerrarDetalle: document.getElementById("catalogo-detalle-cerrar")
    };
  }

  function ocultarMensajesListado(els) {
    if (els.mensajeCargando) { els.mensajeCargando.hidden = true; }
    if (els.mensajeError) { els.mensajeError.hidden = true; }
    if (els.mensajeVacia) { els.mensajeVacia.hidden = true; }
    if (els.mensajeSinResultados) { els.mensajeSinResultados.hidden = true; }
  }

  function actualizarPaginacion(els, cargando) {
    var paginaActual = Math.floor(estado.offset / estado.limite) + 1;
    if (els.paginaSalida) {
      els.paginaSalida.textContent = "Página " + paginaActual;
    }
    if (els.btnBuscar) {
      els.btnBuscar.disabled = cargando;
    }
    if (els.btnAnterior) {
      els.btnAnterior.disabled = cargando || estado.offset <= 0;
    }
    if (els.btnSiguiente) {
      els.btnSiguiente.disabled = cargando || !ultimoHayMas;
    }
  }

  function aplicarResultadoListado(els, lista, consulta) {
    var vista = decidirVista(lista.length, consulta);
    ocultarMensajesListado(els);

    if (vista === "fin") {
      ultimoHayMas = false;
      return;
    }

    estado.offset = consulta.offset;
    if (vista === "tabla") {
      renderizarTabla(els.tbody, lista);
      els.tabla.hidden = false;
      ultimoHayMas = hayMas(lista.length, estado.limite);
      return;
    }

    els.tbody.textContent = "";
    els.tabla.hidden = true;
    ultimoHayMas = false;
    if (vista === "sin-resultados" && els.mensajeSinResultados) {
      els.mensajeSinResultados.hidden = false;
    } else if (els.mensajeVacia) {
      els.mensajeVacia.hidden = false;
    }
  }

  async function cargarCatalogo(offsetObjetivo) {
    var els = obtenerElementos();
    if (!els.tabla || !els.tbody) {
      return;
    }
    if (offsetObjetivo === undefined) {
      offsetObjetivo = estado.offset;
    }

    estado.peticion += 1;
    var numeroPeticion = estado.peticion;
    var consulta = {
      titulo: estado.titulo,
      limite: estado.limite,
      offset: offsetObjetivo
    };

    ocultarMensajesListado(els);
    if (els.mensajeCargando) {
      els.mensajeCargando.hidden = false;
    }
    actualizarPaginacion(els, true);

    try {
      var libros = await Api.get("/libros/", parametrosListado(consulta));
      if (numeroPeticion !== estado.peticion) {
        return;
      }
      aplicarResultadoListado(els, Array.isArray(libros) ? libros : [], consulta);
    } catch (error) {
      if (numeroPeticion !== estado.peticion) {
        return;
      }
      ocultarMensajesListado(els);
      els.tabla.hidden = true;
      ultimoHayMas = false;
      if (els.mensajeError) {
        els.mensajeError.textContent =
          error && error.message ? error.message : "No se pudo cargar el catálogo.";
        els.mensajeError.hidden = false;
      }
    } finally {
      if (numeroPeticion === estado.peticion) {
        if (els.mensajeCargando) {
          els.mensajeCargando.hidden = true;
        }
        actualizarPaginacion(els, false);
      }
    }
  }

  function nombreEditorial(libro) {
    return libro && libro.editorial && libro.editorial.nombre
      ? String(libro.editorial.nombre)
      : "";
  }

  function crearCelda(texto) {
    var td = document.createElement("td");
    td.textContent = texto;
    return td;
  }

  function renderizarTabla(tbody, libros) {
    tbody.textContent = "";
    libros.forEach(function (libro) {
      var tr = document.createElement("tr");
      var tituloLibro = libro.titulo || "";

      tr.appendChild(crearCelda(tituloLibro));
      tr.appendChild(crearCelda(libro.isbn || ""));
      tr.appendChild(crearCelda(formatearPrecio(libro.precio)));
      tr.appendChild(crearCelda(nombreEditorial(libro)));
      tr.appendChild(crearCelda(textoGenero(libro)));

      var celdaAccion = document.createElement("td");
      var botonDetalle = document.createElement("button");
      botonDetalle.type = "button";
      botonDetalle.className = "btn";
      botonDetalle.textContent = "Ver detalle";
      botonDetalle.setAttribute("aria-label", "Ver detalle de " + tituloLibro);
      botonDetalle.addEventListener("click", function () {
        cargarDetalleLibro(libro.id, botonDetalle);
      });
      celdaAccion.appendChild(botonDetalle);
      tr.appendChild(celdaAccion);

      tbody.appendChild(tr);
    });
  }

  function renderizarDetalleLibro(els, libro) {
    if (els.detalleTitulo) { els.detalleTitulo.textContent = libro.titulo || ""; }
    if (els.detalleIsbn) { els.detalleIsbn.textContent = libro.isbn || ""; }
    if (els.detallePrecio) { els.detallePrecio.textContent = formatearPrecio(libro.precio); }
    if (els.detalleStock) {
      els.detalleStock.textContent =
        libro.stock !== undefined && libro.stock !== null ? String(libro.stock) : "";
    }
    if (els.detalleEditorial) { els.detalleEditorial.textContent = nombreEditorial(libro); }
    if (els.detalleGenero) { els.detalleGenero.textContent = textoGenero(libro); }

    if (els.detalleAutoresBody) {
      var autorias = autoriasOrdenadas(libro.autores);
      els.detalleAutoresBody.textContent = "";
      autorias.forEach(function (autoria) {
        var tr = document.createElement("tr");
        var autorNombre =
          autoria && autoria.autor && autoria.autor.nombre ? autoria.autor.nombre : "";
        var ordenTexto =
          autoria && autoria.orden !== undefined && autoria.orden !== null
            ? String(autoria.orden)
            : "";

        tr.appendChild(crearCelda(autorNombre));
        tr.appendChild(crearCelda(autoria && autoria.rol ? autoria.rol : ""));
        tr.appendChild(crearCelda(ordenTexto));
        els.detalleAutoresBody.appendChild(tr);
      });

      var sinAutorias = autorias.length === 0;
      if (els.detalleAutoresTabla) { els.detalleAutoresTabla.hidden = sinAutorias; }
      if (els.detalleSinAutores) { els.detalleSinAutores.hidden = !sinAutorias; }
    }

    if (els.detalleContenido) {
      els.detalleContenido.hidden = false;
    }
  }

  async function cargarDetalleLibro(id, botonOrigen) {
    var els = obtenerElementos();
    if (!els.panelDetalle) {
      return;
    }

    detallePeticion += 1;
    var numeroDetalle = detallePeticion;
    botonDetalleOrigen = resolverOrigenDetalle(
      botonOrigen,
      typeof document !== "undefined" ? document : null
    );

    els.panelDetalle.hidden = false;
    if (els.detalleCargando) { els.detalleCargando.hidden = false; }
    if (els.detalleError) { els.detalleError.hidden = true; }
    if (els.detalleContenido) { els.detalleContenido.hidden = true; }
    if (els.tituloDetalle) { els.tituloDetalle.focus(); }

    try {
      var libro = await Api.get("/libros/" + encodeURIComponent(id));
      if (numeroDetalle !== detallePeticion) {
        return;
      }
      renderizarDetalleLibro(els, libro || {});
    } catch (error) {
      if (numeroDetalle !== detallePeticion) {
        return;
      }
      if (els.detalleContenido) { els.detalleContenido.hidden = true; }
      if (els.detalleError) {
        els.detalleError.textContent =
          error && error.message ? error.message : "No se pudo cargar el detalle del libro.";
        els.detalleError.hidden = false;
      }
    } finally {
      if (numeroDetalle === detallePeticion && els.detalleCargando) {
        els.detalleCargando.hidden = true;
      }
    }
  }

  function cerrarDetalle() {
    var els = obtenerElementos();
    detallePeticion += 1;
    if (els.panelDetalle) { els.panelDetalle.hidden = true; }
    if (els.detalleCargando) { els.detalleCargando.hidden = true; }
    if (els.detalleError) { els.detalleError.hidden = true; }
    if (els.detalleContenido) { els.detalleContenido.hidden = true; }

    enfocarOrigenDetalle(
      botonDetalleOrigen,
      typeof document !== "undefined" ? document : null
    );
    botonDetalleOrigen = null;
  }

  function conectarEventos() {
    var els = obtenerElementos();
    if (els.form) {
      els.form.addEventListener("submit", function (event) {
        event.preventDefault();
        estado.titulo = els.campoBusqueda ? els.campoBusqueda.value : "";
        estado.offset = 0;
        cargarCatalogo(0);
      });
    }
    if (els.btnAnterior) {
      els.btnAnterior.addEventListener("click", function () {
        if (estado.offset > 0) {
          cargarCatalogo(Math.max(0, estado.offset - estado.limite));
        }
      });
    }
    if (els.btnSiguiente) {
      els.btnSiguiente.addEventListener("click", function () {
        cargarCatalogo(estado.offset + estado.limite);
      });
    }
    if (els.btnCerrarDetalle) {
      els.btnCerrarDetalle.addEventListener("click", function () {
        cerrarDetalle();
      });
    }
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
      conectarEventos();
      cargarCatalogo(0);
    });
  }

  if (typeof window !== "undefined") {
    // Expuestas para C-04 (refresco tras un alta) y C-06 (apertura desde el estante).
    window.renderCatalogo = function () {
      return cargarCatalogo(estado.offset);
    };
    window.mostrarDetalleLibro = function (id, botonOrigen) {
      return cargarDetalleLibro(id, botonOrigen);
    };
  }

  // Exportación condicional solo para tests unitarios con `node --test`;
  // en el navegador `module` no existe y este archivo sigue siendo un script clásico.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      textoGenero: textoGenero,
      formatearPrecio: formatearPrecio,
      autoriasOrdenadas: autoriasOrdenadas,
      parametrosListado: parametrosListado,
      decidirVista: decidirVista,
      hayMas: hayMas,
      resolverOrigenDetalle: resolverOrigenDetalle,
      enfocarOrigenDetalle: enfocarOrigenDetalle,
      cerrarDetalle: cerrarDetalle
    };
  }
})();
