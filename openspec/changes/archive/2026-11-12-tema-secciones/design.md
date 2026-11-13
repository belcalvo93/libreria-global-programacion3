## Context

`header::after` ya tenía `estrella-fugaz`, pero medía 80×2 px, era visible ~0,8 s cada 14 s y recorría 12 rem sobre una imagen clara: la animación corría, pero no se percibía. No la tapaba ningún z-index ni fue borrada.

## Decisions

- **D1 Estrella**: se mantiene `header::after` (z-index -1, como la luna: detrás del texto, delante del cielo). Cabeza con `radial-gradient` + estela con `linear-gradient` en una sola capa de fondo; `rotate(12deg) translateX(0→45vw)`, ciclo de 10 s, visible ~12 %. `overflow-x: clip` evita el scroll horizontal. Sin movimiento reducido: `opacity: 0`.
- **D2 Cristal nocturno**: `.card` de `main` usa `rgba(10,14,40,.62)` con fallback opaco `rgba(10,14,40,.9)` y `backdrop-filter` dentro de `@supports`. Radio 16 px, borde dorado tenue. Contenido máx. ~1100 px (`main`).
- **D3 Selectores**: todo por clase/estructura existente; `.card` anidada (resultado de cliente) se atenúa con `main .card .card`.
- **D4 Botones**: `.btn` pasa a ancho automático desde 48rem; en móvil, 100 %. Los botones `type="button"` (secundarios) pasan a borde dorado y fondo transparente salvo `submit` y `btn--peligro`.
- **D5 Tablas**: columnas numéricas alineadas a la derecha con `:is()` por posición de columna no es fiable en tablas generadas; se alinean con `td:nth-child` solo en tablas conocidas (precio/stock/ID/total).
- **D6 HTML**: sin cambios.

## Risks

`backdrop-filter` puede costar rendimiento en equipos lentos: es mejora progresiva.

## Segunda pasada: Ventas e Historial

- **D7 Clases nuevas** (sección 15c del CSS): `.btn--secundario`, `.btn--compacto`, `.btn--quitar`, `.btn--confirmar`, `.venta-cliente`, `.venta-fila` (+ `__precio`, `__etiqueta`), `.paginacion`, `.form--precio`, `.texto-apoyo`. Anulan el viejo «renglón de venta» (`.form__grupo:has(output)`) con más especificidad.
- **D8 Sin subtotal en borrador**: la fila queda Libro | Cantidad | Precio | quitar. El subtotal y el total NO se calculan en el front (regla dura, D-08): se ven en «Venta confirmada» con los importes de la API.
- **D9 Quitar libro (ajuste)**: botón de solo ícono, sin texto visible. Zona táctil 44x44; círculo de 28 px (`::before`, borde rojo apagado) y cruz ✕ con dos gradientes rotados (`::after`). `aria-label="Quitar libro N"` y `title="Quitar libro"`. Hover y foco: fondo rojo tenue y cruz más intensa; foco dorado; transición solo con `no-preference`. Escritorio: al final de la fila, centrado con selector y cantidad; móvil: arriba a la derecha de la tarjeta del libro.
- **D10 Ver detalle**: texto visible «Ver detalle», `aria-label="Ver detalle de la venta N"`.
- **D11 Jerga**: «renglón» → «libro»/«fila» en etiquetas y mensajes; los ids (`venta-quitar-N`, `venta-libro-N`) y el campo `renglones` de la API no cambian.
- **D12 Paginación**: `order` pone Anterior · Página N · Siguiente en una línea; deshabilitado con borde punteado y texto apagado.
