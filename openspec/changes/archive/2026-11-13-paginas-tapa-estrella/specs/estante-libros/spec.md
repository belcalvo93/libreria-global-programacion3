## ADDED Requirements

### Requirement: Canto de páginas con imagen
El canto de páginas de cada libro SHALL dibujarse con `img/paginas-forma.webp`, apoyado sobre el borde superior del lomo, con el ancho del lomo y la proporción de la imagen, sin cambiar el tamaño ni el layout del libro.

#### Scenario: Alineación
- **WHEN** se ve la estantería
- **THEN** el canto de páginas de cada libro empieza en el borde izquierdo de su lomo y tiene su mismo ancho

### Requirement: Tapa de cuero y estrella dorada
Al salir hacia adelante, la tapa del libro SHALL mostrar cuero (`img/tapa-cuero.webp`) teñido con el color del libro y una estrella dorada (`img/estrella-dorada.webp`) centrada, de ~26 % del ancho de la tapa y con un leve resplandor. La estrella MUST ser decorativa, sin texto accesible.

#### Scenario: Foco en un libro
- **WHEN** un libro recibe foco con Tab
- **THEN** su tapa se ve de cuero del color del libro con la estrella dorada centrada
