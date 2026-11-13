## Decisions

- **D1 Cuero**: la textura es la capa inferior del `background-image` del lomo; `overlay` la tiñe con `--lomo-color`. Una capa `rgba(0,0,0,.32)` sobre ella baja el brillo (la mostaza quedaba clara y el título blanco no llegaba a AA; con la capa la mediana de contraste de los cinco colores es 7,4 a 14,3:1). `cover` para lomos angostos. Título con `text-shadow` reforzado.
- **D2 Etiqueta**: `#estante-etiqueta` (mismo id y `aria-hidden`) se mueve de `.estante__mueble` a `.estante__escena`, justo después del h2. `position: absolute` a la derecha del gato, sin fondo ni borde, Georgia dorada con resplandor. Ocupa el hueco de cielo sobre el gabinete; su ancho máximo se limita al viewport. `estante.js` no cambia: sigue mostrándola por id con hover y foco.
- **D3 320 px**: el lema subió la cabecera y la escena dejó de entrar en 320x568. Se ajusta `--alto-cabecera` a 5,75 rem y `--alto-max` a 36 dvh por debajo de 24 rem.
- **D4 Origen de la textura**: recorte de una imagen propia generada con Gemini por Belén (120x512, grises).
