## Context

Change **retroactivo**: el código ya existe en la rama `feat/pulido-visual` (commits `02665af`, `124aed4`, `cfe92d4`). Este diseño documenta las decisiones tal como quedaron implementadas y verificadas; no planifica trabajo nuevo. Motivación en proposal.md («Why»). Restricciones del proyecto: HTML/CSS/JS nativos (IIFE, `var`, sin librerías), sin estilos inline, `textContent` en lugar de `innerHTML`, `hidden` para mensajes, todo el movimiento bajo `prefers-reduced-motion: no-preference`. Las medidas completas están en la entrada de la revisión 14 de `design-system/README.md`.

## Goals / Non-Goals

**Goals:**
- Que las specs reflejen la revisión 14 aprobada (equilibrio, interacción, tablas en móvil, estantería, gato).
- Mantener la lógica nueva testeable en Node (funciones expuestas por `module.exports` cuando corren en Node, como en el resto del front).

**Non-Goals:**
- No cambia paleta, imágenes ni el contrato con la API.
- No incluye las imágenes al doble (`lomo-cuero@2x.webp`, `tapa-cuero@2x.webp`, `fondo-noche@2x.webp`): quedan pendientes de Belén.

## Decisions

- **D1 Estado de carga como función pura**: `estadoControlesCarga(cargando, offset, hayMas)` devuelve qué botones deshabilitar, el texto del botón y si la tabla está ocupada; `aplicarEstadoCarga` solo lo vuelca al DOM (`disabled`, `textContent`, `aria-busy`, `.is-cargando`). Alternativa descartada: solo un spinner CSS (no comunica nada a lectores de pantalla ni evita dobles envíos).
- **D2 Errores por campo junto a la validación existente**: `erroresLibroPorCampo` y `erroresClientePorCampo` devuelven `{idDelControl: mensaje}` en el orden del formulario; la validación general (`validarLibroFormulario`) sigue decidiendo si se envía y su mensaje general no cambia. `mostrarErrorCampo` crea el `<p class="mensaje-campo">` con `createElement` la primera vez (id `<control>-error`) y lo reutiliza; `limpiarErrorCampo` lo oculta con `hidden`. `campoDeConflicto` traduce un 409 a ISBN o email. Alternativa descartada: reemplazar el mensaje general (rompía los tests y el caso G-03).
- **D3 Tablas como tarjetas solo con CSS** (bloque 18): bajo 48rem, `td` en grilla con la etiqueta en `td::before` (mismo texto del `th`, escrito en el CSS por id de tabla) y `thead` visualmente oculto. El JS que arma las filas no cambia. Alternativa descartada: `data-label` desde JS (tocaba el JS de otros integrantes).
- **D4 Repisa en varias filas**: `flex-wrap` con `max-inline-size: min(100%, 68.75rem − 2 × --esp-5)`; todas las filas miden `--fila-alto` y la tabla de madera de cada fila es un fondo que se repite cada `--fila-alto`. `--alto-max` baja de 46 a 42dvh y la portada pasa a `min-height`. Alternativa descartada: mantener el scroll horizontal (escondía libros y tapaba la tapa rotada del último).
- **D5 Lomo en el flujo**: `.libro__lomo` deja de ser absoluto (ancho = título + 0.4 rem por lado, mínimo `max(1.75rem, 0.6 × --lomo-ancho)`) y la tapa gira sobre el borde derecho (`left: 100%`, `transform-origin: 0 50%`, `rotateY(90deg)`). Título en oro `#ecd389`, Georgia normal, relieve con `text-shadow`.
- **D6 Canto de páginas**: gradientes (cantos de tapa con `color-mix` del color del lomo y respaldo marrón; hojas con `repeating-linear-gradient` paralelo) y `perspective-origin` de 50% −40% a 50% −5% para que en reposo asome una franja de 16 a 23 px. Reemplaza el bloque crema con rayas a 95° (D-51).
- **D7 Mueble 3D**: tapa superior en `.estante__mueble::before` (`--corona-alto` 1.25 rem, vuelo 0.5 rem, cara de arriba con `clip-path` trapecial), paredes, fondo de tablas y cara superior de cada estante, todo con gradientes.
- **D8 Gato en dos piezas**: `span.gato` (`aria-hidden`) contiene `img.gato__cuerpo` y `span.gato__cola` con la misma imagen de fondo; los `clip-path` se superponen en la raíz (65–68 % del alto) y la cola gira con `transform-origin: 14% 68%` (animación `cola-gato` de 7.5 s). La respiración usa `scale` y la inclinación `rotate` (propiedades separadas, no se pisan) en el contenedor, con `:has(.libro:hover, .libro:focus-visible)`. `z-index` 2: delante del mueble. Alternativa descartada: una segunda imagen de cola (otro archivo, otro pedido y riesgo de desajuste).
- **D9 Equilibrio**: `--alto-nav` 3.75 rem; en móvil `--luna: clamp(3rem, 11vw, 4rem)` y `padding-inline` simétrico en `header`; buscador en grilla de una fila desde 48rem; «Estantería» a `clamp(1.4rem, 3vw, 1.75rem)`; etiquetas a 0.9375 rem; botones en tablas a 44 px.

## Risks / Trade-offs

- [`color-mix()` sin soporte] → se declara antes un `background` de respaldo con marrón neutro.
- [`:has()` sin soporte] → el gato no se inclina; nada más depende de eso.
- [Con más de una fila la portada ya no entra en una pantalla] → aceptado: con el seed (6 libros) en escritorio es una fila; el límite de 12 libros acota el alto.
- [Las etiquetas de las tarjetas están escritas en el CSS] → si cambia un encabezado hay que cambiar el CSS; se documentó en el bloque 18.
- [Imágenes a 1x en pantallas 2x] → pendiente de Belén (exportar las versiones @2x).

## UI Mockups

- Decision: no (project policy) — 2026-11-13, modo `system-only` (política light, sin `mockups/`).
- Design system revision: 14 (reemplaza a la 13).
- Approval: approved (2026-11-13, by Belén Calvo; propuesta de Elías) — revisión 14 del design system.
- Change retroactivo: el código ya estaba implementado y verificado cuando se escribió este diseño.
- Preview: manual detrás de nginx en 320x568, 390x844, 768x1024, 1366x768 y 1920x1080.
