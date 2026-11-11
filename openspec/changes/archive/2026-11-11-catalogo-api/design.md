# Design

## Context

- **Estado actual**: `frontend/public/js/catalogo.js` es el del parcial (Ej. 3). Filtra en memoria sobre `DATOS.libros` de `datos.js`, arma nombres de editorial, género y autores por id, y filtra en cada `input`. La sección `#catalogo` de `index.html` trae 6 filas fijas y una columna «Autores».
- **Lo que ya está disponible**: `window.Api` (C-02, spec `cliente-http`). Arma la URL bajo `/api`, omite parámetros vacíos y lanza `ApiError` con `status` (0 = sin conexión) y `message` en español.
- **Contrato** (`knowledge-base/11_contrato_api.md`):
  - `GET /libros/` devuelve `LibroResumen[]`, con `editorial` y `genero` ya resueltos como objetos (`genero` puede ser `null`), `precio` como texto, orden por `id` y sin total.
  - `GET /libros/{id}` devuelve `LibroRead`, que suma `autores: [{autor:{nombre}, rol, orden}]`.
- **Restricciones** (AGENTS.md):
  - Script clásico en IIFE con `"use strict"` y `var`.
  - Solo `textContent` y `createElement`.
  - `preventDefault` en la primera línea del submit.
  - Mensajes con `hidden`.
  - Sin estilos inline.
  - Solo se toca `catalogo.js` y `#catalogo`; `css/styles.css` es de Belén.
- **Seed**: 6 libros, uno de ellos sin género.

## Goals / Non-Goals

**Goals:**
- Separar la lógica pura (formatos, parámetros, decisión de estado, paginación) del DOM, para testearla con `node --test` sin un DOM falso.
- Cubrir los escenarios de `specs/catalogo-libros/spec.md` con el menor código posible y sin depender de `datos.js`.

**Non-Goals:**
- Búsqueda mientras se escribe (debounce), caché de páginas, total de resultados o salto a la página N.
- Filtro por género (D-30).
- Estilos nuevos. Si hace falta un ajuste visual (por ejemplo, botones deshabilitados), se le pide a Belén en C-06.
- Tests de DOM automatizados: el DOM se verifica a mano con G-01 detrás de nginx.

## Decisions

1. **Dos capas dentro del mismo archivo.**
   - *Lógica pura*, sin `window` ni `document`:
     - `textoGenero(libro)` → nombre del género o «Sin clasificar».
     - `formatearPrecio(precio)` → `Api.numero(precio).toFixed(2)`.
     - `parametrosListado(estado)` → `{ titulo, limit, offset }`, con `titulo` sin espacios en los extremos.
     - `decidirVista(cantidad, estado)` → `"tabla" | "vacia" | "sin-resultados" | "fin"`.
     - `hayMas(cantidad, limite)`.
     - `autoriasOrdenadas(autores)`.
   - *Capa DOM*: render, eventos y llamadas a `Api.get`.
   - Alternativa descartada: dos archivos (`catalogo-logica.js` + `catalogo.js`). Suma un `<script>` en el HTML compartido y otro archivo a revisar, sin ganancia.

2. **Exportación para tests sin módulos ES.**
   - Al final de la IIFE va `if (typeof module !== "undefined" && module.exports) { module.exports = { ... } }`.
   - El cableado del DOM (`DOMContentLoaded`, `window.renderCatalogo`, `window.mostrarDetalleLibro`) se protege con `if (typeof document !== "undefined")`.
   - En el navegador `module` no existe, así que el archivo sigue siendo un script clásico.
   - El test define `globalThis.window = globalThis` y hace `require` de `public/js/api.js` (que publica `window.Api`) y después de `catalogo.js`. Así `formatearPrecio` usa el `Api.numero` real.
   - Alternativa descartada: exponer las funciones puras en `window`. Ensucia el global compartido con las otras secciones.

3. **Estado en memoria en un único objeto**: `{ titulo, offset, limite: 5, peticion: 0 }`.
   - `LIMITE = 5`, para que G-01 muestre la paginación con los 6 libros del seed (5 en la página 1 y 1 en la página 2).
   - El número de página se calcula como `offset / limite + 1`.
   - Alternativa descartada: 20, el default de la API. Con el seed no se podría demostrar «Siguiente».

4. **Búsqueda con `<form id="form-catalogo" role="search">`** y `submit` (Enter o botón), con `event.preventDefault()` en la primera línea. Una petición por búsqueda. Se elige en lugar de `input` + debounce (decisión de Hernán en el propose).

5. **Respuestas fuera de orden con un contador de peticiones.**
   - Cada carga incrementa `estado.peticion` y guarda su número.
   - Al volver, si `numero !== estado.peticion`, la respuesta se descarta.
   - Alternativa descartada: `AbortController`. Requiere tocar `api.js`, que es de Belén y no acepta `signal`.

