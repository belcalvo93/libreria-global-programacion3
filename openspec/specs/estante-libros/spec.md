# estante-libros Specification

## Purpose
Estantería de libros de la portada: un mueble de librería antigua, de madera oscura, con libros de lomo hacia afuera apoyados en una repisa, que salen al pasar el cursor o enfocar con el teclado. Muestra libros reales del catálogo de la API en una sección propia arriba del catálogo. Cada libro abre el detalle del libro, y el estante incluye un gato decorativo (imagen).

## Requirements

### Requirement: Libros desde la API
Al abrir la página, el estante SHALL pedir `GET /api/libros/` con `limit` 12 a través del cliente HTTP compartido. MUST mostrar un libro por cada libro recibido, en el orden de llegada. El estante MUST NOT usar datos locales ni libros escritos en el HTML.

#### Scenario: Carga con el seed
- **GIVEN** la base con los 6 libros del seed
- **WHEN** se abre la página
- **THEN** se pide `GET /api/libros/?limit=12` y el estante muestra 6 libros, ordenados por id

#### Scenario: Más de 12 libros
- **GIVEN** la base con 20 libros
- **WHEN** se abre la página
- **THEN** el estante muestra exactamente 12 libros

### Requirement: Inicio en una sola pantalla
La cabecera, la navegación y la estantería completa (con el gato y la luna) SHALL verse enteras, sin scroll de página, en 1366x768, 1920x1080 y 390x844. Las medidas verticales del gabinete, los libros, el gato y la luna SHALL depender del alto de la ventana. Si hay más libros de los que entran a lo ancho, el scroll MUST ser solo el de la repisa. Las secciones Catálogo, Libros, Clientes, Ventas e Historial MUST seguir debajo y alcanzarse con las pestañas.

#### Scenario: Escritorio
- **WHEN** se abre la página a 1366x768 o a 1920x1080
- **THEN** la cabecera, el nav y la estantería entran enteros y el borde inferior del bloque de inicio no pasa de la altura de la ventana

#### Scenario: Móvil
- **WHEN** se abre la página a 390x844
- **THEN** el inicio entra entero y los libros que no entran a lo ancho se alcanzan desplazando solo la repisa

#### Scenario: Las pestañas siguen funcionando
- **WHEN** el usuario activa la pestaña «Ventas»
- **THEN** la página va a la sección `#ventas`, que sigue debajo del inicio

### Requirement: Repisa con scroll horizontal
La repisa SHALL mostrar al menos 8 libros a la vez en escritorio (1280 px) y MUST permitir ver el resto con scroll horizontal suave cuando no entran todos, sin provocar scroll horizontal de la página. En pantallas angostas MUST mostrar menos libros y desplazarse igual.

#### Scenario: Escritorio
- **GIVEN** 12 libros y un ancho de 1280 px
- **WHEN** se abre la página
- **THEN** se ven al menos 8 libros, el resto se alcanza desplazando la repisa si no entra y la página no tiene scroll horizontal

#### Scenario: Ancho mínimo
- **WHEN** la página se ve a 320 px de ancho
- **THEN** la repisa se desplaza horizontalmente y todos los libros pueden alcanzarse con scroll o con Tab

### Requirement: Gabinete compacto de madera
La estantería SHALL dibujarse como un gabinete de madera oscura ajustado a los libros, sin aire arriba, abajo ni a los costados: marco de nogal con vetas sutiles hechas con gradientes CSS, fondo en sombra cálida con luz dorada tenue, una base con zócalo y sombra, y volumen (bisel, sombra proyectada). MUST NOT usar imágenes para el mueble.

#### Scenario: Mueble sin libros
- **GIVEN** el estante vacío o con error
- **WHEN** se abre la página
- **THEN** el gabinete con su marco, su fondo y su base se ve igual, con el gato encima

### Requirement: Libros de lomo
Cada libro SHALL mostrar su lomo hacia afuera, apoyado en la repisa y junto a los demás, con color tipo cuero, 2 o 3 bandas doradas y relieve sutil. El color SHALL salir de `id % 5` y el alto, del largo del título y del id. El grosor del lomo SHALL ser de 14 a 18 % de su alto y la tapa visible al rotar, de 60 a 65 %, con clases y sin estilos inline. Los títulos largos MUST ocupar lomos más gruesos y más altos y las alturas MUST ser desparejas.

