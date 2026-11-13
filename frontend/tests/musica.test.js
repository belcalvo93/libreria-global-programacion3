"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");

var musica = require("../public/js/musica.js");

test("carga musica.js en Node sin document", function () {
  assert.equal(typeof musica.siguienteEstado, "function");
  assert.equal(typeof musica.vistaBoton, "function");
});

test("la primera interacción arranca la música desde la espera", function () {
  assert.equal(musica.siguienteEstado("espera", "interaccion"), "sonando");
});

test("el botón también arranca la música desde la espera", function () {
  assert.equal(musica.siguienteEstado("espera", "boton"), "sonando");
});

test("el botón alterna entre sonando y silenciada", function () {
  assert.equal(musica.siguienteEstado("sonando", "boton"), "silenciada");
  assert.equal(musica.siguienteEstado("silenciada", "boton"), "sonando");
});

test("si el usuario la silenció, tocar la página no la reactiva", function () {
  assert.equal(musica.siguienteEstado("silenciada", "interaccion"), "silenciada");
});

test("ocultar la pestaña pausa la música y volver la retoma", function () {
  assert.equal(musica.siguienteEstado("sonando", "ocultar"), "oculta");
  assert.equal(musica.siguienteEstado("oculta", "mostrar"), "sonando");
});

test("silenciada sigue silenciada al ocultar y al volver a la pestaña", function () {
  assert.equal(musica.siguienteEstado("silenciada", "ocultar"), "silenciada");
  assert.equal(musica.siguienteEstado("silenciada", "mostrar"), "silenciada");
});

test("ocultar o mostrar antes de la primera interacción no la arranca", function () {
  assert.equal(musica.siguienteEstado("espera", "ocultar"), "espera");
  assert.equal(musica.siguienteEstado("espera", "mostrar"), "espera");
});

test("un play() rechazado deja la música silenciada", function () {
  assert.equal(musica.siguienteEstado("sonando", "rechazo"), "silenciada");
  assert.equal(musica.siguienteEstado("espera", "rechazo"), "silenciada");
  assert.equal(musica.siguienteEstado("oculta", "rechazo"), "silenciada");
});

test("el botón con la pestaña oculta la silencia", function () {
  assert.equal(musica.siguienteEstado("oculta", "boton"), "silenciada");
});

test("un estado o evento desconocido no cambia el estado", function () {
  assert.equal(musica.siguienteEstado("sonando", "volar"), "sonando");
  assert.equal(musica.siguienteEstado("raro", "boton"), "raro");
});

test("estaSonando solo es verdadero mientras suena", function () {
  assert.equal(musica.estaSonando("sonando"), true);
  assert.equal(musica.estaSonando("oculta"), false);
  assert.equal(musica.estaSonando("silenciada"), false);
  assert.equal(musica.estaSonando("espera"), false);
});

test("vistaBoton sonando: 🔊, tooltip «Silenciar música» y presionado", function () {
  assert.deepEqual(musica.vistaBoton("sonando"), { icono: "🔊", titulo: "Silenciar música", presionado: "true" });
});

test("vistaBoton oculta se ve igual que sonando (solo la pausó la pestaña)", function () {
  assert.deepEqual(musica.vistaBoton("oculta"), musica.vistaBoton("sonando"));
});

test("vistaBoton silenciada y en espera: 🔇, tooltip «Activar música» y no presionado", function () {
  var apagado = { icono: "🔇", titulo: "Activar música", presionado: "false" };
  assert.deepEqual(musica.vistaBoton("silenciada"), apagado);
  assert.deepEqual(musica.vistaBoton("espera"), apagado);
});

test("la etiqueta accesible es fija: el estado lo comunica solo aria-pressed", function () {
  assert.equal(musica.ETIQUETA_BOTON, "Música de fondo");
  ["espera", "sonando", "silenciada", "oculta"].forEach(function (estado) {
    assert.equal(Object.prototype.hasOwnProperty.call(musica.vistaBoton(estado), "etiqueta"), false);
  });
});

test("el botón del HTML nace con la etiqueta fija y aria-pressed en false", function () {
  var fs = require("node:fs");
  var path = require("node:path");
  var html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
  assert.match(html, /<button id="boton-musica"[^>]*aria-pressed="false"[^>]*aria-label="Música de fondo"/);
});

test("VOLUMEN_INICIAL es bajo (0.3)", function () {
  assert.equal(musica.VOLUMEN_INICIAL, 0.3);
});

/* ----- Fundido de volumen (C-06h) ----- */

test("siguienteVolumen sube un paso hacia el objetivo", function () {
  assert.equal(musica.siguienteVolumen(0, 0.3, 0.05), 0.05);
  assert.equal(musica.siguienteVolumen(0.1, 0.3, 0.05), 0.15);
});

test("siguienteVolumen baja un paso hacia el objetivo", function () {
  assert.equal(musica.siguienteVolumen(0.3, 0, 0.1), 0.2);
  assert.equal(musica.siguienteVolumen(0.25, 0, 0.05), 0.2);
});

test("siguienteVolumen no se pasa del objetivo", function () {
  assert.equal(musica.siguienteVolumen(0.28, 0.3, 0.05), 0.3);
  assert.equal(musica.siguienteVolumen(0.02, 0, 0.05), 0);
  assert.equal(musica.siguienteVolumen(0.3, 0.3, 0.05), 0.3);
});

test("siguienteVolumen redondea a 3 decimales (sin restos de coma flotante)", function () {
  assert.equal(musica.siguienteVolumen(0.1, 0.3, 0.2 / 3), 0.167);
});

test("siguienteVolumen con datos inválidos devuelve el objetivo", function () {
  assert.equal(musica.siguienteVolumen(NaN, 0.3, 0.05), 0.3);
  assert.equal(musica.siguienteVolumen(0.1, 0.3, 0), 0.3);
  assert.equal(musica.siguienteVolumen(0.1, 0.3, -1), 0.3);
});

test("pasoPorCuadro reparte la diferencia en los cuadros de la duración", function () {
  // 0 → 0.3 en 1500 ms a ~16.7 ms por cuadro: 90 cuadros
  assert.equal(musica.pasoPorCuadro(0, 0.3, 1500, 1000 / 60), 0.3 / 90);
  // 0.3 → 0 en 600 ms: 36 cuadros
  assert.equal(musica.pasoPorCuadro(0.3, 0, 600, 1000 / 60), 0.3 / 36);
});

test("pasoPorCuadro con duración menor a un cuadro hace todo en un paso", function () {
  assert.equal(musica.pasoPorCuadro(0, 0.3, 0, 1000 / 60), 0.3);
  assert.equal(musica.pasoPorCuadro(0.2, 0.2, 600, 1000 / 60), 0);
});

test("las duraciones del fundido son 1.5 s al subir y 0.6 s al bajar", function () {
  assert.equal(musica.FUNDIDO_SUBIDA_MS, 1500);
  assert.equal(musica.FUNDIDO_BAJADA_MS, 600);
});
