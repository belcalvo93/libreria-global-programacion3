# Design system — Gatoteca Lunar

Mode: system-only
Revision: 10
Approval: approved (2026-11-12, by Belén Calvo)

> Política «light»: se **reutiliza** el CSS del parcial. No se crea un sistema nuevo ni se piden mockups por change.
> - La revisión 1 (tema claro del parcial) la aprobó la usuaria el 2026-11-10.
> - La revisión 2 (2026-11-12) es el tema «librería mágica» de C-06: reasigna variables de `:root`, agrega variables nuevas y adapta los componentes compartidos al tema oscuro. La usuaria la aprobó el 2026-11-12 junto con la reasignación de las variables `--color-*`.
> - La revisión 3 (2026-11-12) cambió la tipografía a la familia **Almendra** y reemplazó el gato y la luna dibujados por imágenes WebP. **Nunca se aprobó**: la revisión 4 la reemplaza.
> - La revisión 4 (2026-11-12) ajustó lo que la usuaria vio de la 3 y **tampoco se aprobó**: la revisión 5 la reemplaza. La 4 hizo:
>   - el título pasa a un tamaño moderado, en dorado claro con resplandor y **sin contorno**;
>   - la luna es la nueva `luna.webp` (380x380, sin estrellas alrededor), chica y detrás del contenido;
>   - el estante deja los libros 3D con tapa y pasa a un **mueble de madera antigua con libros de lomo** y una **etiqueta** con el título completo al hover o al foco.
> - La revisión 5 (2026-11-12) ajustó la luna, el gato y los títulos de lomo y **tampoco se aprobó**: la revisión 6 la reemplaza. La 5 hizo:
>   - la luna es mucho más chica (90 px en móvil y 120 px desde 48rem), completa y sin pisar la navegación;
>   - el gato se sienta sobre el borde superior derecho del mueble (110 a 140 px) sin pisar el encabezado «Estante»;
>   - el título de cada lomo va **en blanco, directo sobre el cuero, sin óvalo ni fondo y sin recortes** (nunca «…»), y los lomos son más anchos y más altos y de alturas desparejas a propósito.
> - La revisión 10 (2026-11-12, change `tema-secciones`) recupera la **estrella fugaz** de la cabecera y pasa las secciones de abajo (Catálogo, Libros, Clientes, Ventas, Historial) a «**cristal nocturno**»: tarjetas azul noche translúcidas con borde dorado tenue, títulos con línea y ✦, formularios en grilla, botones primario/secundario, tablas y mensajes coherentes. No toca la portada ni la estantería. Una segunda pasada (Ventas e Historial) agrega botones secundario/compacto/fantasma, fila de libro, cliente por ID y paginación centrada. **Aprobada por Belén Calvo el 2026-11-12; reemplaza a la 9.**
> - La revisión 9 fue la anterior aprobada (2026-11-12, por Belén Calvo). Las revisiones 3 a 8 fueron iteraciones intermedias que nunca se aprobaron y quedan reemplazadas por la 9; la última aprobada antes era la 2. La 9 **reemplaza a la 8**: el cielo pasa de estrellas hechas con CSS a la imagen `fondo-noche.webp` con un velo azul noche.
> - La revisión 8 (2026-11-12) **reemplazó a la 7** (que no se aprobó) con tres cambios: la estantería **sin tarjeta** (el cielo estrellado continuo detrás de toda la portada), la navegación con **marcapáginas colgantes** de una varilla dorada y una **navegación fija** con el título como enlace al inicio. **Pendiente de aprobación.**
> - La revisión 7 (2026-11-12) **reemplazó a la 6** (que no se aprobó) con dos ajustes: el gato queda **por detrás del gabinete** (cola tapada por el marco y patas a ras del borde) y los libros tienen **proporciones de libro real** (lomo de 14 a 18 % del alto y tapa de 60 a 65 %). **Pendiente de aprobación.**
> - La revisión 6 (2026-11-12) fue un rediseño de la estantería hecho con criterio de diseño gráfico y UX/UI, que **reemplaza a la 5** (y a la 4 y la 3):
>   - **todo el inicio en una sola pantalla** (cabecera, nav y estantería enteras a 1366x768, 1920x1080 y 390x844), con las demás secciones debajo;
>   - **gabinete compacto** de madera ajustado a los libros, con volumen;
>   - títulos de los lomos **de abajo hacia arriba**;
>   - **gato nuevo** (364x960) arriba a la izquierda del gabinete, mirando a la luna;
>   - encabezado «**Estantería**»;
>   - vuelve la tipografía anterior: **Georgia** (título normal, `h2`, `h3` y pestañas en negrita) y se **elimina Almendra**.
>   **Aprobada por Belén Calvo el 2026-11-12.**
>
> Un cambio a variables de `:root` o a componentes compartidos sube `Revision:` y vuelve `Approval` a `pending`.

