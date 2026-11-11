(function () {
  "use strict";

  var textoOriginalErrorLibro = "";
  var textoOriginalErrorCliente = "";

  function buscarPorId(lista, id) {
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === id) {
        return lista[i];
      }
    }
    return null;
  }

  function nombreEditorial(editorialId) {
    var editorial = buscarPorId(DATOS.editoriales, editorialId);
    return editorial ? editorial.nombre : "";
  }

  function nombreGenero(generoId) {
    if (generoId === null || generoId === undefined) {
      return "Sin clasificar";
    }
    var genero = buscarPorId(DATOS.generos, generoId);
    return genero ? genero.nombre : "Sin clasificar";
  }

  function nombresAutores(autorIds) {
    var nombres = [];
    (autorIds || []).forEach(function (autorId) {
      var autor = buscarPorId(DATOS.autores, autorId);
      if (autor) {
        nombres.push(autor.nombre);
      }
    });
    return nombres.join(", ");
  }

  function formatearPrecio(precio) {
    return Number(precio).toFixed(2);
  }

  function crearCelda(texto) {
    var td = document.createElement("td");
    td.textContent = texto;
    return td;
  }

  function crearFila(valores) {
    var tr = document.createElement("tr");
    valores.forEach(function (valor) {
      tr.appendChild(crearCelda(valor));
    });
    return tr;
  }

  function generarSlug(texto) {
    return String(texto)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function slugUnico(lista, texto) {
    var base = generarSlug(texto) || "registro";
    var candidato = base;
    var sufijo = 2;
    var existe = true;
    while (existe) {
      existe = false;
      for (var i = 0; i < lista.length; i++) {
        if (lista[i].id === candidato) {
          existe = true;
          break;
        }
      }
      if (existe) {
        candidato = base + "-" + sufijo;
        sufijo++;
      }
    }
    return candidato;
  }

  function normalizarISBN(valor) {
    return String(valor).replace(/[\s-]/g, "");
  }

  function normalizarEmail(valor) {
    return String(valor).trim().toLowerCase();
  }

  function emailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  }

  function validarLibro(libro) {
    if (libro.titulo === "") {
      return "El título es obligatorio.";
    }
    if (libro.isbn === "") {
      return "El ISBN es obligatorio.";
    }
    var isbnNormalizado = normalizarISBN(libro.isbn);
    for (var i = 0; i < DATOS.libros.length; i++) {
      if (normalizarISBN(DATOS.libros[i].isbn) === isbnNormalizado) {
        return "Ya existe un libro con ese ISBN.";
      }
    }
    if (!isFinite(libro.precio) || libro.precio <= 0) {
      return "El precio debe ser un número mayor que cero.";
    }
    if (!buscarPorId(DATOS.editoriales, libro.editorialId)) {
      return "La editorial seleccionada no existe.";
    }
    if (libro.autorIds.length === 0) {
      return "Seleccioná al menos un autor.";
    }
    for (var j = 0; j < libro.autorIds.length; j++) {
      if (!buscarPorId(DATOS.autores, libro.autorIds[j])) {
        return "Alguno de los autores seleccionados no existe.";
      }
    }
    if (libro.generoId !== null && !buscarPorId(DATOS.generos, libro.generoId)) {
      return "El género seleccionado no existe.";
    }
    return "";
  }

  function validarCliente(cliente) {
    if (cliente.nombre === "") {
      return "El nombre es obligatorio.";
    }
    if (cliente.email === "") {
      return "El email es obligatorio.";
    }
    if (!emailValido(cliente.email)) {
      return "El email no tiene un formato válido.";
    }
    var emailNormalizado = normalizarEmail(cliente.email);
    for (var i = 0; i < DATOS.clientes.length; i++) {
      if (normalizarEmail(DATOS.clientes[i].email) === emailNormalizado) {
        return "Ya existe un cliente con ese email.";
      }
    }
    return "";
  }

  function renderTablaLibros() {
    var tabla = document.getElementById("tabla-libros");
    var tbody = document.querySelector("#tabla-libros tbody");
    var mensajeVacia = document.getElementById("mensaje-libros-vacia");
    if (!tabla || !tbody || !mensajeVacia) {
      return;
    }
    tbody.textContent = "";
    DATOS.libros.forEach(function (libro) {
      tbody.appendChild(
        crearFila([
          libro.titulo,
          libro.isbn,
          nombreEditorial(libro.editorialId),
          nombreGenero(libro.generoId),
          nombresAutores(libro.autorIds),
          formatearPrecio(libro.precio)
        ])
      );
    });
    var tieneLibros = DATOS.libros.length > 0;
    tabla.hidden = !tieneLibros;
    mensajeVacia.hidden = tieneLibros;
  }

  function renderTablaClientes() {
    var tabla = document.getElementById("tabla-clientes");
    var tbody = document.querySelector("#tabla-clientes tbody");
    var mensajeVacia = document.getElementById("mensaje-clientes-vacia");
    if (!tabla || !tbody || !mensajeVacia) {
      return;
    }
    tbody.textContent = "";
    DATOS.clientes.forEach(function (cliente) {
      tbody.appendChild(crearFila([cliente.nombre, cliente.email]));
    });
    var tieneClientes = DATOS.clientes.length > 0;
    tabla.hidden = !tieneClientes;
    mensajeVacia.hidden = tieneClientes;
  }

  function agregarOpcion(select, valor, texto) {
    if (!select) {
      return;
    }
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].value === String(valor)) {
        return;
      }
    }
    var option = document.createElement("option");
    option.value = valor;
    option.textContent = texto;
    select.appendChild(option);
  }

  // los selects de venta los arma js/ventas.js (Ej. 5)
  function actualizarVenta() {
    if (typeof window.actualizarSelectsVenta === "function") {
      window.actualizarSelectsVenta();
    }
  }

  function poblarSelect(select, items) {
    if (!select) {
      return;
    }
    select.textContent = "";
    items.forEach(function (item) {
      agregarOpcion(select, item.id, item.nombre);
    });
  }

  function poblarSelects() {
    poblarSelect(document.getElementById("libro-editorial"), DATOS.editoriales);
    var genero = document.getElementById("libro-genero");
    poblarSelect(genero, DATOS.generos);
    agregarOpcion(genero, "sin-clasificar", "Sin clasificar");
    poblarSelect(document.getElementById("libro-autores"), DATOS.autores);
  }

  // Ejercicio 6: guarda en localStorage si js/persistencia.js está cargado.
  function persistir() {
    if (typeof window.guardarDatos === "function") {
      window.guardarDatos();
    }
  }

  function mostrarMensaje(mensajeError, mensajeOk, detalle, textoOriginalError) {
    if (detalle !== "") {
      if (mensajeError) {
        mensajeError.textContent = detalle;
        mensajeError.hidden = false;
      }
      if (mensajeOk) {
        mensajeOk.hidden = true;
      }
      return;
    }
    if (mensajeError) {
      mensajeError.textContent = textoOriginalError;
      mensajeError.hidden = true;
    }
    if (mensajeOk) {
      mensajeOk.hidden = false;
    }
  }

  function manejarAltaLibro(event) {
    event.preventDefault();
    var form = document.getElementById("form-libro");
    var tituloInput = document.getElementById("libro-titulo");
    var isbnInput = document.getElementById("libro-isbn");
    var precioInput = document.getElementById("libro-precio");
    var editorialSelect = document.getElementById("libro-editorial");
    var generoSelect = document.getElementById("libro-genero");
    var autoresSelect = document.getElementById("libro-autores");
    var mensajeError = document.getElementById("mensaje-error-libro");
    var mensajeOk = document.getElementById("mensaje-ok-libro");
    if (
      !form ||
      !tituloInput ||
      !isbnInput ||
      !precioInput ||
      !editorialSelect ||
      !generoSelect ||
      !autoresSelect
    ) {
      return;
    }
    var titulo = tituloInput.value.trim();
    var isbn = isbnInput.value.trim();
    var generoValor = generoSelect.value;
    var autorIds = [];
    for (var i = 0; i < autoresSelect.options.length; i++) {
      if (autoresSelect.options[i].selected) {
        autorIds.push(autoresSelect.options[i].value);
      }
    }
    var libro = {
      titulo: titulo,
      isbn: isbn,
      precio: Number(precioInput.value),
      editorialId: editorialSelect.value,
      generoId: generoValor === "sin-clasificar" ? null : generoValor,
      autorIds: autorIds
    };
    var detalle = validarLibro(libro);
    if (detalle !== "") {
      mostrarMensaje(mensajeError, mensajeOk, detalle, textoOriginalErrorLibro);
      return;
    }
    libro.id = slugUnico(DATOS.libros, titulo);
    DATOS.libros.push(libro);
    persistir();
    renderTablaLibros();
    var filtro = document.getElementById("catalogo-busqueda");
    if (typeof window.renderCatalogo === "function") {
      window.renderCatalogo(filtro ? filtro.value : "");
    }
    actualizarVenta();
    form.reset();
    mostrarMensaje(mensajeError, mensajeOk, "", textoOriginalErrorLibro);
  }

  function manejarAltaCliente(event) {
    event.preventDefault();
    var form = document.getElementById("form-cliente");
    var nombreInput = document.getElementById("cliente-nombre");
    var emailInput = document.getElementById("cliente-email");
    var mensajeError = document.getElementById("mensaje-error-cliente");
    var mensajeOk = document.getElementById("mensaje-ok-cliente");
    if (!form || !nombreInput || !emailInput) {
      return;
    }
    var cliente = {
      nombre: nombreInput.value.trim(),
      email: emailInput.value.trim()
    };
    var detalle = validarCliente(cliente);
    if (detalle !== "") {
      mostrarMensaje(mensajeError, mensajeOk, detalle, textoOriginalErrorCliente);
      return;
    }
    cliente.id = slugUnico(DATOS.clientes, cliente.nombre);
    DATOS.clientes.push(cliente);
    persistir();
    renderTablaClientes();
    actualizarVenta();
    form.reset();
    mostrarMensaje(mensajeError, mensajeOk, "", textoOriginalErrorCliente);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var mensajeErrorLibro = document.getElementById("mensaje-error-libro");
    var mensajeErrorCliente = document.getElementById("mensaje-error-cliente");
    if (mensajeErrorLibro) {
      textoOriginalErrorLibro = mensajeErrorLibro.textContent;
    }
    if (mensajeErrorCliente) {
      textoOriginalErrorCliente = mensajeErrorCliente.textContent;
    }
    poblarSelects();
    renderTablaLibros();
    renderTablaClientes();
    var formLibro = document.getElementById("form-libro");
    var formCliente = document.getElementById("form-cliente");
    if (formLibro) {
      formLibro.addEventListener("submit", manejarAltaLibro);
    }
    if (formCliente) {
      formCliente.addEventListener("submit", manejarAltaCliente);
    }
  });
})();
