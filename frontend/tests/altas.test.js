"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");

globalThis.window = globalThis;
require("../public/js/api.js");
var altas = require("../public/js/altas.js");

test("carga altas.js en Node sin document y con Api disponible", function () {
  assert.equal(typeof globalThis.Api, "object");
  assert.equal(typeof globalThis.Api.numero, "function");
  assert.equal(typeof altas, "object");
  assert.notEqual(altas, null);
});

test("esEnteroPositivo y esEnteroNoNegativo validan enteros segun limite", function () {
  assert.equal(altas.esEnteroPositivo("1"), true);
  assert.equal(altas.esEnteroPositivo(12), true);
  assert.equal(altas.esEnteroPositivo("0"), false);
  assert.equal(altas.esEnteroPositivo("-2"), false);
  assert.equal(altas.esEnteroPositivo("1.5"), false);
  assert.equal(altas.esEnteroPositivo("abc"), false);

  assert.equal(altas.esEnteroNoNegativo("0"), true);
  assert.equal(altas.esEnteroNoNegativo(10), true);
  assert.equal(altas.esEnteroNoNegativo("-1"), false);
  assert.equal(altas.esEnteroNoNegativo("1.5"), false);
  assert.equal(altas.esEnteroNoNegativo(""), false);
});

test("esPrecioValido exige mayor a cero, hasta 2 decimales y hasta 10 digitos", function () {
  assert.equal(altas.esPrecioValido("1500"), true);
  assert.equal(altas.esPrecioValido("1500.50"), true);
  assert.equal(altas.esPrecioValido("0.01"), true);
  assert.equal(altas.esPrecioValido("99999999.99"), true);
  assert.equal(altas.esPrecioValido("0"), false);
  assert.equal(altas.esPrecioValido("-10"), false);
  assert.equal(altas.esPrecioValido("10.123"), false);
  assert.equal(altas.esPrecioValido("123456789.12"), false);
  assert.equal(altas.esPrecioValido("abc"), false);
});

test("esEmailValido valida formato basico sin espacios", function () {
  assert.equal(altas.esEmailValido("ana@ejemplo.com"), true);
  assert.equal(altas.esEmailValido("  Ana.Perez@utn.edu.ar "), true);
  assert.equal(altas.esEmailValido("sin-arroba.com"), false);
  assert.equal(altas.esEmailValido("ana@"), false);
  assert.equal(altas.esEmailValido("ana ejemplo@dom.com"), false);
  assert.equal(altas.esEmailValido(""), false);
});

test("validarAutoria exige autor, rol permitido, orden >= 1 y sin duplicados", function () {
  var existentes = [{ autor_id: 1, nombre: "Cortázar", rol: "autor", orden: 1 }];
  assert.equal(
    altas.validarAutoria({ autor_id: 2, rol: "coautor", orden: "2" }, existentes),
    ""
  );
  assert.notEqual(
    altas.validarAutoria({ autor_id: null, rol: "autor", orden: "1" }, []),
    ""
  );
  assert.notEqual(
    altas.validarAutoria({ autor_id: 1, rol: "traductor", orden: "2" }, existentes),
    ""
  );
  assert.notEqual(
    altas.validarAutoria({ autor_id: 3, rol: "editor", orden: "1" }, []),
    ""
  );
  assert.notEqual(
    altas.validarAutoria({ autor_id: 3, rol: "autor", orden: "0" }, []),
    ""
  );
});

test("validarLibroFormulario valida campos requeridos, stock >= 0 y al menos una autoria", function () {
  var valido = {
    titulo: "Rayuela",
    isbn: "978-950-00-0001-1",
    precio: "25000.00",
    stock: "0",
    editorialId: "1",
    autorias: [{ autor_id: 1, rol: "autor", orden: 1 }]
  };
  assert.equal(altas.validarLibroFormulario(valido), "");

  assert.notEqual(
    altas.validarLibroFormulario(Object.assign({}, valido, { titulo: "   " })),
    ""
  );
  assert.notEqual(
    altas.validarLibroFormulario(Object.assign({}, valido, { isbn: "" })),
    ""
  );
  assert.notEqual(
    altas.validarLibroFormulario(Object.assign({}, valido, { precio: "0" })),
    ""
  );
  assert.notEqual(
    altas.validarLibroFormulario(Object.assign({}, valido, { stock: "-1" })),
    ""
  );
  assert.notEqual(
    altas.validarLibroFormulario(Object.assign({}, valido, { stock: "1.5" })),
    ""
  );
  assert.notEqual(
    altas.validarLibroFormulario(Object.assign({}, valido, { editorialId: "" })),
    ""
  );
  assert.notEqual(
    altas.validarLibroFormulario(Object.assign({}, valido, { autorias: [] })),
    ""
  );
});

