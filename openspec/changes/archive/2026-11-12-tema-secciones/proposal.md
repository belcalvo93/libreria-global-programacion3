## Why

La estrella fugaz de la cabecera dejó de notarse con `fondo-noche.webp` y las secciones de abajo (Catálogo, Libros, Clientes, Ventas, Historial) quedaron con un aspecto plano frente a la portada. Hay que recuperar la estrella y llevar el tema de noche mágica a las secciones.

## What Changes

- Estrella fugaz visible: más grande, con cabeza luminosa y estela dorada/blanca, cada ~10 s, detrás del texto, solo con `prefers-reduced-motion: no-preference`.
- Secciones con «cristal nocturno» (tarjetas), títulos con línea y ✦, formularios en grilla, botones primario/secundario, tablas y mensajes coherentes.
- Primera pasada solo CSS. Segunda pasada (con C-05 ya en `main`): Ventas e Historial con componentes propios (cliente por ID en una línea, filas de libro, botón «Quitar libro» fantasma, botones secundarios/compactos, paginación centrada, formulario de precio en fila) y se cambia la jerga «renglón» por «libro»/«fila» en `ventas.js` y su test. Sin tocar portada, estantería, Catálogo, Libros, Clientes ni `altas.js`.

## Capabilities

### New Capabilities
- (ninguna)

### Modified Capabilities
- `tema-visual`: estrella fugaz recuperada y secciones de contenido con estilo de cristal nocturno.

## Impact

`frontend/public/css/styles.css`, `frontend/public/index.html` (solo clases y textos de Ventas/Historial), `frontend/public/js/ventas.js` y `frontend/tests/ventas.test.js`, `design-system/README.md` (revisión 10, pending), `CHANGES.md`, `knowledge-base/09_decisiones_y_supuestos.md`.