## Política visual del proyecto

- `system-only`: hay UI, pero no se pide mockup por change. Los changes visuales que tengan `design.md` registran `Decision: no (project policy)`.
- No se crean `tokens.css`, `brand.js`, `components.html`, `assets/` ni `previews/`: no aplican en política light. La fuente de verdad es el CSS existente.
- Dueña del CSS general: Belén.
- Cambiar la política requiere pedido explícito del usuario.

## Fuente

- `frontend/public/css/styles.css` es el único archivo de estilos externo, sin librerías, frameworks ni CDN.
- Se estiliza por clase y estructura, nunca por id.
- Cualquier cambio a variables de `:root` o a componentes compartidos sube `Revision:` y vuelve la aprobación a `pending`.

## Tipografía (revisión 6)

- **Título principal**: Georgia, peso normal, `clamp(1.6rem, 3.5vw, 2.25rem)`, dorado #f6dc8f con `text-shadow` tenue de resplandor, **sin contorno**.
- **`h2`, `h3` y pestañas del nav**: Georgia en negrita (`--fuente-titulo` y `--fuente-encabezados` = Georgia, «Times New Roman», serif). La etiqueta del hover del estante, también Georgia bold.
- **Texto, formularios, tablas y títulos de los lomos**: fuentes del sistema (`--font-sans`, `--font-mono`; los lomos, `system-ui` bold).
- **No hay fuentes locales ni remotas.** Almendra (SIL OFL 1.1, © 2011-2012 Ana Sanfelippo) se usó en las revisiones 3 a 5 y se **eliminó** en la 6: se quitaron los `@font-face`, `frontend/public/fonts/` (con `OFL-Almendra.txt`, que solo se justificaba mientras se usaba) y el `types { font/ttf ttf; }` de `frontend/default.conf.template`, que quedó igual que en `main`. Si se volviera a usar una fuente local, hay que versionar su licencia junto al archivo y declarar su MIME en nginx.

## Imágenes (revisión 6)

| Archivo | Tamaño intrínseco | Uso | Origen |
|---|---|---|---|
| `frontend/public/img/gato.webp` | 364x960, WebP transparente (alto y angosto; ya mira arriba a la derecha) | gato sentado arriba a la izquierda del gabinete, de alto `clamp(110px, 22dvh, 200px)`, mirando a la luna | TBD (autoría y licencia no registradas) |
| `frontend/public/img/fondo-noche.webp` | 1920x1072, WebP (88 KB), cielo nocturno azul con estrellas y nebulosa | fondo de TODA la página, en `body::before` fijo (`cover`, centrado) con un velo azul noche encima (0.55 arriba, 0.7 abajo) | TBD (autoría y licencia no registradas) |
| `frontend/public/img/luna.webp` | 380x380, WebP transparente (halo propio, sin estrellas alrededor) | luna de ~120 px (`clamp(4rem, 12dvh, 7.5rem)`), completa, arriba a la derecha de la cabecera y detrás del contenido; se oculta por debajo de 24rem | TBD (autoría y licencia no registradas) |

- Ambas van con `<img>` de `width`/`height` fijos, `alt=""`, `aria-hidden="true"` y `decoding="async"`. El tamaño mostrado lo define el CSS.
- No se dibujan con CSS ni SVG. Son decorativas.
- Portadas reales opcionales: `frontend/public/img/portadas/<isbn>.jpg|webp`, solo para los ISBN de la lista `PORTADAS_DISPONIBLES` de `estante.js` (hoy vacía).

