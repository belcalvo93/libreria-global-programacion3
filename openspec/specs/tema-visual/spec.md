# tema-visual Specification

## Purpose
Tema visual «librería mágica» de todo el frontend: el clima de una librería encantada de noche, con cielo estrellado, luna, acentos dorados y violeta y tipografía Georgia. Mantiene el contraste AA, el foco visible, el movimiento reducido y el responsive de 320 a 1280 px.

## Requirements

### Requirement: Escena continua sin contenedor
La portada (cabecera, navegación y estantería) SHALL verse como una sola escena: el cielo nocturno con estrellas MUST verse continuo, de borde a borde, detrás del título «Estantería», el gato y el gabinete, sin tarjeta, fondo sólido, borde, sombra ni esquinas redondeadas que lo tapen. Las secciones de abajo MUST conservar su fondo y su legibilidad.

#### Scenario: Cielo continuo
- **WHEN** se abre la página a 1366x768
- **THEN** el cielo estrellado se ve sin cortes detrás de la estantería y la estantería no tiene tarjeta

### Requirement: Título que vuelve al inicio
El título «Gatoteca Lunar» SHALL ser un enlace a `#inicio`, con el mismo aspecto de hoy (sin subrayado ni color de enlace) y foco visible. El principio de la portada MUST tener el id `inicio`.

#### Scenario: Volver al inicio
- **GIVEN** la página desplazada a una sección de abajo
- **WHEN** el usuario activa el título
- **THEN** la página vuelve arriba de todo y ningún marcapáginas queda marcado como activo

### Requirement: Cielo nocturno
El fondo de la página SHALL ser la imagen de un cielo nocturno con estrellas y nebulosa (`img/fondo-noche.webp`), cubriendo toda la página como una sola escena continua y quieta al desplazarse, con un velo azul noche encima que mantenga el contraste AA del texto. Puede pasar ocasionalmente una estrella fugaz. La decoración MUST NOT recibir foco, MUST NOT capturar clics y MUST NOT provocar scroll horizontal.

#### Scenario: Contraste sobre la imagen
- **WHEN** se mide el título y «Estantería» sobre la zona más clara de la imagen con el velo
- **THEN** el texto dorado del título alcanza al menos 4.5:1 y las estrellas y la nebulosa siguen viéndose

#### Scenario: Página cargada
- **WHEN** se abre la página a 1280 px
- **THEN** se ve el cielo con estrellas detrás del contenido y todos los controles siguen respondiendo al clic

#### Scenario: Ancho mínimo
- **WHEN** se abre la página a 320 px
- **THEN** no aparece scroll horizontal por la decoración

### Requirement: Luna como imagen
La luna SHALL ser una imagen (`img/luna.webp`, 380x380 con halo propio) pequeña, de unos 120 px ajustados al alto de la ventana, completa y arriba a la derecha de la cabecera, detrás del contenido y con opacidad suave. MUST NOT pisar las pestañas de navegación ni el título, y en 320 px puede ocultarse. MUST NOT dibujarse con CSS ni SVG, ni recibir foco o clics.

#### Scenario: Luna completa y sin pisar la navegación
- **WHEN** se abre la página a 1366x768, a 1920x1080 y a 390x844
- **THEN** se ve la luna entera arriba a la derecha de la cabecera y su borde inferior queda por encima de las pestañas

#### Scenario: Luna decorativa
- **WHEN** un lector de pantalla recorre la cabecera
- **THEN** no anuncia la luna, que es un `<img>` con `alt` vacío y `aria-hidden="true"`

### Requirement: Tipografía Georgia y del sistema
El título principal, los encabezados `h2` y `h3` y las etiquetas de navegación SHALL usar Georgia (con serif de reserva); `h2`, `h3` y las pestañas en negrita. Párrafos, formularios, tablas y títulos de los lomos MUST usar fuentes del sistema. La página MUST NOT cargar fuentes de ningún origen.

#### Scenario: Sin pedidos de fuentes
- **WHEN** se abre la página con las herramientas de red del navegador abiertas
- **THEN** no hay pedidos de archivos de fuente ni a otros dominios

