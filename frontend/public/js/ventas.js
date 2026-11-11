(function () {
  "use strict";

  // cantidad queda como texto tal cual lo escribe la persona, se valida al confirmar
  var renglones = [];
  var nodosRenglones = [];
  var textoOriginalErrorVenta = "";

  function buscarPorId(lista, id) {
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === id) {
        return lista[i];
      }
    }
    return null;
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

  function crearOpcion(valor, texto) {
    var option = document.createElement("option");
    option.value = valor;
    option.textContent = texto;
    return option;
  }

  // solo enteros mayores que cero: 0, -1 y 1.5 no pasan
  function cantidadValida(texto) {
    var limpio = String(texto).trim();
    return /^\d+$/.test(limpio) && Number(limpio) > 0;
  }

  function subtotalRenglon(renglon) {
    var libro = buscarPorId(DATOS.libros, renglon.libroId);
    if (!libro || !cantidadValida(renglon.cantidad)) {
      return 0;
    }
    return libro.precio * Number(renglon.cantidad);
  }

  function calcularTotal() {
    var total = 0;
    renglones.forEach(function (renglon) {
      total += subtotalRenglon(renglon);
    });
    return total;
  }

  function libroEnOtroRenglon(libroId, indice) {
    for (var i = 0; i < renglones.length; i++) {
      if (i !== indice && renglones[i].libroId === libroId) {
        return true;
      }
    }
    return false;
  }

  function primerLibroLibre() {
    for (var i = 0; i < DATOS.libros.length; i++) {
      if (!libroEnOtroRenglon(DATOS.libros[i].id, -1)) {
        return DATOS.libros[i].id;
      }
    }
    return null;
  }

  function mostrarError(texto) {
    var mensajeError = document.getElementById("mensaje-error-venta");
    var mensajeOk = document.getElementById("mensaje-ok-venta");
    if (mensajeError) {
      mensajeError.textContent = texto;
      mensajeError.hidden = false;
    }
    if (mensajeOk) {
      mensajeOk.hidden = true;
    }
  }

  function mostrarOk(texto) {
    var mensajeError = document.getElementById("mensaje-error-venta");
    var mensajeOk = document.getElementById("mensaje-ok-venta");
    if (mensajeError) {
      mensajeError.textContent = textoOriginalErrorVenta;
      mensajeError.hidden = true;
    }
    if (mensajeOk) {
      mensajeOk.textContent = texto;
      mensajeOk.hidden = false;
    }
  }

  function ocultarError() {
    var mensajeError = document.getElementById("mensaje-error-venta");
    if (mensajeError) {
      mensajeError.textContent = textoOriginalErrorVenta;
      mensajeError.hidden = true;
    }
  }

  function poblarSelectCliente() {
    var select = document.getElementById("venta-cliente");
    if (!select) {
      return;
    }
    var elegido = select.value;
    select.textContent = "";
    select.appendChild(crearOpcion("", "Elegí un cliente"));
    DATOS.clientes.forEach(function (cliente) {
      select.appendChild(crearOpcion(cliente.id, cliente.nombre));
    });
    select.value = buscarPorId(DATOS.clientes, elegido) ? elegido : "";
  }

  function actualizarImportes() {
    nodosRenglones.forEach(function (nodos, i) {
      var libro = buscarPorId(DATOS.libros, renglones[i].libroId);
      nodos.precio.textContent = formatearPrecio(libro ? libro.precio : 0);
      nodos.subtotal.textContent = formatearPrecio(subtotalRenglon(renglones[i]));
    });
    var total = document.getElementById("venta-total");
    if (total) {
      total.textContent = formatearPrecio(calcularTotal());
    }
  }

  function crearTextoConOutput(texto, id, calculadoDe) {
    var p = document.createElement("p");
    var output = document.createElement("output");
    output.id = id;
    output.setAttribute("for", calculadoDe);
    p.appendChild(document.createTextNode(texto));
    p.appendChild(output);
    return { p: p, output: output };
  }

  function cambiarLibro(indice, select) {
    if (libroEnOtroRenglon(select.value, indice)) {
      mostrarError("Ese libro ya está en otro renglón. Cambiá la cantidad de ese renglón.");
      select.value = renglones[indice].libroId;
      return;
    }
    renglones[indice].libroId = select.value;
    ocultarError();
    actualizarImportes();
  }

  function crearRenglon(indice) {
    var numero = indice + 1;
    var renglon = renglones[indice];
    var grupo = document.createElement("div");
    grupo.className = "form__grupo";

    var labelLibro = document.createElement("label");
    labelLibro.htmlFor = "venta-libro-" + numero;
    labelLibro.textContent = "Libro del renglón " + numero;
    var select = document.createElement("select");
    select.id = "venta-libro-" + numero;
    select.name = select.id;
    DATOS.libros.forEach(function (libro) {
      select.appendChild(crearOpcion(libro.id, libro.titulo));
    });
    select.value = renglon.libroId;
    select.addEventListener("change", function () {
      cambiarLibro(indice, select);
    });

    var labelCantidad = document.createElement("label");
    labelCantidad.htmlFor = "venta-cantidad-" + numero;
    labelCantidad.textContent = "Cantidad del renglón " + numero;
    var cantidad = document.createElement("input");
    cantidad.type = "number";
    cantidad.id = "venta-cantidad-" + numero;
    cantidad.name = cantidad.id;
    cantidad.min = "1";
    cantidad.step = "1";
    cantidad.value = renglon.cantidad;
    cantidad.addEventListener("input", function () {
      renglon.cantidad = cantidad.value;
      ocultarError();
      actualizarImportes();
    });

    var precio = crearTextoConOutput("Precio unitario: ", "venta-precio-" + numero, select.id);
    var subtotal = crearTextoConOutput("Subtotal: ", "venta-subtotal-" + numero, select.id + " " + cantidad.id);

    var quitar = document.createElement("button");
    quitar.type = "button";
    quitar.id = "venta-quitar-" + numero;
    quitar.className = "btn btn--peligro";
    quitar.textContent = "Quitar renglón " + numero;
    quitar.addEventListener("click", function () {
      quitarRenglon(indice);
    });

    grupo.appendChild(labelLibro);
    grupo.appendChild(select);
    grupo.appendChild(labelCantidad);
    grupo.appendChild(cantidad);
    grupo.appendChild(precio.p);
    grupo.appendChild(subtotal.p);
    grupo.appendChild(quitar);
    return { grupo: grupo, select: select, precio: precio.output, subtotal: subtotal.output };
  }

  // los renglones van como hijos directos del form para que el css del ej 2 los tome
  function renderRenglones() {
    var form = document.getElementById("form-venta");
    var botonAgregar = document.getElementById("venta-agregar");
    var total = document.getElementById("venta-total");
    if (!form || !botonAgregar) {
      return;
    }
    nodosRenglones.forEach(function (nodos) {
      form.removeChild(nodos.grupo);
    });
    nodosRenglones = [];
    var idsCampos = [];
    renglones.forEach(function (renglon, i) {
      var nodos = crearRenglon(i);
      form.insertBefore(nodos.grupo, botonAgregar);
      nodosRenglones.push(nodos);
      idsCampos.push("venta-libro-" + (i + 1), "venta-cantidad-" + (i + 1));
    });
    if (total) {
      total.setAttribute("for", idsCampos.join(" "));
    }
    actualizarImportes();
  }

  function agregarRenglon() {
    var libroId = primerLibroLibre();
    if (libroId === null) {
      mostrarError("Ya están todos los libros del catálogo en la venta.");
      return;
    }
    ocultarError();
    renglones.push({ libroId: libroId, cantidad: "1" });
    renderRenglones();
    nodosRenglones[nodosRenglones.length - 1].select.focus();
  }

  function quitarRenglon(indice) {
    renglones.splice(indice, 1);
    ocultarError();
    renderRenglones();
    var botonAgregar = document.getElementById("venta-agregar");
    if (botonAgregar) {
      botonAgregar.focus();
    }
  }

  function validarVenta(clienteId) {
    if (!buscarPorId(DATOS.clientes, clienteId)) {
      return "Elegí un cliente para la venta.";
    }
    if (renglones.length === 0) {
      return "Agregá al menos un renglón.";
    }
    for (var i = 0; i < renglones.length; i++) {
      var numero = i + 1;
      if (!buscarPorId(DATOS.libros, renglones[i].libroId)) {
        return "El libro del renglón " + numero + " no existe.";
      }
      if (!cantidadValida(renglones[i].cantidad)) {
        return "La cantidad del renglón " + numero + " tiene que ser un número entero mayor que cero.";
      }
      if (libroEnOtroRenglon(renglones[i].libroId, i)) {
        return "El libro del renglón " + numero + " está repetido.";
      }
    }
    return "";
  }

  // el id sale de cuantas ventas hay, asi despues de recargar no se repite
  function generarIdVenta() {
    return "V-" + String(DATOS.ventas.length + 1).padStart(3, "0");
  }

  function fechaDeHoy() {
    var hoy = new Date();
    var mes = String(hoy.getMonth() + 1).padStart(2, "0");
    var dia = String(hoy.getDate()).padStart(2, "0");
    return hoy.getFullYear() + "-" + mes + "-" + dia;
  }

  // se copian titulo y precio para que el historial no dependa del catalogo actual
  function armarVenta(cliente) {
    var detalle = renglones.map(function (renglon) {
      var libro = buscarPorId(DATOS.libros, renglon.libroId);
      var cantidad = Number(renglon.cantidad);
      return {
        libroId: libro.id,
        titulo: libro.titulo,
        cantidad: cantidad,
        precioUnitario: libro.precio,
        subtotal: libro.precio * cantidad
      };
    });
    return {
      id: generarIdVenta(),
      fecha: fechaDeHoy(),
      clienteId: cliente.id,
      clienteNombre: cliente.nombre,
      renglones: detalle,
      total: calcularTotal()
    };
  }

  function reiniciarFormulario() {
    var selectCliente = document.getElementById("venta-cliente");
    if (selectCliente) {
      selectCliente.value = "";
    }
    renglones = [];
    if (DATOS.libros.length > 0) {
      renglones.push({ libroId: DATOS.libros[0].id, cantidad: "1" });
    }
    renderRenglones();
  }

  function crearDetalle(venta) {
    var details = document.createElement("details");
    var summary = document.createElement("summary");
    summary.textContent = "Ver detalle de " + venta.id;
    details.appendChild(summary);

    var tabla = document.createElement("table");
    tabla.className = "tabla";
    var thead = document.createElement("thead");
    var filaTitulos = document.createElement("tr");
    ["Libro", "Cantidad", "Precio unitario", "Subtotal"].forEach(function (titulo) {
      var th = document.createElement("th");
      th.scope = "col";
      th.textContent = titulo;
      filaTitulos.appendChild(th);
    });
    thead.appendChild(filaTitulos);
    var tbody = document.createElement("tbody");
    venta.renglones.forEach(function (renglon) {
      tbody.appendChild(
        crearFila([
          renglon.titulo,
          String(renglon.cantidad),
          formatearPrecio(renglon.precioUnitario),
          formatearPrecio(renglon.subtotal)
        ])
      );
    });
    tabla.appendChild(thead);
    tabla.appendChild(tbody);
    var contenedor = document.createElement("div");
    contenedor.className = "tabla-contenedor";
    contenedor.appendChild(tabla);
    details.appendChild(contenedor);
    return details;
  }

  function renderHistorial() {
    var tabla = document.getElementById("tabla-historial");
    var tbody = document.querySelector("#tabla-historial tbody");
    var seccion = document.getElementById("historial");
    var mensajeVacia = document.getElementById("mensaje-historial-vacia");
    if (!tabla || !tbody || !seccion || !mensajeVacia) {
      return;
    }
    tbody.textContent = "";
    // los details van sueltos en la seccion para que tomen el espaciado de .card
    seccion.querySelectorAll(":scope > details").forEach(function (details) {
      seccion.removeChild(details);
    });
    DATOS.ventas.forEach(function (venta) {
      tbody.appendChild(crearFila([venta.id, venta.fecha, venta.clienteNombre, formatearPrecio(venta.total)]));
      seccion.insertBefore(crearDetalle(venta), mensajeVacia);
    });
    var tieneVentas = DATOS.ventas.length > 0;
    tabla.hidden = !tieneVentas;
    mensajeVacia.hidden = tieneVentas;
  }

  function manejarConfirmar(event) {
    event.preventDefault();
    var selectCliente = document.getElementById("venta-cliente");
    if (!selectCliente) {
      return;
    }
    var detalle = validarVenta(selectCliente.value);
    if (detalle !== "") {
      mostrarError(detalle);
      return;
    }
    var venta = armarVenta(buscarPorId(DATOS.clientes, selectCliente.value));
    DATOS.ventas.push(venta);
    if (typeof window.guardarDatos === "function") {
      window.guardarDatos();
    }
    renderHistorial();
    reiniciarFormulario();
    mostrarOk("Venta " + venta.id + " confirmada correctamente.");
  }

  function actualizarSelectsVenta() {
    poblarSelectCliente();
    renderRenglones();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("form-venta");
    var botonAgregar = document.getElementById("venta-agregar");
    var mensajeError = document.getElementById("mensaje-error-venta");
    if (!form || !botonAgregar) {
      return;
    }
    if (mensajeError) {
      textoOriginalErrorVenta = mensajeError.textContent;
    }
    // saca el renglon de ejemplo del html, desde aca los arma el js
    form.querySelectorAll(".form__grupo").forEach(function (grupo) {
      if (grupo.querySelector("output")) {
        form.removeChild(grupo);
      }
    });
    poblarSelectCliente();
    reiniciarFormulario();
    renderHistorial();
    botonAgregar.addEventListener("click", agregarRenglon);
    form.addEventListener("submit", manejarConfirmar);
  });

  // la usa altas.js para que los libros y clientes nuevos aparezcan en la venta
  window.actualizarSelectsVenta = actualizarSelectsVenta;
})();
