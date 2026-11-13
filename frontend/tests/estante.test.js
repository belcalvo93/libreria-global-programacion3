"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");

globalThis.window = globalThis;
require("../public/js/api.js");
var estante = require("../public/js/estante.js");

test("carga estante.js en Node sin document y con Api disponible", function () {
  assert.equal(typeof globalThis.Api, "object");
  assert.equal(typeof estante, "object");
  assert.notEqual(estante, null);
});

test("claseColorLibro reparte 5 clases distintas y se repite cada 5 ids", function () {
  var clases = [1, 2, 3, 4, 5].map(estante.claseColorLibro);
  assert.equal(new Set(clases).size, 5);
  assert.equal(estante.claseColorLibro(1), estante.claseColorLibro(6));
  assert.equal(estante.claseColorLibro(2), estante.claseColorLibro(12));
});

test("claseColorLibro da libro--c0 para 0 y para ids inválidos", function () {
  assert.equal(estante.claseColorLibro(0), "libro--c0");
  assert.equal(estante.claseColorLibro(undefined), "libro--c0");
  assert.equal(estante.claseColorLibro(-3), "libro--c0");
  assert.equal(estante.claseColorLibro(2.5), "libro--c0");
  assert.equal(estante.claseColorLibro("7"), "libro--c0");
});

function titulo(n) {
  return new Array(n + 1).join("a");
}

test("categoriaLargoTitulo separa corto, medio, largo, muy largo y extra en sus límites", function () {
  assert.equal(estante.categoriaLargoTitulo(titulo(14)), 0);
  assert.equal(estante.categoriaLargoTitulo(titulo(15)), 1);
  assert.equal(estante.categoriaLargoTitulo(titulo(30)), 1);
  assert.equal(estante.categoriaLargoTitulo(titulo(31)), 2);
  assert.equal(estante.categoriaLargoTitulo(titulo(50)), 2);
  assert.equal(estante.categoriaLargoTitulo(titulo(51)), 3);
  assert.equal(estante.categoriaLargoTitulo(titulo(60)), 3);
  assert.equal(estante.categoriaLargoTitulo(titulo(61)), 4);
  assert.equal(estante.categoriaLargoTitulo(titulo(80)), 4);
});

test("categoriaLargoTitulo trata vacío y valores raros como corto", function () {
  assert.equal(estante.categoriaLargoTitulo(""), 0);
  assert.equal(estante.categoriaLargoTitulo("Sin título"), 0);
  assert.equal(estante.categoriaLargoTitulo(null), 0);
  assert.equal(estante.categoriaLargoTitulo(undefined), 0);
});

test("claseLetraLibro da 5 tamaños y los reales caen en la categoría esperada", function () {
  assert.equal(estante.claseLetraLibro("Rayuela"), "libro--t0");
  assert.equal(estante.claseLetraLibro("Respiración artificial"), "libro--t1");
  assert.equal(estante.claseLetraLibro("Antología de la literatura fantástica"), "libro--t2");
  assert.equal(estante.claseLetraLibro(titulo(55)), "libro--t3");
  assert.equal(estante.claseLetraLibro(titulo(80)), "libro--t4");
});

test("TAMANOS_LETRA nunca baja de 0.85 rem salvo en más de 60 caracteres", function () {
  var t = estante.TAMANOS_LETRA_REM;
  assert.deepEqual(t, [1.1, 1.05, 1, 0.9, 0.8]);
  [0, 1, 2, 3].forEach(function (i) {
    assert.ok(t[i] >= 0.85);
  });
  assert.ok(t[4] >= 0.75);
  assert.ok(t[4] < t[3]);
});

test("claseAnchoLibro crece con el largo del título y el id agrega 0 o 1", function () {
  assert.equal(estante.claseAnchoLibro(2, "Rayuela"), "libro--w0");
  assert.equal(estante.claseAnchoLibro(1, "Rayuela"), "libro--w1");
  assert.equal(estante.claseAnchoLibro(2, "Respiración artificial"), "libro--w3");
  assert.equal(estante.claseAnchoLibro(1, "Respiración artificial"), "libro--w4");
  assert.equal(estante.claseAnchoLibro(2, titulo(40)), "libro--w3");
  assert.equal(estante.claseAnchoLibro(2, titulo(55)), "libro--w4");
  assert.equal(estante.claseAnchoLibro(2, titulo(80)), "libro--w4");
  assert.equal(estante.claseAnchoLibro(1, titulo(80)), "libro--w5");
});

