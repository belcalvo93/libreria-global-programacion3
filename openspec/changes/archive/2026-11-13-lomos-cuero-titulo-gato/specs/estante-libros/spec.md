## ADDED Requirements

### Requirement: Lomos de cuero gastado
Los lomos SHALL mostrar la textura `img/lomo-cuero.webp` teñida con el color de cada libro, conservando tapa de páginas, líneas doradas y sombra, sin cambiar tamaños ni layout. El título vertical MUST ser texto real con contraste AA.

#### Scenario: Cinco colores
- **WHEN** se ven libros de cuero, borravino, azul, verde y mostaza
- **THEN** cada uno conserva su color y se nota la textura con vetas

## MODIFIED Requirements

### Requirement: Etiqueta con el título completo
Al pasar el cursor o al enfocar un libro con el teclado, el estante SHALL mostrar el título completo como texto suelto (sin fondo, borde ni pastilla), en Georgia negrita dorada con resplandor, a la derecha del gato y bajo «Estantería». MUST verse igual con mouse y con teclado, no superponerse a los libros ni al gabinete, caber en 320 px, no recibir foco ni clics, y ocultarse al quitar el cursor o el foco y para las tecnologías de asistencia. Se inserta como texto.

#### Scenario: Teclado
- **WHEN** el usuario llega con Tab a un libro cuyo título es «Inventario de luces mínimas»
- **THEN** se ve el título completo junto al gato sin tapar ningún libro, y se oculta al pasar al siguiente libro

#### Scenario: Borde de la repisa
- **GIVEN** la repisa desplazada hasta el extremo derecho
- **WHEN** el usuario enfoca el último libro
- **THEN** el título se ve completo junto al gato, sin cortarse

#### Scenario: Teléfono chico
- **WHEN** se enfoca un libro de título largo a 320x568
- **THEN** el título se ve completo en varias líneas, sin salirse de la pantalla ni tocar el gabinete

#### Scenario: Reducir movimiento
- **GIVEN** el sistema con `prefers-reduced-motion: reduce`
- **WHEN** el usuario enfoca un libro
- **THEN** el título aparece al instante, sin animación
