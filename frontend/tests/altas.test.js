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

// ---- Errores por campo (rev. 14) ----

var libroValido = {
  titulo: "Rayuela",
  isbn: "9780000000001",
  precio: "100.50",
  stock: "3",
  editorialId: "1",
  generoId: "",
  autorias: [{ autor_id: 1, rol: "autor", orden: 1 }]
};

test("erroresLibroPorCampo devuelve objeto vacío si todo es válido", function () {
  assert.deepEqual(altas.erroresLibroPorCampo(libroValido), {});
});

test("erroresLibroPorCampo informa cada campo inválido con texto específico y en orden", function () {
  var errores = altas.erroresLibroPorCampo({
    titulo: " ", isbn: "", precio: "0", stock: "-1", editorialId: "", autorias: []
  });
  assert.deepEqual(errores, {
    "libro-titulo": "Escribí el título.",
    "libro-isbn": "El ISBN es obligatorio.",
    "libro-precio": "El precio tiene que ser mayor a 0.",
    "libro-stock": "El stock tiene que ser un número entero desde 0.",
    "libro-editorial": "Elegí una editorial.",
    "autor-id-buscar": "Agregá al menos un autor."
  });
  assert.equal(Object.keys(errores)[0], "libro-titulo");
});

test("erroresLibroPorCampo marca solo los campos malos y coincide con validarLibroFormulario", function () {
  var malo = Object.assign({}, libroValido, { precio: "abc" });
  assert.deepEqual(Object.keys(altas.erroresLibroPorCampo(malo)), ["libro-precio"]);
  assert.notEqual(altas.validarLibroFormulario(malo), "");
  var autoriaRota = Object.assign({}, libroValido, { autorias: [{ autor_id: 0, rol: "x", orden: 0 }] });
  assert.deepEqual(Object.keys(altas.erroresLibroPorCampo(autoriaRota)), ["autor-id-buscar"]);
  assert.equal(altas.erroresLibroPorCampo(autoriaRota)["autor-id-buscar"], "Revisá los datos de las autorías cargadas.");
});

test("erroresClientePorCampo valida nombre y email", function () {
  assert.deepEqual(altas.erroresClientePorCampo({ nombre: "Ana", email: "a@b.com" }), {});
  assert.deepEqual(altas.erroresClientePorCampo({ nombre: "", email: "" }), {
    "cliente-nombre": "Escribí el nombre.",
    "cliente-email": "El email es obligatorio."
  });
  assert.deepEqual(altas.erroresClientePorCampo({ nombre: "Ana", email: "nope" }), {
    "cliente-email": "El email no tiene un formato válido."
  });
});

test("campoDeConflicto mapea 409 al ISBN o al email, y nada para otros errores", function () {
  var e409 = { status: 409, message: "Ya existe un libro con ese ISBN." };
  assert.deepEqual(altas.campoDeConflicto(e409, "libro"), { campoId: "libro-isbn", mensaje: "Ya existe un libro con ese ISBN." });
  assert.deepEqual(altas.campoDeConflicto({ status: 409, message: "Email repetido" }, "cliente"), { campoId: "cliente-email", mensaje: "Email repetido" });
  assert.equal(altas.campoDeConflicto({ status: 500, message: "x" }, "libro"), null);
  assert.equal(altas.campoDeConflicto(null, "cliente"), null);
});

function crearDocFalso() {
  var creados = [];
  function nuevoElemento(id) {
    var attrs = {};
    var el = {
      id: id || "",
      hidden: false,
      textContent: "",
      className: "",
      parentNode: null,
      nextSibling: null,
      setAttribute: function (k, v) { attrs[k] = String(v); if (k === "hidden") { el.hidden = true; } },
      removeAttribute: function (k) { delete attrs[k]; if (k === "hidden") { el.hidden = false; } },
      getAttribute: function (k) { return k in attrs ? attrs[k] : null; }
    };
    return el;
  }
  var padre = {
    hijos: [],
    insertBefore: function (nuevo, ref) {
      var i = ref ? padre.hijos.indexOf(ref) : padre.hijos.length;
      padre.hijos.splice(i, 0, nuevo);
      nuevo.parentNode = padre;
    }
  };
  var control = nuevoElemento("libro-titulo");
  control.parentNode = padre;
  padre.hijos.push(control);
  var doc = {
    createElement: function () { var el = nuevoElemento(""); creados.push(el); return el; },
    getElementById: function (id) {
      if (id === control.id) { return control; }
      return padre.hijos.filter(function (h) { return h.id === id; })[0] || null;
    }
  };
  return { doc: doc, control: control, padre: padre, creados: creados };
}

test("mostrarErrorCampo crea una sola vez el mensaje, marca aria-invalid y lo vincula", function () {
  var f = crearDocFalso();
  altas.mostrarErrorCampo(f.control, "Escribí el título.", null, f.doc);
  assert.equal(f.control.getAttribute("aria-invalid"), "true");
  assert.equal(f.control.getAttribute("aria-describedby"), "libro-titulo-error");
  var msg = f.padre.hijos[1];
  assert.equal(msg.id, "libro-titulo-error");
  assert.equal(msg.className, "mensaje-campo");
  assert.equal(msg.textContent, "Escribí el título.");
  assert.equal(msg.hidden, false);
  altas.mostrarErrorCampo(f.control, "Otro texto.", null, f.doc);
  assert.equal(f.padre.hijos.length, 2);
  assert.equal(f.padre.hijos[1].textContent, "Otro texto.");
});

test("limpiarErrorCampo quita aria-invalid y oculta el mensaje; sin mensaje no falla", function () {
  var f = crearDocFalso();
  assert.doesNotThrow(function () { altas.limpiarErrorCampo(f.control, f.doc); });
  altas.mostrarErrorCampo(f.control, "Escribí el título.", null, f.doc);
  altas.limpiarErrorCampo(f.control, f.doc);
  assert.equal(f.control.getAttribute("aria-invalid"), null);
  assert.equal(f.control.getAttribute("aria-describedby"), null);
  assert.equal(f.padre.hijos[1].hidden, true);
});

test("mostrarErrorCampo inserta después del ancla indicada", function () {
  var f = crearDocFalso();
  var ancla = { id: "ancla", parentNode: f.padre };
  f.padre.hijos.push(ancla);
  altas.mostrarErrorCampo(f.control, "x", ancla, f.doc);
  assert.equal(f.padre.hijos.indexOf(ancla) + 1, f.padre.hijos.indexOf(f.doc.getElementById("libro-titulo-error")));
});
