# Tasks

> Strict TDD. La lógica pura de `estante.js` (§1) sigue RED → GREEN → TRIANGULATE → REFACTOR con `node --test`. Para HTML, CSS, imágenes y animaciones el ciclo RED/GREEN **no aplica** (no hay DOM de prueba ni runner visual): se verifican a mano detrás de nginx o de un servidor local con los escenarios de §5 y §6 (design.md D12).
> Antes de empezar, cargar las skills `web-design-guidelines` y `emil-design-eng`.
> Correr los tests con `node --test "frontend/tests/*.test.js"` (en Node 24, `node --test frontend/tests/` trata la carpeta como un archivo y falla).
> Prioridad si hay que recortar, desde el final: (1) tema global y tipografía, (2) estante de lomos con etiqueta y detalle, (3) navegación en pestañas, (4) gato y luna, (5) estrella fugaz y extras.

## 1. Lógica pura de `js/estante.js` y tests (Strict TDD)

- [x] 1.1 Crear `frontend/tests/estante.test.js` (`node:test`, `globalThis.window = globalThis`, carga `api.js` y `estante.js`) y el esqueleto IIFE de `frontend/public/js/estante.js`: `"use strict"`, `var`, guarda `typeof document !== "undefined"` y `module.exports` condicional, como en `catalogo.js`. Verificar: los tests corren, con el test de carga en verde y los de `catalogo.test.js` siguiendo verdes.
- [x] 1.2 RED/GREEN/TRIANGULATE de `claseColorLibro(id)` (5 colores de cuero). Casos:
  - ids 1, 2, 3, 4 y 5 dan 5 clases distintas;
  - 1 y 6 dan la misma;
  - 0 da `libro--c0`;
  - `undefined`, -3, 2.5 y `"7"` dan `libro--c0`.
- [x] 1.3 RED/GREEN/TRIANGULATE de `claseInclinacionLibro(id)` (las clases de ancho y alto pasan a la revisión 5, tareas 1.9 a 1.11). Casos:
  - inclinación: ids 3 y 10 dan `libro--inclinado`, y ids 1, 2, 4 y 7 dan `""`;
  - ids inválidos dan la primera variante y sin inclinación;
- [x] 1.4 RED/GREEN/TRIANGULATE de `tituloLibro(libro)` y `etiquetaLibro(titulo)`. Casos:
  - un título con espacios en los extremos queda recortado;
  - un título vacío, solo espacios, `null` o un libro `null` dan «Sin título»;
  - `<b>Rayuela</b>` se devuelve literal;
  - la etiqueta empieza con el título y termina en «, ver detalle».
- [x] 1.5 RED/GREEN/TRIANGULATE de `rutaPortada(isbn, disponibles)`. Casos:
  - con la lista vacía (`PORTADAS_DISPONIBLES`) siempre da `null`;
  - un ISBN con archivo `.jpg` y otro con `.webp` dan `img/portadas/<archivo>`;
  - un ISBN que no está, un ISBN vacío, `null` o con caracteres de ruta (`../x`) dan `null`;
  - un ISBN que es prefijo de otro no confunde el archivo.
- [x] 1.6 RED/GREEN/TRIANGULATE de `decidirVistaEstante(lista)` y `PARAMETROS_ESTANTE`. Casos:
  - una lista con 6 libros da `"libros"`;
  - `[]`, `null` y un valor que no es lista dan `"vacio"`;
  - `PARAMETROS_ESTANTE` es `{ limit: 12 }` sin `offset` ni `titulo`.
- [x] 1.7 RED/GREEN/TRIANGULATE de `elegirSeccionActiva(entradas)`. Casos:
  - entre dos secciones intersectando gana la de mayor `intersectionRatio`;
  - sin intersecciones da `null`;
  - una entrada con `isIntersecting: false` no cuenta;
  - con un empate gana la primera.
