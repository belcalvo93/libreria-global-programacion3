# Design

## Context

- **Estado actual**: `frontend/public/js/altas.js` lee y modifica `DATOS` (`datos.js`), llama a `guardarDatos()` (`persistencia.js`) y `window.actualizarSelectsVenta()`, y las secciones `#libros` y `#clientes` de `frontend/public/index.html` traen filas y opciones fijas del parcial (sin campo `stock` ni búsqueda de autores/clientes por ID).
- **Disponible en `main`**: `window.Api` (`js/api.js`) y `window.renderCatalogo()` (`js/catalogo.js`).
- **Contrato** (`knowledge-base/11_contrato_api.md`):
  - `GET /editoriales/?limit=100` y `GET /generos/?limit=100` devuelven listas paginadas (RN-10).
  - `GET /autores/{id}` devuelve `AutorRead` (`id`, `nombre`, `nacionalidad`) o 404.
  - `POST /libros/` (`extra="forbid"`) recibe `{ isbn, titulo, precio, stock, editorial_id, genero_id, autores }` y responde 201 `LibroRead` | 409 | 422. El DTO del back no exige `min_length=1` en `autores`, por lo que el frente valida `>= 1` autoría (D-24).
  - `POST /clientes/` (`extra="forbid"`) recibe `{ nombre, email }` y responde 201 `ClienteRead` | 409 | 422.
  - `GET /clientes/{id}` devuelve `ClienteRead` (`id`, `nombre`, `email`, `perfil`) o 404. Se ignora `perfil` (I-04).
- **Restricciones** (`AGENTS.md`):
  - IIFE clásica con `"use strict"` y `var`; sin módulos, librerías ni estilos inline.
  - Solo `textContent` y `createElement`; mensajes con `hidden` (nunca `style.display`); `event.preventDefault()` como primera línea de cada `submit`.
  - No tocar `css/styles.css` (de Belén), ni borrar `datos.js`/`persistencia.js` (C-07), ni modificar secciones ajenas del HTML.

## Goals / Non-Goals

**Goals:**
- Separar la lógica pura de validación, normalización y armado de payloads en `js/altas.js` para probarla con `node --test` en `frontend/tests/altas.test.js` (Strict TDD).
- Reemplazar por completo las lecturas/escrituras sobre `DATOS` y `localStorage` en `altas.js` por llamadas vía `window.Api`.
- Reutilizar exclusivamente las clases existentes de `css/styles.css` (`.form`, `.form__grupo`, `.btn`, `.btn--peligro`, `.tabla-contenedor`, `.tabla`, `.mensaje`, `.mensaje--error`, `.mensaje--ok`).

**Non-Goals:**
- Crear o editar autores, editoriales o géneros desde el front (no usados por la consigna, KB 11).
- Editar libros existentes (`PATCH /libros/{id}` pertenece a C-05 / caso G-05).
- Modificar `css/styles.css` ni actualizar la estantería (`estante.js` no expone refresco y es de C-06).

## Decisions

1. **Arquitectura de dos capas en `js/altas.js` (mismo patrón que `catalogo.js` y `estante.js`).**
   - *Capa pura* (sin `window` ni `document`): validadores (`esEnteroPositivo`, `esEnteroNoNegativo`, `esPrecioValido`, `esEmailValido`, `validarAutoria`, `validarLibroFormulario`, `validarClienteFormulario`), constructores de payloads (`armarCuerpoLibro`, `armarCuerpoCliente`) y formateadores (`formatearAutoresResumen`, `formatearPrecio`).
   - *Capa DOM*: carga inicial de selects, estado en memoria del borrador de autorías (`autorSeleccionado`, `autorias`), manejo de eventos `submit`/`click` y render con `createElement`/`textContent`.
   - Exportación condicional al final de la IIFE (`if (typeof module !== "undefined" && module.exports)`) y cableado DOM protegido con `if (typeof document !== "undefined")`.
   - Alternativa descartada: separar en dos archivos JS (`altas-logica.js` + `altas.js`), porque requiere agregar otro `<script>` en el `index.html` compartido.

2. **Búsqueda y agregado de autorías en `#libros` sin `<output>` dentro de `.form__grupo`.**
   - En `styles.css`, `.form .form__grupo:has(output)` activa la grilla especial de 4 columnas pensada únicamente para los renglones de venta (`ventas.js`). Para no heredar esa grilla en `#libros` ni `#clientes`, los datos del autor encontrado y del cliente encontrado se muestran en `<p>` con `<span>` dentro o fuera del formulario, nunca con `<output>` dentro de `.form__grupo`.
   - Flujo de autorías: un bloque dentro de `#form-libro` (o justo antes del botón de envío, con controles `type="button"` para no disparar `submit` accidental al apretar botones) permite ingresar `#autor-id-buscar`, pulsar `#autor-buscar` (`GET /autores/{id}`), ver el nombre encontrado, elegir `#autor-rol` y `#autor-orden`, y pulsar `#autor-agregar`. Las autorías agregadas se muestran en `#tabla-libro-autorias` (oculta cuando está vacía junto a `#mensaje-libro-sin-autorias`).
   - Enter en `#autor-id-buscar` y `#autor-orden`: como están dentro de `#form-libro`, el navegador enviaría el formulario del libro (y saltaría el error de «al menos una autoría»). Un `keydown` en esos dos campos hace `event.preventDefault()` ante `Enter`; en `#autor-id-buscar` además dispara la búsqueda del autor, y en `#autor-orden` dispara «Agregar autoría».
   - Alternativa descartada: anidar un `<form>` de búsqueda de autor dentro de `#form-libro` (HTML inválido).

