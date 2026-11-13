## Context

El front es HTML/CSS/JS nativo detrás de nginx (scripts clásicos en IIFE, sin módulos ni librerías, sin estilos inline ni `localStorage`). Los navegadores solo permiten reproducir audio después de una activación del usuario. El gato de la estantería (`img/gato.webp`, 364x960) ya usa dos recortes de la misma imagen: cuerpo y cola, y la cola gira sola con una animación CSS.

## Goals / Non-Goals

**Goals:**
- Música opt-in que nunca suena sin una interacción previa y que el usuario puede silenciar en todo momento.
- Estado de la música como máquina de estados pura, testeable con `node --test` sin DOM.
- Cola del gato más natural y reactiva al cursor, sin estilos inline.

**Non-Goals:**
- Recordar la preferencia entre visitas (sin `localStorage`, por regla del proyecto).
- Control de volumen o lista de temas.

## Decisions

### D1. Máquina de estados de la música
Estados: `espera` (no arrancó), `sonando`, `silenciada` y `oculta` (pausada porque la pestaña no se ve). Eventos: `interaccion`, `boton`, `ocultar`, `mostrar`, `rechazo`.

| Estado \ evento | interaccion | boton | ocultar | mostrar | rechazo |
|---|---|---|---|---|---|
| espera | sonando | sonando | espera | espera | silenciada |
| sonando | sonando | silenciada | oculta | sonando | silenciada |
| silenciada | silenciada | sonando | silenciada | silenciada | silenciada |
| oculta | oculta | silenciada | oculta | sonando | silenciada |

`silenciada + interaccion → silenciada`: si el usuario la silenció, tocar la página no la reactiva. La capa DOM aplica el efecto: `sonando` → `play()` (con `try/catch`; si la promesa se rechaza, evento `rechazo`); el resto → `pause()`. Estado o evento desconocido: el estado no cambia.

### D2. Primera interacción
`pointerdown`, `keydown` y `touchstart` en `document`, con `{ once }` lógico: al primero se quitan los tres. Si el evento sale del propio botón se ignora (el `click` del botón ya alterna); si no, el `pointerdown` arrancaría la música y el `click` la silenciaría al instante.

### D3. Botón
`<button id="boton-musica" type="button" aria-pressed>`: `aria-pressed="true"` mientras suena (o está pausada solo por la pestaña oculta). El ícono va en un `span` con `aria-hidden="true"` (🔊 sonando, 🔇 si no) y la acción en `aria-label` y `title` («Silenciar música» / «Activar música»), según pidió Belén. `vistaBoton(estado)` devuelve `{ icono, etiqueta, presionado }`. Fijo abajo a la derecha (no choca con el nav, el gato ni la luna, que están arriba), 44x44 px, fondo `--magia-franja` con desenfoque, borde y ícono dorados, foco visible con `--color-foco`. Su transición vive solo en `prefers-reduced-motion: no-preference`.

### D4. nginx
`location /audio/` igual a `/img/` (`expires 30d`, `Cache-Control: public`) con `types { audio/mpeg mp3; }`. nginx atiende `Range` en archivos estáticos por defecto (respuesta 206), necesario para que el navegador busque dentro del audio y repita el `loop`.

### D5. Cola del gato en dos tramos
La cola pasa a tres capas sin estilos inline:
- `.gato__cola` (contenedor, sin recorte): vaivén lento sobre la raíz (14 % 68 %).
- `.gato__cola-giro` (contenedor): latigazo de toda la cola cuando el cursor está muy cerca.
- `.gato__cola-base` y `.gato__cola-punta`: la misma imagen recortada (base del 65 al 85 % del alto, punta del 83 al 100 %; se superponen 2 % para ocultar la unión). La punta gira sobre su articulación (18 % 84 %) con el mismo vaivén retrasado 0.4 s, así la cola ondula en lugar de moverse rígida, y suma golpecitos de la punta (`rotate`, que se compone con el `transform` del vaivén) cuando el cursor está cerca.

`estante.js` mide la distancia del puntero a la mitad de la cola (`pointermove` en `document`, una medición por cuadro con `requestAnimationFrame`) y `estadoColaPorDistancia(distancia, altoGato)` devuelve `calma` (lejos), `atenta` (a menos de 1.2 veces el alto del gato) o `inquieta` (a menos de 0.4 veces). El estado va en `data-cola` del `.gato`. Subir de nivel es inmediato (las animaciones nuevas empiezan en 0°); bajar se hace de a un nivel y solo al terminar un ciclo de la animación que se quita (`animationiteration`), cuando vale 0°, para que no salte: `pasoCola(actual, deseado)`. Sin movimiento cerca durante 3 s, vuelve a `calma`. Con `prefers-reduced-motion: reduce` no se escucha el puntero y la cola queda quieta.

## Risks / Trade-offs

- [`aria-pressed` con etiqueta que cambia] Algunos lectores leen «Silenciar música, presionado». Se mantiene por pedido explícito; la alternativa es dejar la etiqueta fija («Música»).
- [iOS no considera `touchstart` como activación] El `play()` puede ser rechazado: la música queda silenciada y el botón la activa con un toque (D1).
- [Archivo de 2 MB] `preload="none"`: no se descarga hasta que se reproduce.
