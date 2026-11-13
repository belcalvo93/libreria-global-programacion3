/* ==========================================================================
   Librería Página Viva — Ventas e historial desde la API (Global, Ejercicio 3)
   - Cliente por ID (GET /clientes/{id}) y libros del catálogo (GET /libros/).
   - El borrador de la venta vive solo en memoria (sin localStorage).
   - POST /ventas/ con cliente_id y renglones [{libro_id, cantidad}], nada más.
   - Los importes que se muestran salen siempre de la respuesta de la API:
     el front nunca calcula subtotales ni totales (precio histórico, D-08).
   - Historial con GET /ventas/?limit&offset y detalle con GET /ventas/{id}.
   - G-05: cambio de precio con PATCH /libros/{id} enviando solo {precio}.
   Inserción solo como texto (textContent, nunca como HTML).
   ========================================================================== */
(function () {
  "use strict";

  var LIMITE_HISTORIAL = 10;
  var LIMITE_LIBROS = 100; // máximo que acepta la API por página
  var MAX_PAGINAS_LIBROS = 20;

  // ---------- Funciones puras (se testean con node --test) ----------

  // Solo enteros mayores que cero escritos como dígitos: 0, -1, 1.5 y "" no pasan.
  function enteroPositivo(texto) {
    var limpio = String(texto === undefined || texto === null ? "" : texto).trim();
    return /^\d+$/.test(limpio) && Number(limpio) > 0;
  }

  // Devuelve el número de la fila (1, 2, ...) que ya tiene ese libro, o 0.
  function renglonConLibro(renglones, libroId, indiceIgnorado) {
    for (var i = 0; i < renglones.length; i++) {
      if (i !== indiceIgnorado && String(renglones[i].libroId) === String(libroId)) {
        return i + 1;
      }
    }
    return 0;
  }

  // Reglas del Ej. 3 antes de enviar: cliente, al menos un libro, cantidades
  // enteras positivas y una fila por libro. Devuelve "" si el borrador está bien.
  function validarBorrador(clienteTexto, renglones) {
    if (!enteroPositivo(clienteTexto)) {
      return "Ingresá el ID del cliente (un número entero mayor que cero).";
    }
    if (!Array.isArray(renglones) || renglones.length === 0) {
      return "Agregá al menos un libro.";
    }
    for (var i = 0; i < renglones.length; i++) {
      var numero = i + 1;
      if (!enteroPositivo(renglones[i].libroId)) {
        return "Elegí el libro " + numero + ".";
      }
      if (!enteroPositivo(renglones[i].cantidad)) {
        return "La cantidad del libro " + numero + " tiene que ser un número entero mayor que cero.";
      }
      var repetido = renglonConLibro(renglones, renglones[i].libroId, i);
      if (repetido > 0 && repetido < numero) {
        return "El libro " + numero + " ya está en la fila " + repetido +
          ". Un mismo libro no puede aparecer en dos filas.";
      }
    }
    return "";
  }

  // Cuerpo exacto de POST /ventas/: ni precios, ni total, ni fecha (extra="forbid").
  function cuerpoVenta(clienteTexto, renglones) {
    return {
      cliente_id: Number(String(clienteTexto).trim()),
      renglones: renglones.map(function (renglon) {
        return {
          libro_id: Number(renglon.libroId),
          cantidad: Number(String(renglon.cantidad).trim())
        };
      })
    };
  }

  // Los Decimal de la API llegan como texto ("1500.00"): solo se formatean, no se recalculan.
  function formatearImporte(valor) {
    if (valor === null || valor === undefined || valor === "") {
      return "";
    }
    var numero = Api.numero(valor);
    return Number.isFinite(numero) ? numero.toFixed(2) : "";
  }

  function dosDigitos(numero) {
    return String(numero).padStart(2, "0");
  }

  // ISO 8601 de la API -> "dd/mm/aaaa hh:mm" en la hora local del navegador.
  function formatearFecha(iso) {
    var fecha = new Date(iso);
    if (!iso || Number.isNaN(fecha.getTime())) {
      return "";
    }
    return dosDigitos(fecha.getDate()) + "/" + dosDigitos(fecha.getMonth() + 1) + "/" +
      fecha.getFullYear() + " " + dosDigitos(fecha.getHours()) + ":" + dosDigitos(fecha.getMinutes());
  }

  function textoCliente(cliente) {
    if (!cliente) {
      return "";
    }
    return cliente.email ? cliente.nombre + " (" + cliente.email + ")" : String(cliente.nombre);
  }

  // La API no devuelve el total del listado: si llegó una página llena, puede haber más.
  function hayMas(cantidad, limite) {
    return limite > 0 && cantidad >= limite;
  }

  // Precio > 0, hasta 8 enteros y 2 decimales (Numeric(10, 2) en la base).
  function validarPrecio(texto) {
    var limpio = String(texto === undefined || texto === null ? "" : texto).trim().replace(",", ".");
    if (!/^\d{1,8}(\.\d{1,2})?$/.test(limpio) || Number(limpio) <= 0) {
      return "";
    }
    return limpio;
  }

  // Nombre accesible del botón de quitar (no hay texto visible).
  function textoQuitar(numero) {
    return "Quitar libro " + numero;
  }

  function textoOpcionLibro(libro) {
    return libro.titulo + " — $" + formatearImporte(libro.precio) + " (stock " + libro.stock + ")";
  }

  // ---------- Estado en memoria ----------

  var libros = [];
  // Cada fila (libro): { libroId: "3", cantidad: "2" }. Se guardan como texto tal cual
  // los escribe la persona y se validan al confirmar.
  var renglones = [];
  var nodosRenglones = [];
  var enviando = false;
  var clienteBuscado = { id: "", peticion: 0 };
  var historial = { offset: 0, peticion: 0, ultimoHayMas: false };
  var detalle = { id: null, peticion: 0, botonOrigen: null };

  function el(id) {
    return document.getElementById(id);
  }

  function mostrarMensaje(id, texto) {
    var nodo = el(id);
    if (!nodo) {
      return;
    }
    nodo.textContent = texto || "";
    nodo.hidden = !texto;
  }

  function crearCelda(texto) {
    var td = document.createElement("td");
    td.textContent = texto;
    return td;
  }

  function crearOpcion(valor, texto) {
    var option = document.createElement("option");
    option.value = valor;
    option.textContent = texto;
    return option;
  }

  function llenarTablaRenglones(tbody, renglonesVenta) {
    tbody.textContent = "";
    (renglonesVenta || []).forEach(function (renglon) {
      var tr = document.createElement("tr");
      tr.appendChild(crearCelda(renglon.titulo));
      tr.appendChild(crearCelda(String(renglon.cantidad)));
      tr.appendChild(crearCelda(formatearImporte(renglon.precio_unitario)));
      tr.appendChild(crearCelda(formatearImporte(renglon.subtotal)));
      tbody.appendChild(tr);
    });
  }

  // ---------- Libros del catálogo (selectores de la venta y del precio) ----------

  async function pedirTodosLosLibros() {
    var todos = [];
    for (var pagina = 0; pagina < MAX_PAGINAS_LIBROS; pagina++) {
      var lote = await Api.get("/libros/", { limit: LIMITE_LIBROS, offset: pagina * LIMITE_LIBROS });
      todos = todos.concat(lote || []);
      if (!hayMas((lote || []).length, LIMITE_LIBROS)) {
        break;
      }
    }
    return todos;
  }

  function libroPorId(id) {
    for (var i = 0; i < libros.length; i++) {
      if (String(libros[i].id) === String(id)) {
        return libros[i];
      }
    }
    return null;
  }

  function poblarSelectPrecio() {
    var select = el("precio-libro");
    if (!select) {
      return;
    }
    var elegido = select.value;
    select.textContent = "";
    select.appendChild(crearOpcion("", "Elegí un libro"));
    libros.forEach(function (libro) {
      select.appendChild(crearOpcion(String(libro.id), textoOpcionLibro(libro)));
    });
    select.value = libroPorId(elegido) ? elegido : "";
  }

  async function cargarLibros() {
    mostrarMensaje("mensaje-venta-libros", "Cargando libros del catálogo...");
    try {
      libros = await pedirTodosLosLibros();
      mostrarMensaje("mensaje-venta-libros", libros.length === 0 ? "No hay libros en el catálogo para vender." : "");
    } catch (error) {
      libros = [];
      mostrarMensaje("mensaje-venta-libros", "");
      mostrarMensaje("mensaje-error-venta", "No se pudieron cargar los libros: " + error.message);
    }
    renderRenglones();
    poblarSelectPrecio();
  }

  // ---------- Cliente por ID ----------

  function nombreCliente(texto) {
    var salida = el("venta-cliente-nombre");
    if (salida) {
      salida.textContent = texto;
    }
  }

  async function buscarCliente() {
    var campo = el("venta-cliente-id");
    if (!campo) {
      return;
    }
    var texto = campo.value.trim();
    if (!enteroPositivo(texto)) {
      nombreCliente("Sin buscar");
      mostrarMensaje("mensaje-error-venta", "Ingresá el ID del cliente (un número entero mayor que cero).");
      return;
    }
    var peticion = ++clienteBuscado.peticion;
    nombreCliente("Buscando...");
    try {
      var cliente = await Api.get("/clientes/" + Number(texto));
      if (peticion !== clienteBuscado.peticion) {
        return;
      }
      clienteBuscado.id = texto;
      nombreCliente(textoCliente(cliente));
      mostrarMensaje("mensaje-error-venta", "");
    } catch (error) {
      if (peticion !== clienteBuscado.peticion) {
        return;
      }
      clienteBuscado.id = "";
      // 404 «El cliente no existe»: se avisa, pero no se bloquea la venta; si se
      // confirma igual, la API responde 409 y el borrador se conserva (G-06).
      nombreCliente(error.status === 404 ? "No existe un cliente con ese ID" : "No se pudo buscar el cliente");
      mostrarMensaje("mensaje-error-venta", error.message);
    }
  }

  // ---------- Libros (filas) del borrador ----------

  function crearRenglon(indice) {
    var numero = indice + 1;
    var renglon = renglones[indice];
    var grupo = document.createElement("div");
    grupo.className = "form__grupo venta-fila";

    var labelLibro = document.createElement("label");
    labelLibro.htmlFor = "venta-libro-" + numero;
    labelLibro.textContent = "Libro " + numero;
    var select = document.createElement("select");
    select.id = "venta-libro-" + numero;
    select.name = select.id;
    select.appendChild(crearOpcion("", "Elegí un libro"));
    libros.forEach(function (libro) {
      // value = id del libro (no el ISBN): es lo que espera POST /ventas/ (I-17)
      select.appendChild(crearOpcion(String(libro.id), textoOpcionLibro(libro)));
    });
    select.value = libroPorId(renglon.libroId) ? String(renglon.libroId) : "";
    select.addEventListener("change", function () {
      var repetido = renglonConLibro(renglones, select.value, indice);
      if (select.value !== "" && repetido > 0) {
        mostrarMensaje("mensaje-error-venta", "Ese libro ya está en la fila " + repetido +
          ". Cambiá la cantidad de esa fila en lugar de repetirlo.");
        select.value = renglon.libroId;
        return;
      }
      renglon.libroId = select.value;
      precio.output.textContent = textoPrecioCatalogo(renglon.libroId);
      mostrarMensaje("mensaje-error-venta", "");
    });

    var labelCantidad = document.createElement("label");
    labelCantidad.htmlFor = "venta-cantidad-" + numero;
    labelCantidad.textContent = "Cantidad del libro " + numero;
    var cantidad = document.createElement("input");
    cantidad.type = "number";
    cantidad.id = "venta-cantidad-" + numero;
    cantidad.name = cantidad.id;
    cantidad.min = "1";
    cantidad.step = "1";
    cantidad.inputMode = "numeric";
    cantidad.value = renglon.cantidad;
    cantidad.addEventListener("input", function () {
      renglon.cantidad = cantidad.value;
      mostrarMensaje("mensaje-error-venta", "");
    });

    // Precio de lista del catálogo, solo como referencia: los importes de la venta
    // los define la API al confirmarla.
    var precio = { p: document.createElement("p"), output: document.createElement("output") };
    precio.output.id = "venta-precio-" + numero;
    precio.output.setAttribute("for", select.id);
    precio.output.textContent = textoPrecioCatalogo(renglon.libroId);
    precio.p.className = "venta-fila__precio";
    var etiquetaPrecio = document.createElement("span");
    etiquetaPrecio.className = "venta-fila__etiqueta";
    etiquetaPrecio.textContent = "Precio";
    precio.p.appendChild(etiquetaPrecio);
    precio.p.appendChild(precio.output);

    var quitar = document.createElement("button");
    quitar.type = "button";
    quitar.id = "venta-quitar-" + numero;
    quitar.className = "btn btn--quitar";
    // Botón de solo ícono: la cruz ✕ la dibuja el CSS; el nombre es aria-label y
    // title muestra el tooltip del navegador.
    quitar.setAttribute("aria-label", textoQuitar(numero));
    quitar.title = "Quitar libro";
    quitar.addEventListener("click", function () {
      quitarRenglon(indice);
    });

    grupo.appendChild(labelLibro);
    grupo.appendChild(select);
    grupo.appendChild(labelCantidad);
    grupo.appendChild(cantidad);
    grupo.appendChild(precio.p);
    grupo.appendChild(quitar);
    return { grupo: grupo, select: select };
  }

  function textoPrecioCatalogo(libroId) {
    var libro = libroPorId(libroId);
    return libro ? formatearImporte(libro.precio) : "—";
  }

  // Las filas van como hijos directos del form, antes de «Agregar otro libro».
  function renderRenglones() {
    var form = el("form-venta");
    var botonAgregar = el("venta-agregar");
    if (!form || !botonAgregar) {
      return;
    }
    nodosRenglones.forEach(function (nodos) {
      if (nodos.grupo.parentNode === form) {
        form.removeChild(nodos.grupo);
      }
    });
    nodosRenglones = renglones.map(function (_renglon, i) {
      var nodos = crearRenglon(i);
      form.insertBefore(nodos.grupo, botonAgregar);
      return nodos;
    });
  }

  function agregarRenglon() {
    renglones.push({ libroId: "", cantidad: "1" });
    mostrarMensaje("mensaje-error-venta", "");
    renderRenglones();
    nodosRenglones[nodosRenglones.length - 1].select.focus();
  }

  function quitarRenglon(indice) {
    renglones.splice(indice, 1);
    mostrarMensaje("mensaje-error-venta", "");
    renderRenglones();
    var botonAgregar = el("venta-agregar");
    if (botonAgregar) {
      botonAgregar.focus();
    }
  }

  function limpiarFormulario() {
    var campo = el("venta-cliente-id");
    if (campo) {
      campo.value = "";
    }
    clienteBuscado.id = "";
    nombreCliente("Sin buscar");
    renglones = [{ libroId: "", cantidad: "1" }];
    renderRenglones();
  }

  // ---------- Confirmar la venta ----------

  function mostrarVentaConfirmada(venta) {
    var articulo = el("venta-confirmada");
    var tbody = document.querySelector("#tabla-venta-confirmada tbody");
    if (!articulo || !tbody) {
      return;
    }
    el("venta-confirmada-id").textContent = String(venta.id);
    el("venta-confirmada-fecha").textContent = formatearFecha(venta.fecha);
    el("venta-confirmada-cliente").textContent = textoCliente(venta.cliente);
    llenarTablaRenglones(tbody, venta.renglones);
    el("venta-confirmada-total").textContent = formatearImporte(venta.total);
    articulo.hidden = false;
  }

  async function manejarConfirmar(event) {
    event.preventDefault();
    if (enviando) {
      return;
    }
    var campo = el("venta-cliente-id");
    var boton = el("venta-confirmar");
    var clienteTexto = campo ? campo.value : "";
    var problema = validarBorrador(clienteTexto, renglones);
    if (problema !== "") {
      mostrarMensaje("mensaje-ok-venta", "");
      mostrarMensaje("mensaje-error-venta", problema);
      return;
    }

    enviando = true;
    if (boton) {
      boton.disabled = true;
      boton.setAttribute("aria-busy", "true");
    }
    mostrarMensaje("mensaje-error-venta", "");
    mostrarMensaje("mensaje-ok-venta", "Enviando la venta...");
    try {
      var venta = await Api.post("/ventas/", cuerpoVenta(clienteTexto, renglones));
      mostrarVentaConfirmada(venta);
      limpiarFormulario();
      mostrarMensaje("mensaje-ok-venta", "Venta " + venta.id + " confirmada. Total: " + formatearImporte(venta.total) + ".");
      await cargarHistorial(historial.offset);
    } catch (error) {
      // 409 (cliente o libro inexistente) y 422 (cuerpo inválido): se muestra el
      // mensaje del servidor y el borrador queda como estaba.
      mostrarMensaje("mensaje-ok-venta", "");
      mostrarMensaje("mensaje-error-venta", error.message);
    } finally {
      enviando = false;
      if (boton) {
        boton.disabled = false;
        boton.removeAttribute("aria-busy");
      }
    }
  }

  // ---------- Historial ----------

  function actualizarPaginacion(cantidad) {
    var pagina = el("historial-pagina");
    var anterior = el("historial-anterior");
    var siguiente = el("historial-siguiente");
    if (pagina) {
      pagina.textContent = "Página " + (Math.floor(historial.offset / LIMITE_HISTORIAL) + 1);
    }
    if (anterior) {
      anterior.disabled = historial.offset === 0;
    }
    if (siguiente) {
      siguiente.disabled = !hayMas(cantidad, LIMITE_HISTORIAL);
    }
  }

  function renderHistorial(ventas) {
    var tabla = el("tabla-historial");
    var tbody = document.querySelector("#tabla-historial tbody");
    if (!tabla || !tbody) {
      return;
    }
    tbody.textContent = "";
    ventas.forEach(function (venta) {
      var tr = document.createElement("tr");
      tr.appendChild(crearCelda(String(venta.id)));
      tr.appendChild(crearCelda(formatearFecha(venta.fecha)));
      tr.appendChild(crearCelda(venta.cliente ? venta.cliente.nombre : ""));
      tr.appendChild(crearCelda(formatearImporte(venta.total)));
      var celda = document.createElement("td");
      var boton = document.createElement("button");
      boton.type = "button";
      boton.className = "btn btn--secundario btn--compacto";
      boton.textContent = "Ver detalle";
      boton.setAttribute("aria-label", "Ver detalle de la venta " + venta.id);
      boton.addEventListener("click", function () {
        cargarDetalle(venta.id, boton);
      });
      celda.appendChild(boton);
      tr.appendChild(celda);
      tbody.appendChild(tr);
    });
    tabla.hidden = ventas.length === 0;
    mostrarMensaje("mensaje-historial-vacia", ventas.length === 0 && historial.offset === 0 ? "No hay ventas registradas." : "");
    mostrarMensaje("mensaje-historial-fin", ventas.length === 0 && historial.offset > 0 ? "No hay más ventas." : "");
  }

  async function cargarHistorial(offset) {
    var peticion = ++historial.peticion;
    historial.offset = Math.max(0, offset);
    mostrarMensaje("mensaje-historial-error", "");
    mostrarMensaje("mensaje-historial-cargando", "Cargando historial...");
    try {
      var ventas = await Api.get("/ventas/", { limit: LIMITE_HISTORIAL, offset: historial.offset });
      if (peticion !== historial.peticion) {
        return;
      }
      ventas = ventas || [];
      renderHistorial(ventas);
      actualizarPaginacion(ventas.length);
    } catch (error) {
      if (peticion !== historial.peticion) {
        return;
      }
      mostrarMensaje("mensaje-historial-error", "No se pudo cargar el historial: " + error.message);
    } finally {
      if (peticion === historial.peticion) {
        mostrarMensaje("mensaje-historial-cargando", "");
      }
    }
  }

  async function cargarDetalle(id, botonOrigen) {
    var articulo = el("historial-detalle");
    var contenido = el("historial-detalle-contenido");
    var tbody = document.querySelector("#tabla-detalle-venta tbody");
    if (!articulo || !contenido || !tbody) {
      return;
    }
    var peticion = ++detalle.peticion;
    detalle.id = id;
    if (botonOrigen) {
      detalle.botonOrigen = botonOrigen;
    }
    articulo.hidden = false;
    contenido.hidden = true;
    mostrarMensaje("mensaje-historial-detalle-error", "");
    mostrarMensaje("mensaje-historial-detalle-cargando", "Cargando detalle de la venta...");
    try {
      var venta = await Api.get("/ventas/" + Number(id));
      if (peticion !== detalle.peticion) {
        return;
      }
      el("detalle-venta-id").textContent = String(venta.id);
      el("detalle-venta-fecha").textContent = formatearFecha(venta.fecha);
      el("detalle-venta-cliente").textContent = textoCliente(venta.cliente);
      llenarTablaRenglones(tbody, venta.renglones);
      el("detalle-venta-total").textContent = formatearImporte(venta.total);
      contenido.hidden = false;
    } catch (error) {
      if (peticion !== detalle.peticion) {
        return;
      }
      mostrarMensaje("mensaje-historial-detalle-error", error.message);
    } finally {
      if (peticion === detalle.peticion) {
        mostrarMensaje("mensaje-historial-detalle-cargando", "");
      }
    }
    if (botonOrigen) {
      var titulo = el("historial-detalle-titulo");
      if (titulo) {
        titulo.focus();
      }
    }
  }

  function cerrarDetalle() {
    var articulo = el("historial-detalle");
    if (articulo) {
      articulo.hidden = true;
    }
    detalle.id = null;
    detalle.peticion++;
    // El foco vuelve al botón que abrió el detalle, si sigue en la página.
    if (detalle.botonOrigen && document.body.contains(detalle.botonOrigen)) {
      detalle.botonOrigen.focus();
    }
    detalle.botonOrigen = null;
  }

  // ---------- G-05: cambiar el precio de un libro ----------

  async function manejarPrecio(event) {
    event.preventDefault();
    var select = el("precio-libro");
    var campo = el("precio-nuevo");
    var boton = el("precio-guardar");
    if (!select || !campo) {
      return;
    }
    mostrarMensaje("mensaje-ok-precio", "");
    if (!enteroPositivo(select.value)) {
      mostrarMensaje("mensaje-error-precio", "Elegí el libro al que le querés cambiar el precio.");
      return;
    }
    var precio = validarPrecio(campo.value);
    if (precio === "") {
      mostrarMensaje("mensaje-error-precio", "El precio tiene que ser mayor que cero, con hasta dos decimales.");
      return;
    }
    mostrarMensaje("mensaje-error-precio", "");
    if (boton) {
      boton.disabled = true;
    }
    try {
      // Solo el precio: el resto del libro (y sus autores) no se toca.
      var libro = await Api.patch("/libros/" + Number(select.value), { precio: Number(precio) });
      campo.value = "";
      mostrarMensaje("mensaje-ok-precio", "Nuevo precio de «" + libro.titulo + "»: " + formatearImporte(libro.precio) +
        ". Las ventas ya registradas conservan sus importes.");
      await cargarLibros();
      select.value = String(libro.id);
      if (typeof window.renderCatalogo === "function") {
        window.renderCatalogo();
      }
      // Si hay una venta abierta en el detalle, se vuelve a pedir a la API para
      // ver que sus importes no cambiaron.
      if (detalle.id !== null) {
        cargarDetalle(detalle.id, null);
      }
    } catch (error) {
      mostrarMensaje("mensaje-error-precio", error.message);
    } finally {
      if (boton) {
        boton.disabled = false;
      }
    }
  }

  // ---------- Arranque ----------

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
      var form = el("form-venta");
      var botonAgregar = el("venta-agregar");
      if (!form || !botonAgregar) {
        return;
      }
      var campoCliente = el("venta-cliente-id");
      var botonBuscar = el("venta-buscar-cliente");
      if (botonBuscar) {
        botonBuscar.addEventListener("click", buscarCliente);
      }
      if (campoCliente) {
        // Enter en el ID busca el cliente en vez de confirmar la venta.
        campoCliente.addEventListener("keydown", function (event) {
          if (event.key === "Enter") {
            event.preventDefault();
            buscarCliente();
          }
        });
        campoCliente.addEventListener("input", function () {
          if (campoCliente.value.trim() !== clienteBuscado.id) {
            clienteBuscado.peticion++;
            nombreCliente("Sin buscar");
          }
        });
      }
      botonAgregar.addEventListener("click", agregarRenglon);
      form.addEventListener("submit", manejarConfirmar);

      var anterior = el("historial-anterior");
      var siguiente = el("historial-siguiente");
      var cerrar = el("historial-detalle-cerrar");
      if (anterior) {
        anterior.addEventListener("click", function () {
          cargarHistorial(historial.offset - LIMITE_HISTORIAL);
        });
      }
      if (siguiente) {
        siguiente.addEventListener("click", function () {
          cargarHistorial(historial.offset + LIMITE_HISTORIAL);
        });
      }
      if (cerrar) {
        cerrar.addEventListener("click", cerrarDetalle);
      }
      var formPrecio = el("form-precio");
      if (formPrecio) {
        formPrecio.addEventListener("submit", manejarPrecio);
      }

      renglones = [{ libroId: "", cantidad: "1" }];
      renderRenglones();
      cargarLibros();
      cargarHistorial(0);
    });

    // Para que un libro dado de alta (C-04) aparezca en los selectores de la venta.
    window.actualizarSelectsVenta = function () {
      return cargarLibros();
    };
  }

  // Exportación condicional solo para tests unitarios con `node --test`;
  // en el navegador `module` no existe y este archivo sigue siendo un script clásico.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      enteroPositivo: enteroPositivo,
      renglonConLibro: renglonConLibro,
      validarBorrador: validarBorrador,
      cuerpoVenta: cuerpoVenta,
      formatearImporte: formatearImporte,
      formatearFecha: formatearFecha,
      textoCliente: textoCliente,
      hayMas: hayMas,
      validarPrecio: validarPrecio,
      textoOpcionLibro: textoOpcionLibro,
      textoQuitar: textoQuitar
    };
  }
})();
