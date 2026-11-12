# Proposal

> C-04 de `CHANGES.md` · Dueño: Bruno (R) · Ejercicio 2 (20 pts) · US-2.1..2.6 · Casos G-02, G-03 · Governance MEDIO.

## Why

Las secciones `#libros` y `#clientes` del parcial (`frontend/public/js/altas.js` y `frontend/public/index.html`) leen y escriben en `DATOS` (`datos.js`), guardan en `localStorage` (`persistencia.js`) y muestran filas fijas escritas a mano. El Ejercicio 2 del Global exige conectar ambas secciones con la API del TP a través de `window.Api`: poblar editoriales y géneros desde el backend, cargar autorías por ID (con rol y orden), validar al menos una autoría en el frente (D-24), dar de alta libros y clientes por `POST`, buscar clientes por ID, y mostrar errores 409/422 del servidor cerca de cada formulario.

## What Changes

- `frontend/public/js/altas.js` (reescrito): deja de usar `DATOS` y `guardarDatos()` y se conecta a la API mediante `window.Api`.
  - Carga inicial de selects con `GET /editoriales/?limit=100` y `GET /generos/?limit=100` (opción «Sin clasificar» con valor vacío que envía `genero_id: null`).
  - Gestión de autorías en memoria para el alta de libro: búsqueda por ID con `GET /autores/{id}` (mostrando nombre y manejo de 404/red), selección de rol (`autor | coautor | traductor | ilustrador`) y orden (entero `>= 1`), agregado sin repetir `autor_id` y botón para quitar cada autoría.
  - Alta de libro con `POST /libros/` validando en el frente título, ISBN, precio `> 0`, stock entero `>= 0`, editorial obligatoria y **al menos una autoría** (D-24). En 201 muestra éxito con los datos devueltos, actualiza la tabla de libros creados en la sesión y llama a `window.renderCatalogo()` si existe.
  - Alta de cliente con `POST /clientes/` y búsqueda de cliente por ID con `GET /clientes/{id}` (no existe listado de clientes en el backend).
  - Errores 404, 409 (ISBN o email repetido) y 422 mostrados con `error.message` cerca del formulario correspondiente usando `hidden`.
  - **BREAKING (interno)**: `altas.js` ya no escribe ni lee `DATOS` ni llama a `guardarDatos()`. Se conserva `datos.js` y `persistencia.js` intactos hasta C-07.
  - Exportación condicional `if (typeof module !== "undefined")` de las funciones puras de validación y armado de payloads para tests unitarios en Node.
- `frontend/public/index.html`, únicamente `<section id="libros">` y `<section id="clientes">`:
  - En `#libros`: se agrega el campo `#libro-stock` (entero `>= 0`), se reemplaza `<select id="libro-autores" multiple>` por los controles de búsqueda de autor por ID, rol, orden y lista/tabla de autorías agregadas, se quitan las filas fijas del `<tbody>` de `#tabla-libros` y se ocultan inicialmente las tablas vacías.
  - En `#clientes`: se quitan las filas fijas de `#tabla-clientes` y se agrega un formulario de búsqueda por ID (`GET /clientes/{id}`) con panel de resultado y mensajes con `hidden`.
- `README.md`: se documenta explícitamente que autores y clientes se buscan por ID porque el backend no expone listados (US-2.6, RF-14, I-18).
- `frontend/tests/altas.test.js` (nuevo): tests unitarios con `node --test`, sin dependencias externas.
- **Fuera de alcance**:
  - Borrar `js/datos.js` y `js/persistencia.js` (pertenece a C-07, Belén).
  - Modificar `css/styles.css`, `js/api.js`, `js/catalogo.js`, `js/ventas.js`, `js/estante.js` o `backend/`.
  - Modificar otras secciones de `index.html`.

## Capabilities

### New Capabilities
- `altas-libros-clientes`: alta de libros con editoriales, géneros y autorías (rol y orden), alta de clientes y búsqueda de autores y clientes por ID contra la API del TP, con validaciones en el frente y manejo de errores 404/409/422.

### Modified Capabilities
<!-- Ninguna: `cliente-http` y `catalogo-libros` se consumen tal cual sin cambiar sus requisitos. -->

## Impact

- **Código**: `frontend/public/js/altas.js`, secciones `#libros` y `#clientes` de `frontend/public/index.html`, `README.md` y `frontend/tests/altas.test.js`. Sin cambios en archivos de otros integrantes.
- **API consumida**:
  - `GET /editoriales/?limit=100` y `GET /generos/?limit=100`
  - `GET /autores/{id}`
  - `POST /libros/`
  - `POST /clientes/` y `GET /clientes/{id}`
- **Integración**:
  - Llama a `window.renderCatalogo()` tras un `POST /libros/` exitoso si está definida (dependencia blanda con C-03).
  - Deja listas las secciones de Bruno para que C-07 pueda retirar `datos.js` y `persistencia.js` después del merge de C-05.
- **Dependencias**:
  - C-02 (`window.Api`).
  - Node >= 18 para ejecutar `node --test`.