## Tokens (`:root`)

### Revisión 1 (vigente en el código hasta el apply de C-06)

- Color: `--color-fondo` #f5f2ec, `--color-superficie` #ffffff, `--color-texto` #26313b, `--color-texto-suave` #5a6a76, `--color-borde` #d9d3c8, `--color-primario` #245b8c, `--color-primario-oscuro` #1a4266, `--color-primario-claro` #e8f0f8, `--color-peligro` #b3261e, `--color-peligro-oscuro` #8c1d17, `--color-foco` #0b57d0.
- Estados: `--color-error-fondo|texto|borde` (#fdecea / #7a1b12 / #c0392b) y `--color-ok-fondo|texto|borde` (#e9f7ee / #14532d / #2e8b57).

### Revisión 2 — paleta «librería mágica» (C-06, aprobada el 2026-11-12)

Temática: librería encantada de noche, con luna y estrellas. Usa dorado como acento principal y violeta suave como segundo acento. No usa nombres, logos, tipografías ni marcas de ningún universo de ficción.

Variables **reasignadas**. Así el tema llega a todas las secciones sin tocar su HTML ni su JS:

| Variable | Rev. 1 | Rev. 2 |
|---|---|---|
| `--color-fondo` | #f5f2ec | #0e1128 |
| `--color-superficie` | #ffffff | #161a33 |
| `--color-texto` | #26313b | #f4ecd8 (pergamino) |
| `--color-texto-suave` | #5a6a76 | #bdb6d1 |
| `--color-borde` | #d9d3c8 | #8c7a4a |
| `--color-primario` | #245b8c | #e8c46a (dorado) |
| `--color-primario-oscuro` | #1a4266 | #f6dc8f (*hover* del botón dorado; el nombre se conserva aunque ahora es más claro) |
| `--color-primario-claro` | #e8f0f8 | #232848 |
| `--color-foco` | #0b57d0 | #ffd75e |
| `--color-error-fondo` / `-texto` / `-borde` | #fdecea / #7a1b12 / #c0392b | #3b1418 / #ffc2ba / #ff6b5e |
| `--color-ok-fondo` / `-texto` / `-borde` | #e9f7ee / #14532d / #2e8b57 | #0f2a1d / #aef0c8 / #4cc38a |
| `--color-peligro` / `-oscuro` | #b3261e / #8c1d17 | sin cambio |

Variables **nuevas**:

| Variable | Valor |
|---|---|
| `--color-texto-sobre-primario` | #161a33 |
| `--color-texto-sobre-peligro` | #ffffff |
| `--magia-cielo-bajo` | #040509 (color base bajo la imagen) |
| `--magia-velo-alto` / `--magia-velo-bajo` (rev. 9) | rgba(8, 12, 40, 0.55) / rgba(8, 12, 40, 0.7) |
| `--magia-superficie` | rgba(22, 26, 51, 0.88) |
| `--magia-dorado-oscuro` | #c9a24a |
| `--magia-violeta` | #c4b5f0 |
| `--magia-brillo` | rgba(232, 196, 106, 0.45) |
| `--magia-estrella` | #fff6d8 |
| `--magia-madera` / `--magia-madera-oscura` | #5a3a1e / #3a2412 |
| `--lomo-cuero` / `--lomo-bordo` / `--lomo-marino` / `--lomo-bosque` / `--lomo-mostaza` (rev. 4) | #6b4423 / #6e1f2e / #1c2b5a / #1f4a35 / #7d5f1c |
| `--oro-lomo` (rev. 4) | #d8b45a (bandas doradas y marco de la tapa) |
| `--nogal` / `--nogal-oscuro` / `--estante-fondo` (rev. 4) | #4a2c16 / #2e1a0c / #170d06 |
| `--fuente-titulo` / `--fuente-encabezados` (rev. 6) | Georgia, "Times New Roman", serif |
| `--luna` / `--gato-alto` / `--alto-max` (rev. 6) | clamp(4rem, 12dvh, 7.5rem) / clamp(110px, 22dvh, 200px) / 50dvh (44dvh en móvil) |
| `--magia-marcapagina` / `--magia-franja` (rev. 8) | #6e2234 / rgba(14, 17, 40, 0.85) |
| `--alto-cabecera` / `--alto-nav` (rev. 8) | calc(var(--luna) + 1.2rem) / 4.5rem (7.5rem a 320 px) |
| `--libro-prof` (rev. 7, por libro) | 60 a 65 % del alto del libro (ancho de la tapa que asoma al salir) |
| `--mov-duracion` / `--mov-curva` | 200ms / cubic-bezier(0.23, 1, 0.32, 1) |

Contraste calculado (WCAG 2.x). El peor caso de la tarjeta es ≈ #161a35, sobre el tono más claro del cielo. El detalle completo está en `openspec/changes/estante-estetica/design.md` D2.
- **Texto**:
  - pergamino sobre tarjeta: 14.46;
  - texto suave: 8.74;
  - dorado: 10.16;
  - peor tono del título #c9a24a: 6.93;
  - violeta: 9.09.
- **Botones**:
  - dorado (texto #161a33): 10.19;
  - peligro (texto blanco): 6.54.
- **Campos, tablas y mensajes**:
  - borde de campo: 4.05 (≥ 3:1);
  - `th`: 8.54;
  - error: 10.53;
  - éxito: 11.76.
- **Foco** #ffd75e sobre tarjeta: 12.27. Con `outline-offset: 2px` queda separado del botón dorado.
- **Estantería** (medido en pantalla): título blanco #ffffff sobre cada cuero, 5.96 a 13.61 (el peor, mostaza, 5.96); etiqueta, 13.76.
- **Título principal** #f6dc8f contra el cielo #141a45: 12.31. Etiqueta del hover (dorado claro sobre azul noche): 13.76.
- Los valores de las secciones, la tabla, los campos y los mensajes se midieron además en el navegador (script sobre los colores calculados): coinciden con los de arriba.

### Comunes (sin cambio)

- Tipografía: `--font-sans` (system-ui y fallbacks), `--font-mono` (ui-monospace y fallbacks), `--fs-base` 1rem, `--fs-sm` 0.875rem, `--fs-lg` 1.25rem, `--fs-titulo` clamp(1.5rem, 4vw, 2rem).
- Espaciado (escala de 4px): `--esp-1` 0.25rem, `--esp-2` 0.5rem, `--esp-3` 0.75rem, `--esp-4` 1rem, `--esp-5` 1.5rem, `--esp-6` 2rem.
- Forma y elevación: `--radio` 8px, `--radio-sm` 4px, `--sombra` 0 1px 3px rgba(0,0,0,.12).

## Componentes

- Estructura: `header`, `nav` (lista centrada, enlaces con `min-height` 44px), `footer`, `main` (grid, `max-width` 72rem).
- `.card`: tarjeta con `h2` subrayado en color primario.
- Formularios: `.form` (1 columna; 2 desde 48rem) y `.form__grupo` (label + control; funciona dentro y fuera de `.form`).
- Renglón de venta: `.form .form__grupo:has(output)` (selector estructural; en 48rem+ pasa a 4 columnas). Sin `:has()` cae a pila vertical.
- Controles: `input`, `select` (`min-height` 44px), `select[multiple]`, `output` (monoespaciada, fondo primario claro), `details`/`summary`.
- Botones: `.btn` (ancho completo, 44px) y `.btn.btn--peligro` (acción de quitar).
- Tablas: `.tabla-contenedor` (único responsable del scroll horizontal) y `.tabla` (celdas con `nowrap`).
- Mensajes de estado: `.mensaje` (base), `.mensaje--error` (marcador ⚠) y `.mensaje--ok` (marcador ✓). El estado no depende solo del color.
- `hidden`: `[hidden] { display: none !important; }` es la única excepción de `!important`. Los `.mensaje` llevan `hidden` en el HTML y el JS lo quita/pone para mostrarlos u ocultarlos. No usar `display` inline ni clases ad hoc para ocultar.

Agregados de las revisiones 2 a 6 (C-06):
- **Cielo**:
  - (rev. 9) `body::before` fijo lleva la imagen `fondo-noche.webp` con el velo azul noche; `html` pinta el color base. Ya no hay estrellas de CSS ni titileo.
  - La cabecera lleva la estrella fugaz (`header::after`).
  - La **luna** es la imagen `.luna` (380x380), detrás del contenido (`z-index: -1`), con opacidad suave; en móvil queda en la esquina para no restar contraste al título. Su halo respira solo con movimiento permitido.
  - Toda la decoración usa `pointer-events: none`.
- **Inicio en una pantalla** (rev. 6, ajustado en la 8): `.portada` (`display: contents`) reúne `header#inicio`, `nav` y la estantería, que suman 100dvh con alturas fijas (`--alto-cabecera`, `--alto-nav`); `main` con las demás secciones va debajo y las anclas del nav no cambian. Todo lo vertical sale del alto de la ventana (`--luna`, `--gato-alto`, `--alto-max`).
- **Título**: Georgia 400, `clamp(1.6rem, 3.5vw, 2.25rem)`, dorado claro con `text-shadow` tenue; sin contorno.
- **Nav** (rev. 8): franja fija (`position: sticky; top: 0`) de azul noche al 85 % con borde inferior dorado fino y una varilla dorada arriba, de la que cuelgan **marcapáginas** borravino (#6e2234) con texto dorado, Georgia negrita y borde inferior en V (`clip-path` en pseudo-elementos). La activa (`aria-current`) es dorada con texto oscuro y cuelga 8 px más. Hover y foco: borde dorado (capa dorada detrás) y bajan 4 px con movimiento permitido; el foco suma el contorno dorado global separado. 44 px de alto y cinco en una fila a 390 px. No usa roles de tabs ni de menú.
- **Estantería** (gabinete compacto, rev. 6):
  - `.estante__escena` agrupa el `h2` «Estantería» (sin línea), el gato y el gabinete, y se ajusta al ancho del gabinete;
  - `.estante__mueble`: gabinete de nogal ajustado a los libros (marco de 0.5 rem con vetas, bisel de luz, reflejo dorado, sombra proyectada) y base con zócalo (`::after`);
  - `.estante__repisa`: el fondo, con sombra cálida, luz dorada tenue desde arriba y scroll horizontal suave sin scrollbar; es el único contenedor con scroll;
  - `.libro` (`<button>`) de lomo hacia afuera con color `libro--c0`…`c4` (id % 5), altura `libro--h0`…`h5` (fracción de `--alto-max`: 68 % a 100 %; desparejas a propósito), grosor de lomo `libro--w0`…`w5` (14 a 18 % del alto, nunca menos de ~10 %) y tapa de 60 a 65 % del alto (`--libro-prof` por color) y tamaño de letra `libro--t0`…`t4` (1.1, 1.05, 1, 0.9 y 0.8 rem: nunca menos de 0.85 rem salvo en más de 60 caracteres); inclinación `libro--inclinado` (id % 7 = 3, 4°);
  - lomo con bandas doradas (2 arriba y 1 abajo) y relieve lateral; borde de páginas visible arriba (`libro__tope`); el título `libro__titulo` va **de abajo hacia arriba** (`vertical-rl` más `rotate(180deg)`), blanco #ffffff, `system-ui` negrita, sin fondo y **sin ellipsis, nowrap ni overflow hidden** (completo, hasta 80 caracteres, en varias columnas);
  - al salir (hover de puntero fino o `:focus-visible`, con movimiento permitido) el libro sube 14 px, avanza y gira `-32°` sobre su centro mostrando su tapa 3D (`libro__tapa`) con destello dorado; con *reduce* solo cambian brillo y borde;
  - `.estante__etiqueta`: etiqueta única con el título completo en Georgia bold, arriba y al centro del gabinete (sobre las puntas de los libros), fuera del scroll, visible con mouse y con teclado;
  - portada real opcional `.libro__portada`, solo para los ISBN de la lista y solo al salir el libro.
- **Gato** (rev. 6): `.gato`, imagen decorativa 364x960 arriba a la izquierda del gabinete, sin espejar, de alto `--gato-alto`; las patas (70 % de su alto) en el borde superior, la cola por fuera del costado izquierdo y detrás del marco; `brightness`, sombra suave y leve resplandor de luna.
- **`.btn:disabled`**: `opacity` reducida y `cursor: not-allowed`.

## Reglas

1. Sin estilos inline (`style=""`): todo va en `styles.css`.
2. Colores, tipografía, espaciado y radios salen de las variables de `:root`; no hardcodear valores.
3. Foco visible en todo control interactivo (`:focus-visible`, anillo 3px `--color-foco`). Nunca suprimir `outline` sin reemplazo.
4. Responsive de 320 a 1280 px, mobile-first, breakpoint en 48rem, sin scroll horizontal de página (el scroll de tablas va en `.tabla-contenedor` y el de los libros en `.estante__repisa`).
5. Contenido dinámico con `textContent` (nunca `innerHTML` con datos del usuario o de la API).
6. Objetivos táctiles de 44px mínimo; contraste AA.
7. Los mensajes de estado reutilizan `.mensaje`, `.mensaje--error`, `.mensaje--ok` y el atributo `hidden`.
8. Sin librerías, frameworks, CDN ni fuentes remotas ni locales. Las imágenes van en `frontend/public/img/`.
9. **Movimiento** (rev. 2):
   - Toda `animation` y `transition` se declara solo dentro de `@media (prefers-reduced-motion: no-preference)`, así que con *reduce* nada se anima y los libros no giran ni se mueven (solo cambian borde y brillo).
   - Se animan `opacity`, `transform` y, en el gato y la luna, `filter: drop-shadow`.
   - No se usan `backdrop-filter` ni `background-attachment: fixed`.

## Decisiones abiertas (TBD)

- Nombre de marca final: **Gatoteca Lunar** (decidido en C-06c, D-47; ya no es TBD). Reemplaza al nombre provisional del parcial.
- Logo: (TBD). No hay logo de marca. `gato.webp` y `luna.webp` son decorativas y su origen (autoría y licencia) es TBD: no se inventa autoría.
- Modo claro alternativo: no se hace. La revisión 2 es solo oscura.
- ~~Movimiento/animaciones y `prefers-reduced-motion`~~: resuelto en la revisión 2 (regla 9).
- ~~Estilos para estados nuevos (carga, vacío)~~: se reutiliza `.mensaje` con `hidden`. Además se agrega `.btn:disabled` (revisión 2).
- ~~Paleta «librería mágica»~~: resuelta y aprobada en la revisión 2 (tabla de arriba).
- Alcance visual de C-06 (decidido, D-25, ampliado en D-31, D-32 y D-33):
  - tema global oscuro con cielo, estrellas, luna (imagen) y estrella fugaz;
  - Georgia en título, pestañas, `h2` y `h3` (Almendra eliminada);
  - estante de libros de lomo de la API arriba del catálogo, en un gabinete compacto de madera (salen al frente con cursor o foco y muestran una etiqueta con el título; al hacer clic abren el detalle `GET /libros/{id}`);
  - gato decorativo (imagen);
  - nav como etiquetas tipo pestaña.

  La tabla del catálogo se mantiene.
- Decisiones de la revisión 9:
  - **Imagen de cielo** en un pseudo-elemento fijo para todos los tamaños (no `background-attachment: fixed`, que falla en móvil), con `cover` y centrada.
  - **Velo** de 0.55 a 0.7: contraste medido con los píxeles reales de la imagen: título #f6dc8f 6.91:1 y #e8c46a 5.57:1 contra el peor bloque de la nebulosa (13.4:1 o más bajo la cabecera y «Estantería»). Sin velo bajaría a ~3:1.
  - **Caché**: `/img/` con `expires 30d` en nginx.
  - Origen de la imagen: TBD (no se inventa autoría).
- Decisiones de la revisión 8:
  - **Sin contenedor**: la estantería ya no es una tarjeta; el cielo fijo se ve continuo de borde a borde detrás de cabecera, nav y estantería. Las secciones de abajo conservan sus tarjetas.
  - **Marcapáginas sin recorte de bordes**: el `clip-path` va en `::before` y `::after`, no en el enlace; así el contorno de foco y el borde dorado se ven enteros.
  - **Nav fija**: para que `sticky` funcione a lo largo de toda la página, `.portada` pasa a `display: contents` y la nav queda como hijo directo del `body`; las alturas de cabecera y nav son fijas para que la portada siga midiendo 100dvh.
  - **Título como enlace** a `#inicio` (en el `header`) y `scroll-margin-top` en `main > .card`.
- Decisiones de la revisión 7:
  - **Gato detrás del gabinete**: `z-index` 0 (gato) contra 1 (gabinete) como hermanos en la escena; se sube `0.01 × alto` para que la base de las patas (70.8 % de la imagen) quede a ras del borde superior sin que el marco las tape.
  - **Libros de proporción real**: lomo 14 a 18 % del alto y tapa 60 a 65 %, todo como fracción de `--lomo-alto`; alturas más bajas (`--alto-max` 46dvh, 40dvh en móvil) y desparejas. Para que los títulos entren en lomos más finos, el grosor mínimo de los títulos medios y largos sube a `w3`/`w4`.
  - **Tapa rotada contenida**: giro sobre el centro del libro, `padding` y `scroll-padding` de la repisa de 0.22 y 0.13 veces `--alto-max`.
- Decisiones de la revisión 6:
  - **Inicio en una pantalla**: `.portada` de 100dvh con cabecera, nav y estantería; las demás secciones siguen debajo de `main` y las anclas no se rompen. Se mide con `portada.getBoundingClientRect().bottom <= innerHeight`; el `scrollHeight` total de la página es mayor por las secciones de abajo.
  - Todo lo vertical (luna, gato, lomos) sale de dvh con `clamp`; el exceso horizontal se resuelve con scroll solo en la repisa.
  - **Gabinete ajustado**: el ancho del gabinete se ajusta a los libros (centrado); la etiqueta del hover va sobre las puntas de los libros y no reserva espacio.
  - **Gato**: arriba a la izquierda, detrás del marco, sin espejar; el `h2` reserva su ancho y no lleva línea.
  - **Almendra eliminada** porque la etiqueta queda igual de bien en Georgia bold.
  - Los lomos pueden usar hasta 3 columnas en los títulos de más de 60 caracteres.
  - La inclinación pasa de 6° a 4° y la casilla del libro inclinado queda por encima de la siguiente para no tapar su título.
- Decisiones de la revisión 5:
  - la luna cabe entera dentro de la cabecera (que crece lo necesario) para no llegar a las pestañas; en móvil la cabecera reserva a la derecha el ancho de la luna y por debajo de 24rem la luna se oculta;
  - el gato va a la derecha y el mueble reserva sobre sí el alto del gato, así que no pisa el `h2` ni su línea;
  - los libros se reparten en el ancho del estante con `margin-inline: auto` en cada casilla (sin espacio libre, como en móvil, el margen vale 0 y se desplaza);
  - para que los títulos de más de 60 caracteres entren completos se permiten hasta 3 columnas en el lomo (el pedido hablaba de 2): con 2 columnas y 16 rem de alto no alcanza a 0.75 rem de letra.
- Decisiones de la revisión 4:
  - el estante vuelve a libros de **lomo** (la usuaria no quiso las cajas con tapa en reposo): la tapa solo asoma al salir el libro, y la portada real, si existe, solo se pide en ese momento;
  - la etiqueta con el título completo es **una sola**, anclada arriba y al centro del mueble y fuera del contenedor con scroll, para que no se corte en los bordes ni tape al gato;
  - la repisa **no muestra scrollbar** (se desplaza con toque, rueda o Tab) para no romper el aspecto del mueble;
  - en escritorio entran los 12 libros (más de los 8 pedidos como mínimo); el scroll horizontal solo actúa cuando no entran;
  - el título principal no usa degradado de recorte: con `text-shadow` y color sólido se ve más nítido.

## Reemplazo

- **Valores visuales**: se cambian en `:root` de `frontend/public/css/styles.css`; no hay otro punto de reemplazo.
- **Fuente de títulos**: se cambia `--fuente-titulo` / `--fuente-encabezados` en `:root`.
- **Gato y luna**: se reemplazan los archivos `img/gato.webp` e `img/luna.webp` (mismas proporciones, fondo transparente) o se ajusta su tamaño en `.gato` / `.luna`.
- En ambos casos, coordinar con Belén (dueña del CSS general) y subir `Revision:`.
