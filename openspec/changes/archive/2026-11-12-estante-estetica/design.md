# Design

## Context

- **Motivación**: ver `proposal.md` (Why). Los requisitos están en `specs/estante-libros`, `specs/navegacion-principal` y `specs/tema-visual`.
- **CSS actual** (`frontend/public/css/styles.css`, del parcial, revisión 1 del design system):
  - Tema claro, «papel y tinta azul».
  - Todo el color sale de variables semánticas de `:root` (`--color-*`).
  - Se estiliza por clase y por estructura, nunca por id.
  - La única excepción de `!important` es `[hidden]`.
  - No hay transiciones ni animaciones.
- **Lo que ya expone el catálogo** (C-03, `js/catalogo.js`, de Hernán):
  - `window.mostrarDetalleLibro(id)` se define al ejecutarse el script, no en `DOMContentLoaded`. Por dentro llama a `cargarDetalleLibro(id, null)`, que:
    - quita `hidden` a `#catalogo-detalle`;
    - **enfoca `#catalogo-detalle-titulo`** (`tabindex="-1"`) de forma síncrona;
    - pide `GET /libros/{id}` y maneja sus propios errores.
  - Como el origen es `null`, `cerrarDetalle()` **no devuelve el foco** a quien abrió el detalle (ver Riesgos).
- **Cliente HTTP** (`js/api.js`):
  - `Api.get("/libros/", { limit: 12 })` arma `/api/libros/?limit=12`.
  - Ante un error lanza `ApiError`: `status` 0 cuando no hay conexión, y `message` en español.
- **Tests**: ya hay un runner para la lógica pura, `node --test` sobre `frontend/tests/*.test.js` (precedente: `catalogo.test.js`, que carga `api.js` y el script con `globalThis.window = globalThis`). El DOM y el CSS no tienen tests automáticos.
- **Imágenes** (ya presentes): `frontend/public/img/gato.webp` (364x960, alto y angosto, mira arriba a la derecha) y `luna.webp` (380x380), WebP con fondo transparente. Su origen (autoría y licencia) es TBD.
  - **Fuentes**: ya no hay fuentes locales. Almendra se **eliminó** (ver D5): títulos y pestañas vuelven a Georgia y el resto, a la fuente del sistema.
- **Imagen del front**: el `Dockerfile` hace `COPY public/` completo, así que `img/` entra en la imagen sin cambios (ni `.gitignore` ni `.dockerignore` lo excluyen). nginx sirve estáticos con `try_files`.
- **Propiedad** (AGENTS.md):
  - Belén es dueña de `css/styles.css`, del `nav`, de la cabecera y de la nueva `#estante`.
  - No se toca `js/catalogo.js`, `js/altas.js`, `js/ventas.js`, `api.js` ni el HTML de `#catalogo`, `#libros`, `#clientes`, `#ventas` o `#historial`.

## Goals / Non-Goals

**Goals:**
- Llevar el tema a **toda** la página reasignando variables semánticas y ajustando los componentes compartidos, sin tocar el HTML ni el JS de los demás.
- Separar en `estante.js` la lógica pura (testeable con `node --test`) del DOM.
- Que toda animación sea opcional, con `prefers-reduced-motion`, y barata: solo `opacity` y `transform`.

**Non-Goals:**
- Modo claro alternativo o selector de tema.
- Refrescar el estante tras un alta (C-04) o una venta (C-05).
- Paginación o búsqueda en el estante: muestra los primeros 12 por id.
- Tests automáticos de DOM, CSS o accesibilidad: se verifican a mano (tasks §5 y §6).
- Mockups HTML (política `system-only`).

## Decisions

### D1. Reasignar las variables semánticas existentes, en lugar de crear un juego paralelo `--magia-*` para todo

El pedido original era agregar variables sin cambiar las existentes, pero el alcance nuevo es un tema **global**. Hay dos caminos:
- **(a) Elegido**: reasignar los valores de `--color-*`. Cada regla que ya usa `var(--color-texto)` y similares pasa al tema sin reescribirse.
- **(b) Descartado**: crear `--magia-*` y reescribir todas las reglas. Duplica tokens, deja los `--color-*` con valores muertos y toca más líneas.

