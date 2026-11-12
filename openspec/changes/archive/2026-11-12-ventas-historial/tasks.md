# Tasks

## 1. Lógica pura de la venta y tests unitarios

- [x] 1.1 Crear `frontend/tests/ventas.test.js` (con `node --test` y `globalThis.window = globalThis` cargando `frontend/public/js/api.js`) y la exportación condicional en `frontend/public/js/ventas.js`.
- [x] 1.2 `enteroPositivo`, `renglonConLibro` y `validarBorrador` (cliente, ≥ 1 renglón, libro elegido, cantidad entera > 0, un renglón por libro).
- [x] 1.3 `cuerpoVenta` (solo `cliente_id` y `renglones[{libro_id, cantidad}]`), `formatearImporte` (por `Api.numero`, sin recalcular), `formatearFecha`, `textoCliente`, `hayMas`, `validarPrecio` y `textoOpcionLibro`.
- [x] 1.4 `node --test frontend/tests/*.test.js`: 54 tests en verde (14 nuevos).

## 2. Estructura HTML

- [x] 2.1 `<section id="ventas">`: campo «ID del cliente» con «Buscar cliente» y `<output>` del nombre; sin renglones fijos; mensajes de carga, error y éxito con `hidden`; bloque «Venta confirmada».
- [x] 2.2 `<section id="historial">`: sin la venta V-001 fija; mensajes de carga, error, vacío y fin; paginación; detalle con título enfocable; formulario «Cambiar el precio de un libro».

## 3. Capa DOM

- [x] 3.1 Libros de todas las páginas de `GET /libros/` en los `<select>` (value = id) y en el formulario de precio.
- [x] 3.2 Cliente por ID con `GET /clientes/{id}` (Enter busca, no confirma).
- [x] 3.3 Renglones: agregar, cambiar libro (sin repetir), cambiar cantidad y quitar, con foco en el control siguiente.
- [x] 3.4 Confirmar con `POST /ventas/`, botón deshabilitado durante el envío y `finally`; 201 con importes de la respuesta, limpieza y refresco del historial; 409/422 con el borrador conservado.
- [x] 3.5 Historial paginado y detalle con `GET /ventas/{id}`, descarte de respuestas viejas y foco al abrir y cerrar.
- [x] 3.6 `PATCH /libros/{id}` con solo `{"precio"}`, refresco de libros y catálogo, y nueva consulta del detalle abierto.
- [x] 3.7 Sin `innerHTML`, `style.`, `fetch(`, `localStorage`, `DATOS` ni `guardarDatos` en `ventas.js`.

## 4. Prueba manual G-04, G-05 y G-06

- [x] 4.1 Detrás de un proxy `/api` como el de nginx, contra el backend local con el seed, en Chromium:
  - G-06: libro repetido frenado al elegirlo; cantidad `1.5` rechazada; cliente 999 → 404 al buscar y 409 al confirmar, con borrador intacto y botón habilitado; 422 desde la consola; el historial no cambió.
  - G-04: venta del cliente 2 con 2 renglones → botón deshabilitado durante el envío, 201 con 50000.00 + 19500.00 = 69500.00 de la respuesta, formulario limpio e historial con una venta más; tras recargar, el detalle coincide con el 201.
  - G-05: Rayuela de 25000 a 31000 → el detalle de la venta sigue en 25000.00 / 69500.00.
- [x] 4.2 Sin scroll horizontal a 320, 390 y 1280 px; recorrido con Tab por todos los controles nuevos.

## Workflow follow-up

- Capturas de la UI y de F12 → Red (`G-04_...`, `G-05_...`, `G-06_...`) desde la URL pública cuando se junte la evidencia (C-11).
- Archivar el change y marcar `[x]` en `CHANGES.md` para C-05 antes de abrir el PR.
- PR desde `feat/ventas-historial` hacia `main` con `Closes #N` de la issue de C-05, revisión de otro integrante y merge común.
