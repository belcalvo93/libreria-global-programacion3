"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");

globalThis.window = globalThis;
require("../public/js/api.js");
var catalogo = require("../public/js/catalogo.js");

test("carga catalogo.js en Node sin document y con Api disponible", function () {
  assert.equal(typeof globalThis.Api, "object");
  assert.equal(typeof globalThis.Api.numero, "function");
  assert.equal(typeof catalogo, "object");
  assert.notEqual(catalogo, null);
});

test("textoGenero devuelve el nombre del género si existe", function () {
  assert.equal(catalogo.textoGenero({ genero: { id: 1, nombre: "Cuento" } }), "Cuento");
});

test("textoGenero devuelve Sin clasificar cuando genero es null o falta", function () {
  assert.equal(catalogo.textoGenero({ titulo: "Antología", genero: null }), "Sin clasificar");
  assert.equal(catalogo.textoGenero({}), "Sin clasificar");
  assert.equal(catalogo.textoGenero(null), "Sin clasificar");
});

test("formatearPrecio formatea decimales usando Api.numero sin recalcular", function () {
  assert.equal(catalogo.formatearPrecio("18000.00"), "18000.00");
  assert.equal(catalogo.formatearPrecio("1500"), "1500.00");
  assert.equal(catalogo.formatearPrecio(2500.5), "2500.50");
  assert.equal(catalogo.formatearPrecio("abc"), "");
  assert.equal(catalogo.formatearPrecio(null), "");
});

test("autoriasOrdenadas ordena autorías ascendentemente por orden", function () {
  var entrada = [
    { autor: { nombre: "Bioy Casares" }, rol: "coautor", orden: 3 },
    { autor: { nombre: "Borges" }, rol: "autor", orden: 1 },
    { autor: { nombre: "Ocampo" }, rol: "coautor", orden: 2 }
  ];
  var resultado = catalogo.autoriasOrdenadas(entrada);
  assert.deepEqual(resultado.map(function (item) { return item.orden; }), [1, 2, 3]);
  assert.deepEqual(entrada.map(function (item) { return item.orden; }), [3, 1, 2]);
});

test("autoriasOrdenadas soporta listas vacías, nulas y orden mayor a 9", function () {
  assert.deepEqual(catalogo.autoriasOrdenadas([]), []);
  assert.deepEqual(catalogo.autoriasOrdenadas(null), []);
  var resultado = catalogo.autoriasOrdenadas([
    { orden: 10, autor: { nombre: "Diez" }, rol: "ilustrador" },
    { orden: 2, autor: { nombre: "Dos" }, rol: "coautor" }
  ]);
  assert.deepEqual(resultado.map(function (item) { return item.orden; }), [2, 10]);
});

test("parametrosListado recorta titulo y conserva limit y offset", function () {
  assert.deepEqual(
    catalogo.parametrosListado({ titulo: "  aleph ", limite: 5, offset: 0 }),
    { titulo: "aleph", limit: 5, offset: 0 }
  );
  assert.deepEqual(
    catalogo.parametrosListado({ titulo: "   ", limite: 5, offset: 5 }),
    { limit: 5, offset: 5 }
  );
  assert.deepEqual(
    catalogo.parametrosListado({ titulo: null, limite: 5, offset: 0 }),
    { limit: 5, offset: 0 }
  );
});

test("decidirVista devuelve tabla cuando hay libros", function () {
  assert.equal(catalogo.decidirVista(5, { titulo: "", offset: 0 }), "tabla");
  assert.equal(catalogo.decidirVista(1, { titulo: "a", offset: 5 }), "tabla");
});

test("decidirVista distingue vacia, sin-resultados y fin según offset y titulo", function () {
  assert.equal(catalogo.decidirVista(0, { titulo: "", offset: 0 }), "vacia");
  assert.equal(catalogo.decidirVista(0, { titulo: "   ", offset: 0 }), "vacia");
  assert.equal(catalogo.decidirVista(0, { titulo: "zzz", offset: 0 }), "sin-resultados");
  assert.equal(catalogo.decidirVista(0, { titulo: "", offset: 5 }), "fin");
  assert.equal(catalogo.decidirVista(0, { titulo: "a", offset: 5 }), "fin");
});

