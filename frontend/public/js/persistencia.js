/* ==========================================================================
   Librería Página Viva — Persistencia con localStorage (Ejercicio 6)
   Se carga justo después de js/datos.js y antes del resto de los scripts:
   - Primer inicio: no hay nada guardado → se guardan los ejemplos de DATOS.
   - Siguientes aperturas: los arrays de DATOS se REEMPLAZAN por lo guardado
     (no se suman), así no se duplican ejemplos ni ventas.
   Se guardan libros, clientes y ventas. Editoriales, géneros y autores son
   fijos (no tienen alta) y siempre salen de js/datos.js.
   ========================================================================== */
(function () {
  "use strict";

  // Prefijo propio: en Chrome/Edge todas las páginas abiertas con file://
  // comparten el mismo localStorage, así no chocamos con otros proyectos.
  var PREFIJO = "paginaViva.";
  var COLECCIONES = ["libros", "clientes", "ventas"];

  // Las ventas llegan con el Ejercicio 5; si datos.js no las trae, arrancan vacías.
  if (!Array.isArray(DATOS.ventas)) {
    DATOS.ventas = [];
  }

  // localStorage puede no existir o tirar error (modo privado, permisos).
  function almacenamientoDisponible() {
    try {
      var clavePrueba = PREFIJO + "prueba";
      window.localStorage.setItem(clavePrueba, "1");
      window.localStorage.removeItem(clavePrueba);
      return true;
    } catch (error) {
      return false;
    }
  }

  var disponible = almacenamientoDisponible();

  // Devuelve el array guardado, o null si no hay nada o el JSON está roto.
  function leerColeccion(nombre) {
    var texto = window.localStorage.getItem(PREFIJO + nombre);
    if (texto === null) {
      return null;
    }
    try {
      var valor = JSON.parse(texto);
      return Array.isArray(valor) ? valor : null;
    } catch (error) {
      return null;
    }
  }

  function guardarColeccion(nombre) {
    window.localStorage.setItem(PREFIJO + nombre, JSON.stringify(DATOS[nombre]));
  }

  // Se llama después de cada alta o venta confirmada. Devuelve true si guardó.
  function guardarDatos() {
    if (!disponible) {
      return false;
    }
    try {
      COLECCIONES.forEach(guardarColeccion);
      return true;
    } catch (error) {
      // Cuota llena o almacenamiento bloqueado: la app sigue andando en memoria.
      return false;
    }
  }

  function cargarDatos() {
    if (!disponible) {
      console.warn("localStorage no disponible: los cambios se pierden al recargar.");
      return;
    }
    COLECCIONES.forEach(function (nombre) {
      var guardado = leerColeccion(nombre);
      if (guardado !== null) {
        DATOS[nombre] = guardado;
      }
    });
    // En el primer inicio deja guardados los ejemplos; si no, reescribe lo mismo.
    guardarDatos();
  }

  cargarDatos();

  // Expuesta para js/altas.js (Ej. 4) y el JS de ventas (Ej. 5).
  window.guardarDatos = guardarDatos;
})();
