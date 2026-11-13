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
Con los libros en una fila, la cabecera, el nav y la estantería completa (gato y luna incluidos) SHALL verse enteros, sin scroll de página, en 1366x768 y 1920x1080. La portada MUST tener alto mínimo, no fijo: con más filas crece hacia abajo, sin scroll horizontal. Las medidas verticales del mueble, los libros, el gato y la luna SHALL depender del alto de la ventana. Las secciones de abajo MUST seguir alcanzándose con las pestañas.

#### Scenario: Escritorio
- **WHEN** se abre la página a 1366x768 o a 1920x1080 con los 6 libros del seed
- **THEN** la cabecera, el nav y la estantería entran enteros y el borde inferior del gabinete no pasa de la altura de la ventana

#### Scenario: Móvil
- **WHEN** se abre la página a 390x844
- **THEN** los libros que no entran a lo ancho pasan a otra fila, la portada crece lo necesario y la página no tiene scroll horizontal

#### Scenario: Las pestañas siguen funcionando
- **WHEN** el usuario activa la pestaña «Ventas»
- **THEN** la página va a la sección `#ventas`, que sigue debajo del inicio

### Requirement: Gabinete compacto de madera
La estantería SHALL dibujarse como un mueble de nogal en 3D ajustado a los libros, con vetas en gradientes CSS: tapa superior que vuela sobre los costados (cara de arriba en perspectiva y canto con filo dorado), paredes laterales en sombra, fondo de tablas verticales, la cara superior de cada estante bajo los libros y una base con zócalo y sombra. MUST NOT usar imágenes para el mueble.

#### Scenario: Mueble sin libros
- **GIVEN** el estante vacío o con error
- **WHEN** se abre la página
- **THEN** el gabinete con su tapa superior, su marco, su fondo y su base se ve igual, con el gato sentado encima

#### Scenario: Volumen del mueble
- **WHEN** se ve la portada a 1366x768
- **THEN** se distinguen la tapa superior en perspectiva, las paredes laterales en sombra, el fondo de tablas y la cara superior de cada estante

### Requirement: Libros de lomo
Cada libro SHALL mostrar su lomo hacia afuera, apoyado en la repisa, con color tipo cuero, 2 o 3 bandas doradas y relieve. El color SHALL salir de `id % 5` y el alto, del largo del título y del id. El ancho del lomo SHALL ser el de su título más un margen de cuero, con un mínimo proporcional al alto; la tapa al rotar mide 60 a 65 % del alto. Sin estilos inline. Los títulos largos MUST dar lomos más gruesos y altos, de alturas desparejas.

#### Scenario: Variación estable
- **WHEN** el estante muestra los libros con id 1 a 6
- **THEN** los libros 1 y 6 comparten color, los libros 1 a 5 tienen los cinco colores distintos, y recargar la página da el mismo aspecto a cada libro

#### Scenario: Proporciones de libro real
- **WHEN** el estante muestra un título de una columna y «Antología de la literatura fantástica», que ocupa dos
- **THEN** el lomo del primero mide unos 35 px y el del segundo unos 53 px, y el ancho de la tapa de cada uno es de 60 a 65 % de su alto