3. **Tablas de sesión en `#libros` y `#clientes` sin filas fijas del parcial.**
   - Se eliminan todas las filas fijas del HTML heredado en `#tabla-libros` y `#tabla-clientes`.
   - Ambas tablas comienzan con `hidden` y `tbody` vacío. Cada 201 de `POST /libros/` o `POST /clientes/` agrega el registro devuelto por la API a la tabla de la sesión (sin volver a pedir listas que el back no expone, como clientes).
   - `#mensaje-libros-vacia` y `#mensaje-clientes-vacia` cambian su texto a «Todavía no agregaste libros en esta sesión.» y «Todavía no agregaste clientes en esta sesión.»: se muestran mientras la tabla de la sesión está vacía y se ocultan con el primer alta. El texto anterior («No hay libros registrados») daba a entender que la base estaba vacía.
   - Además, tras `POST /libros/` 201 se invoca `if (typeof window.renderCatalogo === "function") { window.renderCatalogo(); }` (dependencia blanda con C-03).

4. **Selectores de editorial y género al cargar la página.**
   - Se piden en paralelo con `Promise.all` (`Api.get("/editoriales/", { limit: 100 })` y `Api.get("/generos/", { limit: 100 })`).
   - Editorial inicia con `<option value="">Elegí una editorial</option>` (obligatoria).
   - Género inicia con `<option value="">Sin clasificar</option>` (opcional, envía `genero_id: null`).
   - Si falla la carga inicial, se informa el `error.message` en `#mensaje-error-libro` (sin bloquear el resto de la página).

5. **Búsqueda de cliente por ID en `#clientes`.**
   - Un segundo formulario `#form-buscar-cliente` debajo del alta permite consultar `GET /clientes/{id}` y mostrar ID, nombre y email en `#cliente-resultado` (`hidden` por defecto), con su propio mensaje de error `#mensaje-error-buscar-cliente` (`role="alert"`, `hidden`) para el 404 («El cliente no existe») o error de red.
   - Se ignora `cliente.perfil` según I-04.

6. **Control de concurrencia y doble envío.**
   - Al enviar `#form-libro`, `#form-cliente`, buscar autor o buscar cliente, se deshabilita el botón disparador durante la petición y se rehabilita en `finally`, evitando envíos duplicados (RF-10).
   - Al confirmar alta con 201 se conserva la tabla de resultados de la sesión y se resetea el formulario (incluyendo la lista de autorías en `#libros`). Ante 409 o 422 se muestran los errores del servidor y se **conservan los campos ingresados** para que el usuario pueda corregir (por ejemplo, cambiar el ISBN o email repetido).

## Risks / Trade-offs

- **[Más de 100 editoriales o géneros]** → La API limita `limit` a 100 (RN-10). Para el alcance del TP alcanza con `limit=100` (D-06); si creciera en el futuro habría que paginar en bucle.
- **[`precio` con más de 10 dígitos o > 2 decimales]** → Se valida en el frente (`> 0` y formato decimal de hasta 2 decimales y 10 dígitos totales) para dar feedback inmediato antes del 422 del servidor.
- **[Dependencia blanda con `window.renderCatalogo`]** → Guardada con `typeof window.renderCatalogo === "function"` (ya existente en `main`).
- **[`ventas.js` aún usa `DATOS` hasta C-05]** → `altas.js` deja de tocar `DATOS` y `persistencia.js`, pero esos dos archivos permanecen en el repo e `index.html` hasta C-07 para no romper `ventas.js`.
  - Consecuencia: hasta que se mergee C-05, los libros y clientes creados por la API **no aparecen** en los selectores de la sección de ventas, que siguen leyendo `DATOS`. Se quita la llamada a `window.actualizarSelectsVenta()` porque ya no hay nada nuevo en `DATOS` que refrescar.
  - Se avisa a Joaquín (C-05) y a Belén (C-07) en el PR para que nadie lo tome como regresión.
- **[Sin Docker local en la máquina de desarrollo]** → Los tests unitarios de lógica pura corren con `node --test` y la verificación E2E contra nginx/API se documenta para correr donde esté el stack levantado (o contra el deploy/local de prueba).
