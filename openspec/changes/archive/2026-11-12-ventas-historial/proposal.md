# Proposal

> C-05 de `CHANGES.md` · Dueño: Joaquín · Ejercicio 3 (25 pts) · US-3.1..3.6 · Casos G-04, G-05 y G-06 · Governance MEDIO.

## Why

Las secciones Ventas e Historial siguen siendo las del parcial: el cliente se elige de `DATOS.clientes`, los libros se identifican por ISBN (I-17), el front calcula precios, subtotales y total, y la venta se guarda en `localStorage`. El Ejercicio 3 del Global pide que la venta se registre en la API y que los importes salgan de su respuesta, para que el historial conserve el precio de cada venta aunque después cambie el del libro (RN-06, D-08). Con `js/api.js` en `main` (C-02), la venta ya puede usar la API.

## What Changes

- `frontend/public/js/ventas.js` (reescrito): deja de leer `DATOS` y de llamar a `guardarDatos()`.
  - **Cliente por ID**: campo numérico y botón «Buscar cliente» con `GET /clientes/{id}`; muestra nombre y email. Un 404 se avisa, pero no bloquea la venta: si se confirma igual, la API responde 409 (G-06).
  - **Renglones** desde `GET /libros/` (todas las páginas de a 100): el `value` de cada `<select>` es el `id` del libro, no el ISBN (I-17). Agregar, cambiar cantidad y quitar renglones. Un mismo libro no puede elegirse en dos renglones.
  - **Borrador solo en memoria**: no se guarda en `localStorage`.
  - **Confirmar** con `POST /ventas/ {cliente_id, renglones:[{libro_id, cantidad}]}` y nada más. Antes se valida cliente, al menos un renglón, cantidades enteras positivas y un renglón por libro. El botón se deshabilita durante el envío y se rehabilita en `finally`.
  - **201**: se muestran precio unitario, subtotal y total **de la respuesta** (no se recalculan), se limpia el formulario y se refresca el historial.
  - **409 / 422**: se muestra el mensaje del servidor y el borrador queda como estaba.
  - **Historial** con `GET /ventas/?limit=10&offset=…` (Anterior / Siguiente) y **detalle** con `GET /ventas/{id}`: fecha, cliente, renglones e importes históricos. Como sale de la API, sobrevive a recargar la página.
  - **G-05**: formulario «Cambiar el precio de un libro» con `PATCH /libros/{id}` enviando solo `{"precio": …}`. Si hay una venta abierta en el detalle, se vuelve a pedir para ver que sus importes no cambiaron.
  - `window.actualizarSelectsVenta()` se mantiene: ahora recarga los libros desde la API.
  - Funciones puras exportadas con `if (typeof module !== "undefined")` para testearlas con `node --test`.
- `frontend/public/index.html`, solo `<section id="ventas">` y `<section id="historial">`: se quitan el renglón y la venta V-001 escritos a mano, y se agregan el campo del cliente, los mensajes, la venta confirmada, la paginación, el detalle y el formulario de precio.
- `frontend/tests/ventas.test.js` (nuevo): 14 tests con `node --test`, sin dependencias.
- `knowledge-base/10_preguntas_abiertas.md`: I-17 queda resuelta.
- **Fuera de alcance**:
  - Borrar `datos.js` y `persistencia.js` (C-07).
  - Cambiar `css/styles.css` (Belén).
  - Buscar clientes por nombre: la API no tiene `GET /clientes/`.

## Capabilities

### New Capabilities
- `ventas-historial`: registrar una venta contra la API con importes de la respuesta, conservar el borrador ante errores, consultar el historial paginado y el detalle, y comprobar el precio histórico tras un cambio de precio.

### Modified Capabilities
<!-- Ninguna: `cliente-http` y `catalogo-libros` se usan tal cual. -->

## Impact

- **Código**: `frontend/public/js/ventas.js`, las secciones `ventas` e `historial` de `frontend/public/index.html` y un test nuevo. No toca archivos de otros integrantes.
- **API consumida** (sin cambios en el backend): `GET /clientes/{id}`, `GET /libros/`, `POST /ventas/`, `GET /ventas/`, `GET /ventas/{id}` y `PATCH /libros/{id}`.
- **Integración**: llama a `window.renderCatalogo()` (C-03) después de cambiar un precio, si existe. C-07 podrá borrar `datos.js` y `persistencia.js` sin romper la venta.