- [x] 1.9 RED/GREEN/TRIANGULATE de `categoriaLargoTitulo(titulo)` y `claseLetraLibro(titulo)`. Casos: límites 14/15, 30/31, 50/51 y 60/61 caracteres; «Sin título» y títulos vacíos son cortos; las letras son 1, 0.95, 0.9, 0.85 y 0.75 rem y nunca bajan de 0.85 rem salvo en más de 60 caracteres.
- [x] 1.10 RED/GREEN/TRIANGULATE de `claseAnchoLibro(id, titulo)`, `claseAlturaLibro(id, titulo)` y `clasesLibro(id, titulo)`. Casos: el ancho y el alto mínimos crecen con la categoría del título; el id agrega 0 o 1 (ancho) y 0 a 2 (alto); nunca se pasa de `w5` ni `h5`; un id inválido usa la variante 0; con los mismos id y título la salida es igual.
- [x] 1.11 RED/GREEN de que ningún título se recorta: `tituloLibro` devuelve el título completo para 14, 60, 80 y 200 caracteres, y la etiqueta lo conserva.
- [x] 1.8 REFACTOR: nombres, constantes (`CANTIDAD_COLORES = 5`, `CANTIDAD_ALTURAS = 4`, `CANTIDAD_ANCHOS = 3`, `LIMITE_ESTANTE = 12`) y comentario de cabecera. Verificar que todos los tests siguen verdes.

## 2. Marcado en `index.html` (solo la zona de Belén)

- [x] 2.1 Agregar `<section id="estante" class="card estante" aria-labelledby="estante-titulo">` como **primer hijo de `main`**, con la estructura de design.md D8: `h2`, `.estante__mueble` con el gato, la etiqueta `#estante-etiqueta` (`aria-hidden="true"`, `hidden`) y `ul.estante__repisa` (`aria-label="Libros del estante"`), y los tres `p.mensaje` (cargando con `role="status"`, vacío, y error con `role="alert"`), todos con `hidden` y debajo del mueble. Verificar con `git diff` que `#catalogo`, `#libros`, `#clientes`, `#ventas`, `#historial`, el `<nav>` y el texto de la cabecera no cambian.
- [x] 2.2 Mantener el gato como `<img class="gato" src="img/gato.webp" width="368" height="560" alt="" aria-hidden="true" decoding="async">` dentro de `.estante__mueble`, y la luna como `<img class="luna" src="img/luna.webp" width="380" height="380" alt="" aria-hidden="true" decoding="async">` dentro de `<header>` (el archivo nuevo mide 380x380). Sin `style` y sin dibujar nada con SVG o CSS. Verificar: `grep -n "style=" frontend/public/index.html` no da resultados y el árbol de accesibilidad no muestra las imágenes.
- [x] 2.3 Agregar `<script src="js/estante.js"></script>` como **último** script. Verificar que queda después de `catalogo.js` y que el orden de los demás scripts no cambia.

## 3. Capa DOM de `js/estante.js`

- [x] 3.1 Implementar `cargarEstante()`: `async` con `try/catch`, muestra «cargando», llama a `Api.get("/libros/", PARAMETROS_ESTANTE)`, elige la vista con `decidirVistaEstante`, en el error muestra `error.message` en `#mensaje-estante-error`, y nunca hay dos mensajes visibles a la vez. Verificar con `grep -nE "innerHTML|style\.|fetch\(|localStorage|DATOS" frontend/public/js/estante.js` sin coincidencias.
- [x] 3.2 Implementar `crearLibro(libro)`: `li > button` con `clasesLibro(id)`, `type="button"`, `aria-label` con `etiquetaLibro`, y los `span` `libro__lomo` (con el óvalo `libro__titulo`), `libro__tapa` y `libro__tope`, todos con `textContent`. No crea ningún `<img>` en reposo. Al hacer clic: llama a `window.mostrarDetalleLibro(id, boton)` si existe y, si el foco no quedó en `#catalogo-detalle-titulo`, lo enfoca; si no existe, muestra «No se pudo abrir el detalle del libro.».
- [x] 3.5 Implementar la etiqueta (D10): `mostrarEtiqueta` / `ocultarEtiqueta` con `textContent` y `hidden` sobre `#estante-etiqueta`, disparadas con `mouseenter`/`focus` y `mouseleave`/`blur` del botón; y, solo al salir el libro la primera vez, el `<img class="libro__portada" loading="lazy" width="88" height="132" alt="">` en la tapa si `rutaPortada` da una ruta. Verificar con la lista vacía que no hay pedidos a `img/portadas/`.
- [x] 3.3 Implementar `conectarNavegacion()` (D7): marca `aria-current="location"` en el clic de un enlace del nav, en `hashchange` y en la carga inicial con hash; usa un `IntersectionObserver` (`rootMargin: "-10% 0px -80% 0px"`) sobre las 5 secciones, en solo lectura, con `elegirSeccionActiva`; quita el atributo de los demás enlaces, o de todos si da `null`; sin `IntersectionObserver` se queda solo con clic y hash. Verificar que los `href` del nav no se modifican y que no hay `preventDefault` en los enlaces.
- [x] 3.4 Iniciar todo en `DOMContentLoaded` (`cargarEstante()` y `conectarNavegacion()`). Verificar que el archivo sigue cargando en Node sin `document`.

