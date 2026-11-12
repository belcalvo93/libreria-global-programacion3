"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");

globalThis.window = globalThis;
require("../public/js/api.js");
var ventas = require("../public/js/ventas.js");

test("carga ventas.js en Node sin document", function () {
  assert.equal(typeof ventas, "object");
  assert.equal(typeof ventas.validarBorrador, "function");
});

test("enteroPositivo acepta solo enteros mayores que cero escritos como dígitos", function () {
  ["1", "2", " 15 ", 7].forEach(function (valor) {
    assert.equal(ventas.enteroPositivo(valor), true, String(valor));
  });
  ["", "0", "-1", "1.5", "1e2", "abc", null, undefined].forEach(function (valor) {
    assert.equal(ventas.enteroPositivo(valor), false, String(valor));
  });
});

test("validarBorrador exige el ID del cliente y al menos un renglón", function () {
  assert.match(ventas.validarBorrador("", [{ libroId: "1", cantidad: "1" }]), /ID del cliente/);
  assert.match(ventas.validarBorrador("0", [{ libroId: "1", cantidad: "1" }]), /ID del cliente/);
  assert.equal(ventas.validarBorrador("2", []), "Agregá al menos un renglón.");
});

test("validarBorrador exige libro elegido y cantidad entera positiva en cada renglón", function () {
  assert.equal(ventas.validarBorrador("2", [{ libroId: "", cantidad: "1" }]), "Elegí el libro del renglón 1.");
  assert.match(ventas.validarBorrador("2", [{ libroId: "1", cantidad: "1" }, { libroId: "3", cantidad: "0" }]),
    /cantidad del renglón 2/);
  assert.match(ventas.validarBorrador("2", [{ libroId: "1", cantidad: "1.5" }]), /cantidad del renglón 1/);
});

test("validarBorrador rechaza el mismo libro en dos renglones (un renglón por libro)", function () {
  var mensaje = ventas.validarBorrador("2", [
    { libroId: "1", cantidad: "1" },
    { libroId: "3", cantidad: "1" },
    { libroId: "1", cantidad: "2" }
  ]);
  assert.equal(mensaje, "El libro del renglón 3 ya está en el renglón 1. Un mismo libro no puede aparecer en dos renglones.");
});

test("validarBorrador devuelve vacío con un borrador válido de dos renglones", function () {
  assert.equal(ventas.validarBorrador("2", [{ libroId: "1", cantidad: "2" }, { libroId: "4", cantidad: "1" }]), "");
});

test("renglonConLibro devuelve el número del renglón que ya tiene el libro", function () {
  var renglones = [{ libroId: "1" }, { libroId: "4" }];
  assert.equal(ventas.renglonConLibro(renglones, "4", -1), 2);
  assert.equal(ventas.renglonConLibro(renglones, 4, -1), 2);
  assert.equal(ventas.renglonConLibro(renglones, "4", 1), 0);
  assert.equal(ventas.renglonConLibro(renglones, "9", -1), 0);
});

test("cuerpoVenta manda solo cliente_id y renglones con libro_id y cantidad numéricos", function () {
  var cuerpo = ventas.cuerpoVenta(" 2 ", [{ libroId: "1", cantidad: "2", titulo: "no va" }, { libroId: "4", cantidad: " 1 " }]);
  assert.deepEqual(cuerpo, {
    cliente_id: 2,
    renglones: [{ libro_id: 1, cantidad: 2 }, { libro_id: 4, cantidad: 1 }]
  });
  assert.deepEqual(Object.keys(cuerpo).sort(), ["cliente_id", "renglones"]);
});

test("formatearImporte solo da formato a los importes de la API, sin recalcular", function () {
  assert.equal(ventas.formatearImporte("69500.00"), "69500.00");
  assert.equal(ventas.formatearImporte("1500"), "1500.00");
  assert.equal(ventas.formatearImporte(19500.5), "19500.50");
  assert.equal(ventas.formatearImporte(null), "");
  assert.equal(ventas.formatearImporte("abc"), "");
});

test("formatearFecha pasa el ISO de la API a dd/mm/aaaa hh:mm en hora local", function () {
  var iso = "2026-11-12T23:16:00Z";
  var local = new Date(iso);
  var esperado = String(local.getDate()).padStart(2, "0") + "/" + String(local.getMonth() + 1).padStart(2, "0") +
    "/" + local.getFullYear() + " " + String(local.getHours()).padStart(2, "0") + ":" +
    String(local.getMinutes()).padStart(2, "0");
  assert.equal(ventas.formatearFecha(iso), esperado);
  assert.equal(ventas.formatearFecha(""), "");
  assert.equal(ventas.formatearFecha("no es fecha"), "");
});

test("textoCliente muestra nombre y email", function () {
  assert.equal(ventas.textoCliente({ id: 2, nombre: "Tomás Ríos", email: "tomas@example.com" }), "Tomás Ríos (tomas@example.com)");
  assert.equal(ventas.textoCliente(null), "");
});

test("hayMas asume más páginas solo si llegó una página llena", function () {
  assert.equal(ventas.hayMas(10, 10), true);
  assert.equal(ventas.hayMas(3, 10), false);
  assert.equal(ventas.hayMas(0, 10), false);
});

test("validarPrecio acepta mayores que cero con hasta dos decimales", function () {
  assert.equal(ventas.validarPrecio("31000"), "31000");
  assert.equal(ventas.validarPrecio("2500.5"), "2500.5");
  assert.equal(ventas.validarPrecio("2500,50"), "2500.50");
  ["", "0", "-10", "1.234", "abc", "123456789"].forEach(function (valor) {
    assert.equal(ventas.validarPrecio(valor), "", valor);
  });
});

test("textoOpcionLibro muestra título, precio de catálogo y stock", function () {
  assert.equal(ventas.textoOpcionLibro({ id: 1, titulo: "Rayuela", precio: "25000.00", stock: 12 }), "Rayuela — $25000.00 (stock 12)");
});
