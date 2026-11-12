## Why

La estrella fugaz de la cabecera dejó de notarse con `fondo-noche.webp` y las secciones de abajo (Catálogo, Libros, Clientes, Ventas, Historial) quedaron con un aspecto plano frente a la portada. Hay que recuperar la estrella y llevar el tema de noche mágica a las secciones.

## What Changes

- Estrella fugaz visible: más grande, con cabeza luminosa y estela dorada/blanca, cada ~10 s, detrás del texto, solo con `prefers-reduced-motion: no-preference`.
- Secciones con «cristal nocturno» (tarjetas), títulos con línea y ✦, formularios en grilla, botones primario/secundario, tablas y mensajes coherentes.
- Solo CSS (y, de ser necesario, cambios mínimos de presentación en `index.html`). Sin tocar `.js`, portada ni estantería.

## Capabilities

### New Capabilities
- (ninguna)

### Modified Capabilities
- `tema-visual`: estrella fugaz recuperada y secciones de contenido con estilo de cristal nocturno.

## Impact

`frontend/public/css/styles.css`, `design-system/README.md` (revisión 10, pending), `CHANGES.md`, `knowledge-base/09_decisiones_y_supuestos.md`.