test("claseAlturaLibro crece con el largo del título y el id agrega de 0 a 2", function () {
  assert.equal(estante.claseAlturaLibro(3, "Rayuela"), "libro--h0");
  assert.equal(estante.claseAlturaLibro(1, "Rayuela"), "libro--h1");
  assert.equal(estante.claseAlturaLibro(2, "Rayuela"), "libro--h2");
  assert.equal(estante.claseAlturaLibro(3, titulo(40)), "libro--h2");
  assert.equal(estante.claseAlturaLibro(3, titulo(80)), "libro--h4");
  assert.equal(estante.claseAlturaLibro(3, titulo(55)), "libro--h3");
  assert.equal(estante.claseAlturaLibro(3, "Respiración artificial"), "libro--h1");
  assert.equal(estante.claseAlturaLibro(2, titulo(80)), "libro--h5");
});

test("ancho y alto nunca pasan de w5 y h5 e ids inválidos usan la variante 0", function () {
  [1, 2, 3, 4, 5].forEach(function (id) {
    assert.ok(/^libro--w[0-5]$/.test(estante.claseAnchoLibro(id, titulo(80))));
    assert.ok(/^libro--h[0-5]$/.test(estante.claseAlturaLibro(id, titulo(80))));
  });
  assert.equal(estante.claseAnchoLibro(undefined, "Rayuela"), "libro--w0");
  assert.equal(estante.claseAlturaLibro(-1, "Rayuela"), "libro--h0");
  assert.equal(estante.claseAlturaLibro("2", titulo(80)), "libro--h4");
});

test("los títulos largos nunca quedan en lomos más angostos ni más bajos que los cortos", function () {
  [1, 2, 3, 4, 5, 6].forEach(function (id) {
    var corto = estante.claseAnchoLibro(id, "Rayuela").slice(-1);
    var largo = estante.claseAnchoLibro(id, titulo(55)).slice(-1);
    assert.ok(Number(largo) > Number(corto));
    assert.ok(Number(estante.claseAlturaLibro(id, titulo(55)).slice(-1)) >= Number(estante.claseAlturaLibro(id, "Rayuela").slice(-1)));
  });
});

test("claseInclinacionLibro inclina de forma determinista solo algunos ids", function () {
  assert.equal(estante.claseInclinacionLibro(3), "libro--inclinado");
  assert.equal(estante.claseInclinacionLibro(10), "libro--inclinado");
  assert.equal(estante.claseInclinacionLibro(3), estante.claseInclinacionLibro(3));
  [1, 2, 4, 7].forEach(function (id) {
    assert.equal(estante.claseInclinacionLibro(id), "");
  });
});

test("claseInclinacionLibro no inclina ids inválidos", function () {
  assert.equal(estante.claseInclinacionLibro(undefined), "");
  assert.equal(estante.claseInclinacionLibro(-4), "");
  assert.equal(estante.claseInclinacionLibro("3"), "");
  assert.equal(estante.claseInclinacionLibro(3.5), "");
});

test("clasesLibro une color, letra, ancho, alto e inclinación sin espacios de más", function () {
  assert.equal(estante.clasesLibro(1, "Rayuela"), "libro libro--c1 libro--t0 libro--w1 libro--h1");
  assert.equal(estante.clasesLibro(3, "Rayuela"), "libro libro--c3 libro--t0 libro--w1 libro--h0 libro--inclinado");
  assert.equal(estante.clasesLibro(3, "Rayuela"), estante.clasesLibro(3, "Rayuela"));
});

test("clasesLibro con id inválido usa la primera variante sin inclinación", function () {
  assert.equal(estante.clasesLibro(undefined, "Rayuela"), "libro libro--c0 libro--t0 libro--w0 libro--h0");
  assert.equal(estante.clasesLibro(-1, "Sin título"), "libro libro--c0 libro--t0 libro--w0 libro--h0");
});

test("tituloLibro recorta espacios y devuelve el título literal", function () {
  assert.equal(estante.tituloLibro({ titulo: "  Ficciones  " }), "Ficciones");
  assert.equal(estante.tituloLibro({ titulo: "<b>Rayuela</b>" }), "<b>Rayuela</b>");
});