test("hayMas es true solo cuando llegan tantos libros como limite", function () {
  assert.equal(catalogo.hayMas(5, 5), true);
  assert.equal(catalogo.hayMas(4, 5), false);
  assert.equal(catalogo.hayMas(1, 5), false);
  assert.equal(catalogo.hayMas(0, 5), false);
  assert.equal(catalogo.hayMas(5, 0), false);
});

test("resolverOrigenDetalle devuelve el botón indicado o el activeElement si no es body", function () {
  var boton = { focus: function () {} };
  var otro = { focus: function () {} };
  var cuerpo = {};

  assert.equal(
    catalogo.resolverOrigenDetalle(boton, { activeElement: otro, body: cuerpo }),
    boton
  );
  assert.equal(
    catalogo.resolverOrigenDetalle(null, { activeElement: otro, body: cuerpo }),
    otro
  );
  assert.equal(
    catalogo.resolverOrigenDetalle(undefined, { activeElement: cuerpo, body: cuerpo }),
    null
  );
  assert.equal(catalogo.resolverOrigenDetalle(null, null), null);
});

test("enfocarOrigenDetalle enfoca el botón solo cuando sigue en document.body", function () {
  var focos = 0;
  var boton = {
    focus: function () {
      focos += 1;
    }
  };
  var docPresente = {
    body: {
      contains: function (el) {
        return el === boton;
      }
    }
  };
  var docAusente = {
    body: {
      contains: function () {
        return false;
      }
    }
  };

  assert.equal(catalogo.enfocarOrigenDetalle(boton, docPresente), true);
  assert.equal(focos, 1);

  assert.equal(catalogo.enfocarOrigenDetalle(boton, docAusente), false);
  assert.equal(focos, 1);

  assert.equal(catalogo.enfocarOrigenDetalle(null, docPresente), false);
  assert.equal(focos, 1);
});

test("mostrarDetalleLibro conserva el botón de origen y cerrarDetalle le devuelve el foco", async function () {
  var focoEnTitulo = 0;
  var focoEnBoton = 0;
  var botonEstante = {
    focus: function () {
      focoEnBoton += 1;
    }
  };
  var elementos = {
    "catalogo-detalle": { hidden: true },
    "catalogo-detalle-titulo": {
      focus: function () {
        focoEnTitulo += 1;
      }
    },
    "mensaje-catalogo-detalle-cargando": { hidden: true },
    "mensaje-catalogo-detalle-error": { hidden: true, textContent: "" },
    "catalogo-detalle-contenido": { hidden: true },
    "detalle-libro-titulo": { textContent: "" },
    "detalle-libro-isbn": { textContent: "" },
    "detalle-libro-precio": { textContent: "" },
    "detalle-libro-stock": { textContent: "" },
    "detalle-libro-editorial": { textContent: "" },
    "detalle-libro-genero": { textContent: "" },
    "tabla-detalle-autores": { hidden: true },
    "mensaje-detalle-sin-autores": { hidden: true }
  };
  var docAnterior = globalThis.document;
  var apiGetAnterior = globalThis.Api.get;

  globalThis.document = {
    body: {
      contains: function (el) {
        return el === botonEstante;
      }
    },
    activeElement: null,
    getElementById: function (id) {
      return elementos[id] || null;
    },
    querySelector: function () {
      return null;
    }
  };
  globalThis.Api.get = function () {
    return Promise.resolve({
      id: 3,
      titulo: "Ficciones",
      isbn: "978-0",
      precio: "1500.00",
      stock: 4,
      editorial: { nombre: "Sur" },
      genero: { nombre: "Cuento" },
      autores: []
    });
  };

  try {
    await globalThis.window.mostrarDetalleLibro(3, botonEstante);
    assert.equal(elementos["catalogo-detalle"].hidden, false);
    assert.equal(focoEnTitulo, 1);

    catalogo.cerrarDetalle();
    assert.equal(elementos["catalogo-detalle"].hidden, true);
    assert.equal(focoEnBoton, 1);
  } finally {
    if (docAnterior === undefined) {
      delete globalThis.document;
    } else {
      globalThis.document = docAnterior;
    }
    globalThis.Api.get = apiGetAnterior;
  }
});