#### Scenario: Libro levantado en el borde
- **WHEN** el usuario enfoca el primero, el último o el libro más alto de una fila
- **THEN** su tapa rotada, pegada al borde derecho del lomo, no queda cortada por el borde de la repisa ni se sale del gabinete

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
El título SHALL escribirse en vertical, de abajo hacia arriba, estampado en oro (#ecd389) sobre el cuero, en Georgia de peso normal, con relieve de hierro en caliente y sin óvalo, etiqueta, filetes ni fondo. MUST tener contraste de al menos 4.5:1 también en el lomo mostaza y verse completo, sin «…» ni recortes (ni en CSS ni en JS), hasta 80 caracteres, partiéndose en columnas. Se inserta siempre como texto, nunca como HTML.

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
- **THEN** los cuatro se ven completos, en oro sobre el cuero, en Georgia y sin óvalo ni fondo

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
Al pasar el cursor o al enfocar un libro con el teclado, el estante SHALL mostrar el título completo como texto suelto, sin fondo, en Georgia negrita dorada con resplandor, a la derecha del gato y a la altura del borde superior del gabinete (por encima de su tapa superior), creciendo hacia arriba. MUST NOT superponerse a los libros, al gabinete ni a «Estantería», MUST caber en 320 px, no recibir foco ni clics y ocultarse al salir y para las tecnologías de asistencia. Se inserta como texto.

#### Scenario: Teclado
- **WHEN** el usuario llega con Tab a un libro cuyo título es «Inventario de luces mínimas»
- **THEN** se ve el título completo junto al gato, sobre el gabinete y sin tapar ningún libro, y se oculta al pasar al siguiente libro

#### Scenario: Borde de la repisa
- **GIVEN** la repisa con libros en dos filas
- **WHEN** el usuario enfoca el último libro de la segunda fila, junto al borde derecho
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
El encabezado «Estantería» SHALL estar centrado horizontalmente sobre el gabinete, sin tapar al gato ni la luna, también en 320 px, y MUST tener el mismo tamaño que los títulos de las secciones de abajo (`clamp(1.4rem, 3vw, 1.75rem)`).

#### Scenario: Centrado
- **WHEN** se ve la portada a cualquier ancho
- **THEN** el centro del texto «Estantería» coincide con el centro del gabinete

#### Scenario: Mismo tamaño que las secciones
- **WHEN** se comparan «Estantería» y «Catálogo» a 1366 px
- **THEN** ambos títulos tienen el mismo tamaño de letra

### Requirement: Canto de páginas crema
La cara superior de cada libro SHALL dibujarse como la de un libro real visto desde arriba: a cada costado el canto de la tapa, del color del lomo oscurecido (marrón oscuro si el navegador no soporta la mezcla de colores), en el medio las hojas como líneas crema finas paralelas a las tapas y una sombra que las oscurece hacia el fondo. En reposo MUST asomar solo una franja fina sobre el lomo. MUST NOT usar imágenes.

#### Scenario: Reposo
- **WHEN** se ve la estantería
- **THEN** cada libro muestra sobre el lomo una franja fina con los cantos de las tapas y las hojas crema, sin hueco ni sobresalidas

#### Scenario: Libro levantado
- **WHEN** un libro recibe foco con Tab
- **THEN** se ve la tapa de cuero y, arriba, una franja fina de hojas que une el lomo con la tapa

### Requirement: Repisa en varias filas
La repisa SHALL medir lo justo para sus libros, hasta un máximo igual al ancho de las secciones de abajo, y los libros que no entran MUST pasar a otra fila, sin scroll horizontal de la repisa ni de la página. Todas las filas MUST medir lo mismo y cada una MUST tener su propia tabla de madera con canto dorado sobre la que se apoyan los libros. Se mantiene el límite de 12 libros.

#### Scenario: Escritorio con el seed
- **GIVEN** los 6 libros del seed
- **WHEN** se abre la página a 1366x768
- **THEN** los 6 libros se ven en una sola fila sobre su tabla y la repisa no se desplaza de costado

#### Scenario: Muchos libros
- **GIVEN** 24 libros en la repisa
- **WHEN** se ve la página a 1366 px y a 390 px
- **THEN** los libros se reparten en varias filas, cada una con su tabla, todos visibles sin desplazar la repisa y sin scroll horizontal de la página

#### Scenario: Teclado entre filas
- **WHEN** el usuario recorre los libros con Tab
- **THEN** el foco pasa del último libro de una fila al primero de la siguiente y ningún libro queda fuera de la vista de costado

### Requirement: Cola del gato animada
Con movimiento permitido, la cola del gato SHALL ondular: la base se balancea sobre su raíz y la punta la sigue con retraso. Con el cursor cerca la punta MUST dar golpecitos, y muy cerca toda la cola MUST agitarse; al alejarse vuelve a la calma sin saltos. El gato MUST ser una sola imagen (`img/gato.webp`) en tres recortes sin unión visible, y con `prefers-reduced-motion: reduce` la cola MUST quedar quieta.

#### Scenario: Movimiento permitido
- **WHEN** se abre la página sin preferencia de movimiento reducido
- **THEN** la cola se balancea y la punta la sigue con retraso, sin hueco visible entre la cola y el cuerpo

#### Scenario: Cursor cerca
- **WHEN** el cursor pasa cerca de la cola y después se aleja
- **THEN** la punta da golpecitos (y toda la cola se agita si el cursor está muy cerca) y luego vuelve a la calma al terminar el ciclo

#### Scenario: Reducir movimiento
- **GIVEN** el sistema con `prefers-reduced-motion: reduce`
- **WHEN** se abre la página
- **THEN** el gato y su cola están quietos

### Requirement: Gato atento a los libros
Con movimiento permitido, el gato SHALL respirar de forma casi imperceptible y MUST inclinarse levemente hacia la estantería mientras un libro sale al frente con el mouse o con el teclado, volviendo a su postura al soltarlo. El gato MUST mostrar un borde fino de luz dorada del lado de la luna que despegue su silueta del cielo.

#### Scenario: Libro enfocado
- **WHEN** el usuario enfoca un libro con Tab
- **THEN** el gato se inclina unos 5° hacia la estantería y vuelve al quitar el foco

#### Scenario: Reducir movimiento
- **GIVEN** el sistema con `prefers-reduced-motion: reduce`
- **WHEN** el usuario enfoca un libro
- **THEN** el gato no se inclina ni respira

### Requirement: Gato sentado delante del mueble
La estantería SHALL mostrar un gato negro hecho con la imagen `img/gato.webp` (364x960), de alto `clamp(120px, 26dvh, 240px)`, sentado arriba a la izquierda del gabinete, sin espejar y mirando hacia la luna. MUST quedar delante del mueble, sentado sobre la tapa superior, con la cola colgando por el frente. Es decorativo (contenedor con `aria-hidden="true"` e imagen con `alt` vacío) y MUST NOT tapar libros, etiqueta ni el encabezado «Estantería».

#### Scenario: Gato sobre la tapa
- **WHEN** se abre la página a 1366x768
- **THEN** el gato se ve sentado sobre la tapa superior, arriba a la izquierda del gabinete, con la cola por delante del frente, sin solaparse con el encabezado «Estantería» ni con la navegación

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla recorre la sección de la estantería
- **THEN** no anuncia el gato ni la etiqueta de título

#### Scenario: Ancho mínimo
- **WHEN** la página se ve a 320 y a 390 px de ancho
- **THEN** el gato se ve completo y ningún libro ni etiqueta queda debajo de él
