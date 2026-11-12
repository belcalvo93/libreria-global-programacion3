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
El título «Librería Página Viva» SHALL ser un enlace a `#inicio`, con el mismo aspecto de hoy (sin subrayado ni color de enlace) y foco visible. El principio de la portada MUST tener el id `inicio`.

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
El título «Librería Página Viva» SHALL verse en Georgia de peso normal (no negrita), de tamaño `clamp(1.6rem, 3.5vw, 2.25rem)`, en dorado claro con un resplandor tenue (`text-shadow`). MUST NOT llevar contorno ni borde en las letras. Su contraste contra el cielo MUST ser de al menos 4.5:1.

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