## 4. CSS: tema, fuentes, nav, estante, gato y luna (`css/styles.css`)

- [x] 4.1 (Reemplazada por 9.6: ya no hay fuentes locales) Agregar los dos `@font-face` de Almendra (400 y 700, D5) y versionar `frontend/public/fonts/Almendra-Regular.ttf`, `Almendra-Bold.ttf` y `OFL-Almendra.txt` **sin modificarlos**. Verificar con `git status` que solo se agregan, y en la red que las fuentes se piden a `/fonts/` del mismo origen con estado 200 y que no hay pedidos a otros dominios.
- [x] 4.2 Reasignar las variables de `:root` y agregar las nuevas con los hex exactos de design.md D2 (más `--fuente-titulo`, `--fuente-encabezados` y las variables del libro). Incluye `color-scheme: dark` y un comentario sobre `--color-primario-oscuro`. Verificar que `--color-peligro` y `--color-peligro-oscuro` no cambian.
- [x] 4.3 Implementar el cielo (D3): `html` con el color base y `body::before` fijo (`inset: 0`, `z-index: -1`, `pointer-events: none`) con el velo y la imagen `fondo-noche.webp` en `cover`. Verificar que a 320 px no hay scroll horizontal y que todos los controles siguen respondiendo al clic.
- [x] 4.4 Implementar el título moderado y sin contorno (D6): `clamp(1.75rem, 4.5vw, 2.5rem)`, 700, dorado claro, `text-shadow` de resplandor y `letter-spacing` leve; aplicar `--fuente-titulo` a `h1` y `nav a` y `--fuente-encabezados` a `h2` y `h3` (700, mínimo 1.1 rem). Verificar con `grep -n "text-stroke" frontend/public/css/styles.css` sin coincidencias y a 320 y 1440 px en pantalla.
- [x] 4.5 Adaptar los componentes compartidos (D11): `header`, `nav`, `footer` y `.card`; `input`, `select` y `::placeholder`; `output`, `details`, `th` y filas pares; `.btn` con `--color-texto-sobre-primario`, `.btn--peligro` con `--color-texto-sobre-peligro` y `.btn:disabled`; mensajes. Verificar con `grep -n "!important"` que solo aparece en `[hidden]`, y que no se agrega ningún selector por id.
- [x] 4.6 Estilizar el nav como etiquetas tipo pestaña (D7): `min-height` de 44 px, *hover* violeta y `[aria-current="location"]` con fondo dorado, subrayado y borde inferior grueso. Verificar a 320 px que las 5 etiquetas se leen completas, sin scroll horizontal.
- [x] 4.7 Estilizar el mueble, la repisa y los libros de lomo (D10): marco de nogal con vetas, fondo en sombra cálida con luz dorada, repisa de madera debajo; lomo de cuero con bandas doradas, relieve y óvalo del título vertical; variación por clases de color, altura, ancho e inclinación; caras tapa y tope; sombra sobre la repisa; salida al frente con `rotateY`, `translateY(-14px)` y destello; y etiqueta anclada arriba y al centro. Verificar que el libro elevado y la etiqueta no se cortan, también en el último libro, y que a 1280 px se ven al menos 8 libros.
- [x] 4.8 Estilizar gato y luna (D9, D3): gato sobre el mueble sin tapar libros, etiqueta, mensajes ni título; luna de 140 a 200 px arriba a la derecha, detrás del contenido y con opacidad suave, que en móvil no moleste al título ni a su contraste. Verificar con capturas a 320, 390 y 1440 px.
- [x] 4.9 Declarar **todas** las `animation` y `transition` (estrellas, estrella fugaz, resplandor y balanceo del gato, halo de la luna, salida al frente de los libros y aparición de la etiqueta) solo dentro de `@media (prefers-reduced-motion: no-preference)` (D4). Con *reduce* emulado, los libros no giran ni se mueven y solo cambian el brillo y el borde; la etiqueta aparece al instante.

## 5. Verificación manual del estante y del nav (con el seed, o con un servidor simulado si el backend no está)

