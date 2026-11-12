# Proposal

## Why

El catálogo ya sale de la API (C-03), pero la página sigue con la estética clara del parcial y le falta la sección de estante que el grupo decidió en D-25. C-06 le da a todo el front el clima de una **librería encantada de noche**:
- cielo nocturno con estrellas y una luna (imagen);
- acentos en dorado y violeta;
- tipografía Georgia (la familia local Almendra se probó y se eliminó);
- una estantería de libros de lomo reales, en un gabinete compacto de madera, con un gato misterioso (imagen), todo en una sola pantalla;
- un menú de etiquetas tipo pestaña.

Así también se cierran los TBD de paleta y alcance. Va ahora porque depende de C-03, que ya está mergeado, y conviene cerrarlo antes del deploy final del viernes 13.

## What Changes

- **Tema global «librería mágica»** en `css/styles.css` (Belén es dueña del CSS general):
  - **Fondo y decoración**: cielo nocturno como imagen (`img/fondo-noche.webp`, 1920x1072) con un velo azul noche, fijo detrás de toda la página; una luna como imagen (`img/luna.webp`, 380x380 con halo propio, pequeña, de unos 120 px ajustados al alto de la ventana, completa y detrás del contenido, sin pisar la navegación) y una estrella fugaz ocasional.
  - **Acentos**: dorado (bordes, títulos y detalles con un brillo sutil) y violeta suave.
  - **Componentes compartidos adaptados al tema oscuro**: `.card`, formularios, tablas, botones, `output`, `details` y mensajes. Las superficies son azul noche translúcido con un borde dorado fino, el foco visible es dorado y todo cumple contraste AA.
  - **Variables existentes**: se **reasignan** las variables semánticas de `:root` (`--color-*`). Así el tema llega a todas las secciones sin tocar su HTML ni su JS.
  - **Variables nuevas**: cielo, madera, lomos, tipografía y movimiento.
- **Tipografía**: Georgia (serif) en el título, las pestañas, `h2`, `h3` y la etiqueta del estante; fuentes del sistema en el resto. No hay fuentes locales: se eliminó Almendra.
  - Título «Librería Página Viva»: Georgia normal, `clamp(1.6rem, 3.5vw, 2.25rem)`, dorado suave con resplandor tenue y **sin contorno**.
  - `h2`, `h3` y pestañas: Georgia en negrita.
- **Sección nueva `<section id="estante">`** arriba de `#catalogo`: un **mueble de librería antigua** con libros de **lomo** pedidos con `GET /libros/?limit=12` a través de `window.Api`.
  - El JS va en el nuevo **`frontend/public/js/estante.js`**: IIFE con `"use strict"` y `var`, cargado después de `catalogo.js`.
  - **Mueble**: marco de madera oscura (nogal) con vetas de `repeating-linear-gradient`, tabla superior, laterales, fondo en sombra cálida con luz dorada tenue desde arriba y una repisa de madera debajo de los libros. Todo con CSS.
  - **Libros de lomo**: apoyados en la repisa, juntos, de distinta altura y ancho, color tipo cuero (marrón, bordó, azul marino, verde bosque o mostaza oscura), 2 o 3 bandas doradas, relieve lateral y el título en vertical de abajo hacia arriba, en blanco y sin fondo ni recorte, directo sobre el cuero.
    - Color por `id % 5`; ancho (3.5 a 6 rem), altura (11 a 16 rem) y tamaño de letra según el largo del título (los largos, más anchos y más altos) y el id, con alturas desparejas a propósito; alguno inclinado contra el vecino de forma determinista (`id % 7`). Todo con clases, sin estilos inline.
    - **El título nunca se corta**: sin puntos suspensivos ni recorte, hasta 80 caracteres.
    - Cada libro es un `<button>` con `aria-label` «<título>, ver detalle».
  - **Hover o foco de teclado**: el libro sale al frente (sube unos 14 px y se inclina con `rotateY` mostrando la tapa en 3D) y suelta un destello dorado. Aparece una **etiqueta horizontal** con el título completo en Georgia negrita, anclada arriba y al centro del mueble (visible con mouse y con teclado, sin cortarse en los bordes). Con «reducir movimiento» no hay giro: solo brillo, borde y etiqueta.
  - **Portada real opcional** (`img/portadas/<isbn>`): solo para los ISBN de una lista explícita en `estante.js` (hoy vacía), y solo cuando el libro sale al frente, nunca en reposo.
  - Se ven al menos 8 libros en escritorio, repartidos a lo ancho del estante, y el resto, con scroll horizontal suave cuando no entra.
  - Al hacer clic llama a `window.mostrarDetalleLibro(id, boton)` y el foco pasa al detalle del catálogo.
  - El estante muestra estados de carga, vacío y error con `.mensaje` y `hidden`.
