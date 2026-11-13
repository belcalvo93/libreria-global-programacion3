## Why

El canto de páginas con `paginas-forma.webp` no ensambla bien con el lomo y pierde la forma del libro. Belén decidió volver al bloque crema original.

## What Changes

- `.libro__tope` vuelve al bloque crema con líneas a 95° y su geometría 3D original (cara superior rotada con `rotateX(90deg)`).
- Se quitan el relleno con `clip-path`, el labio de cuero y la imagen `img/paginas-forma.webp` (borrada).
- Se mantienen lomo y tapa de cuero, estrella dorada, «Estantería» centrada y el nombre del libro junto al gato.

## Capabilities

### Modified Capabilities
- `estante-libros`: se quita el canto de páginas con imagen y vuelve el bloque crema.

## Impact

`frontend/public/css/styles.css`, `frontend/public/img/paginas-forma.webp` (borrada), docs.