- [x] 5.1 **Carga**: se pide `GET /api/libros/?limit=12`, se ven los libros ordenados por id y los colores se repiten cada 5 ids.
- [x] 5.2 **Teclado**: Tab recorre las etiquetas del nav y después los libros. Cada uno muestra el anillo dorado, sale al frente y muestra la etiqueta con el título completo. Enter y Espacio abren el detalle, y el foco queda en «Detalle del libro» con los datos de ese libro.
- [x] 5.3 **Mouse**: con el cursor el libro sale al frente, aparece la etiqueta y vuelve. Con un clic se abre el detalle correcto (`GET /api/libros/{id}`).
- [ ] 5.4 *(seguimiento manual de la usuaria tras el archive: no automatizable)* **Lector de pantalla** (NVDA o Narrador): los libros se anuncian como botones «<título>, ver detalle», el gato y la luna no se anuncian y el nav se anuncia como «Navegación principal» con 5 enlaces. *(Manual de la usuaria: no se automatiza.)*
- [x] 5.5 **`aria-current`**: al hacer clic en «Clientes», solo ese enlace lo tiene. Al hacer scroll hasta Historial, pasa a «Historial». Arriba de todo, ningún enlace lo tiene.
- [x] 5.6 **Reduced motion**: con *reduce* emulado no se anima nada, el gato no se anima y los libros no giran.
- [x] 5.7 **Error de conexión**: con el backend detenido, el estante muestra «⚠ No se pudo conectar con el servidor. Revisá tu conexión.», sin libros.
- [x] 5.8 **Vacío**: contra una base sin libros, se ve «Todavía no hay libros en el estante.».
- [x] 5.9 **Detalle no disponible**: en consola, `window.mostrarDetalleLibro = undefined` y clic en un libro. Se ve el mensaje de error del estante y no hay excepciones en consola.
- [x] 5.11 **Etiqueta en los bordes**: con la repisa desplazada al extremo izquierdo y al derecho, la etiqueta se ve completa, centrada en el mueble, sin cortarse y sin tapar al gato.
- [x] 5.10 **Responsive**: a 320, 768 y 1280 px no hay scroll horizontal de página, la repisa se desplaza horizontalmente, el gato se ve completo y los títulos largos se truncan con «…».

## 6. Regresión visual de secciones ajenas (tema global) y verificación a la vista

- [x] 6.1 **Catálogo** (Hernán) a 320 y 1280 px: búsqueda, tabla con scroll interno, paginación (incluido «Anterior» deshabilitado), panel de detalle, tabla de autorías y mensajes; todo legible y con foco dorado visible; `git diff` vacío en `catalogo.js`.
- [x] 6.2 **Libros y Clientes** (Bruno) a 320 y 1280 px: campos, `select` y `select[multiple]` en esquema oscuro, botón «Agregar», mensajes de error (⚠) y de éxito (✓), y tablas.
- [x] 6.3 **Ventas e Historial** (Joaquín) a 320 y 1280 px: renglón de venta, `output` legibles, botón «Quitar» rojo con texto blanco, total, tabla de historial y `details`/`summary`.
- [x] 6.4 **Contraste y legibilidad a la vista**: capturas de cabecera (título y luna), nav, estante, cada sección y mensajes a 390 y 1440 px, además de medir con script los contrastes de texto, `th`, botón dorado, campo con borde, cinta de título y mensajes. Incluye el título del lomo sobre el óvalo, la etiqueta y el título de la cabecera (320 y 1440 px). Todos deben dar AA; si alguno no, ajustar el hex en `:root`, el design system y D2 a la vez.
- [x] 6.5 **Consola y red**: sin errores en consola y sin pedidos a dominios externos.
- [x] 6.6 **MIME en nginx**: construir la imagen del front, correrla en `127.0.0.1:8080` y verificar con `curl -sI` que `.ttf` da `Content-Type: font/ttf` y `.webp` da `image/webp`. Si no, agregar el cambio mínimo `types { ... }` en `default.conf.template` y reportarlo. *(Si Docker no está disponible, queda sin marcar y se explica.)*

## 7. Documentación

- [x] 7.1 `design-system/README.md` a `Revision: 7` con `Approval: pending (revisión 7, ...)`, aclarando que reemplaza a la 6, la 5, la 4 y la 3 (nunca aprobadas): paleta, variables de `:root`, fuentes y licencias (Almendra, OFL, Ana Sanfelippo), imágenes (`gato.webp`, `luna.webp`, origen TBD) y decisiones (título, luna y estantería de lomos con etiqueta). `.active-orchestrator-state.json` con `visual_design.revision: 9` y `status: pending`.
- [x] 7.2 Resolver los TBD de C-06 en `CHANGES.md` y la KB (06, 09 con D-31, 10) y marcar C-06 como implementado, pendiente de PR/archive. Verificar con `grep` que no queda ninguna referencia a la fuente anterior.
- [x] 7.3 `openspec validate estante-estetica --strict` verde.