#### Scenario: Variación estable
- **WHEN** el estante muestra los libros con id 1 a 6
- **THEN** los libros 1 y 6 comparten color, los libros 1 a 5 tienen los cinco colores distintos, y recargar la página da el mismo aspecto a cada libro

#### Scenario: Proporciones de libro real
- **WHEN** se mide cualquier libro de la estantería
- **THEN** el grosor de su lomo es de 14 a 18 % de su alto y el ancho de su tapa, de 60 a 65 %

#### Scenario: Libro levantado en el borde
- **WHEN** el usuario enfoca el primero, el último o el libro más alto
- **THEN** su tapa rotada no queda cortada por el borde de la repisa ni se sale del gabinete

#### Scenario: Títulos largos, lomos mayores
- **WHEN** el estante muestra «Rayuela» y «Antología de la literatura fantástica»
- **THEN** el lomo del segundo es más grueso y más alto que el del primero

#### Scenario: Libro inclinado
- **WHEN** el estante muestra los libros con id 1 a 12
- **THEN** algunos libros, siempre los mismos según su id, aparecen inclinados apoyados contra el vecino y el resto, derechos

#### Scenario: Id inválido
- **WHEN** un libro llega con un id ausente, negativo o no entero
- **THEN** su lomo usa la primera variante de color y de tamaño, sin inclinación, y el estante no falla

