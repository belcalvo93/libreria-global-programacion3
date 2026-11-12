# Design

## Context

- **Estado actual**: `js/ventas.js` es el del parcial. Arma la venta con `DATOS.clientes` y `DATOS.libros`, calcula precio, subtotal y total en el navegador, genera un id `V-00N` y la guarda con `guardarDatos()`. El HTML trae un renglón con ISBN como `value` y la venta V-001 escrita a mano.
- **Disponible**: `window.Api` (C-02): base `/api`, `ApiError` con `status` (0 = sin conexión) y `message` en español, y `Api.numero` para los Decimal que llegan como texto. `window.renderCatalogo()` (C-03).
- **Contrato** (`knowledge-base/11_contrato_api.md`):
  - `POST /ventas/` acepta solo `cliente_id` y `renglones[{libro_id, cantidad}]` (`extra="forbid"`). Devuelve `VentaRead` con `fecha`, `cliente`, `renglones[{libro_id, titulo, cantidad, precio_unitario, subtotal}]` y `total`.
  - Errores: 409 «El cliente indicado no existe» / «No existe el libro con id X»; 422 «Un mismo libro no puede aparecer en dos renglones».
  - `GET /ventas/` devuelve `VentaResumen[]` ordenado por `id`, sin total de registros.
  - No existe `GET /clientes/`: el cliente se busca por ID.
- **Restricciones** (AGENTS.md): IIFE con `"use strict"` y `var`; solo `textContent` y `createElement`; `preventDefault` en la primera línea de cada `submit`; mensajes con `hidden`; sin estilos inline; nunca recalcular importes; Decimal siempre por `Api.numero`; nada de `localStorage`.

## Goals / Non-Goals

**Goals:**
- Que todo importe visible de una venta salga de la API.
- Que un 409 o un 422 no hagan perder el borrador.
- Que G-04, G-05 y G-06 se puedan hacer desde la UI, y verse en F12 → Red.

**Non-Goals:**
- Totales estimados del borrador: no hay importes de venta antes del 201.
- Ordenar el historial de la venta más nueva a la más vieja: la API no lo permite.
- Tests de DOM automatizados en el repo: el DOM se prueba a mano con G-04 a G-06.

## Decisions

### 1. El borrador no muestra subtotales ni total
- **Decisión:** cada renglón muestra solo el «precio actual del catálogo» como referencia. Precio unitario, subtotal y total aparecen recién en la venta confirmada, copiados del 201.
- **Por qué:** D-08 y la regla dura «NUNCA recalcular importes». Un total estimado en el borrador podría diferir del que guarda la API.

### 2. El 404 del cliente avisa, pero no bloquea
- **Decisión:** «Buscar cliente» muestra el nombre o «No existe un cliente con ese ID». Confirmar solo exige que el ID sea un entero positivo.
- **Por qué:** US-3.1 pide ver el nombre antes de usarlo, y G-06 pide probar un ID inexistente. Si se confirma igual, la API responde 409 «El cliente indicado no existe», que se muestra con el borrador intacto.

### 3. Un renglón por libro, controlado en el front
- **Decisión:** al elegir en un renglón un libro que ya está en otro, el `<select>` vuelve a su valor anterior y se muestra en qué renglón está. `validarBorrador` lo controla también al confirmar.
- **Por qué:** la consigna pide «un renglón por libro». Como el front no deja enviarlo, el 422 del servidor para G-06 se prueba desde la consola del navegador (F12) con `Api.post`, y se ve en F12 → Red. Cualquier 422 que llegue igual se muestra conservando el borrador.

### 4. Libros de todas las páginas
- **Decisión:** `GET /libros/?limit=100&offset=…` hasta recibir menos de 100, con un tope de 20 páginas.
- **Por qué:** el máximo de la API es 100 por página (I-03); con más libros faltarían opciones.

### 5. Respuestas fuera de orden
- **Decisión:** el historial, el detalle y la búsqueda de cliente llevan un contador de petición, como el catálogo de C-03. Una respuesta vieja que llega tarde se descarta.

### 6. Foco
- **Decisión:** al abrir el detalle, el foco va al título del detalle; al cerrarlo, vuelve al botón «Ver detalle» que lo abrió. Enter en el ID del cliente busca el cliente en lugar de confirmar la venta.

## Risks / Trade-offs

- **[Riesgo] El historial no se ordena de la más nueva a la más vieja:** con muchas ventas, la recién confirmada queda en la última página. Para eso se muestra completa en «Venta confirmada».
- **[Trade-off] El precio del catálogo en el borrador puede quedar viejo** si otro usuario lo cambia; no importa, porque la venta usa el precio que copia la API.
- **[Riesgo] Mismo navegador, varias pestañas:** el borrador es por pestaña (memoria), como pide la consigna.