test("tituloLibro da Sin título para vacío, null o libro null", function () {
  assert.equal(estante.tituloLibro({ titulo: "" }), "Sin título");
  assert.equal(estante.tituloLibro({ titulo: "   " }), "Sin título");
  assert.equal(estante.tituloLibro({ titulo: null }), "Sin título");
  assert.equal(estante.tituloLibro({}), "Sin título");
  assert.equal(estante.tituloLibro(null), "Sin título");
});

test("etiquetaLibro empieza con el título y termina en , ver detalle", function () {
  assert.equal(estante.etiquetaLibro("Ficciones"), "Ficciones, ver detalle");
  assert.equal(estante.etiquetaLibro("Sin título"), "Sin título, ver detalle");
});

test("decidirVistaEstante da lomos para una lista con libros", function () {
  assert.equal(estante.decidirVistaEstante([1, 2, 3, 4, 5, 6].map(function (n) { return { id: n }; })), "libros");
  assert.equal(estante.decidirVistaEstante([{ id: 1 }]), "libros");
});

test("decidirVistaEstante da vacio para [], null y valores que no son lista", function () {
  assert.equal(estante.decidirVistaEstante([]), "vacio");
  assert.equal(estante.decidirVistaEstante(null), "vacio");
  assert.equal(estante.decidirVistaEstante(undefined), "vacio");
  assert.equal(estante.decidirVistaEstante({ length: 3 }), "vacio");
});

test("PARAMETROS_ESTANTE es solo limit 12", function () {
  assert.deepEqual(estante.PARAMETROS_ESTANTE, { limit: 12 });
  assert.equal("offset" in estante.PARAMETROS_ESTANTE, false);
  assert.equal("titulo" in estante.PARAMETROS_ESTANTE, false);
});

test("elegirSeccionActiva elige la de mayor intersectionRatio", function () {
  var entradas = [
    { target: { id: "catalogo" }, isIntersecting: true, intersectionRatio: 0.2 },
    { target: { id: "libros" }, isIntersecting: true, intersectionRatio: 0.7 }
  ];
  assert.equal(estante.elegirSeccionActiva(entradas), "libros");
  assert.equal(estante.elegirSeccionActiva(entradas.slice().reverse()), "libros");
});

test("elegirSeccionActiva da null sin intersecciones e ignora las que no intersectan", function () {
  assert.equal(estante.elegirSeccionActiva([]), null);
  assert.equal(estante.elegirSeccionActiva(null), null);
  var entradas = [
    { target: { id: "catalogo" }, isIntersecting: false, intersectionRatio: 0.9 },
    { target: { id: "ventas" }, isIntersecting: true, intersectionRatio: 0.1 }
  ];
  assert.equal(estante.elegirSeccionActiva(entradas), "ventas");
  assert.equal(estante.elegirSeccionActiva([entradas[0]]), null);
});

test("elegirSeccionActiva con empate gana la primera", function () {
  var entradas = [
    { target: { id: "clientes" }, isIntersecting: true, intersectionRatio: 0.5 },
    { target: { id: "ventas" }, isIntersecting: true, intersectionRatio: 0.5 }
  ];
  assert.equal(estante.elegirSeccionActiva(entradas), "clientes");
});

test("rutaPortada da null con la lista vacía de portadas disponibles", function () {
  assert.deepEqual(estante.PORTADAS_DISPONIBLES, []);
  assert.equal(estante.rutaPortada("9789500100011", estante.PORTADAS_DISPONIBLES), null);
  assert.equal(estante.rutaPortada("9789500100011", []), null);
});

test("rutaPortada arma la ruta para archivos jpg y webp disponibles", function () {
  var lista = ["9789500100011.jpg", "9789500100028.webp"];
  assert.equal(estante.rutaPortada("9789500100011", lista), "img/portadas/9789500100011.jpg");
  assert.equal(estante.rutaPortada("9789500100028", lista), "img/portadas/9789500100028.webp");
});

test("rutaPortada da null para ISBN ausentes, inválidos o con caracteres de ruta", function () {
  var lista = ["9789500100011.jpg"];
  assert.equal(estante.rutaPortada("9789500100099", lista), null);
  assert.equal(estante.rutaPortada("", lista), null);
  assert.equal(estante.rutaPortada(null, lista), null);
  assert.equal(estante.rutaPortada("../9789500100011", lista), null);
  assert.equal(estante.rutaPortada("9789500100011", null), null);
});

