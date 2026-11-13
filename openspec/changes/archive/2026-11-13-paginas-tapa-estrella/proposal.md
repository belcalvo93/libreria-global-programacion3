## Why

C-06e: el canto de páginas era un bloque crema con rayas, la tapa un marrón liso y la estrella un carácter de texto. Se reemplazan por recortes de una imagen propia para que el libro se vea más real.

## What Changes

- Canto de páginas con `img/paginas-forma.webp` (paralelogramo de hojas con borde ondulado).
- Tapa con `img/tapa-cuero.webp` teñida con el color de cada libro (overlay + capa oscura al 32 %).
- Estrella decorativa con `img/estrella-dorada.webp` y leve resplandor en lugar del carácter ✦.
- Solo CSS e imágenes; sin tocar `estante.js` ni el DOM.

## Capabilities

### Modified Capabilities
- `estante-libros`: canto de páginas, tapa de cuero y estrella dorada.

## Impact

`frontend/public/css/styles.css`, `frontend/public/img/` (3 imágenes nuevas), docs.
