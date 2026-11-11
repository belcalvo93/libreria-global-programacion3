/* ==========================================================================
   Librería Página Viva — Catálogo dinámico y filtro (Ejercicio 3)
   Genera #tabla-catalogo desde DATOS.libros y filtra por título.
   Inserción solo como texto (textContent, nunca como HTML).
   Sin clases ni estilos inline: el CSS adaptable del Ejercicio 2 intacto.
   ========================================================================== */
(function () {
  "use strict";

  function nombreEditorial(editorialId) {
    var editorial = DATOS.editoriales.filter(function (item) {
      return item.id === editorialId;
    })[0];
    return editorial ? editorial.nombre : "";
  }

  function nombreGenero(generoId) {
    if (generoId === null || generoId === undefined) {
      return "Sin clasificar";
    }
    var genero = DATOS.generos.filter(function (item) {
      return item.id === generoId;
    })[0];
    return genero ? genero.nombre : "Sin clasificar";
  }

  function nombresAutores(autorIds) {
    return autorIds
      .map(function (autorId) {
        var autor = DATOS.autores.filter(function (item) {
          return item.id === autorId;
        })[0];
        return autor ? autor.nombre : "";
      })
      .filter(function (nombre) {
        return nombre !== "";
      })
      .join(", ");
  }

  function formatearPrecio(precio) {
    return Number(precio).toFixed(2);
  }

  function crearCelda(texto) {
    var td = document.createElement("td");
    td.textContent = texto;
    return td;
  }

  // Filtro: parcial, case-insensitive, con trim. Vacía (o solo espacios)
  // muestra todo; sin coincidencias muestra el mensaje y oculta la tabla.
  function renderCatalogo(filtro) {
    if (filtro === undefined) {
      filtro = "";
    }
    var tabla = document.getElementById("tabla-catalogo");
    var tbody = document.querySelector("#tabla-catalogo tbody");
    var mensajeVacia = document.getElementById("mensaje-catalogo-vacia");
    var mensajeSinResultados = document.getElementById("mensaje-catalogo-sin-resultados");
    if (!tabla || !tbody || !mensajeVacia || !mensajeSinResultados) {
      return;
    }
    var texto = String(filtro).trim().toLowerCase();
    var libros = DATOS.libros;
    var filtrados =
      texto === ""
        ? libros.slice()
        : libros.filter(function (libro) {
            return libro.titulo.toLowerCase().indexOf(texto) !== -1;
          });

    tbody.textContent = "";
    filtrados.forEach(function (libro) {
      var tr = document.createElement("tr");
      tr.appendChild(crearCelda(libro.titulo));
      tr.appendChild(crearCelda(libro.isbn));
      tr.appendChild(crearCelda(nombreEditorial(libro.editorialId)));
      tr.appendChild(crearCelda(nombreGenero(libro.generoId)));
      tr.appendChild(crearCelda(nombresAutores(libro.autorIds)));
      tr.appendChild(crearCelda(formatearPrecio(libro.precio)));
      tbody.appendChild(tr);
    });

    var tieneLibros = libros.length > 0;
    mensajeVacia.hidden = tieneLibros;
    mensajeSinResultados.hidden = !(tieneLibros && filtrados.length === 0);
    tabla.hidden = !tieneLibros || filtrados.length === 0;
  }

  function conectarFiltro() {
    var campo = document.getElementById("catalogo-busqueda");
    var boton = document.getElementById("catalogo-buscar");
    if (campo) {
      campo.addEventListener("input", function () {
        renderCatalogo(campo.value);
      });
    }
    if (boton && campo) {
      boton.addEventListener("click", function () {
        renderCatalogo(campo.value);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    conectarFiltro();
    renderCatalogo();
  });

  // Expuesta para reutilizar desde el Ejercicio 4 (re-render tras un alta).
  window.renderCatalogo = renderCatalogo;
})();
