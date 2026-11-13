/* ==========================================================================
   Gatoteca Lunar — Alta de libros y clientes (Global, Ejercicio 2)
   Consume editoriales, géneros, autores, libros y clientes a través de window.Api.
   Inserción solo como texto (textContent, nunca como HTML).
   ========================================================================== */
(function () {
  "use strict";

  var ROLES_AUTORIA = ["autor", "coautor", "traductor", "ilustrador"];

  function limpiarTexto(valor) {
    return String(valor === undefined || valor === null ? "" : valor).trim();
  }

  function esEnteroPositivo(valor) {
    var texto = limpiarTexto(valor);
    return /^\d+$/.test(texto) && Number(texto) >= 1;
  }

  function esEnteroNoNegativo(valor) {
    var texto = limpiarTexto(valor);
    return /^\d+$/.test(texto) && Number.isSafeInteger(Number(texto)) && Number(texto) >= 0;
  }

  function esPrecioValido(valor) {
    var texto = limpiarTexto(valor);
    if (!/^\d+(\.\d{1,2})?$/.test(texto)) {
      return false;
    }
    var digitos = texto.replace(".", "").replace(/^0+/, "");
    return digitos.length <= 10 && Number.isFinite(Number(texto)) && Number(texto) > 0;
  }

  function esEmailValido(valor) {
    var texto = limpiarTexto(valor);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto);
  }

  // Siguiente número de orden libre (1, 2, 3...): el menor entero positivo que
  // ninguna autoría de la lista usa todavía. Solo sugiere: la persona puede editarlo.
  function siguienteOrden(autorias) {
    var usados = {};
    (Array.isArray(autorias) ? autorias : []).forEach(function (item) {
      usados[String(Number(item && item.orden))] = true;
    });
    var candidato = 1;
    while (usados[String(candidato)]) {
      candidato += 1;
    }
    return candidato;
  }

  function validarAutoria(nueva, existentes) {
    if (!nueva || !esEnteroPositivo(nueva.autor_id)) {
      return "Buscá y seleccioná un autor válido antes de agregar.";
    }
    if (ROLES_AUTORIA.indexOf(nueva.rol) === -1) {
      return "Elegí un rol de autoría válido.";
    }
    if (!esEnteroPositivo(nueva.orden)) {
      return "El orden de la autoría debe ser un entero mayor o igual a 1.";
    }
    var idNuevo = Number(nueva.autor_id);
    var lista = Array.isArray(existentes) ? existentes : [];
    for (var i = 0; i < lista.length; i += 1) {
      if (Number(lista[i].autor_id) === idNuevo) {
        return "Ese autor ya está agregado en la lista.";
      }
    }
    return "";
  }

  function validarLibroFormulario(datos) {
    if (!datos || limpiarTexto(datos.titulo) === "") {
      return "El título es obligatorio.";
    }
    if (limpiarTexto(datos.isbn) === "") {
      return "El ISBN es obligatorio.";
    }
    if (!esPrecioValido(datos.precio)) {
      return "El precio debe ser mayor que cero y tener hasta 2 decimales.";
    }
    if (!esEnteroNoNegativo(datos.stock)) {
      return "El stock debe ser un número entero mayor o igual a cero.";
    }
    if (!esEnteroPositivo(datos.editorialId)) {
      return "Seleccioná una editorial.";
    }
    if (!Array.isArray(datos.autorias) || datos.autorias.length === 0) {
      return "Agregá al menos una autoría para el libro.";
    }
    for (var i = 0; i < datos.autorias.length; i += 1) {
      var item = datos.autorias[i];
      if (!item || !esEnteroPositivo(item.autor_id) || ROLES_AUTORIA.indexOf(item.rol) === -1 || !esEnteroPositivo(item.orden)) {
        return "Revisá los datos de las autorías cargadas.";
      }
    }
    return "";
  }

  function validarClienteFormulario(datos) {
    if (!datos || limpiarTexto(datos.nombre) === "") {
      return "El nombre completo es obligatorio.";
    }
    var email = limpiarTexto(datos.email);
    if (email === "") {
      return "El email es obligatorio.";
    }
    if (!esEmailValido(email)) {
      return "El email no tiene un formato válido.";
    }
    return "";
  }

  function armarCuerpoLibro(datos) {
    var generoTexto = limpiarTexto(datos.generoId);
    return {
      isbn: limpiarTexto(datos.isbn),
      titulo: limpiarTexto(datos.titulo),
      precio: Number(limpiarTexto(datos.precio)),
      stock: Number(limpiarTexto(datos.stock)),
      editorial_id: Number(limpiarTexto(datos.editorialId)),
      genero_id: generoTexto === "" ? null : Number(generoTexto),
      autores: (datos.autorias || []).map(function (item) {
        return {
          autor_id: Number(item.autor_id),
          rol: item.rol,
          orden: Number(item.orden)
        };
      })
    };
  }

  function armarCuerpoCliente(datos) {
    return {
      nombre: limpiarTexto(datos.nombre),
      email: limpiarTexto(datos.email)
    };
  }

  function formatearPrecio(precio) {
    if (precio === null || precio === undefined || precio === "") {
      return "";
    }
    var numero = Api.numero(precio);
    return Number.isFinite(numero) ? numero.toFixed(2) : "";
  }

  function textoGenero(libro) {
    if (!libro || !libro.genero || !libro.genero.nombre) {
      return "Sin clasificar";
    }
    return String(libro.genero.nombre);
  }

  function formatearAutoresResumen(autores) {
    if (!Array.isArray(autores) || autores.length === 0) {
      return "";
    }
    return autores.slice().sort(function (a, b) {
      return Number(a.orden) - Number(b.orden);
    }).map(function (item) {
      var nombre = item && item.autor && item.autor.nombre ? item.autor.nombre : "";
      var rol = item && item.rol ? item.rol : "";
      var orden = item && item.orden !== undefined && item.orden !== null ? String(item.orden) : "";
      return nombre + " (" + rol + ", " + orden + ")";
    }).join(", ");
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

  function agregarOpcion(select, valor, texto) {
    var option = document.createElement("option");
    option.value = String(valor);
    option.textContent = texto;
    select.appendChild(option);
  }

  function mostrarError(elemento, texto) {
    if (!elemento) {
      return;
    }
    elemento.textContent = texto;
    elemento.hidden = false;
    elemento.removeAttribute("hidden");
  }

  function ocultarElemento(elemento) {
    if (elemento) {
      elemento.hidden = true;
      elemento.setAttribute("hidden", "");
    }
  }

  function mostrarElemento(elemento) {
    if (elemento) {
      elemento.hidden = false;
      elemento.removeAttribute("hidden");
    }
  }

  function inicializarAltas() {
    var autorSeleccionado = null;
    var autorias = [];

    var formLibro = document.getElementById("form-libro");
    var tituloInput = document.getElementById("libro-titulo");
    var isbnInput = document.getElementById("libro-isbn");
    var precioInput = document.getElementById("libro-precio");
    var stockInput = document.getElementById("libro-stock");
    var editorialSelect = document.getElementById("libro-editorial");
    var generoSelect = document.getElementById("libro-genero");
    var autorIdInput = document.getElementById("autor-id-buscar");
    var btnBuscarAutor = document.getElementById("autor-buscar");
    var autorRolSelect = document.getElementById("autor-rol");
    var autorOrdenInput = document.getElementById("autor-orden");
    var btnAgregarAutoria = document.getElementById("autor-agregar");
    var autorEncontradoMsg = document.getElementById("autor-encontrado");
    var autorErrorMsg = document.getElementById("mensaje-error-autor");
    var sinAutoriasMsg = document.getElementById("mensaje-libro-sin-autorias");
    var tablaAutorias = document.getElementById("tabla-libro-autorias");
    var tbodyAutorias = document.querySelector("#tabla-libro-autorias tbody");
    var btnGuardarLibro = document.getElementById("libro-guardar");
    var libroErrorMsg = document.getElementById("mensaje-error-libro");
    var libroOkMsg = document.getElementById("mensaje-ok-libro");
    var tablaLibros = document.getElementById("tabla-libros");
    var tbodyLibros = document.querySelector("#tabla-libros tbody");
    var librosVaciaMsg = document.getElementById("mensaje-libros-vacia");

    var formCliente = document.getElementById("form-cliente");
    var clienteNombreInput = document.getElementById("cliente-nombre");
    var clienteEmailInput = document.getElementById("cliente-email");
    var btnGuardarCliente = document.getElementById("cliente-guardar");
    var clienteErrorMsg = document.getElementById("mensaje-error-cliente");
    var clienteOkMsg = document.getElementById("mensaje-ok-cliente");
    var tablaClientes = document.getElementById("tabla-clientes");
    var tbodyClientes = document.querySelector("#tabla-clientes tbody");
    var clientesVaciaMsg = document.getElementById("mensaje-clientes-vacia");

    var formBuscarCliente = document.getElementById("form-buscar-cliente");
    var clienteIdBuscarInput = document.getElementById("cliente-id-buscar");
    var btnBuscarCliente = document.getElementById("cliente-buscar");
    var buscarClienteErrorMsg = document.getElementById("mensaje-error-buscar-cliente");
    var clienteResultadoPanel = document.getElementById("cliente-resultado");
    var clienteResultadoId = document.getElementById("cliente-resultado-id");
    var clienteResultadoNombre = document.getElementById("cliente-resultado-nombre");
    var clienteResultadoEmail = document.getElementById("cliente-resultado-email");

    function poblarSelects(editoriales, generos) {
      if (editorialSelect) {
        editorialSelect.textContent = "";
        agregarOpcion(editorialSelect, "", "Elegí una editorial");
        (Array.isArray(editoriales) ? editoriales : []).forEach(function (editorial) {
          agregarOpcion(editorialSelect, editorial.id, editorial.nombre);
        });
      }
      if (generoSelect) {
        generoSelect.textContent = "";
        agregarOpcion(generoSelect, "", "Sin clasificar");
        (Array.isArray(generos) ? generos : []).forEach(function (genero) {
          agregarOpcion(generoSelect, genero.id, genero.nombre);
        });
      }
    }

    async function cargarSelectsIniciales() {
      if (!editorialSelect && !generoSelect) {
        return;
      }
      try {
        var respuestas = await Promise.all([
          Api.get("/editoriales/", { limit: 100 }),
          Api.get("/generos/", { limit: 100 })
        ]);
        poblarSelects(respuestas[0], respuestas[1]);
      } catch (error) {
        mostrarError(
          libroErrorMsg,
          error && error.message ? error.message : "No se pudieron cargar editoriales y géneros."
        );
      }
    }

    function renderAutorias() {
      if (!tablaAutorias || !tbodyAutorias || !sinAutoriasMsg) {
        return;
      }
      tbodyAutorias.textContent = "";
      autorias.forEach(function (item, indice) {
        var tr = document.createElement("tr");
        tr.appendChild(crearCelda(item.nombre + " (ID " + item.autor_id + ")"));
        tr.appendChild(crearCelda(item.rol));
        tr.appendChild(crearCelda(String(item.orden)));

        var tdAccion = document.createElement("td");
        var btnQuitar = document.createElement("button");
        btnQuitar.type = "button";
        btnQuitar.className = "btn btn--peligro";
        btnQuitar.textContent = "Quitar";
        btnQuitar.setAttribute("aria-label", "Quitar a " + item.nombre);
        btnQuitar.addEventListener("click", function () {
          autorias.splice(indice, 1);
          if (autorOrdenInput) {
            autorOrdenInput.value = String(siguienteOrden(autorias));
          }
          renderAutorias();
          ocultarElemento(autorErrorMsg);
          ocultarElemento(libroErrorMsg);
          ocultarElemento(libroOkMsg);
          if (autorIdInput) {
            autorIdInput.focus();
          }
        });
        tdAccion.appendChild(btnQuitar);
        tr.appendChild(tdAccion);
        tbodyAutorias.appendChild(tr);
      });
      if (autorias.length > 0) {
        mostrarElemento(tablaAutorias);
        ocultarElemento(sinAutoriasMsg);
      } else {
        ocultarElemento(tablaAutorias);
        mostrarElemento(sinAutoriasMsg);
      }
    }

    async function buscarAutorPorId() {
      if (!autorIdInput) {
        return;
      }
      var idTexto = limpiarTexto(autorIdInput.value);
      ocultarElemento(autorEncontradoMsg);
      ocultarElemento(autorErrorMsg);
      ocultarElemento(libroErrorMsg);
      ocultarElemento(libroOkMsg);
      autorSeleccionado = null;

      if (!esEnteroPositivo(idTexto)) {
        mostrarError(autorErrorMsg, "Ingresá un ID de autor válido (entero mayor o igual a 1).");
        return;
      }

      if (btnBuscarAutor) {
        btnBuscarAutor.disabled = true;
      }
      try {
        var autor = await Api.get("/autores/" + encodeURIComponent(idTexto));
        autorSeleccionado = autor;
        if (autorEncontradoMsg) {
          var detalleAutor = "Autor encontrado: " + autor.nombre;
          if (autor.nacionalidad) {
            detalleAutor += " (" + autor.nacionalidad + ")";
          }
          autorEncontradoMsg.textContent = detalleAutor;
          mostrarElemento(autorEncontradoMsg);
        }
      } catch (error) {
        autorSeleccionado = null;
        mostrarError(
          autorErrorMsg,
          error && error.message ? error.message : "No se pudo buscar el autor."
        );
      } finally {
        if (btnBuscarAutor) {
          btnBuscarAutor.disabled = false;
        }
      }
    }

    function agregarAutoriaALista() {
      ocultarElemento(autorErrorMsg);
      ocultarElemento(libroErrorMsg);
      ocultarElemento(libroOkMsg);
      var idTexto = autorIdInput ? limpiarTexto(autorIdInput.value) : "";
      if (!autorSeleccionado || Number(idTexto) !== Number(autorSeleccionado.id)) {
        mostrarError(autorErrorMsg, "Buscá y confirmá el autor por su ID antes de agregarlo.");
        return;
      }
      var rol = autorRolSelect ? autorRolSelect.value : "";
      var ordenTexto = autorOrdenInput ? autorOrdenInput.value : "";
      var errorAutoria = validarAutoria(
        { autor_id: autorSeleccionado.id, rol: rol, orden: ordenTexto },
        autorias
      );
      if (errorAutoria !== "") {
        mostrarError(autorErrorMsg, errorAutoria);
        return;
      }
      autorias.push({
        autor_id: autorSeleccionado.id,
        nombre: autorSeleccionado.nombre,
        rol: rol,
        orden: Number(limpiarTexto(ordenTexto))
      });
      autorSeleccionado = null;
      if (autorIdInput) {
        autorIdInput.value = "";
      }
      if (autorOrdenInput) {
        autorOrdenInput.value = String(siguienteOrden(autorias));
      }
      ocultarElemento(autorEncontradoMsg);
      ocultarElemento(autorErrorMsg);
      ocultarElemento(libroErrorMsg);
      ocultarElemento(libroOkMsg);
      renderAutorias();
    }

    async function manejarAltaLibro(event) {
      event.preventDefault();
      if (!formLibro || !tituloInput || !isbnInput || !precioInput || !stockInput || !editorialSelect || !generoSelect) {
        return;
      }
      ocultarElemento(libroErrorMsg);
      ocultarElemento(libroOkMsg);
      ocultarElemento(autorErrorMsg);
      ocultarElemento(autorEncontradoMsg);

      var datosFormulario = {
        titulo: tituloInput.value,
        isbn: isbnInput.value,
        precio: precioInput.value,
        stock: stockInput.value,
        editorialId: editorialSelect.value,
        generoId: generoSelect.value,
        autorias: autorias
      };
      var detalle = validarLibroFormulario(datosFormulario);
      if (detalle !== "") {
        mostrarError(libroErrorMsg, detalle);
        return;
      }

      if (btnGuardarLibro) {
        btnGuardarLibro.disabled = true;
      }
      try {
        var libroCreado = await Api.post("/libros/", armarCuerpoLibro(datosFormulario));
        if (tbodyLibros && tablaLibros) {
          tbodyLibros.appendChild(
            crearFila([
              libroCreado.titulo || "",
              libroCreado.isbn || "",
              formatearPrecio(libroCreado.precio),
              libroCreado.stock !== undefined && libroCreado.stock !== null ? String(libroCreado.stock) : "",
              libroCreado.editorial && libroCreado.editorial.nombre ? libroCreado.editorial.nombre : "",
              textoGenero(libroCreado),
              formatearAutoresResumen(libroCreado.autores)
            ])
          );
          mostrarElemento(tablaLibros);
          ocultarElemento(librosVaciaMsg);
        }
        formLibro.reset();
        autorias = [];
        autorSeleccionado = null;
        if (autorOrdenInput) {
          autorOrdenInput.value = String(siguienteOrden(autorias));
        }
        ocultarElemento(autorEncontradoMsg);
        ocultarElemento(autorErrorMsg);
        ocultarElemento(libroErrorMsg);
        renderAutorias();
        if (libroOkMsg) {
          libroOkMsg.textContent =
            "Libro agregado correctamente: " + libroCreado.titulo + " (ID " + libroCreado.id + ").";
          mostrarElemento(libroOkMsg);
        }
        if (typeof window.renderCatalogo === "function") {
          window.renderCatalogo();
        }
      } catch (error) {
        mostrarError(
          libroErrorMsg,
          error && error.message ? error.message : "No se pudo agregar el libro."
        );
      } finally {
        if (btnGuardarLibro) {
          btnGuardarLibro.disabled = false;
        }
      }
    }

    async function manejarAltaCliente(event) {
      event.preventDefault();
      if (!formCliente || !clienteNombreInput || !clienteEmailInput) {
        return;
      }
      ocultarElemento(clienteErrorMsg);
      ocultarElemento(clienteOkMsg);

      var datosCliente = {
        nombre: clienteNombreInput.value,
        email: clienteEmailInput.value
      };
      var detalle = validarClienteFormulario(datosCliente);
      if (detalle !== "") {
        mostrarError(clienteErrorMsg, detalle);
        return;
      }

      if (btnGuardarCliente) {
        btnGuardarCliente.disabled = true;
      }
      try {
        var clienteCreado = await Api.post("/clientes/", armarCuerpoCliente(datosCliente));
        if (tbodyClientes && tablaClientes) {
          tbodyClientes.appendChild(
            crearFila([
              String(clienteCreado.id),
              clienteCreado.nombre || "",
              clienteCreado.email || ""
            ])
          );
          mostrarElemento(tablaClientes);
          ocultarElemento(clientesVaciaMsg);
        }
        formCliente.reset();
        ocultarElemento(clienteErrorMsg);
        if (clienteOkMsg) {
          clienteOkMsg.textContent =
            "Cliente agregado correctamente: " + clienteCreado.nombre + " (ID " + clienteCreado.id + ").";
          mostrarElemento(clienteOkMsg);
        }
      } catch (error) {
        mostrarError(
          clienteErrorMsg,
          error && error.message ? error.message : "No se pudo agregar el cliente."
        );
      } finally {
        if (btnGuardarCliente) {
          btnGuardarCliente.disabled = false;
        }
      }
    }

    async function manejarBuscarCliente(event) {
      event.preventDefault();
      if (!clienteIdBuscarInput) {
        return;
      }
      var idTexto = limpiarTexto(clienteIdBuscarInput.value);
      ocultarElemento(buscarClienteErrorMsg);
      ocultarElemento(clienteResultadoPanel);

      if (!esEnteroPositivo(idTexto)) {
        mostrarError(buscarClienteErrorMsg, "Ingresá un ID de cliente válido (entero mayor o igual a 1).");
        return;
      }

      if (btnBuscarCliente) {
        btnBuscarCliente.disabled = true;
      }
      try {
        var cliente = await Api.get("/clientes/" + encodeURIComponent(idTexto));
        ocultarElemento(buscarClienteErrorMsg);
        if (clienteResultadoId) { clienteResultadoId.textContent = String(cliente.id); }
        if (clienteResultadoNombre) { clienteResultadoNombre.textContent = cliente.nombre || ""; }
        if (clienteResultadoEmail) { clienteResultadoEmail.textContent = cliente.email || ""; }
        if (clienteResultadoPanel) { mostrarElemento(clienteResultadoPanel); }
      } catch (error) {
        ocultarElemento(clienteResultadoPanel);
        mostrarError(
          buscarClienteErrorMsg,
          error && error.message ? error.message : "No se pudo buscar el cliente."
        );
      } finally {
        if (btnBuscarCliente) {
          btnBuscarCliente.disabled = false;
        }
      }
    }

    if (autorIdInput) {
      autorIdInput.addEventListener("input", function () {
        autorSeleccionado = null;
        ocultarElemento(autorEncontradoMsg);
        ocultarElemento(autorErrorMsg);
        ocultarElemento(libroErrorMsg);
      });
      autorIdInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          buscarAutorPorId();
        }
      });
    }
    if (autorRolSelect) {
      autorRolSelect.addEventListener("change", function () {
        ocultarElemento(autorErrorMsg);
      });
    }
    if (autorOrdenInput) {
      autorOrdenInput.addEventListener("input", function () {
        ocultarElemento(autorErrorMsg);
      });
      autorOrdenInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          agregarAutoriaALista();
        }
      });
    }
    if (btnBuscarAutor) {
      btnBuscarAutor.addEventListener("click", buscarAutorPorId);
    }
    if (btnAgregarAutoria) {
      btnAgregarAutoria.addEventListener("click", agregarAutoriaALista);
    }
    if (formLibro) {
      formLibro.addEventListener("submit", manejarAltaLibro);
    }
    if (formCliente) {
      formCliente.addEventListener("submit", manejarAltaCliente);
    }
    if (formBuscarCliente) {
      formBuscarCliente.addEventListener("submit", manejarBuscarCliente);
    }

    [tituloInput, isbnInput, precioInput, stockInput, editorialSelect, generoSelect].forEach(function (campo) {
      if (campo) {
        var tipoEvento = campo.tagName === "SELECT" ? "change" : "input";
        campo.addEventListener(tipoEvento, function () {
          ocultarElemento(libroErrorMsg);
          ocultarElemento(libroOkMsg);
        });
      }
    });

    [clienteNombreInput, clienteEmailInput].forEach(function (campo) {
      if (campo) {
        campo.addEventListener("input", function () {
          ocultarElemento(clienteErrorMsg);
          ocultarElemento(clienteOkMsg);
        });
      }
    });

    if (clienteIdBuscarInput) {
      clienteIdBuscarInput.addEventListener("input", function () {
        ocultarElemento(buscarClienteErrorMsg);
        ocultarElemento(clienteResultadoPanel);
      });
    }

    renderAutorias();
    cargarSelectsIniciales();
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", inicializarAltas);
  }

  // Exportación condicional solo para tests unitarios con `node --test`;
  // en el navegador `module` no existe y este archivo sigue siendo un script clásico.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      ROLES_AUTORIA: ROLES_AUTORIA,
      esEnteroPositivo: esEnteroPositivo,
      esEnteroNoNegativo: esEnteroNoNegativo,
      esPrecioValido: esPrecioValido,
      esEmailValido: esEmailValido,
      siguienteOrden: siguienteOrden,
      validarAutoria: validarAutoria,
      validarLibroFormulario: validarLibroFormulario,
      validarClienteFormulario: validarClienteFormulario,
      armarCuerpoLibro: armarCuerpoLibro,
      armarCuerpoCliente: armarCuerpoCliente,
      formatearPrecio: formatearPrecio,
      textoGenero: textoGenero,
      formatearAutoresResumen: formatearAutoresResumen
    };
  }
})();
