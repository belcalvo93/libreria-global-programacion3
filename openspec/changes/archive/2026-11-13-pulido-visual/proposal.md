## Why

Change **retroactivo**: el trabajo ya está hecho y commiteado en la rama `feat/pulido-visual` (commits `02665af`, `124aed4` y `cfe92d4`) y lo aprobó Belén como revisión 14 del design-system (2026-11-13). Se documenta acá para que las specs reflejen lo que hace el código. Motivo del pulido: la portada y las secciones tenían desequilibrios (franja del nav con aire de más, «Estantería» como el título más chico, cabecera móvil corrida), faltaba feedback (el catálogo no avisaba que buscaba; los errores de alta no señalaban el campo), las tablas obligaban a desplazar de costado en el celular y la estantería se desplazaba de costado en vez de mostrar todos los libros.

## What Changes

- **Equilibrio**: franja del nav de 4.5 a 3.75 rem; en móvil la luna más chica y la cabecera con el mismo margen a ambos lados; buscador del catálogo en una fila desde 48rem; el formulario «Libros» pierde el bloque «3. Guardar» (el botón queda al pie); «Estantería» del tamaño de los títulos de sección; etiquetas de formulario a 15 px.
- **Interacción** (JS + tests, 73 → 86): el catálogo muestra «Buscando…», desactiva los botones y marca la tabla con `aria-busy` y `.is-cargando` mientras espera; Libros y Clientes marcan cada campo con error (`aria-invalid`, `.mensaje-campo`, `aria-describedby`), llevan el foco al primero, lo limpian al escribir y un 409 se marca en ISBN o email.
- **Responsive**: por debajo de 48rem las tablas de catálogo, libros, historial, venta confirmada y detalle de venta se ven como tarjetas; los botones dentro de tablas miden 44 px.
- **Estantería** (**BREAKING** respecto de la spec): la repisa ya no se desplaza de costado; los libros pasan a varias filas, cada una con su tabla de madera, hasta el ancho de las secciones; la portada pasa de alto fijo a alto mínimo. Mueble 3D con tapa superior, paredes y fondo de tablas. Lomos con ancho según el título y título en oro estampado (Georgia). Canto de páginas redibujado como la cara superior de un libro real.
- **Gato**: más grande, borde de luz de luna, respira, se inclina hacia el libro que sale, se sienta delante del mueble sobre la tapa superior y mueve la cola (dos recortes de la misma imagen). Toda animación solo con `prefers-reduced-motion: no-preference`.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `estante-libros`: varias filas en lugar de scroll horizontal, portada con alto mínimo, mueble 3D, lomos según el título, título en oro, canto de páginas, gato delante del mueble con cola animada, tamaño de «Estantería».
- `tema-visual`: tipografía de los lomos, movimiento reducido (gato y cola), responsive con tablas como tarjetas, secciones en móvil, cabecera móvil centrada.
- `navegacion-principal`: franja más baja (aire bajo la punta activa).
- `catalogo-libros`: aviso de carga en la búsqueda; tabla como tarjetas en pantallas angostas; buscador en una fila.
- `altas-libros-clientes`: errores por campo; formulario «Libros» en dos bloques con el botón al pie.

## Impact

`frontend/public/index.html` (gato en dos piezas, sin bloque «3. Guardar»), `frontend/public/css/styles.css` (bloques 17 y 18 nuevos y ajustes de estantería, gato, nav y cabecera), `frontend/public/js/catalogo.js`, `frontend/public/js/altas.js`, `frontend/tests/catalogo.test.js`, `frontend/tests/altas.test.js`, `design-system/README.md` (revisión 14 aprobada). Sin cambios en el backend ni en la API.