// ---- Estado de carga del buscador (rev. 14) ----

function crearClassListFalso() {
  var set = {};
  return {
    add: function (c) { set[c] = true; },
    remove: function (c) { delete set[c]; },
    contains: function (c) { return set[c] === true; }
  };
}

function crearElementosFalsos() {
  var attrs = {};
  var contenedor = {
    classList: crearClassListFalso(),
    setAttribute: function (k, v) { attrs[k] = String(v); },
    removeAttribute: function (k) { delete attrs[k]; },
    getAttribute: function (k) { return k in attrs ? attrs[k] : null; }
  };
  return {
    btnBuscar: { disabled: false, textContent: "Buscar en el catálogo" },
    btnAnterior: { disabled: true },
    btnSiguiente: { disabled: true },
    paginaSalida: { textContent: "" },
    tabla: { parentNode: contenedor },
    contenedor: contenedor
  };
}

test("estadoControlesCarga durante la carga deshabilita todo y pide aria-busy", function () {
  var e = catalogo.estadoControlesCarga(true, 5, true);
  assert.equal(e.buscarDeshabilitado, true);
  assert.equal(e.textoBuscar, "Buscando…");
  assert.equal(e.anteriorDeshabilitado, true);
  assert.equal(e.siguienteDeshabilitado, true);
  assert.equal(e.ocupado, true);
});

test("estadoControlesCarga en reposo respeta offset y hayMas", function () {
  var a = catalogo.estadoControlesCarga(false, 5, true);
  assert.equal(a.buscarDeshabilitado, false);
  assert.equal(a.textoBuscar, "Buscar en el catálogo");
  assert.equal(a.anteriorDeshabilitado, false);
  assert.equal(a.siguienteDeshabilitado, false);
  assert.equal(a.ocupado, false);
  var b = catalogo.estadoControlesCarga(false, 0, false);
  assert.equal(b.anteriorDeshabilitado, true);
  assert.equal(b.siguienteDeshabilitado, true);
});

test("aplicarEstadoCarga marca el contenedor y cambia el texto del botón", function () {
  var els = crearElementosFalsos();
  catalogo.aplicarEstadoCarga(els, true);
  assert.equal(els.btnBuscar.disabled, true);
  assert.equal(els.btnBuscar.textContent, "Buscando…");
  assert.equal(els.btnAnterior.disabled, true);
  assert.equal(els.btnSiguiente.disabled, true);
  assert.equal(els.contenedor.getAttribute("aria-busy"), "true");
  assert.equal(els.contenedor.classList.contains("is-cargando"), true);
});

test("aplicarEstadoCarga al terminar restaura texto, aria-busy y clase", function () {
  var els = crearElementosFalsos();
  catalogo.aplicarEstadoCarga(els, true);
  catalogo.aplicarEstadoCarga(els, false);
  assert.equal(els.btnBuscar.disabled, false);
  assert.equal(els.btnBuscar.textContent, "Buscar en el catálogo");
  assert.equal(els.contenedor.getAttribute("aria-busy"), null);
  assert.equal(els.contenedor.classList.contains("is-cargando"), false);
  assert.equal(els.btnAnterior.disabled, true);
  assert.equal(els.btnSiguiente.disabled, true);
});

test("aplicarEstadoCarga tolera elementos ausentes", function () {
  assert.doesNotThrow(function () {
    catalogo.aplicarEstadoCarga({}, true);
    catalogo.aplicarEstadoCarga({}, false);
  });
});
