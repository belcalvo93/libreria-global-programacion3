> Change retroactivo: todas las tareas ya estaban hechas y commiteadas en `feat/pulido-visual` (`02665af`, `124aed4`, `cfe92d4`) y se verificaron contra el código al escribir este archivo.

## 1. Equilibrio visual
- [x] 1.1 Franja del nav de 4.5 a 3.75 rem (`--alto-nav`), sin banda vacía bajo los marcapáginas
- [x] 1.2 Cabecera móvil: luna `clamp(3rem, 11vw, 4rem)` y `padding-inline` simétrico; sin luna bajo 24rem
- [x] 1.3 Buscador del catálogo (`.form[role="search"]`) en una fila desde 48rem
- [x] 1.4 Formulario «Libros» sin el bloque «3. Guardar»: botón al pie, a todo el ancho (`index.html`)
- [x] 1.5 «Estantería» a `clamp(1.4rem, 3vw, 1.75rem)` y etiquetas de formulario a 15 px

## 2. Interacción (JS + tests)
- [x] 2.1 Catálogo: `estadoControlesCarga` y `aplicarEstadoCarga` («Buscando…», botones deshabilitados, `aria-busy`, `.is-cargando`) + 5 tests en `catalogo.test.js`
- [x] 2.2 Altas: `erroresLibroPorCampo`, `erroresClientePorCampo`, `campoDeConflicto` (409 → ISBN/email), `mostrarErrorCampo`, `limpiarErrorCampo`; foco al primer campo inválido y limpieza al escribir + 8 tests en `altas.test.js`
- [x] 2.3 CSS del bloque 17: `.mensaje-campo` con ⚠, borde de error en `[aria-invalid="true"]`, atenuado de la tabla con transición solo con `no-preference`

## 3. Responsive
- [x] 3.1 Bloque 18: tablas de catálogo, libros, historial, venta confirmada y detalle de venta como tarjetas por debajo de 48rem (`td::before` con la etiqueta, `thead` visualmente oculto)
- [x] 3.2 Botones dentro de tablas a 44 px de alto

## 4. Estantería
- [x] 4.1 Repisa en varias filas (`flex-wrap`), ancho máximo igual al de las secciones, una tabla de nogal por fila (`--fila-alto`), `--alto-max` 42dvh, portada con `min-height`
- [x] 4.2 Mueble 3D: tapa superior (`::before`), paredes laterales, fondo de tablas y cara superior de cada estante
- [x] 4.3 Lomo en el flujo con ancho según el título y tapa girada sobre su borde derecho
- [x] 4.4 Título del lomo en oro estampado (Georgia, #ecd389)
- [x] 4.5 Canto de páginas redibujado (cantos de tapa con `color-mix` y respaldo, hojas paralelas) y `perspective-origin` 50% −5%

## 5. Gato
- [x] 5.1 Más grande (`clamp(120px, 26dvh, 240px)`), borde de luz de luna, delante del mueble (`z-index` 2) sobre la tapa superior
- [x] 5.2 Respiración e inclinación hacia el libro que sale (`:has`), solo con `no-preference`
- [x] 5.3 Cola animada: `span.gato > img.gato__cuerpo + span.gato__cola` con dos recortes de la misma imagen y animación `cola-gato`, solo con `no-preference`

## 6. Verificación y cierre
- [x] 6.1 `node --test frontend/tests/*.test.js`: 86 tests en verde (73 antes del change)
- [x] 6.2 Revisión manual detrás de nginx en 320x568, 390x844, 768x1024, 1366x768 y 1920x1080: sin scroll horizontal, portada en una pantalla con una fila de libros, gato sin pisar «Estantería» ni la etiqueta; probado también con 24 libros clonados (varias filas)
- [x] 6.3 `design-system/README.md`: revisión 14 aprobada por Belén (2026-11-13)
- [x] 6.4 `openspec validate pulido-visual --strict`
