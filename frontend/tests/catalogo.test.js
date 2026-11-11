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
