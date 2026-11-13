## MODIFIED Requirements

### Requirement: Canto de páginas con imagen
El canto de páginas de cada libro SHALL dibujarse con `img/paginas-forma.webp`, ensamblado al lomo: su esquina izquierda coincide con la esquina superior izquierda del lomo, su borde inferior queda unos píxeles por detrás del lomo sin hueco, sobresale a lo sumo 6 px a la derecha y nada a la izquierda, con un labio de cuero fino sobre el borde del lomo. MUST usar porcentajes o variables (sirve para cualquier ancho de lomo) y no cambiar el tamaño ni el layout del libro.

#### Scenario: Alineación
- **WHEN** se ve la estantería
- **THEN** el canto de páginas de cada libro empieza en el borde izquierdo de su lomo, sin hueco entre ambos, y sobresale como máximo 6 px a la derecha

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

## ADDED Requirements

### Requirement: Título Estantería centrado
El encabezado «Estantería» SHALL estar centrado horizontalmente sobre el gabinete, sin tapar al gato ni la luna, también en 320 px.

#### Scenario: Centrado
- **WHEN** se ve la portada a cualquier ancho
- **THEN** el centro del texto «Estantería» coincide con el centro del gabinete