- **Gato misterioso**: imagen `img/gato.webp` (368x560) con `<img>` de tamaño fijo, nuevo (364x960), sentado arriba a la izquierda del gabinete, mirando a la luna, de alto `clamp(110px, 22vh, 200px)`, con `alt=""` y `aria-hidden="true"`. No tapa libros, etiqueta ni controles. Su resplandor dorado respira y se balancea apenas (solo con movimiento permitido).
- **Navegación**:
  - Es el mismo `<nav aria-label="Navegación principal">` con sus 5 enlaces ancla, ahora con estilo de etiquetas tipo pestaña.
  - Funciona a 320 px.
  - `estante.js` marca `aria-current="location"` en el enlace de la sección activa al hacer clic, al cambiar el hash o al hacer scroll.
- **Movimiento**: todas las animaciones y transiciones se declaran solo con `prefers-reduced-motion: no-preference`; con «reducir movimiento» no hay giro de libros ni animaciones.
- **Documentación**:
  - `design-system/README.md` pasa a `Revision: 6` con `Approval: pending (revisión 6)`, y registra la paleta, las fuentes y su licencia, las imágenes (`gato.webp`, `luna.webp`, origen TBD) y la estantería de lomos con etiqueta.
  - Se actualizan `CHANGES.md` (alcance y archivos de C-06), la KB (06, 09 con D-25, D-26 y la nueva D-31, y 10) y `.active-orchestrator-state.json`.

Fuera de alcance:
- Cambiar `js/catalogo.js`, `js/altas.js`, `js/ventas.js`, el HTML de `#catalogo`, `#libros`, `#clientes`, `#ventas` o `#historial`, `api.js` o el backend.
- Recursos remotos. Las únicas imágenes son `gato.webp` y `luna.webp`, ya presentes (sin portadas reales por ahora).
- Refrescar el estante después de un alta.
- Devolver el foco al libro al cerrar el detalle (depende de `catalogo.js`; ver design.md).

## Capabilities

### New Capabilities
- `estante-libros`: sección de estante con libros de lomo reales que salen de la API, en un mueble de madera antigua. Cubre el mueble, el lomo de cuero con bandas doradas y su variación por id, el título vertical, el libro como botón accesible, la salida al frente con destello, la etiqueta con el título completo, las portadas opcionales, la apertura del detalle del catálogo, los estados (cargando, vacío y error) y el gato decorativo (imagen).
- `navegacion-principal`: navegación por anclas a las secciones de la página, con etiquetas tipo pestaña, foco visible y `aria-current` en la sección activa.
- `tema-visual`: tema «librería mágica» de toda la página. Cubre el cielo nocturno animado, la luna (imagen), la tipografía Georgia, los componentes compartidos con contraste AA, el foco visible, el movimiento reducido y el responsive de 320 a 1280 px.

### Modified Capabilities
<!-- Ninguna: `catalogo-libros` no cambia su comportamiento. El estante usa `window.mostrarDetalleLibro(id)`, que C-03 ya expone, y el tema solo cambia la presentación. -->

## Impact

- **Código (en apply, no ahora)**:
  - Nuevo `frontend/public/js/estante.js`.
  - `frontend/public/index.html`: cabecera (estructura decorativa), `<nav>` (sin cambiar sus enlaces), nueva `#estante` con la imagen del gato, la etiqueta de título, la imagen de la luna en la cabecera y el `<script>` de `estante.js`.
  - `frontend/public/css/styles.css`: `:root` (con variables reasignadas y nuevas), estilos globales, nav, estantería de lomos, gato, luna y movimiento.
  - `frontend/public/img/` (`gato.webp`, `luna.webp`): se versionan tal como están.
  - Nuevo `frontend/tests/estante.test.js` para la lógica pura, con `node --test`.
- **API**: solo lee `GET /libros/?limit=12`. El contrato no cambia.
- **Secciones de otros integrantes**: el catálogo (Hernán), las altas (Bruno), las ventas e historial (Joaquín) **cambian de aspecto** porque se reasignan variables y estilos compartidos, pero no se toca su HTML ni su JS. Hay riesgo de regresión visual y se pide verificarlas a mano (tasks §6).
- **Diseño**: el design system sube a la revisión 4, que reemplaza a la 5 (y a la 4 y la 3, nunca aprobadas), y la aprobación vuelve a `pending` hasta que la usuaria apruebe los cambios de tipografía, luna, imágenes y estantería de lomos (la revisión 2 ya fue aprobada).
- **Dependencias**: C-03, ya mergeado. No se agregan librerías, CDN, npm ni recursos remotos.
