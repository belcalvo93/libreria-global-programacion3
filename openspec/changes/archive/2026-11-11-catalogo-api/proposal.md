# Proposal

> C-03 de `CHANGES.md` · Dueño: Hernán · Ejercicio 1 (20 pts) · US-1.1..1.6 · Caso G-01 · Governance MEDIO.

## Why

El catálogo del parcial (`js/catalogo.js`) se arma con datos fijos de `datos.js` y la tabla del `index.html` trae filas escritas a mano. El Ejercicio 1 del Global pide que el catálogo salga de la API del TP: búsqueda por título, paginación con `limit`/`offset`, detalle con autores y estados visibles para el usuario. Ahora que `js/api.js` está en `main` (C-02), el catálogo ya puede consumirla. Además, C-04 (altas) necesita `window.renderCatalogo()` para refrescar la vista, y C-06 (estante) se construye sobre este catálogo.

## What Changes

- `frontend/public/js/catalogo.js` (reescrito): deja de leer `DATOS` y pide `GET /libros/?titulo=&limit=&offset=` con `Api.get`.
  - Tabla con título, ISBN, precio, editorial y género. Un género `null` se muestra como «Sin clasificar» (RF-04).
  - Búsqueda parcial por título al enviar el formulario (Enter o botón), con `event.preventDefault()` en la primera línea. Al cambiar el filtro, `offset` vuelve a 0 (RF-03).
  - Paginación con «Anterior» y «Siguiente» de 5 libros por página. La respuesta no trae total: si llegaron `limit` libros, se asume que puede haber más.
  - Detalle del libro con `GET /libros/{id}`: datos del libro y autores con rol y orden. Un 404 muestra el mensaje del servidor.
  - Cuatro estados distinguibles (RF-05): cargando, lista vacía, búsqueda sin coincidencias y error de conexión. Todos usan mensajes con `hidden`.
  - **BREAKING (interno)**: `window.renderCatalogo()` ya no filtra en memoria. Recarga desde la API la página y el filtro actuales y devuelve una promesa. Hoy nadie la llama con argumentos.
  - Nuevo `window.mostrarDetalleLibro(id)` para que el estante de C-06 reutilice el detalle.
  - Las funciones puras se exportan con `if (typeof module !== "undefined")` para testearlas en Node. El navegador lo sigue cargando como script clásico.
- `frontend/public/index.html`, solo `<section id="catalogo">`:
  - La búsqueda pasa a ser un `<form>`.
  - Se quitan las filas fijas y la columna «Autores», porque `LibroResumen` no trae autores.
  - Se agregan los mensajes de cargando y error, la paginación y el panel de detalle.
- `frontend/tests/catalogo.test.js` (nuevo): tests con `node --test`, sin dependencias. Quedan fuera de `public/`, así que no entran en la imagen de nginx.
- **Fuera de alcance**:
  - El filtro `genero_id` de `GET /libros/` existe en la API pero el catálogo **no lo usa** (D-30, decisión de Hernán).
  - Borrar `datos.js` y `persistencia.js` (eso es C-07).
  - Cambiar `css/styles.css` (es de Belén).

## Capabilities

### New Capabilities
- `catalogo-libros`: consulta del catálogo de libros desde la API. Cubre listado paginado, búsqueda por título, presentación de campos (género nulo, precio), detalle con autorías, estados de la vista y los puntos de integración que usan otras secciones (`renderCatalogo`, `mostrarDetalleLibro`).

### Modified Capabilities
<!-- Ninguna: `cliente-http` se consume tal cual, sin cambiar sus requisitos. -->

## Impact

- **Código**: `frontend/public/js/catalogo.js`, la sección `catalogo` de `frontend/public/index.html` y un archivo de test nuevo. No toca archivos de otros integrantes.
- **API consumida**:
  - `GET /libros/` con `titulo`, `limit` y `offset`. Devuelve `LibroResumen[]`, ordenado por `id`.
  - `GET /libros/{id}`. Devuelve `LibroRead` o un 404 «El libro no existe».
  - No hay cambios en el backend.
- **Integración**:
  - C-04 (Bruno) llama a `window.renderCatalogo()` después de un alta.
  - C-06 (Belén) puede usar `window.mostrarDetalleLibro(id)`.
  - C-07 podrá borrar `datos.js` sin romper el catálogo.
- **Dependencias**:
  - C-02 (`window.Api`).
  - Node ≥ 18, solo para correr los tests en desarrollo. No es dependencia de runtime.
- **Docs**: D-30 en `knowledge-base/09_decisiones_y_supuestos.md`, y la pregunta del filtro `genero_id` se marca como resuelta en `10_preguntas_abiertas.md`.
