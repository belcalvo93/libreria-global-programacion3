## Why

Quedan detalles de terminación que se notan en el uso real: cada carga da 404 en `/favicon.ico` y la pestaña no tiene ícono; con teclado hay que atravesar el nav y hasta 12 libros para llegar al catálogo; la música arranca y se corta de golpe; y al final de la página el botón flotante de música puede quedar sobre el último contenido.

## What Changes

- **Favicon y color de barra**: íconos derivados de `img/luna.webp` (`favicon.ico` 16/32/48, `favicon-32.png`, `apple-touch-icon.png` 180 px) enlazados en `<head>`, `<meta name="theme-color">` con el azul noche del tema y `location = /favicon.ico` en nginx con cache.
- **Saltar al contenido** (WCAG 2.4.1): primer enlace del `<body>`, oculto hasta recibir foco, lleva el foco a `#catalogo` (`tabindex="-1"`).
- **Fundido de la música**: sube de 0 a 0.3 en ~1.5 s al empezar o retomar y baja a 0 en ~0.6 s antes de `pause()`. Función pura `siguienteVolumen(actual, objetivo, paso)` con tests; un solo temporizador que se cancela si llega otro cambio. `aria-pressed` cambia al instante.
- **Margen al pie**: el pie reserva ~4 rem abajo para que el botón flotante nunca tape contenido.

## Capabilities

### New Capabilities
- (ninguna)

### Modified Capabilities
- `tema-visual`: favicon, color de barra, enlace para saltar al contenido y margen al pie.
- `musica-fondo`: fundido de volumen al empezar, retomar y pausar.

## Impact

`frontend/public/index.html`, `frontend/public/css/styles.css`, `frontend/public/js/musica.js`, `frontend/tests/musica.test.js`, `frontend/default.conf.template`, íconos nuevos en `frontend/public/`, docs. No toca `estante.js`, `catalogo.js`, `altas.js` ni `ventas.js`.
