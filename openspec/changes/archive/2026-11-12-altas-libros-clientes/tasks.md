# Tasks

## 1. Lógica pura de altas y tests unitarios (Strict TDD)

- [x] 1.1 Crear `frontend/tests/altas.test.js` (cargando `api.js` y `altas.js` con `globalThis.window = globalThis`) y el esqueleto IIFE de `frontend/public/js/altas.js` con `"use strict"`, `var`, guarda `typeof document !== "undefined"` y exportación condicional `module.exports`. Verificar ejecutando `node --test frontend/tests/altas.test.js`.
- [x] 1.2 Implementar con ciclo RED/GREEN/TRIANGULATE los validadores puros (`esEnteroPositivo`, `esEnteroNoNegativo`, `esPrecioValido`, `esEmailValido`, `validarAutoria`, `validarLibroFormulario`, `validarClienteFormulario`), cubriendo >= 1 autoría obligatoria (D-24), stock entero >= 0, precio > 0 con hasta 2 decimales y rechazo de autor duplicado. Verificar con `node --test frontend/tests/altas.test.js`.
- [x] 1.3 Implementar con ciclo RED/GREEN/TRIANGULATE `armarCuerpoLibro`, `armarCuerpoCliente`, `formatearPrecio` y `formatearAutoresResumen` (incluyendo `genero_id: null` para «Sin clasificar» y tipos numéricos exactos para el DTO `extra="forbid"`). Verificar que todos los tests pasan y refactorizar sin duplicación manteniendo `node --test frontend/tests/altas.test.js` en verde.

## 2. Estructura HTML de `#libros` y `#clientes`

- [x] 2.1 Actualizar únicamente `<section id="libros">` en `frontend/public/index.html`: quitar opciones y filas fijas del parcial, agregar `#libro-stock` (`min="0"`, `step="1"`), reemplazar `<select id="libro-autores" multiple>` por los controles de autorías por ID (`#autor-id-buscar`, `#autor-buscar`, `#autor-encontrado`, `#autor-rol`, `#autor-orden`, `#autor-agregar`, `#mensaje-error-autor`, `#mensaje-libro-sin-autorias`, `#tabla-libro-autorias`), dejar `#tabla-libros` oculta (`hidden`) con `tbody` vacío y cambiar el texto de `#mensaje-libros-vacia` a «Todavía no agregaste libros en esta sesión.». Verificar por inspección que todos los controles tienen `<label>` o texto accesible y sin `<output>` dentro de `.form__grupo`.
- [x] 2.2 Actualizar únicamente `<section id="clientes">` en `frontend/public/index.html`: quitar filas fijas de `#tabla-clientes` y dejarla oculta (`hidden`), cambiar el texto de `#mensaje-clientes-vacia` a «Todavía no agregaste clientes en esta sesión.», agregar el formulario `#form-buscar-cliente` (`#cliente-id-buscar`, `#cliente-buscar`), el panel de resultado `#cliente-resultado` (`hidden`) y `#mensaje-error-buscar-cliente` (`role="alert"`, `hidden`). Verificar que el resto de `index.html` permanece intacto.

## 3. Capa DOM e integración con la API en `js/altas.js` y documentación

- [x] 3.1 Implementar en `frontend/public/js/altas.js` la carga inicial con `Api.get("/editoriales/", { limit: 100 })` y `Api.get("/generos/", { limit: 100 })` (agregando «Sin clasificar» con valor `""`), la búsqueda de autor por ID (`Api.get("/autores/" + encodeURIComponent(id))`), la gestión de la lista de autorías en memoria (agregar y quitar por botón), el `keydown` de Enter en `#autor-id-buscar` (busca) y `#autor-orden` (agrega) con `event.preventDefault()` para no enviar `#form-libro`, y el manejo de errores con `hidden`. Verificar que `node --test frontend/tests/altas.test.js` sigue en verde.
- [x] 3.2 Implementar en `frontend/public/js/altas.js` el alta de libro (`Api.post("/libros/", ...)`), alta de cliente (`Api.post("/clientes/", ...)`) y búsqueda de cliente por ID (`Api.get("/clientes/" + encodeURIComponent(id))`), con `event.preventDefault()` en la primera línea de cada `submit`, deshabilitado de botones en envío (`finally`), inserción exclusiva por `createElement`/`textContent`, tabla de sesión para registros 201 (ocultando el mensaje de tabla vacía), llamada a `window.renderCatalogo()` si existe y sin llamar más a `window.actualizarSelectsVenta()`. Verificar por búsqueda estática que no hay `innerHTML`, `style.display`, `fetch(`, `localStorage` ni `DATOS` en `altas.js`.
- [x] 3.3 Documentar en `README.md` que autores y clientes se buscan por ID (`GET /autores/{id}` y `GET /clientes/{id}`) porque la API no expone listados (US-2.6, RF-14, I-18). Verificar la lectura del apartado agregado en `README.md`.

## 4. Verificación integrada

- [x] 4.1 Ejecutar la suite completa `node --test "frontend/tests/*.test.js"` y revisar que todos los tests (propios y existentes) pasan sin errores ni regresiones.
- [x] 4.2 Verificar estáticamente reglas duras sobre `frontend/public/js/altas.js` y `frontend/public/index.html` (sin `innerHTML`, sin `style.display`, sin estilos inline, `fetch(` solo en `api.js`, sin `DATOS`/`localStorage` en `altas.js`, `git diff` acotado a los archivos permitidos).

## Workflow follow-up

- Probar manualmente G-02 (alta de libro con stock, género opcional y autorías, refresco del catálogo y 409 por ISBN repetido) y G-03 (alta de cliente, búsqueda por ID y 409 por email repetido) contra el stack levantado detrás de nginx, y guardar capturas de UI y F12 -> Red en `evidencia/` (`G-02_...`, `G-03_...`) cuando se integre la evidencia (C-11).
- Ejecutar `/opsx:archive` (`openspec archive altas-libros-clientes`) y marcar `[x]` en `CHANGES.md` para C-04 antes de abrir el PR.
- Abrir PR desde `feat/altas-libros-clientes` hacia `main` para revisión de otro integrante y merge común (sin squash, sin firma de IA), avisando a Joaquín y Belén que hasta C-05 los libros y clientes creados por la API no aparecen en los selectores de ventas.