### Requirement: Título principal dorado
El título «Gatoteca Lunar» SHALL verse en Georgia de peso normal (no negrita), de tamaño `clamp(1.6rem, 3.5vw, 2.25rem)`, en dorado claro con un resplandor tenue (`text-shadow`). MUST NOT llevar contorno ni borde en las letras. Su contraste contra el cielo MUST ser de al menos 4.5:1.

#### Scenario: Título nítido
- **WHEN** se ve la página a 390 px y a 1366 px
- **THEN** el título se lee nítido sobre el cielo, sin contorno y sin verse pesado

#### Scenario: Sin contorno en otros textos
- **WHEN** se inspeccionan el título, los encabezados `h2` y `h3` y las etiquetas del nav
- **THEN** ninguno tiene `-webkit-text-stroke`

### Requirement: Componentes compartidos legibles
Tarjetas, formularios, campos, tablas, botones, resultados, desplegables y mensajes de todas las secciones SHALL adaptarse al tema oscuro. El texto MUST cumplir contraste AA (4.5:1 normal, 3:1 grande) contra su fondo, y los bordes que identifican campos MUST tener al menos 3:1. Errores y éxitos MUST seguir distinguiéndose por un marcador de texto.

#### Scenario: Formulario de altas
- **WHEN** se ve el formulario de libros con un campo vacío y un mensaje de error
- **THEN** la etiqueta, el texto escrito, el borde del campo y el mensaje («⚠» más el texto) se leen con contraste AA sobre el fondo oscuro

#### Scenario: Controles nativos
- **WHEN** el usuario abre un `select` o el selector múltiple de autores
- **THEN** las opciones se ven en esquema oscuro y son legibles

### Requirement: Foco visible dorado
Todo control interactivo de la página SHALL mostrar al recibir foco de teclado un anillo dorado de al menos 2 px, separado del control, con contraste de al menos 3:1 contra el fondo que lo rodea. El foco MUST NOT suprimirse sin reemplazo.

#### Scenario: Botón dorado
- **WHEN** el usuario enfoca con Tab un botón dorado
- **THEN** se ve un anillo de foco separado del botón por una franja del fondo oscuro, con contraste de al menos 3:1 contra ese fondo

### Requirement: Movimiento reducido
Con la preferencia del sistema «reducir movimiento», la página SHALL desactivar todas las animaciones y transiciones decorativas: estrellas, estrella fugaz, respiración y balanceo del gato, halo de la luna, y salida al frente, giro y destello de los libros y aparición de la etiqueta. Los cambios de estado MUST verse igual, sin animación.

#### Scenario: Reducir movimiento activo
- **GIVEN** el sistema con `prefers-reduced-motion: reduce`
- **WHEN** el usuario enfoca un libro
- **THEN** el libro no gira ni se mueve, solo cambian su brillo y su borde, la etiqueta aparece al instante y nada en la página se anima

### Requirement: Responsive sin scroll de página
Todas las secciones SHALL verse de 320 a 1280 px de ancho sin scroll horizontal de la página, y los controles MUST mantener zonas táctiles de al menos 44 px. El scroll horizontal solo puede ocurrir dentro de los contenedores de tablas y dentro de la repisa de libros.

#### Scenario: 320 px
- **WHEN** se recorre la página completa a 320 px
- **THEN** no hay scroll horizontal de la página en ninguna sección

### Requirement: Estrella fugaz visible
La cabecera SHALL mostrar una estrella fugaz pequeña con estela dorada y blanca que cruce el cielo en diagonal cada 8 a 12 segundos, detrás del texto y de la navegación. MUST tener `pointer-events: none`, MUST NOT afectar el layout ni generar scroll horizontal y MUST NOT animarse ni mostrarse con `prefers-reduced-motion: reduce`.

#### Scenario: Movimiento permitido
- **WHEN** la página se abre sin preferencia de movimiento reducido
- **THEN** cada ~10 s una estrella con estela cruza la parte superior sin tapar texto