test("validarClienteFormulario exige nombre no vacio y email valido", function () {
  assert.equal(
    altas.validarClienteFormulario({ nombre: "Ana Pérez", email: "ana@ejemplo.com" }),
    ""
  );
  assert.notEqual(
    altas.validarClienteFormulario({ nombre: "   ", email: "ana@ejemplo.com" }),
    ""
  );
  assert.notEqual(
    altas.validarClienteFormulario({ nombre: "Ana Pérez", email: "invalido" }),
    ""
  );
});

test("armarCuerpoLibro construye payload exacto para extra=forbid y genero opcional null", function () {
  var cuerpoConGenero = altas.armarCuerpoLibro({
    titulo: "  Rayuela  ",
    isbn: " 978-950-00-0001-1 ",
    precio: "25000.5",
    stock: "12",
    editorialId: "1",
    generoId: "2",
    autorias: [{ autor_id: "1", nombre: "Julio Cortázar", rol: "autor", orden: "1" }]
  });
  assert.deepEqual(cuerpoConGenero, {
    isbn: "978-950-00-0001-1",
    titulo: "Rayuela",
    precio: 25000.5,
    stock: 12,
    editorial_id: 1,
    genero_id: 2,
    autores: [{ autor_id: 1, rol: "autor", orden: 1 }]
  });

  var cuerpoSinGenero = altas.armarCuerpoLibro({
    titulo: "Antología",
    isbn: "978-950-00-0007-3",
    precio: "30000",
    stock: "0",
    editorialId: "1",
    generoId: "",
    autorias: [
      { autor_id: 5, nombre: "Borges", rol: "autor", orden: 1 },
      { autor_id: 3, nombre: "Ocampo", rol: "coautor", orden: 2 }
    ]
  });
  assert.equal(cuerpoSinGenero.genero_id, null);
  assert.equal(cuerpoSinGenero.stock, 0);
  assert.deepEqual(Object.keys(cuerpoSinGenero).sort(), [
    "autores",
    "editorial_id",
    "genero_id",
    "isbn",
    "precio",
    "stock",
    "titulo"
  ]);
  assert.deepEqual(Object.keys(cuerpoSinGenero.autores[0]).sort(), ["autor_id", "orden", "rol"]);
});

test("armarCuerpoCliente recorta espacios y deja solo nombre y email", function () {
  assert.deepEqual(
    altas.armarCuerpoCliente({ nombre: "  Lucía Fernández ", email: " lucia@example.com  " }),
    { nombre: "Lucía Fernández", email: "lucia@example.com" }
  );
});

test("formatearPrecio y formatearAutoresResumen formatean respuestas de la API", function () {
  assert.equal(altas.formatearPrecio("25000.00"), "25000.00");
  assert.equal(altas.formatearPrecio(1500), "1500.00");
  assert.equal(altas.formatearPrecio(null), "");

  var textoAutores = altas.formatearAutoresResumen([
    { autor: { id: 3, nombre: "Ocampo" }, rol: "coautor", orden: 2 },
    { autor: { id: 5, nombre: "Borges" }, rol: "autor", orden: 1 }
  ]);
  assert.equal(textoAutores, "Borges (autor, 1), Ocampo (coautor, 2)");
  assert.equal(altas.formatearAutoresResumen([]), "");
  assert.equal(altas.formatearAutoresResumen(null), "");
});

test("siguienteOrden sugiere 1 con la lista vacía o inválida", function () {
  assert.equal(altas.siguienteOrden([]), 1);
  assert.equal(altas.siguienteOrden(undefined), 1);
});

test("siguienteOrden sugiere el siguiente número libre después de cada autoría", function () {
  assert.equal(altas.siguienteOrden([{ orden: 1 }]), 2);
  assert.equal(altas.siguienteOrden([{ orden: 1 }, { orden: 2 }]), 3);
});

test("siguienteOrden rellena huecos y respeta órdenes escritos a mano", function () {
  assert.equal(altas.siguienteOrden([{ orden: 2 }]), 1);
  assert.equal(altas.siguienteOrden([{ orden: 1 }, { orden: 3 }]), 2);
  assert.equal(altas.siguienteOrden([{ orden: "1" }, { orden: "2" }]), 3);
});
