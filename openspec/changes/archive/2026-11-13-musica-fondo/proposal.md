## Why

Belén quiere una música de fondo opcional («Midnight in the Gatoteca») que acompañe la ambientación nocturna sin imponerse: los navegadores bloquean el audio automático y nadie debería escuchar sonido sin haber interactuado con la página. También pidió que la cola del gato reaccione cuando el cursor pasa cerca, con un movimiento más natural, como el de un gato real.

## What Changes

- Nuevo `<audio id="musica-fondo" src="/audio/ambiente.mp3" loop preload="none">` en `index.html`, sin `autoplay`.
- Nuevo `frontend/public/js/musica.js` (IIFE): la música arranca con la **primera interacción** del usuario (`pointerdown`, `keydown` o `touchstart`, una sola vez) a volumen 0.3; si `play()` es rechazado queda silenciada sin romper nada. Se pausa al ocultar la pestaña y retoma al volver solo si no estaba silenciada.
- Botón fijo `#boton-musica` (abajo a la derecha, 44 px, cristal nocturno y dorado) con `aria-pressed`, ícono 🔊/🔇 y `aria-label` «Silenciar música» / «Activar música». Si el usuario la silenció, tocar la página no la reactiva.
- Lógica en funciones puras (`siguienteEstado`, `vistaBoton`) con tests en `frontend/tests/musica.test.js`.
- nginx: `location /audio/` con cache de 30 días, `Content-Type: audio/mpeg` y soporte de `Range`.
- **Cola del gato**: se parte en base y punta (misma imagen, tres recortes). En calma la punta sigue a la base con retraso (onda); con el cursor cerca la punta da golpecitos; muy cerca, toda la cola se agita. Lógica pura (`estadoColaPorDistancia`, `pasoCola`) en `estante.js`, con tests.

## Capabilities

### New Capabilities
- `musica-fondo`: música ambiental opt-in con botón de control accesible.

### Modified Capabilities
- `estante-libros`: la cola del gato se mueve en dos tramos y reacciona al cursor cercano.

## Impact

`frontend/public/index.html`, `frontend/public/js/musica.js` (nuevo), `frontend/public/js/estante.js`, `frontend/public/css/styles.css`, `frontend/default.conf.template`, `frontend/public/audio/ambiente.mp3` (nuevo), tests y docs. Sin cambios en backend ni en la API.
