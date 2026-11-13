## Why

C-06d: los lomos de la estantería son colores planos y el título del libro al hover aparece en una pastilla dorada que tapa los libros. Se busca más realismo (cuero gastado) y un título limpio junto al gato.

## What Changes

- Lomos con la textura `img/lomo-cuero.webp` teñida con el color de cada libro (`background-blend-mode: overlay`) y una capa oscura para mantener el contraste AA del título.
- El título del libro (hover y foco) pasa de pastilla sobre el gabinete a texto suelto, sin fondo, al lado del gato, bajo «Estantería».
- Ajuste de 320 px: cabecera de 5,75 rem y lomos de 36 dvh para que la escena entre en 320x568 con el lema.

## Capabilities

### Modified Capabilities
- `estante-libros`: lomos de cuero y título junto al gato.

## Impact

`frontend/public/index.html` (la etiqueta cambia de lugar), `css/styles.css`, `img/lomo-cuero.webp` (nuevo), `frontend/tests/estante.test.js`, docs.
