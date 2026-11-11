# Tasks

## 1. Lógica pura del catálogo y tests unitarios (Strict TDD)

- [x] 1.1 Crear `frontend/tests/catalogo.test.js` (con `node --test` y `globalThis.window = globalThis` cargando `frontend/public/js/api.js`) y el esqueleto IIFE de `frontend/public/js/catalogo.js` con `"use strict"`, `var`, guarda `typeof document !== "undefined"` y exportación condicional `if (typeof module !== "undefined" && module.exports)`. Verificar ejecutando `node --test frontend/tests/catalogo.test.js`.
- [x] 1.2 Implementar con ciclo RED/GREEN/TRIANGULATE `textoGenero(libro)`, `formatearPrecio(precio)` (usando `Api.numero`) y `autoriasOrdenadas(autores)` (orden ascendente por `orden`), cubriendo al menos dos casos por comportamiento (género presente y `null` → «Sin clasificar», decimales en texto, autores desordenados y vacíos). Verificar que todos los casos pasan con `node --test frontend/tests/catalogo.test.js`.
- [x] 1.3 Implementar con ciclo RED/GREEN/TRIANGULATE `parametrosListado(estado)` (`trim` de `titulo`, omisión de vacío, `limit` y `offset`), `decidirVista(cantidad, estado)` (`"tabla"`, `"vacia"`, `"sin-resultados"`, `"fin"`) y `hayMas(cantidad, limite)`, cubriendo página 1 vs página > 1 y límites exactos. Verificar que todos los casos pasan con `node --test frontend/tests/catalogo.test.js`.
- [x] 1.4 Refactorizar las funciones puras en `frontend/public/js/catalogo.js` (sin duplicación y con comentario breve aclarando el `module.exports` para tests en Node) y verificar que `node --test frontend/tests/catalogo.test.js` sigue verde.

## 2. Estructura HTML de `<section id="catalogo">`

- [x] 2.1 Modificar únicamente `<section id="catalogo">` en `frontend/public/index.html`: convertir la búsqueda en `<form id="form-catalogo" class="form" role="search" novalidate>` con botón `type="submit"`, quitar las filas fijas del `<tbody>` y la columna «Autores», dejar las columnas Título, ISBN, Precio, Editorial, Género y Detalle, y ocultar `#tabla-catalogo` inicialmente con `hidden`. Verificar que el resto del `index.html` queda intacto.
- [x] 2.2 Agregar en `<section id="catalogo">` (reutilizando clases de `styles.css`, sin estilos inline ni `<nav>`) los mensajes `#mensaje-catalogo-cargando` (`role="status"`, `hidden`) y `#mensaje-catalogo-error` (`role="alert"`, `hidden`), el bloque de paginación con `#catalogo-anterior`, `#catalogo-siguiente` y `<output id="catalogo-pagina">`, y el panel `#catalogo-detalle` (`hidden`) con título enfocable (`tabindex="-1"`), campos de detalle, tabla de autorías, `#mensaje-catalogo-detalle-error` (`role="alert"`, `hidden`) y botón «Cerrar detalle». Verificar por inspección que todos los controles tienen nombre accesible.

## 3. Capa DOM, integración y estados en `js/catalogo.js`

- [x] 3.1 Implementar el estado en memoria (`{ titulo: "", offset: 0, limite: 5, peticion: 0 }`), la carga mediante `Api.get("/libros/", parametrosListado(estado))`, el descarte de respuestas fuera de orden por contador `peticion`, la gestión de estados (`cargando`, `vacia`, `sin-resultados`, `fin`, `error`) usando únicamente `hidden`, y el bloqueo de botones mientras carga. Verificar que `node --test frontend/tests/catalogo.test.js` sigue pasando.
- [x] 3.2 Implementar el renderizado de `#tabla-catalogo` usando solo `document.createElement` y `textContent` (con botón «Ver detalle» y `aria-label` con `setAttribute`), el manejador `submit` de `#form-catalogo` con `event.preventDefault()` en la primera línea (reiniciando `offset` a 0) y los eventos de `#catalogo-anterior` y `#catalogo-siguiente` (incluyendo la restauración de `offset` en `"fin"`). Verificar mediante búsqueda en el archivo que no existen `innerHTML`, `style.display`, `fetch(`, `localStorage` ni `DATOS`.
- [x] 3.3 Implementar la consulta de detalle con `Api.get("/libros/" + id)`, el renderizado en `#catalogo-detalle` (incluyendo `stock`, género y autorías ordenadas), el manejo de foco al abrir y cerrar el detalle, el error en `#mensaje-catalogo-detalle-error` (sin tocar la tabla), y la exposición de `window.renderCatalogo()` (promesa que nunca rechaza) y `window.mostrarDetalleLibro(id)` dentro de la IIFE. Verificar con `node --test frontend/tests/catalogo.test.js`.

## 4. Verificación integrada y prueba manual G-01

- [x] 4.1 Ejecutar la verificación estática de reglas duras sobre `frontend/public/js/catalogo.js` y `frontend/public/index.html` (`fetch(` solo en `api.js`, sin `innerHTML` ni `style.display` ni estilos inline ni `DATOS` en `catalogo.js`) y confirmar `node --test frontend/tests/catalogo.test.js` con el 100% de los tests en verde.
- [x] 4.2 Probar manualmente el caso G-01 detrás de nginx (`http://127.0.0.1:8080`) contra el backend local con la base `libreria_tp` y el seed: carga inicial (5 libros), «Siguiente» (página 2 con la «Antología de la literatura fantástica» → «Sin clasificar»), «Anterior», búsqueda parcial con reinicio de `offset`, búsqueda sin coincidencias, detalle de la Antología (3 autorías con rol y orden), error con el backend apagado, recorrido completo con Tab y verificación sin scroll horizontal de página en 320 px y 1280 px.

## Workflow follow-up

- Guardar capturas de pantalla de la UI y de F12 → Red en `evidencia/` (`G-01_...`) cuando corresponda reunir la evidencia del grupo.
- Archivar el change (`/opsx:archive` / `openspec archive catalogo-api`) y marcar `[x]` en `CHANGES.md` para C-03 antes de abrir el PR.
- Abrir PR desde `feat/catalogo-api` hacia `main` para revisión de otro integrante y merge común (sin squash).