6. **Página siguiente vacía (`"fin"`).**
   - Si `offset > 0` y llega `[]`, se restaura `offset -= limite`, se deshabilita «Siguiente» y la tabla anterior queda intacta (no se vacía el `tbody` antes de conocer la respuesta).
   - `"vacia"` y `"sin-resultados"` solo se deciden con `offset === 0`, según haya filtro o no.

7. **Estados**:
   - Cargando: se muestra `#mensaje-catalogo-cargando` (`role="status"`) y se deshabilitan «Buscar», «Anterior» y «Siguiente». La tabla actual sigue visible para evitar parpadeo.
   - Error: `#mensaje-catalogo-error` (`role="alert"`) muestra `error.message`, para cualquier `ApiError`, incluido el status 0, y la tabla se oculta.
   - Vacía y sin resultados: se reutilizan los `<p>` existentes `#mensaje-catalogo-vacia` y `#mensaje-catalogo-sin-resultados`.

8. **Detalle en un panel `#catalogo-detalle` debajo de la tabla**, en lugar de un modal o un `<details>` por fila.
   - Cada fila tiene un `<button class="btn" type="button">Ver detalle</button>` con `aria-label="Ver detalle de <título>"`, cuyo texto se arma con `setAttribute`, nunca como HTML.
   - El panel muestra los datos del libro y una `.tabla` de autorías (Autor, Rol, Orden).
   - Al abrir, el foco va al `<h3 tabindex="-1">` del panel. «Cerrar detalle» lo oculta y devuelve el foco al botón que lo abrió, si sigue en el DOM.
   - Un error (404) se muestra en `#mensaje-catalogo-detalle-error` dentro del panel, sin tocar la tabla.
   - Se reutilizan `.tabla`, `.btn` y `.mensaje`, así que no hace falta CSS nuevo.
   - Alternativa descartada: `<dialog>`, porque necesita estilos propios.

9. **Puntos de integración**:
   - `window.renderCatalogo()` recarga la página y el filtro actuales y devuelve la promesa de la carga. Nunca rechaza: el error queda en la vista, y C-04 no necesita `try/catch`.
   - `window.mostrarDetalleLibro(id)` abre el panel, para el estante de C-06 (D-25).
   - Ambas se asignan dentro de la IIFE.

10. **HTML de `#catalogo`**:
    - Se quitan las filas fijas y la columna «Autores».
    - El orden de columnas es Título, ISBN, Precio, Editorial, Género y Detalle, como en CHANGES.
    - La paginación va en un `<div class="form__grupo">` con los dos botones y un `<output id="catalogo-pagina">`. No se usa `<nav>`, porque `styles.css` aplica estilos globales a `nav`.
    - El `<tbody>` empieza vacío y la tabla oculta hasta la primera respuesta.

## Risks / Trade-offs

- **[`.btn` deshabilitado no tiene estilo propio en `styles.css`]** → el texto «Página N» y el `disabled` nativo (que lo saca del orden de Tab) bastan para el TP. Si hace falta, se le pide a Belén un `.btn:disabled` en C-06.
- **[«Siguiente» habilitado cuando el total es múltiplo exacto de 5]** → el caso `"fin"` restaura la página anterior sin vaciarla. Es la limitación aceptada de una API sin total (KB 11).
- **[`.btn` ocupa el 100% del ancho de su celda]** → «Ver detalle» queda como un botón ancho dentro de la tabla, que igual se desplaza dentro de `.tabla-contenedor` a 320 px.
- **[`module.exports` en un archivo del navegador]** → la guarda `typeof module` lo vuelve inerte en el navegador. Se documenta con un comentario en el archivo para que el resto del grupo no lo lea como un módulo.
- **[C-04 todavía no existe]** → `renderCatalogo()` mantiene el nombre y el uso sin argumentos que espera la KB (US-1.6, RF-07). Bruno solo tiene que llamarla.
- **[`datos.js` y `persistencia.js` siguen cargados]** → el catálogo ya no los usa. Se borran en C-07, después de este merge.

## Migration Plan

- Sin migración de datos. El rollback es revertir el merge: el catálogo vuelve a leer `datos.js`, que sigue en el repo hasta C-07.

## UI Mockups

- Decision: no (project policy). El design-system está en modo `system-only`, revisión 1, aprobada. Se reutilizan las clases del parcial sin estilos nuevos.

## Testing

- **Automático**: `node --test frontend/tests/` (Node ≥ 18, sin dependencias). Cubre la lógica pura de la decisión 1 con al menos dos casos por comportamiento (Strict TDD: RED → GREEN → TRIANGULATE → REFACTOR).
- **Manual (G-01)**, detrás de nginx en `http://127.0.0.1:8080` con el back y la base `libreria_tp`:
  - Búsqueda parcial, Siguiente/Anterior, búsqueda sin coincidencias, detalle de la Antología («Sin clasificar», 3 autorías), error con el back apagado.
  - Tab por todos los controles, y anchos de 320 y 1280 px.
  - Guardar capturas de la UI y de F12 → Red en `evidencia/` (`G-01_...`).