test("rutaPortada no confunde un ISBN que es prefijo de otro", function () {
  var lista = ["97895001000110.jpg"];
  assert.equal(estante.rutaPortada("9789500100011", lista), null);
});

test("ningún título se recorta: tituloLibro y etiquetaLibro conservan hasta 200 caracteres", function () {
  [14, 60, 80, 200].forEach(function (n) {
    var largo = titulo(n);
    assert.equal(estante.tituloLibro({ titulo: largo }), largo);
    assert.equal(estante.etiquetaLibro(estante.tituloLibro({ titulo: largo })), largo + ", ver detalle");
    assert.equal(estante.tituloLibro({ titulo: largo }).indexOf("…"), -1);
  });
});

test("el título real de 80 caracteres con espacios se conserva tal cual", function () {
  var real = "El increíble y muy extenso tratado sobre la historia natural de los libros que n";
  assert.equal(real.length, 80);
  assert.equal(estante.tituloLibro({ titulo: "  " + real + "  " }), real);
});

test("la etiqueta del título vive en la escena, junto al gato, y no dentro del gabinete", function () {
  var fs = require("node:fs");
  var path = require("node:path");
  var html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
  var escena = html.indexOf('class="estante__escena"');
  var mueble = html.indexOf('class="estante__mueble"');
  var etiqueta = html.indexOf('id="estante-etiqueta"');
  assert.ok(escena > -1 && mueble > escena, "escena y mueble presentes");
  assert.ok(etiqueta > escena && etiqueta < mueble, "la etiqueta va entre el inicio de la escena y el gabinete");
  assert.match(html, /<p id="estante-etiqueta" class="estante__etiqueta" aria-hidden="true" hidden><\/p>/);
});

/* ----- Cola del gato (C-06g) ----- */

test("estadoColaPorDistancia: lejos de la cola, calma", function () {
  assert.equal(estante.estadoColaPorDistancia(500, 200), "calma");
  assert.equal(estante.estadoColaPorDistancia(241, 200), "calma");
});

test("estadoColaPorDistancia: a menos de 1.2 altos del gato, atenta", function () {
  assert.equal(estante.estadoColaPorDistancia(239, 200), "atenta");
  assert.equal(estante.estadoColaPorDistancia(100, 200), "atenta");
});

test("estadoColaPorDistancia: a menos de 0.4 altos del gato, inquieta", function () {
  assert.equal(estante.estadoColaPorDistancia(79, 200), "inquieta");
  assert.equal(estante.estadoColaPorDistancia(0, 120), "inquieta");
});

test("estadoColaPorDistancia: datos inválidos dan calma", function () {
  assert.equal(estante.estadoColaPorDistancia(NaN, 200), "calma");
  assert.equal(estante.estadoColaPorDistancia(10, 0), "calma");
  assert.equal(estante.estadoColaPorDistancia(undefined, 200), "calma");
});

test("pasoCola: subir de nivel es inmediato", function () {
  assert.equal(estante.pasoCola("calma", "atenta"), "atenta");
  assert.equal(estante.pasoCola("calma", "inquieta"), "inquieta");
  assert.equal(estante.pasoCola("atenta", "inquieta"), "inquieta");
});

test("pasoCola: bajar se hace de a un nivel", function () {
  assert.equal(estante.pasoCola("inquieta", "calma"), "atenta");
  assert.equal(estante.pasoCola("atenta", "calma"), "calma");
  assert.equal(estante.pasoCola("inquieta", "atenta"), "atenta");
});

test("pasoCola: mismo nivel o estado desconocido no cambia", function () {
  assert.equal(estante.pasoCola("atenta", "atenta"), "atenta");
  assert.equal(estante.pasoCola("calma", "volar"), "calma");
});

test("la cola del gato tiene base y punta dentro de su giro", function () {
  var fs = require("node:fs");
  var path = require("node:path");
  var html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
  assert.match(html, /<span class="gato__cola">\s*<span class="gato__cola-giro">\s*<span class="gato__cola-base"><\/span>\s*<span class="gato__cola-punta"><\/span>\s*<\/span>\s*<\/span>/);
});
