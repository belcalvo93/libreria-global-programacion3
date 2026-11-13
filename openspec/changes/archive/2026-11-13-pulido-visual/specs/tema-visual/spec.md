## ADDED Requirements

### Requirement: Tablas como tarjetas en pantallas angostas
Por debajo de 48rem, las tablas de catálogo, libros, historial, venta confirmada y detalle de venta SHALL mostrarse como tarjetas: cada fila es una tarjeta con un renglón por dato, precedido por su etiqueta (el mismo texto del encabezado de la columna), alineado a la izquierda, y el botón de la última columna a todo el ancho. El encabezado de la tabla MUST seguir disponible para tecnologías de asistencia. Desde 48rem las tablas MUST verse como tablas.

#### Scenario: Catálogo en el celular
- **WHEN** se ve el catálogo a 390x844
- **THEN** cada libro es una tarjeta con «Título», «ISBN», «Precio», «Editorial» y «Género» como etiquetas, el botón «Ver detalle» ocupa todo el ancho y la tabla no se desplaza de costado

#### Scenario: Escritorio
- **WHEN** se ve el historial a 1366x768
- **THEN** se ve como tabla, con encabezado y columnas

### Requirement: Cabecera móvil centrada
Hasta 48rem la luna SHALL ser más chica (`clamp(3rem, 11vw, 4rem)`) y la cabecera MUST reservar su ancho a ambos lados, de modo que el título y el lema queden centrados en la pantalla sin rozar la luna. Por debajo de 24rem, donde la luna se oculta, el texto MUST usar todo el ancho, centrado.

#### Scenario: Teléfono
- **WHEN** se ve la portada a 390x844
- **THEN** el título y el lema están centrados en la pantalla y no tocan la luna

## MODIFIED Requirements

### Requirement: Tipografía Georgia y del sistema
El título principal, los encabezados `h2` y `h3`, las etiquetas de navegación y los títulos de los lomos SHALL usar Georgia (con serif de reserva); `h2`, `h3` y las pestañas en negrita y los lomos en peso normal. Párrafos, formularios y tablas MUST usar fuentes del sistema; las etiquetas de los formularios miden 15 px. La página MUST NOT cargar fuentes de ningún origen.

#### Scenario: Sin pedidos de fuentes
- **WHEN** se abre la página con las herramientas de red del navegador abiertas
- **THEN** no hay pedidos de archivos de fuente ni a otros dominios

#### Scenario: Lomos en Georgia
- **WHEN** se inspecciona el título de cualquier lomo
- **THEN** usa Georgia de peso normal

### Requirement: Movimiento reducido
Con la preferencia del sistema «reducir movimiento», la página SHALL desactivar todas las animaciones y transiciones decorativas: estrellas, estrella fugaz, respiración, inclinación y cola del gato, halo de la luna, transición del atenuado de la tabla al cargar, y salida al frente, giro y destello de los libros y aparición de la etiqueta. Los cambios de estado MUST verse igual, sin animación.

#### Scenario: Reducir movimiento activo
- **GIVEN** el sistema con `prefers-reduced-motion: reduce`
- **WHEN** el usuario enfoca un libro
- **THEN** el libro no gira ni se mueve, solo cambian su brillo y su borde, la etiqueta aparece al instante, el gato y su cola quedan quietos y nada en la página se anima

### Requirement: Responsive sin scroll de página
Todas las secciones SHALL verse de 320 a 1920 px de ancho sin scroll horizontal de la página ni elementos fuera de pantalla, y los controles MUST mantener zonas táctiles de al menos 44 px, incluidos los botones dentro de tablas. La repisa de libros MUST NOT desplazarse de costado; desde 48rem el scroll horizontal solo puede ocurrir dentro de los contenedores de tablas.

#### Scenario: 320 px
- **WHEN** se recorre la página completa a 320 px
- **THEN** no hay scroll horizontal de la página en ninguna sección

#### Scenario: Botones en tablas
- **WHEN** se mide el botón «Ver detalle» de una fila del catálogo o del historial
- **THEN** mide al menos 44 px de alto

### Requirement: Secciones en cristal nocturno
Catálogo, Libros, Clientes, Ventas e Historial SHALL presentarse como tarjetas de cristal nocturno: fondo azul noche semitransparente con fallback opaco, borde dorado tenue y esquinas de 14 a 16 px. El contraste MUST cumplir WCAG AA.

#### Scenario: Detalles de las secciones
- **WHEN** se ve cualquiera de las cinco secciones en escritorio
- **THEN** el contenido mide como máximo ~1100 px, los títulos son dorados con línea y ✦, los formularios van en dos columnas en escritorio y una en móvil, los controles miden al menos 44 px con foco dorado, las tablas alinean los números a la derecha con scroll horizontal interno y los mensajes llevan borde lateral de color

#### Scenario: Escritorio
- **WHEN** se ve a 1366x768
- **THEN** la portada mide al menos 100dvh y las secciones se ven como tarjetas de cristal

#### Scenario: Móvil
- **WHEN** se ve a 390x844
- **THEN** los formularios van en una columna, los botones a lo ancho y las tablas se ven como tarjetas, sin scroll horizontal