### Requirement: Título en el lomo
El título SHALL escribirse en vertical, de abajo hacia arriba, directamente sobre el cuero, sin óvalo, caja ni fondo, en blanco (#ffffff), con fuente del sistema, peso 600 a 700 y una sombra oscura muy sutil. MUST verse completo, sin puntos suspensivos ni recorte alguno (ni en CSS ni en JS), hasta 80 caracteres, partiéndose en columnas. Se inserta siempre como texto, nunca como HTML.

#### Scenario: Título con marcado HTML
- **WHEN** un título llega como `<b>Rayuela</b>`
- **THEN** el lomo muestra literalmente `<b>Rayuela</b>`, sin interpretarlo como HTML

#### Scenario: Título vacío
- **WHEN** un libro llega sin título
- **THEN** el lomo muestra «Sin título»

#### Scenario: Título de 80 caracteres
- **WHEN** un título de 80 caracteres llega de la API
- **THEN** el lomo muestra los 80 caracteres completos, sin «…» y sin quedar cortado por los bordes del lomo

#### Scenario: Títulos reales
- **WHEN** el estante muestra «Rayuela», «Respiración artificial», «La invención de Morel» y «Antología de la literatura fantástica»
- **THEN** los cuatro se ven completos, en blanco y sobre el cuero, sin óvalo

### Requirement: Tamaño de letra del título según su largo
La letra del título SHALL elegirse según su largo (corto, medio, largo, muy largo) y MUST NOT bajar de 0.85 rem, salvo en títulos de más de 60 caracteres, donde el mínimo es 0.75 rem.

#### Scenario: Tamaño por largo
- **WHEN** el estante muestra «Rayuela», «Respiración artificial» y un título de 80 caracteres
- **THEN** la letra de «Rayuela» es la mayor, la de «Respiración artificial» es menor, y la del de 80 caracteres es de 0.75 rem

### Requirement: Libro como botón accesible
Cada libro SHALL ser un botón operable con mouse, teclado (Tab, Enter, Espacio) y toque. Su nombre accesible MUST empezar por el título del libro.

#### Scenario: Nombre accesible
- **WHEN** un libro se llama «Ficciones»
- **THEN** su botón tiene el nombre accesible «Ficciones, ver detalle»

### Requirement: Libro que sale al frente
Con movimiento permitido, al pasar el cursor o al enfocar un libro con el teclado, el libro SHALL salir hacia adelante, subir unos 14 px, inclinarse mostrando su tapa en 3D y soltar un destello dorado. Al quitar el cursor o el foco MUST volver a su lugar. Con la preferencia «reducir movimiento», MUST NOT girar ni moverse: solo cambian el brillo y el borde. En ambos casos el foco de teclado MUST mostrar un anillo dorado visible, y el libro MUST NOT quedar recortado, tampoco el último de la fila.

#### Scenario: Foco con teclado
- **WHEN** el usuario llega a un libro con Tab
- **THEN** el libro sale al frente con el destello y tiene un anillo de foco dorado visible

#### Scenario: Reducir movimiento
- **GIVEN** el sistema con `prefers-reduced-motion: reduce`
- **WHEN** el usuario enfoca o pasa el cursor sobre un libro
- **THEN** el libro no gira ni se mueve y solo cambian su brillo y su borde

#### Scenario: Último libro de la fila
- **WHEN** el usuario enfoca el último libro de la repisa
- **THEN** su tapa no queda cortada por el borde de la repisa

### Requirement: Etiqueta con el título completo
Al pasar el cursor o al enfocar un libro con el teclado, el estante SHALL mostrar el título completo como texto suelto, sin fondo, en Georgia negrita dorada con resplandor, a la derecha del gato y a la altura del borde superior del gabinete, creciendo hacia arriba. MUST NOT superponerse a los libros, al gabinete ni a «Estantería», MUST caber en 320 px, no recibir foco ni clics y ocultarse al salir y para las tecnologías de asistencia. Se inserta como texto.

#### Scenario: Teclado
- **WHEN** el usuario llega con Tab a un libro cuyo título es «Inventario de luces mínimas»
- **THEN** se ve el título completo junto al gato, sobre el gabinete y sin tapar ningún libro, y se oculta al pasar al siguiente libro

#### Scenario: Borde de la repisa
- **GIVEN** la repisa desplazada hasta el extremo derecho
- **WHEN** el usuario enfoca el último libro
- **THEN** el título se ve completo junto al gato, sin cortarse

#### Scenario: Teléfono chico
- **WHEN** se enfoca un libro de título largo a 320x568
- **THEN** el título se ve completo en varias líneas, sin salirse de la pantalla ni tocar el gabinete ni el título «Estantería»

#### Scenario: Reducir movimiento
- **GIVEN** el sistema con `prefers-reduced-motion: reduce`
- **WHEN** el usuario enfoca un libro
- **THEN** el título aparece al instante, sin animación

### Requirement: Portada real opcional
Si existe una imagen de portada para el ISBN del libro, el estante SHOULD mostrarla en la tapa del libro cuando este sale hacia adelante, y MUST NOT mostrarla ni pedirla con el libro en reposo. `estante.js` MUST mantener una lista explícita de los ISBN con imagen (hoy vacía) y MUST NOT pedir imágenes que no estén en esa lista, para no generar errores 404.

#### Scenario: Sin imágenes
- **GIVEN** la lista de portadas vacía
- **WHEN** se abre la página y se enfocan libros
- **THEN** la red no muestra pedidos a `img/portadas/`

#### Scenario: ISBN con imagen
- **GIVEN** la lista incluye el ISBN `9789500100011` con su archivo
- **WHEN** el libro sale al frente por primera vez
- **THEN** su tapa incluye un `<img loading="lazy">` con `width`, `height` y `alt` vacío apuntando a `img/portadas/` con ese archivo, y no existía antes

### Requirement: Abrir el detalle desde un libro
Al activar un libro, el estante SHALL abrir el detalle de ese libro en el catálogo (`GET /api/libros/{id}`), pasando el botón como origen, y MUST llevar el foco al detalle. Si el catálogo no ofrece la apertura del detalle, el estante MUST mostrar un mensaje de error con texto y no fallar.

#### Scenario: Clic en un libro
- **GIVEN** el catálogo cargado
- **WHEN** el usuario activa el libro con id 3
- **THEN** se pide `GET /api/libros/3`, se muestra el detalle de ese libro y el foco queda en el encabezado del detalle

#### Scenario: Detalle no disponible
- **GIVEN** la apertura del detalle del catálogo no está disponible
- **WHEN** el usuario activa un libro
- **THEN** el estante muestra «No se pudo abrir el detalle del libro.» como mensaje de error

### Requirement: Estados del estante
El estante SHALL mostrar un mensaje de carga mientras espera la respuesta, un mensaje de estante vacío si la API devuelve una lista vacía y un mensaje de error con el texto del error si falla la conexión o la API. Cada estado MUST comunicarse con texto, no solo con color, y solo uno MUST verse a la vez.

#### Scenario: Cargando
- **WHEN** la petición de libros está en curso
- **THEN** se ve «Cargando estantería...» y no se ve ningún libro

#### Scenario: Vacío
- **WHEN** la API responde con una lista vacía
- **THEN** se ve «Todavía no hay libros en la estantería.» y no se ve ningún libro

#### Scenario: Error de conexión
- **GIVEN** el backend detenido
- **WHEN** se abre la página
- **THEN** se ve un mensaje de error con el texto del cliente HTTP (por ejemplo, «No se pudo conectar con el servidor. Revisá tu conexión.»), marcado como error también sin depender del color

### Requirement: Gato decorativo como imagen
La estantería SHALL mostrar un gato negro (`img/gato.webp`, 364x960) de alto `clamp(110px, 22vh, 200px)`, sentado arriba a la izquierda del gabinete, sin espejar y mirando hacia la luna. MUST quedar por detrás del gabinete, con las patas visibles sobre su borde superior y la cola tapada por el marco. Es decorativo (`alt` vacío y `aria-hidden="true"`) y MUST NOT tapar libros, etiqueta ni el encabezado «Estantería».

#### Scenario: Cola detrás del marco
- **WHEN** se mira el gato en cualquier tamaño de ventana
- **THEN** la cola está tapada por el marco donde se superpone con el gabinete y solo asoma por fuera a la izquierda

#### Scenario: Gato sobre el borde
- **WHEN** se abre la página a 1366x768
- **THEN** el gato se ve sentado arriba a la izquierda del gabinete, con las patas en su borde superior, sin solaparse con el encabezado «Estantería» ni con la navegación

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla recorre la sección de la estantería
- **THEN** no anuncia el gato ni la etiqueta de título

#### Scenario: Ancho mínimo
- **WHEN** la página se ve a 390 px de ancho
- **THEN** el gato se ve completo y ningún libro ni etiqueta queda debajo de él

### Requirement: Lomos de cuero gastado
Los lomos SHALL mostrar la textura `img/lomo-cuero.webp` teñida con el color de cada libro, conservando tapa de páginas, líneas doradas y sombra, sin cambiar tamaños ni layout. El título vertical MUST ser texto real con contraste AA.

#### Scenario: Cinco colores
- **WHEN** se ven libros de cuero, borravino, azul, verde y mostaza
- **THEN** cada uno conserva su color y se nota la textura con vetas

### Requirement: Tapa de cuero y estrella dorada
Al salir hacia adelante, la tapa del libro SHALL mostrar cuero (`img/tapa-cuero.webp`) teñido con el color del libro y una estrella dorada (`img/estrella-dorada.webp`) centrada, de ~26 % del ancho de la tapa y con un leve resplandor. La estrella MUST ser decorativa, sin texto accesible.

#### Scenario: Foco en un libro
- **WHEN** un libro recibe foco con Tab
- **THEN** su tapa se ve de cuero del color del libro con la estrella dorada centrada

### Requirement: Título Estantería centrado
El encabezado «Estantería» SHALL estar centrado horizontalmente sobre el gabinete, sin tapar al gato ni la luna, también en 320 px.

#### Scenario: Centrado
- **WHEN** se ve la portada a cualquier ancho
- **THEN** el centro del texto «Estantería» coincide con el centro del gabinete

### Requirement: Canto de páginas crema
El canto de páginas de cada libro SHALL ser un bloque crema con líneas finas casi verticales, inclinadas como «/», dibujado como la cara superior 3D del libro entre el lomo y la tapa, con el ancho del lomo y la profundidad del libro. MUST NOT usar imágenes.

#### Scenario: Reposo
- **WHEN** se ve la estantería
- **THEN** cada libro muestra su canto crema con líneas sobre el lomo, sin hueco ni sobresalidas

#### Scenario: Libro levantado
- **WHEN** un libro recibe foco con Tab
- **THEN** el canto crema une el lomo con la tapa de cuero