## Workflow follow-up

- ~~Aprobar la revisión 9 del design system~~: hecho el 2026-11-12 (`Approval: approved (2026-11-12, by Belén Calvo)` y `visual_design.status: approved`).
- ~~Archivar el change~~: hecho el 2026-11-12 con 1 tarea sin marcar (5.4, lector de pantalla, seguimiento manual); `CHANGES.md` marca C-06 como hecho.
- PR desde `feat/estante-estetica` a `main`, avisando a Hernán, Bruno y Joaquín del cambio visual global; revisión de otro integrante y merge común.

## 8. Ajustes de la revisión 5 (luna, gato y títulos de lomo sin recorte)

- [x] 8.1 Luna de 90 px (móvil) y 120 px (desde 48rem), completa, a 0.9 rem del borde, detrás del contenido; cabecera con `min-height` y reserva a la derecha en móvil; oculta por debajo de 24rem. Verificar a 320, 390 y 1440 px que no pisa las pestañas ni el título.
- [x] 8.2 (Reemplazada por 9.4) Gato de 110 px (móvil) y 140 px (desde 48rem) sentado sobre el borde superior derecho del mueble, con espacio reservado arriba. Verificar que no pisa el `h2` «Estante» ni su línea, ni libros ni etiqueta.
- [x] 8.3 Título del lomo en blanco directo sobre el cuero, sin óvalo, sin `ellipsis`, sin `nowrap` y sin `overflow: hidden`; clases `libro--t0`…`t4` de tamaño de letra; clases `libro--w0`…`w5` y `libro--h0`…`h5` por largo e id; en `estante.js` las funciones de 1.9 a 1.11.
- [x] 8.4 Repartir los libros en el ancho del estante (`margin-inline: auto` en los `li`) y dejar que el mueble crezca con el libro más alto. Verificar a 1440 px con 6 y con 11 libros.
- [x] 8.5 Verificar en pantalla con «Rayuela», «Respiración artificial», «La invención de Morel», «Antología de la literatura fantástica» y un título de 80 caracteres: completos, en blanco, sin cortes ni óvalo; contraste medido; etiqueta de hover con el título completo; reduced-motion; sin errores de consola.
- [x] 8.6 Documentar en `design-system/README.md` (Revision 5, `Approval: pending`, reemplaza a la 4), KB (D-34, ajuste de D-33), `CHANGES.md` y `.active-orchestrator-state.json` (revision 5, pending).

## 9. Rediseño de la revisión 6 (inicio en una pantalla, gabinete compacto, gato nuevo y Georgia)

- [x] 9.1 Bloque `.portada` de 100dvh con cabecera, nav y estantería, y `main` con las demás secciones debajo; luna, gato y lomos medidos en dvh; scroll solo dentro de la repisa. Verificar a 1366x768, 1920x1080 y 390x844 que el borde inferior de `.portada` no pasa de `innerHeight` y que las anclas del nav siguen funcionando.
- [x] 9.2 Gabinete compacto de nogal ajustado a los libros, con marco con vetas, base con zócalo y volumen; libros que llenan el alto, borde de páginas visible, alturas y anchos desparejos; hover y foco sin cambios.
- [x] 9.3 Títulos de lomo de abajo hacia arriba (`vertical-rl` más `rotate(180deg)`), blancos, sin fondo y sin recorte; tamaños de letra y alturas por largo adaptados al nuevo alto en dvh; tests reajustados (`TAMANOS_LETRA_REM`, `ALTO_MINIMO`). Verificar en pantalla títulos de hasta 80 caracteres completos.
- [x] 9.4 Gato nuevo (364x960, verificado en el header del WebP) arriba a la izquierda del gabinete, sin espejar, patas en el borde superior, cola por fuera y detrás del marco; borrar el posicionamiento del gato anterior; `drop-shadow` y resplandor de luna.
- [x] 9.5 Encabezado «Estantería» (con tilde) en `index.html`, `aria-label`, mensajes, specs, tests y docs.
- [x] 9.6 Título principal en Georgia normal `clamp(1.6rem, 3.5vw, 2.25rem)`, dorado con `text-shadow` tenue y sin contorno; `h2`, `h3` y pestañas en Georgia negrita; eliminar Almendra (`@font-face`, `frontend/public/fonts/` y el `types` de `default.conf.template`).
- [x] 9.7 Luna de ~120 px (`clamp` por dvh), completa y sin pisar el nav.
- [x] 9.8 Verificación en pantalla (sin solapes entre gato, luna, h2, nav, libros y etiqueta; sin errores de consola; reduced-motion; contraste) y documentación (Revision 6, D-35 y CHANGES).

