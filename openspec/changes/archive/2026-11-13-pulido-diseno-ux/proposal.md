## Why

Pulido final de diseño y UX (C-06c): la marca definitiva es «Gatoteca Lunar», la portada necesita una bajada, el formulario «Libros» es difícil de seguir y los libros de la estantería pueden sentirse más reales al pasar el mouse.

## What Changes

- Marca «Gatoteca Lunar» en título, h1, footer, docs, comentarios, specs y KB.
- Lema bajo el título (`.portada__lema`), texto estático.
- Formulario «Libros» en 3 bloques (`fieldset`/`legend`), lista de autorías dentro del bloque «Autores» y campo «Orden» que sugiere el siguiente número libre (`siguienteOrden` en `altas.js`, con tests).
- Hover/foco de los libros: inclinación leve y sombra más marcada (solo CSS, solo con `no-preference`).

## Capabilities

### Modified Capabilities
- `tema-visual`: marca, lema y hover de los libros.
- `altas-libros-clientes`: formulario en bloques y orden sugerido.

## Impact

`frontend/public/index.html`, `css/styles.css`, `js/altas.js`, `frontend/tests/altas.test.js`, docs y KB (D-47), `design-system/README.md` (Revision 11, pending).
