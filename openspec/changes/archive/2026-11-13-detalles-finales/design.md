## Context

Front nativo detrás de nginx, scripts clásicos en IIFE, sin estilos inline ni librerías. La luna (`img/luna.webp`, 380x380, transparente) es la imagen más reconocible de la marca. `musica.js` ya tiene una máquina de estados pura (`siguienteEstado`) y aplica `play()`/`pause()` según el estado.

## Goals / Non-Goals

**Goals:** cerrar los cuatro detalles sin lógica nueva fuera de lo pedido y sin tocar `estante.js` ni los archivos de los demás integrantes.

**Non-Goals:** manifiesto PWA, íconos para Android (`manifest.json`), control de volumen.

## Decisions

### D1. Favicon desde la luna
Recorte cuadrado centrado sobre el disco (alfa > 200 entre 43 y 337 px): caja `(40, 40, 340, 340)`, con fondo transparente para `favicon.ico` (16, 32 y 48 px en un archivo) y `favicon-32.png`, reducidos con Lanczos. `apple-touch-icon.png` (180 px) va sobre fondo azul noche con la luna al 84 % (iOS rellena la transparencia con negro). Generados con Pillow desde `luna.webp`, sin dibujar nada nuevo.

`theme-color`: el pedido sugería `#0a0e28`, pero ese valor no está entre las variables `--magia-*`; el azul noche real es `--magia-franja` (`rgba(14, 17, 40, 0.85)`, el color de la franja del nav que queda arriba de la pantalla), igual a `--color-fondo` `#0e1128`. Se usa `#0e1128`.

nginx: `location = /favicon.ico` y `location = /apple-touch-icon.png` con `expires 7d` (cache razonable; un cambio de ícono se ve en una semana sin renombrar archivos).

### D2. Saltar al contenido
`<a class="saltar" href="#catalogo">` es el primer hijo del `<body>`. Fuera de pantalla con `translateY(-200%)`, sin `display:none` (debe ser enfocable); con `:focus` entra arriba a la izquierda, fijo, `z-index` 200 (sobre el nav, 100), cristal nocturno, borde y texto dorados, foco `--color-foco`. `#catalogo` recibe `tabindex="-1"` para que el navegador mueva ahí el foco al seguir el ancla (sin JS). Con teclado (`:focus-visible`) la sección muestra el contorno dorado, así se ve adónde llegó el salto; con mouse no dibuja contorno (`:focus:not(:focus-visible)`). La transición de entrada vive solo en `no-preference`.

### D3. Fundido de volumen
`siguienteVolumen(actual, objetivo, paso)`: acerca `actual` a `objetivo` en `paso`, sin pasarse, y redondea a 3 decimales; con datos inválidos devuelve `objetivo`. `pasoPorCuadro(desde, hasta, duracionMs, msPorCuadro)` calcula el paso. Un único `requestAnimationFrame` activo: cada fundido nuevo cancela el anterior. Subida: 0 → 0.3 en 1500 ms (el volumen se pone en 0 antes de `play()`). Bajada: → 0 en 600 ms y recién al llegar `pause()`. Si mientras baja el usuario vuelve a activar, se cancela la bajada y sube desde el volumen actual, sin `pause()`. `aria-pressed` y el ícono cambian al instante. Si `play()` es rechazado, se cancela el fundido y queda silenciada como antes.

### D4. Margen al pie
`footer` suma `padding-bottom: calc(var(--esp-5) + 4rem)`: 44 px del botón + 16 px de su distancia al borde + aire. En todos los anchos.

## Risks / Trade-offs

- [rAF se frena con la pestaña oculta] La bajada al ocultar la pestaña podría no terminar: al ocultar se pausa sin fundido (el usuario no la escucha igual). Al volver, sube con fundido.
- [`theme-color` distinto del sugerido] Se documenta el motivo (D1).