Lo que obliga el camino (a):
- **Revisar las reglas que daban por hecho un fondo claro.** `.btn` usaba `color: var(--color-superficie)` como «texto blanco». Pasa a `--color-texto-sobre-primario` (nueva). `.btn.btn--peligro` pasa a `--color-texto-sobre-peligro` (nueva).
- **Aceptar un nombre que ya no coincide.** `--color-primario-oscuro` queda como el *hover* del botón dorado y su valor es **más claro** (#f6dc8f). Se deja así para no tocar los selectores. El cambio se anota en el comentario de `:root` y en el design system.

### D2. Paleta (hex concretos) y contraste WCAG

Los contrastes se calcularon con la fórmula de luminancia relativa de WCAG 2.x, con un script de Node durante la propuesta.

La «tarjeta» es `rgba(22,26,51,.88)` sobre el tono más claro del cielo (#141a45). Su color efectivo es ≈ #161a35, y es el peor caso para el texto.

Variables **reasignadas** (antes → ahora):

| Variable | Antes | Ahora | Uso |
|---|---|---|---|
| `--color-fondo` | #f5f2ec | #0e1128 | filas pares de tablas, fondo de campos |
| `--color-superficie` | #ffffff | #161a33 | base de cabecera, nav y pie |
| `--color-texto` | #26313b | #f4ecd8 (pergamino) | texto general |
| `--color-texto-suave` | #5a6a76 | #bdb6d1 | pie y textos secundarios |
| `--color-borde` | #d9d3c8 | #8c7a4a (dorado apagado) | bordes de campos y tarjetas |
| `--color-primario` | #245b8c | #e8c46a (dorado) | títulos, enlaces, botones, `h2` |
| `--color-primario-oscuro` | #1a4266 | #f6dc8f (dorado claro, *hover*) | *hover* de `.btn` |
| `--color-primario-claro` | #e8f0f8 | #232848 (noche clara) | `th`, `output` |
| `--color-foco` | #0b57d0 | #ffd75e (dorado foco) | anillo de foco |
| `--color-error-fondo` / `-texto` / `-borde` | #fdecea / #7a1b12 / #c0392b | #3b1418 / #ffc2ba / #ff6b5e | `.mensaje--error` |
| `--color-ok-fondo` / `-texto` / `-borde` | #e9f7ee / #14532d / #2e8b57 | #0f2a1d / #aef0c8 / #4cc38a | `.mensaje--ok` |
| `--color-peligro` / `-oscuro` | #b3261e / #8c1d17 | **sin cambio** | `.btn--peligro` |

Variables **nuevas**:

| Variable | Valor | Uso |
|---|---|---|
| `--color-texto-sobre-primario` | #161a33 | texto de `.btn` dorado |
| `--color-texto-sobre-peligro` | #ffffff | texto de `.btn--peligro` |
| `--magia-cielo-bajo` | #040509 | color base de la página, bajo la imagen de fondo |
| `--magia-velo-alto` / `--magia-velo-bajo` | rgba(8, 12, 40, 0.55) / rgba(8, 12, 40, 0.7) | velo azul noche sobre la imagen de fondo (D3) |
| `--magia-superficie` | rgba(22, 26, 51, 0.88) | fondo de `.card` (translúcido) |
| `--magia-dorado-oscuro` | #c9a24a | último tono del degradado del título |
| `--magia-violeta` | #c4b5f0 | segundo acento (*hover* del nav, detalles) |
| `--magia-brillo` | rgba(232, 196, 106, 0.45) | resplandores y destellos |
| `--magia-estrella` | #fff6d8 | estrellas |
| `--magia-madera` / `--magia-madera-oscura` | #5a3a1e / #3a2412 | mueble del estante |
| `--lomo-cuero` / `--lomo-bordo` / `--lomo-marino` / `--lomo-bosque` / `--lomo-mostaza` | #6b4423 / #6e1f2e / #1c2b5a / #1f4a35 / #7d5f1c | color del lomo de `.libro--c0`…`c4` (cuero) |
| `--oro-lomo` | #d8b45a | bandas doradas y marco de la tapa |
| `--nogal` / `--nogal-oscuro` / `--estante-fondo` | #4a2c16 / #2e1a0c / #170d06 | marco, repisa y fondo del mueble |
| `--fuente-titulo` / `--fuente-encabezados` | Georgia, "Times New Roman", serif | `h1`, `nav a`, `h2`, `h3` y la etiqueta del estante |
| `--luna` / `--gato-alto` / `--alto-max` | clamp(4rem, 12dvh, 7.5rem) / clamp(110px, 22dvh, 200px) / 50dvh (44dvh en móvil) | luna, gato y lomo más alto, ajustados al alto de la ventana (D13) |
| `--libro-prof` (por libro) | 60 a 65 % del alto del libro | profundidad: ancho de la tapa que asoma al salir |
| `--mov-duracion` / `--mov-curva` | 200ms / cubic-bezier(0.23, 1, 0.32, 1) | transiciones (*ease-out* fuerte) |

Contraste verificado (mínimo: 4.5:1 para texto normal, 3:1 para bordes de campos y foco):

| Par | Ratio | Resultado |
|---|---|---|
| Texto pergamino #f4ecd8 / tarjeta ≈#161a35 | 14.46 | AA/AAA |
| Texto pergamino / cielo alto #141a45 | 14.12 | AA/AAA |
| Texto suave #bdb6d1 / tarjeta | 8.74 | AA/AAA |
| Dorado #e8c46a (h2, enlaces) / tarjeta | 10.16 | AA/AAA |
| Dorado oscuro #c9a24a (peor tono del título) / cielo alto | 6.93 | AA |
| Violeta #c4b5f0 / tarjeta | 9.09 | AA/AAA |
| Texto de botón #161a33 / dorado #e8c46a | 10.19 | AA/AAA |
| Texto de botón / *hover* #f6dc8f | 12.65 | AA/AAA |
| Blanco / peligro #b3261e (y *hover* #8c1d17) | 6.54 (9.12) | AA |
| Texto / campo #0e1128 | 15.79 | AA/AAA |
| Borde de campo #8c7a4a / tarjeta (y / campo) | 4.05 (4.42) | ≥ 3:1 |
| `th` dorado / #232848 | 8.54 | AA/AAA |
| Texto / `output` y fila par #232848 | 12.15 | AA/AAA |
| Error #ffc2ba / #3b1418 | 10.53 | AA/AAA |
| Éxito #aef0c8 / #0f2a1d | 11.76 | AA/AAA |
| Foco #ffd75e / tarjeta (cielo, #232848, madera #5a3a1e) | 12.27 (11.98, 10.31, 7.35) | ≥ 3:1 |
| Título del lomo (blanco #ffffff sobre cada cuero) | se mide en pantalla (≥ 4.5) | AA |
| Etiqueta (dorado claro sobre azul noche semitransparente) | se mide en pantalla (≥ 4.5) | AA |
| Etiqueta activa del nav #161a33 / dorado | 10.19 | AA/AAA |

Notas sobre la tabla:
- **Foco sobre el botón dorado**: el anillo #ffd75e contra el botón #e8c46a da apenas 1.21. Por eso se mantiene `outline-offset: 2px`: el anillo queda separado por una franja del fondo oscuro, contra el que da ≥ 10:1 (escenario «Botón dorado» de `tema-visual`).
- **Lomos contra el fondo del mueble**: son oscuros sobre un fondo más oscuro. El límite del botón lo marcan las bandas doradas y el anillo de foco dorado.
- Estos valores son de fórmula; en apply además se verifican a la vista en capturas (ver tasks §6).

### D3. Fondo: imagen de cielo nocturno con velo, en una capa fija

El cielo es la imagen `img/fondo-noche.webp` (**1920x1072**, 88 KB, WebP con estrellas y nebulosa; origen TBD), que **reemplaza** al cielo hecho con `radial-gradient` y a las dos capas de estrellas que titilaban. Se eliminaron sus reglas, el `@keyframes titileo` y la variable `--magia-cielo-alto`.

Capas:
- `html { background: var(--magia-cielo-bajo); color-scheme: dark; }`: color base (y `select`, opciones y barras de scroll nativas en oscuro).
- `body::before`: `position: fixed; inset: 0; z-index: -1; pointer-events: none` con `background: linear-gradient(velo) , url("../img/fondo-noche.webp") center / cover no-repeat`.
  - Se usa un pseudo-elemento fijo para **todos** los tamaños, en vez de `background-attachment: fixed`, que anda mal en móvil. El cielo queda quieto al bajar y cubre la portada y las secciones de abajo como una sola escena continua, sin saltos ni recortes.
  - **Apilamiento**: `body` queda transparente y `html` pinta el color base, así que el pseudo-elemento con `z-index: -1` se ve por encima del fondo de `html`. La luna (`z-index: -1` dentro de la cabecera, después en el orden del documento) queda por encima del fondo; el gato (0) y el gabinete (1) en la escena y la nav (100) no cambian.
  - `body` no se anima: no quedan animaciones de estrellas de fondo (sí la estrella fugaz, aparte).
- **Velo de contraste**: `linear-gradient(to bottom, rgba(8, 12, 40, 0.55), rgba(8, 12, 40, 0.7))` encima de la imagen (variables `--magia-velo-alto` y `--magia-velo-bajo`). La imagen es casi toda oscura (mediana de luminancia 0.005) y la zona más clara es la nebulosa celeste a media altura, a la derecha. Se midió el contraste con los píxeles reales de la imagen y el velo aplicado:
  - texto dorado claro #f6dc8f (título): **6.91:1** contra el peor bloque de 24 px de la nebulosa y **13.4:1 o más** bajo las bandas de la cabecera y de «Estantería»;
  - dorado #e8c46a («Estantería» y texto de los marcapáginas): **5.57:1** contra el peor bloque. Los marcapáginas llevan además su propio fondo borravino (6.46:1);
  - una estrella aislada que cae exactamente detrás de una letra baja el contraste puntual a 5.6:1 (título) y 3.3:1 (`h2`, que es texto grande y alcanza 3:1);
  - sin el velo, el peor bloque daría 3:1: por eso 0.55 a 0.7 y no menos. Con ese velo las estrellas y la nebulosa se siguen viendo en las capturas.
- Las tarjetas de las secciones de abajo mantienen su fondo propio (`--magia-superficie`, al 88 %): sobre la nebulosa quedan en ≈ #151e39 y su texto, a más de 14:1.
- **Rendimiento**: solo esa imagen de 88 KB. `frontend/default.conf.template` suma `location /img/ { expires 30d; add_header Cache-Control "public"; try_files $uri =404; }` para cachear las imágenes (fondo, gato y luna); `.webp` ya sale como `image/webp` por `mime.types`, y `/api/` y el resto de la configuración no cambian. No se probó con `docker build` (lo hace la usuaria).

Luna y estrella fugaz:
- **Luna**: `<img class="luna" src="img/luna.webp" width="380" height="380" alt="" aria-hidden="true" decoding="async">` dentro de `<header>`, que es `position: relative; overflow-x: clip`.
  - El archivo es de 380x380 (verificado), con halo propio y sin estrellas alrededor.
  - Se muestra pequeña: `--luna` = `clamp(4rem, 12dvh, 7.5rem)` (92 px a 768 px de alto y 120 px desde 1000 px), `position: absolute` arriba a la derecha de la cabecera, así que se ve **completa**. `z-index: -1` (detrás del contenido), `opacity` suave y `pointer-events: none`.
  - La cabecera tiene un `min-height` de `--luna` + 1.2 rem, así que la luna **nunca llega a las pestañas**.
  - En móvil la cabecera reserva a la derecha el ancho de la luna (`padding-inline-end`), de modo que el título no la pisa. Por debajo de 24rem (320 y 360 px) la luna se oculta con `display: none`.
  - Su halo respira con `filter: drop-shadow` animado solo con `no-preference` (D4).
- **Estrella fugaz**: `header::after`, un trazo con degradado. Anima `transform` y `opacity` en un ciclo de 14 s, y solo se ve entre el 0 % y el 6 % del ciclo. El `overflow-x: clip` de la cabecera evita el scroll horizontal.

Capas animadas en toda la página: 2 de estrellas, la estrella fugaz, la luna (halo) y el gato (resplandor y balanceo). Los libros usan transiciones, no animaciones.

**Alternativa descartada**: un `<div class="cielo">` en el HTML con muchos `<span>`. Agrega marcado y nodos, y el mismo efecto sale con pseudo-elementos.

### D4. Movimiento reducido sin `!important`

Las **animaciones** (`animation`) y las **transiciones** (`transition`) se declaran **solo** dentro de `@media (prefers-reduced-motion: no-preference) { … }`.

Fuera de ese bloque queda solo el estado «sin movimiento» de los libros: con `:hover` o `:focus-visible` cambian el brillo y el borde (y la etiqueta se muestra, porque la maneja JS con `hidden`). La salida al frente, el giro y la aparición de la etiqueta viven **dentro** del bloque. Así, con «reducir movimiento», los libros no giran ni se mueven y nada se anima.

**Alternativa descartada**: `@media (prefers-reduced-motion: reduce) { * { animation: none !important } }`. Rompería la regla del design system: `!important` solo se permite en `[hidden]`.

### D5. Tipografía: Georgia y sistema; Almendra eliminada

La revisión 3 sumó la familia Almendra (local, OFL) para títulos y pestañas. En la revisión 6 la usuaria pidió volver a la tipografía anterior, así que:
- **Títulos, pestañas y etiqueta del estante**: Georgia (serif) con `--fuente-titulo` y `--fuente-encabezados` = `Georgia, "Times New Roman", serif`. `h2`, `h3` y las pestañas, en negrita; la etiqueta del hover también, en Georgia bold.
- **Resto** (párrafos, formularios, tablas, título de los lomos): fuentes del sistema (`--font-sans`, `--font-mono`).
- **Almendra se elimina** (decisión de diseño): la etiqueta del hover queda igual de bien en Georgia bold, así que ya no aporta. Se quitan los dos `@font-face`, `frontend/public/fonts/` (`Almendra-Regular.ttf`, `Almendra-Bold.ttf` y `OFL-Almendra.txt`, que solo se justificaba mientras se usaba la fuente) y el `types { font/ttf ttf; }` de `frontend/default.conf.template`, que solo servía para los `.ttf`: queda el archivo original, sin cambios respecto de `main`.
- Sin fuentes remotas ni locales: ningún pedido de fuentes.

### D6. Título principal: Georgia normal, dorado suave y sin contorno

- `header h1 { font-family: var(--fuente-titulo); font-weight: 400; font-size: clamp(1.6rem, 3.5vw, 2.25rem); color: #f6dc8f; text-shadow: 0 0 0.6rem rgba(232, 196, 106, 0.4); }`.
- **Sin contorno**: no se usa `-webkit-text-stroke` en ningún texto. **Sin negrita**: el título quedaba pesado.
- **Contraste**: #f6dc8f contra el cielo #141a45, 12.3:1.
- El texto «Librería Página Viva» no cambia.

### D7. Navegación: marcapáginas colgantes en una franja fija

El `<nav aria-label="Navegación principal">` conserva su HTML, sus 5 `href` y el contrato de `estante.js` (`aria-current="location"`). Cambia solo la presentación:
- **Franja** (`nav`): `position: sticky; top: 0; z-index: 100` (D13), alto fijo `--alto-nav` (4.5 rem: varilla de 2 px, marcapáginas, la punta de la activa y 1 rem de aire), fondo `--magia-franja` (azul noche al 85 %), borde inferior dorado fino y **varilla** dorada de 2 px en el borde superior.
- **Marcapáginas** (`nav a`, en el flujo normal, nunca `absolute` sobre la escena): `display: flex`, Georgia negrita, texto dorado, `min-height: 2.75rem` (44 px). Su forma son dos pseudo-elementos con `clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)`:
  - `::before`: el marcapáginas borravino (`--magia-marcapagina`, #6e2234; texto dorado sobre él, 6.46:1);
  - `::after`: una copia dorada detrás, apenas más grande (`opacity` 0 en reposo y 1 en hover y foco), que asoma como **borde dorado**. Se resuelve así porque `clip-path` en el propio enlace recortaría cualquier borde y contorno.
- **Activa** (`[aria-current="location"]`): fondo dorado, texto oscuro y `min-height: 3.25rem`: **cuelga 8 px más**, de modo que no depende solo del color.
- **Hover y foco**: borde dorado siempre; con `no-preference`, baja 4 px (`transform` con transición). Foco de teclado: el contorno dorado global del enlace (que, al no estar recortado, queda entero) con `outline-offset: 4px`.
- **Una fila en móvil**: tamaño de letra `clamp(0.78rem, 3.2vw, 1rem)` y relleno horizontal `clamp(0.4rem, 1.6vw, 1.1rem)`; a 390 px los cinco ocupan 331 px de ancho en una fila. A 320 px pueden envolver: por debajo de 24rem `--alto-nav` pasa a 7.5 rem.
- **Margen**: la punta más baja (la de la activa, 52 px) queda a 18 px del borde inferior de la franja y a 55 px o más de lo que sigue.
- **`aria-current`**: igual que antes. Un `IntersectionObserver` (`rootMargin: "-10% 0px -80% 0px"`) sobre las 5 secciones, el clic y `hashchange`, con `elegirSeccionActiva`. El enlace del título (`#inicio`) no pertenece al nav, así que al volver al inicio ningún marcapáginas queda activo.

### D8. Estantería: estructura, lógica pura y DOM

Marcado en `index.html` (zona de Belén). La cabecera, el nav y la estantería van dentro de un bloque `.portada` (D13), antes de `<main>`:

```html
<div class="portada">
  <header id="inicio"> … <h1><a href="#inicio">Librería Página Viva</a></h1> </header>
  <nav aria-label="Navegación principal">…</nav>
  <section id="estante" class="card estante" aria-labelledby="estante-titulo">
    <div class="estante__escena">
      <h2 id="estante-titulo">Estantería</h2>
      <img class="gato" src="img/gato.webp" width="364" height="960" alt="" aria-hidden="true" decoding="async">
      <div class="estante__mueble">
        <p id="estante-etiqueta" class="estante__etiqueta" aria-hidden="true" hidden></p>
        <ul class="estante__repisa" aria-label="Libros de la estantería"></ul>
      </div>
    </div>
    <p id="mensaje-estante-cargando" class="mensaje" role="status" hidden>Cargando estantería...</p>
    <p id="mensaje-estante-vacio" class="mensaje" hidden>Todavía no hay libros en la estantería.</p>
    <p id="mensaje-estante-error" class="mensaje mensaje--error" role="alert" hidden></p>
  </section>
</div>
<main> …catálogo, libros, clientes, ventas e historial… </main>
```

- El encabezado dice «Estantería» (con tilde), igual que el nombre accesible de la lista y los mensajes. Los ids técnicos (`#estante`, `.estante__*`, `mensaje-estante-*`) no cambian.
- La escena (`.estante__escena`) agrupa el título, el gato y el gabinete y se ajusta al ancho del gabinete.
- Los mensajes van **debajo** de la escena.
- La etiqueta es **una sola**, dentro del gabinete pero fuera del contenedor que hace scroll (D10).
- `<script src="js/estante.js"></script>` va **último**, después de `catalogo.js`.

`estante.js` es una IIFE con `"use strict"` y `var`, y tiene dos capas.

**Capa pura**: sin `document`. Se exporta con `module.exports` condicional, como `catalogo.js`.

| Función | Devuelve |
|---|---|
| `claseColorLibro(id)` | `"libro--c" + (id % 5)` (cuero, bordó, marino, bosque, mostaza) si `id` es entero ≥ 0; si no, `"libro--c0"` |
| `categoriaLargoTitulo(titulo)` | 0 corto (hasta 14 caracteres), 1 medio (hasta 30), 2 largo (hasta 50), 3 muy largo (hasta 60), 4 extra (más de 60) |
| `claseLetraLibro(titulo)` | `"libro--t" + categoría`: la letra mide 1, 0.95, 0.9, 0.85 y 0.75 rem; nunca baja de 0.85 rem salvo en más de 60 caracteres |
| `claseAnchoLibro(id, titulo)` | `"libro--w" + n`, n de 0 a 5 (grosor del lomo de 14 a 18 % del alto): mínimo `[0, 3, 3, 4, 4]` según la categoría del título, más 0 o 1 según `id % 2` |
| `claseAlturaLibro(id, titulo)` | `"libro--h" + n`, n de 0 a 5 (11 a 16 rem): mínimo según la categoría, más 0 a 2 según `id % 3` (alturas desparejas a propósito) |
| `claseInclinacionLibro(id)` | `"libro--inclinado"` si `id % 7 === 3` (id válido); si no, `""` |
| `clasesLibro(id, titulo)` | `"libro"` más color, letra, ancho, altura e inclinación, sin vacíos |
| `tituloLibro(libro)` | el título sin espacios en los extremos, completo y **sin ningún recorte** (también para el lomo y la etiqueta), o «Sin título» |
| `etiquetaLibro(titulo)` | `titulo + ", ver detalle"` (WCAG 2.5.3, *label in name*) |
| `rutaPortada(isbn, disponibles)` | `"img/portadas/<archivo>"` si algún archivo de `disponibles` empieza con `isbn + "."` y el ISBN es válido (solo letras, números y guion); si no, `null` |
| `decidirVistaEstante(lista)` | `"libros"` o `"vacio"` |
| `elegirSeccionActiva(entradas)` | el id activo o `null` (D7) |
| `PARAMETROS_ESTANTE` | `{ limit: 12 }` |
| `PORTADAS_DISPONIBLES` | `[]` (archivos como `"9789500100011.jpg"`; hoy vacía) |

Color, ancho y altura usan módulos distintos (5, 2 y 3) y el largo del título para que las combinaciones no se repitan en patrón.

**Capa DOM**:
- `cargarEstante()` es `async` con `try/catch`. Ocultar mensajes → mostrar «cargando» → `await Api.get("/libros/", PARAMETROS_ESTANTE)` → vista. En el `catch` muestra `error.message` en `#mensaje-estante-error`.
- `crearLibro(libro)` usa `createElement`: `li > button.libro` (clases de `clasesLibro(id, titulo)`, `type="button"`, `aria-label` con `etiquetaLibro`) con tres `span`: `libro__lomo` (con `libro__titulo`, el título en `textContent`, sin óvalo), `libro__tapa` y `libro__tope`. **No hay `<img>` en reposo.**
- `mostrarEtiqueta(titulo)` / `ocultarEtiqueta()` escriben con `textContent` en `#estante-etiqueta` y alternan `hidden`. Se disparan con `mouseenter`/`focus` y `mouseleave`/`blur` del botón, así que funcionan con mouse y con teclado.
- Al salir el libro por primera vez, `mostrarEtiqueta` también pide `rutaPortada(libro.isbn, PORTADAS_DISPONIBLES)` y, si da una ruta, agrega a la tapa un `<img class="libro__portada" loading="lazy" width="88" height="132" alt="">`. Con la lista vacía no se crea ninguna imagen.
- Al hacer clic en un libro:
  - **Si existe la función**: si `typeof window.mostrarDetalleLibro === "function"`, la llama con `(id, boton)`. Si después el foco no quedó en `#catalogo-detalle-titulo`, lo enfoca (solo lectura del id de Hernán, como defensa).
  - **Si no existe**: muestra «No se pudo abrir el detalle del libro.» en el mensaje de error.
- Se inicia en `DOMContentLoaded`: `cargarEstante()` y `conectarNavegacion()` (D7).
- `window.mostrarDetalleLibro` se consulta **al hacer clic**, no al cargar.

**Por qué una lista y no `role="toolbar"`**: cada libro es un botón independiente en el orden de Tab. La lista `<ul>` anuncia cuántos libros hay.

### D9. Gato y luna: imágenes `<img>`, no dibujos

Gato (`img/gato.webp`, **364x960**, verificado en el header del WebP) y luna (`img/luna.webp`, 380x380) son WebP transparentes; no se dibujan con CSS ni SVG.
- Atributos del HTML: `width`/`height` con el tamaño intrínseco, `alt=""`, `aria-hidden="true"`, `decoding="async"`. Sin `style`.
- **Gato nuevo**: alto `--gato-alto` = `clamp(110px, 22dvh, 200px)` (169 px a 768 de alto) y ancho `0.379 × alto`. La imagen **ya mira arriba a la derecha, hacia la luna: no se espeja**.
  - Va **arriba a la izquierda** del gabinete, sentado sobre su borde superior. Las patas están a ~70 % del alto de la imagen, así que se coloca con `top: 0` en la escena y el gabinete tiene `margin-top: 0.7 × alto − 1.5rem`: las patas quedan justo en el borde superior.
  - **Detrás del gabinete** (ajuste de la revisión 7): el gato y el gabinete son hermanos dentro de `.estante__escena`, con `z-index: 0` y `1`; el gato queda delante del cielo y la tarjeta pero detrás del marco. La base de las patas está al 70.8 % del alto de la imagen, así que se sube el gato `0.01 × alto` (`top: -1 %`): la base de las patas queda a ras del borde superior (medido: 0.3 px por encima) y el marco no las tapa.
  - Se desplaza un 20 % de su ancho hacia la izquierda del gabinete: la cola larga cuelga por fuera del costado izquierdo. La parte de la cola que entra en la zona del marco queda **detrás** del gabinete (`z-index: 0` contra `1`), así que no tapa ningún lomo ni título.
  - El `h2` «Estantería» reserva a su izquierda el ancho del gato y no lleva línea, para no cruzarse con él.
  - `filter`: `brightness(1.3)` (la imagen es muy oscura), una sombra suave debajo y un leve resplandor de luna del lado derecho. Con `no-preference` ese resplandor respira (D4). Sin balanceo.
- Se borró todo el posicionamiento del gato anterior (lado derecho, `bottom: 100%`, tamaños en px fijos).

### D10. Gabinete compacto de madera, libros de lomo y etiqueta

**Gabinete** (`.estante__mueble`), todo con gradientes y sombras, sin imágenes:
- Ajustado a los libros: `inline-size: fit-content` (por la escena), marco de nogal de 0.5 rem, sin aire arriba, abajo ni a los costados salvo 1.25 rem de espacio superior en el fondo, que necesitan el tope de páginas y el libro elevado.
- Marco con vetas (`repeating-linear-gradient`), un bisel de luz a la izquierda y sombra a la derecha, reflejo dorado en el canto superior y sombra proyectada abajo, para que se vea como un objeto con volumen.
- Fondo (`.estante__repisa`): sombra cálida con `box-shadow: inset` y luz dorada tenue desde arriba.
- Base: `::after`, una repisa de madera de 0.9 rem con reflejo dorado y un zócalo (sombra escalonada).

**Repisa** (`.estante__repisa`, el fondo, es el único contenedor con scroll):
- `display: flex; align-items: flex-end; gap: 0`, `overflow-x: auto`, `overflow-y: hidden`, sin scrollbar, `scroll-behavior: smooth` (solo con `no-preference`) y `scroll-snap-type: x proximity`.
- Si hay más libros que ancho, el scroll es **solo el de la repisa**: nunca el de la página en la vista de inicio.

**Libro de lomo** (`button.libro`):
- Caja 3D: el `li` tiene `perspective` y el botón `transform-style: preserve-3d`. Caras: `libro__lomo` (frente, `z = 0`), `libro__tapa` (derecha, asoma al girar) y `libro__tope` (arriba, crema con líneas finas: el **borde de páginas**, visible por la perspectiva).
- **Alturas en dvh**: `--alto-max` = 50dvh (44dvh en pantallas angostas) y cada clase `libro--h0`…`h5` es una fracción (68 %, 74 %, 80 %, 87 %, 93 % y 100 %), con un mínimo de 9 rem. Los libros llenan el alto del estante y quedan desparejos a propósito. El mínimo de clase por largo de título pasa a `[0, 1, 2, 3, 4]`.
- **Proporciones de libro real** (revisión 7): grosor del lomo `libro--w0`…`w5` de 14 a 18 % del alto (nunca menos de ~10 %) y profundidad `--libro-prof` de 60 a 65 % del alto, según el color (`libro--c0`…`c4`: 0.6, 0.625, 0.65, 0.61, 0.635). Todo sale de `--lomo-alto`, así que cada libro conserva su proporción en cualquier ventana. `--alto-max` baja a 46dvh (40dvh en móvil).
- Tamaño de letra `libro--t0`…`t4` de 1.1, 1.05, 1, 0.9 y 0.8 rem (nunca menos de 0.85 rem salvo en más de 60 caracteres) y color `libro--c0`…`c4`.
- Inclinación `libro--inclinado`: `rotate(4deg)` sobre la esquina inferior derecha, con su casilla por encima de la siguiente para que su título no quede tapado.
- **Título** (`.libro__titulo`): **de abajo hacia arriba** (`writing-mode: vertical-rl` más `transform: rotate(180deg)`), blanco #ffffff, `system-ui`, negrita, sin fondo, sin `ellipsis`, sin `nowrap` y sin `overflow: hidden`. Se parte en columnas y, si hace falta, el lomo es más ancho. Se comprobó en pantalla con títulos de hasta 80 caracteres.
- Hover o foco: sin cambios (sube 14 px, gira `-32°` mostrando la tapa y brilla en dorado, solo con `no-preference`; con *reduce*, solo brillo y borde).
- **Giro sobre el centro del libro** (`transform-origin` en el centro de su profundidad) para que la tapa rotada, ahora mucho más ancha, no se vaya lejos. La repisa reserva `padding` lateral de 0.22 × `--alto-max` y superior de 0.13 × `--alto-max`, y `scroll-padding-inline` igual, de modo que la tapa del primero, del último y del más alto no se corta ni sale del marco (medido en 3 tamaños). El libro elevado conserva `z-index` por encima de sus vecinos.

**Etiqueta** (`#estante-etiqueta`): Georgia bold, centrada arriba del gabinete, **sobre las puntas de los libros** (no reserva espacio, para que el gabinete siga compacto), fuera del scroll de la repisa, con `pointer-events: none` y `aria-hidden`. Visible con mouse y con teclado.

### D11. Componentes compartidos en tema oscuro (afecta secciones ajenas)

Solo cambia CSS. No se toca su HTML ni su JS.
- **Fondos**:
  - `header`, `nav` y `footer`: fondo transparente o `--color-superficie` con alfa, borde `--color-borde`.
  - `.card`: `background: var(--magia-superficie)`, `border: 1px solid var(--color-borde)`, sombra con resplandor dorado muy tenue y `h2` en `--fuente-titulo`.
  - No se usa `backdrop-filter`, por rendimiento.
- **Botones**:
  - `.btn`: `color: var(--color-texto-sobre-primario)`.
  - `.btn.btn--peligro`: `color: var(--color-texto-sobre-peligro)`.
  - `.btn:disabled` (lo usa la paginación del catálogo): `opacity: .55` y `cursor: not-allowed`. Hoy no tiene estilo propio, y C-03 dejó pendiente pedírselo a Belén.
- **Campos y otros controles**:
  - `input` y `select`: fondo `--color-fondo`, borde `--color-borde` y texto pergamino. `::placeholder` en `--color-texto-suave`.
  - `output`, `th` y `details`: toman las variables reasignadas. `th` pasa a `color: var(--color-primario)`.
- **Mensajes**: se mantienen los marcadores «⚠» y «✓».
- **Foco**: sin cambios de regla. El anillo usa `--color-foco` (ahora dorado) y conserva el `outline-offset: 2px`.

### D12. TDD

Strict TDD está activo y **sí hay runner** para la lógica pura (`node --test`, como `catalogo.test.js`).

- **Lógica pura**: las funciones de D8 (color, altura, ancho e inclinación por id, portada por ISBN, título, vista, sección activa y parámetros) siguen RED → GREEN → TRIANGULATE → REFACTOR en `frontend/tests/estante.test.js`, con al menos 2 casos por comportamiento.
- **DOM, CSS, imágenes, animaciones y contraste en el navegador**: RED/GREEN **no aplica**, porque no hay DOM de prueba ni runner visual. Se verifican con los escenarios manuales de tasks §5 y §6, detrás de nginx (`http://127.0.0.1:8080`).

### D13. Inicio en una sola pantalla, escena continua y navegación fija

**Problema**: la cabecera, el nav y la estantería no entraban juntos; la estantería estaba en una tarjeta que tapaba el cielo; y el nav no acompañaba al bajar.

**Estructura**: `<div class="portada">` agrupa `header#inicio`, `nav` y `#estante`, antes de `<main>`, pero con `display: contents`: no tiene caja propia, así que sus tres hijos se comportan como hijos directos del `body`.
- **Por qué**: `position: sticky` solo pega dentro de su contenedor. Con el nav dentro de una caja de 100dvh se despegaría al pasar la portada; como hijo del `body`, que es tan alto como la página, queda pegado a lo largo de todo el scroll. El `<div>` se conserva solo para agrupar en el HTML.
- **Alto exacto de 100dvh**: ya no hay un contenedor que lo reparta, así que se fija con variables: `header { height: var(--alto-cabecera) }` (luna + 1.2 rem), `nav { height: var(--alto-nav) }` y `#estante { height: calc(100dvh - var(--alto-cabecera) - var(--alto-nav)) }` (con `100vh` de alternativa). Los tres suman exactamente 100dvh. A 320 y 360 px las variables cambian (`--alto-cabecera` 4.25 rem sin luna y `--alto-nav` 7.5 rem para dos filas).
- **Escena continua**: `.portada > .estante` anula el fondo, borde, sombra y radio de `.card` y deja el espaciado (`padding` 1 rem). El cielo es de la página (capas fijas detrás de todo, con las variables `--magia-*`), así que se ve de borde a borde detrás de cabecera, nav y estantería sin imágenes nuevas. La cabecera ya no tiene borde: la varilla dorada de la nav marca el límite.
- **Secciones de abajo**: `main` y sus tarjetas conservan su fondo. `main > .card` lleva `scroll-margin-top: calc(var(--alto-nav) + 0.75rem)` (en lugar de un selector por id) para que el nav fijo no tape los títulos al navegar por anclas.
- **Volver al inicio**: `<h1><a href="#inicio">` con el mismo aspecto (hereda color, sin subrayado) y el foco global. `id="inicio"` está en el `header`, el primer elemento de la portada (un `display: contents` no puede ser destino de un ancla).
- **Las anclas no se rompen**: `#catalogo`, `#libros`, `#clientes`, `#ventas` e `#historial` siguen en `<main>`; `#estante` conserva su id.
- **Medición** en pantalla: `#estante.getBoundingClientRect().bottom == innerHeight` a 1366x768 (cabecera 111 px, nav 72 px, estantería 585 px), 1920x1080 (139, 72 y 869 px) y 390x844 (120, 72 y 652 px).
- **Alternativas descartadas**: `position: fixed` (saca la nav del flujo y obligaría a reservar espacio), dos navs y una nav dentro del `<header>`.

## UI Mockups

- Design system revision: 2 (Approval: approved, 2026-11-12, by user)
- Decision: no (project policy) — 2026-11-12, modo `system-only`
- Mockups: no aplica (política light; sin `mockups/`)
- Design system revision: 9 (reemplaza a la 8, la 7, la 6, la 5, la 4 y la 3, nunca aprobadas; la 2 se aprobó antes)
- Approval: approved (2026-11-12, by Belén Calvo) — revisión 9 del design system. No aplica a mockups (política light).
- Preview: manual (se verifica en apply detrás de nginx; tasks §5 y §6)
- Visual verify: pendiente (manual, en verify)

## Conformidad con las reglas duras (AGENTS.md)

| Regla | Cómo se cumple |
|---|---|
| Sin `innerHTML` con datos | Libros con `createElement` y `textContent`. El gato y la luna son `<img>` estáticos |
| `preventDefault` en `submit` | El estante no tiene formularios. Los enlaces del nav no se interceptan |
| Mensajes con `hidden`, texto y no solo color | `mensaje-estante-*` con `.mensaje`/`.mensaje--error` (marcador ⚠) |
| Sin estilos inline | Color, altura, ancho e inclinación por clases `.libro--*`; imágenes con tamaño por CSS. No hay `style=` ni `el.style` |
| `async/await` + `try/catch` y mostrar `error.message` | `cargarEstante` |
| Sin recalcular importes / `Api.numero` | El estante no muestra importes |
| `fetch` solo en `api.js` | `Api.get("/libros/", { limit: 12 })` |
| Sin `localStorage` | No se usa |
| Sin módulos, librerías, CDN ni npm | IIFE clásica. `module.exports` condicional solo para `node --test` (precedente C-03). Fuentes e imágenes locales |
| Probar detrás de nginx | tasks §5 y §6 |
| Responsive 320–1280 y foco visible | D7, D10, D11 y tasks |
| No tocar archivos ajenos | Solo `css/styles.css`, `index.html` (cabecera sin cambios de texto, nav sin cambios, `#estante` y script), `js/estante.js`, `img/` y `tests/estante.test.js`. `catalogo.js` se usa solo a través de `window.mostrarDetalleLibro` |
| Sin `!important` salvo `[hidden]` (design system) | D4 |

## Risks / Trade-offs

- **[Regresión visual en secciones ajenas]** El tema reasigna variables compartidas, así que catálogo, altas, ventas e historial cambian de aspecto (texto claro, campos oscuros, botones dorados).
  → Mitigación: tasks §6 exige revisar cada sección a 320 y 1280 px (campos, `select[multiple]`, renglón de venta con `:has(output)`, tablas con scroll, `details`, mensajes de error y éxito, botones deshabilitados). Avisar a Hernán, Bruno y Joaquín en el PR.
- **[Conflictos de merge]** Bruno (C-04) y Joaquín (C-05) pueden tener ramas abiertas que tocan `index.html` en sus secciones.
  → Mitigación: este change solo agrega `#estante` al principio de `main` y una línea `<script>` al final. No toca sus secciones.
- **[Regla de colores fijos]** Un integrante pudo haber puesto un color fijo (claro) en su HTML o JS.
  → Mitigación: está prohibido por las reglas duras. Si aparece, se reporta, no se arregla en su archivo.
- **[Detalle sin foco de vuelta]** `cerrarDetalle()` del catálogo no devuelve el foco al lomo, porque `mostrarDetalleLibro(id)` pasa `null` como origen, y el foco cae en `body`.
  → Mitigación: aceptado en C-06. Mejora opcional en un PR de Hernán: `mostrarDetalleLibro(id, origen)`. Es una decisión de la usuaria (ver Preguntas abiertas).
- **[Catálogo sin cargar o sin la función]** `catalogo.js` falla o se renombra la función.
  → Mitigación: comprobación con `typeof` al hacer clic y mensaje de error con texto (escenario «Detalle no disponible»).
- **[Dos pedidos al cargar]** El estante (`limit=12`) y el catálogo (`limit=5`) piden por separado.
  → Mitigación: aceptado. Son pedidos chicos e independientes, y si uno falla el otro sigue.
- **[MIME de `.ttf` y `.webp`]** El `mime.types` de nginx podría no mapear `.ttf` a `font/ttf` ni `.webp` a `image/webp`.
  → Mitigación: los navegadores cargan la fuente igual. En apply se verifica en la pestaña Red, y si hiciera falta se agrega `types { ... }` en `default.conf.template` (cambio mínimo, que se reporta).
- **[Rendimiento en móviles]** Hay capas fijas animadas, y el resplandor del gato y de la luna anima `filter`.
  → Mitigación: solo `opacity`/`transform`/`filter` sobre dos imágenes chicas, sin `backdrop-filter` ni `background-attachment: fixed`, y todo se apaga con *reduce*.
- **[Gato poco visible]** Una imagen negra sobre el cielo nocturno se ve poco.
  → Mitigación: el propio WebP trae detalles dorados y el resplandor animado lo recorta del fondo. Es decorativo.
- **[Luna baja el contraste del título]** La luna es clara y puede quedar detrás del título en pantallas angostas.
  → Mitigación: opacidad suave, tamaño reducido y posición que reserva espacio; se verifica con capturas a 320 px y se oculta si molesta.
- **[Peso de las imágenes]** `gato.webp` y `luna.webp` pesan ~50 KB cada una.
  → Mitigación: `decoding="async"`, tamaños fijos, y se cargan una sola vez.
- **[Truncado de títulos]** Los títulos largos se cortan con «…» en el lomo.
  → Mitigación: el nombre accesible y la etiqueta muestran el título completo.
- **[3D en navegadores viejos]** `preserve-3d` con `overflow` en ancestros puede aplanarse.
  → Mitigación: el scroll vive en `.estante__repisa` y cada libro es su propio contexto 3D dentro del `li`; si se aplanara, el lomo sigue legible y la etiqueta sigue mostrando el título.
- **[Libro elevado cortado por el scroll]** `overflow-x: auto` también recorta en vertical y en los extremos.
  → Mitigación: `padding-top` y `padding-inline` generosos en la repisa, y la etiqueta fuera del contenedor con scroll.
- **[Nombre `--color-primario-oscuro` invertido]** Ahora vale más claro que el primario.
  → Mitigación: se documenta en `:root` y en el design system (D1).
- **[Contraste calculado y no medido en pantalla]** Las capas translúcidas sobre estrellas pueden variar un poco.
  → Mitigación: se usó el peor caso (cielo más claro) y todos los márgenes son amplios (≥ 6.9:1 en texto).

## Migration Plan

1. Apply en `feat/estante-estetica`: tests de la lógica pura, después `estante.js`, el HTML y por último el CSS.
2. Prueba manual detrás de nginx (`docker build`/`run`, KB 12) de §5 y §6, con el backend arriba y después detenido.
3. `/opsx:archive` → PR con aviso a H, R y J del cambio visual global.
4. **Rollback**: revertir el merge commit. El tema vive en `styles.css`, `index.html` y `estante.js`, y no hay datos ni contrato de API involucrados.

## Open Questions

- ¿Se mantiene el texto del título «Librería Página Viva»? **Resuelto: sí.**
- El foco al cerrar el detalle lo resuelve Hernán en otro PR (`mostrarDetalleLibro(id, origen)`). No bloquea este change: el estante ya pasa el botón como segundo argumento.