#### Scenario: Movimiento reducido
- **WHEN** el usuario pide reducir el movimiento
- **THEN** la estrella no aparece

### Requirement: Secciones en cristal nocturno
Catálogo, Libros, Clientes, Ventas e Historial SHALL presentarse como tarjetas de cristal nocturno: fondo azul noche semitransparente con fallback opaco, borde dorado tenue y esquinas de 14 a 16 px. El contraste MUST cumplir WCAG AA.

#### Scenario: Detalles de las secciones
- **WHEN** se ve cualquiera de las cinco secciones
- **THEN** el contenido mide como máximo ~1100 px, los títulos son dorados con línea y ✦, los formularios van en dos columnas en escritorio y una en móvil, los controles miden al menos 44 px con foco dorado, las tablas alinean los números a la derecha con scroll horizontal interno y los mensajes llevan borde lateral de color

#### Scenario: Escritorio
- **WHEN** se ve a 1366x768
- **THEN** la portada mide 100dvh y las secciones se ven como tarjetas de cristal

#### Scenario: Móvil
- **WHEN** se ve a 390x844
- **THEN** los formularios van en una columna, los botones a lo ancho y las tablas hacen scroll dentro de su contenedor

### Requirement: Ventas e Historial con componentes propios
Ventas e Historial SHALL usar componentes propios: cliente por ID en una línea, cada libro de la venta en una fila Libro | Cantidad | Precio | quitar, «+ Agregar otro libro» secundario, «Confirmar venta» como único botón primario, «Ver detalle» en el historial, paginación centrada y el cambio de precio en una fila. Los textos visibles MUST NOT usar la palabra «renglón» y el front MUST NOT calcular subtotales ni totales.

#### Scenario: Escritorio
- **WHEN** se ve a 1366x768
- **THEN** etiqueta, campo y botón del cliente van en una línea, «Confirmar venta» queda a la derecha y «Ver detalle» tiene `aria-label` «Ver detalle de la venta N»

#### Scenario: Quitar libro accesible
- **WHEN** hay una fila de libro
- **THEN** el botón de quitar es solo ícono (cruz ✕ con CSS, zona táctil de 44x44 px), muestra solo una cruz, su nombre accesible es «Quitar libro 1» y su tooltip «Quitar libro»

#### Scenario: Móvil
- **WHEN** se ve a 390x844
- **THEN** no hay scroll horizontal de página y Anterior, Página N y Siguiente caben en una línea

### Requirement: Marca Gatoteca Lunar
El sitio SHALL llamarse «Gatoteca Lunar» en el `<title>`, el `<h1>` y el pie de página.

#### Scenario: Título de la página
- **WHEN** se abre la página
- **THEN** el título de la pestaña, el h1 y el pie dicen «Gatoteca Lunar»

### Requirement: Lema bajo el título
Bajo el título SHALL haber un párrafo estático (`.portada__lema`) con el texto «En este lugar, entre estantes y estrellas, cada libro guarda una noche por descubrir.», más chico que el título y con contraste AA. MUST NOT superponerse con la luna, el gato, la estantería ni la nav, y la portada MUST seguir midiendo 100dvh.

#### Scenario: Móvil
- **WHEN** se ve a 320x568
- **THEN** el lema se lee completo en 2 o 3 líneas y no hay scroll horizontal

### Requirement: Libros de la estantería al hover
Al pasar el mouse o dar foco, un libro SHALL levantarse con una leve inclinación y una sombra más marcada, con transición suave solo bajo `prefers-reduced-motion: no-preference`, sin cambiar su tamaño.

#### Scenario: Hover
- **WHEN** el mouse pasa sobre un libro
- **THEN** el libro sale al frente con inclinación y sombra y sus medidas no cambian

### Requirement: Escena entera en 320x568
La portada (cabecera con lema, nav y estantería) SHALL entrar completa en 320x568 sin que la escena de la estantería desborde su área.

#### Scenario: Teléfono chico
- **WHEN** se ve a 320x568
- **THEN** la escena queda dentro del área de la estantería y la portada mide 100dvh