## 10. Ajustes de la revisión 7 (gato detrás del marco y libros de proporción real)

- [x] 10.1 Gato por detrás del gabinete (`z-index` 0 contra 1 en el mismo contexto): subirlo `0.01 × alto` para que la base de las patas quede a ras del borde superior sin que el marco las tape, con la cola tapada por el marco. Verificar con captura y con la medición de la base de las patas contra el borde.
- [x] 10.2 Libros de proporción real: grosor del lomo de 14 a 18 % del alto, profundidad de la tapa de 60 a 65 % (`--libro-prof` por libro), `--alto-max` 46dvh (40dvh en móvil), giro sobre el centro, `padding` y `scroll-padding` de la repisa para que la tapa rotada no se corte. `ANCHO_MINIMO` pasa a `[0, 3, 3, 4, 4]` y se ajusta el test (RED, GREEN). Verificar a 1366x768, 1920x1080 y 390x844 que `.portada` no pasa de `innerHeight`, que los títulos entran en su lomo y que el primero, el último y el más alto levantados no se cortan.
- [x] 10.3 Docs: Revision 7 (`Approval: pending`, reemplaza a la 6), KB (D-36 y D-37), `CHANGES.md` y `.active-orchestrator-state.json`.

## 11. Ajustes de la revisión 8 (escena continua, marcapáginas y navegación fija)

- [x] 11.1 Quitar la tarjeta de la estantería (fondo, borde, sombra y radio) para que el cielo se vea continuo detrás de cabecera, nav y estantería; sin borde en la cabecera. Verificar a 1366x768 que no hay cortes ni franjas y que las secciones de abajo conservan su fondo.
- [x] 11.2 Marcapáginas colgantes en la nav: varilla dorada, Georgia negrita, borravino con texto dorado, borde en V con `clip-path` en pseudo-elementos, activa dorada que cuelga 8 px más, hover y foco con borde dorado, baja 4 px (solo `no-preference`), contorno de foco separado, 44 px de alto y cinco en una fila a 390 px. Verificar márgenes de al menos 16 px con `getBoundingClientRect` a 1366x768, 1920x1080 y 390x844.
- [x] 11.3 Navegación fija: `.portada` con `display: contents`, `nav` `sticky` con fondo al 85 %, alturas fijas de cabecera y nav, estantería de `100dvh` menos ambas, `scroll-margin-top` en `main > .card`, título como enlace a `#inicio` con `id="inicio"` en el `header`. Verificar `#estante` bottom == `innerHeight`, nav pegado al bajar, anclas sin tapar títulos y que el clic en el título vuelve arriba.
- [x] 11.4 Docs: Revision 8 (`Approval: pending`, reemplaza a la 7), KB (D-38, D-39 y D-40), `CHANGES.md` y `.active-orchestrator-state.json`.

## 12. Ajuste de la revisión 9 (fondo de cielo con imagen)

- [x] 12.1 Reemplazar el cielo de CSS (`radial-gradient` de estrellas, sus capas y `@keyframes titileo`) por `img/fondo-noche.webp` en `body::before` fijo con velo `--magia-velo-alto/bajo`; quitar `--magia-cielo-alto` y las reglas muertas. Verificar el apilamiento (luna, gato, gabinete y nav) y que no hay scroll horizontal.
- [x] 12.2 Medir el contraste con los píxeles reales de la imagen y el velo aplicado (título #f6dc8f y #e8c46a): ≥ 6.9:1 y ≥ 5.5:1 contra el peor bloque de la nebulosa. Verificar con capturas que estrellas y nebulosa se ven y que las secciones de abajo siguen legibles.
- [x] 12.3 Cache de `/img/` en `frontend/default.conf.template` (cambio mínimo; sin build).
- [x] 12.4 Docs: Revision 9 (`Approval: pending`, reemplaza a la 8), KB (D-41), `CHANGES.md` y `.active-orchestrator-state.json`.
