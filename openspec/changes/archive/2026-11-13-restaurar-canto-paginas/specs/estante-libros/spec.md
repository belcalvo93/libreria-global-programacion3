## REMOVED Requirements

### Requirement: Canto de páginas con imagen
**Reason**: La imagen `paginas-forma.webp` no ensambla bien con el lomo y pierde la forma del libro.
**Migration**: Vuelve el bloque crema con líneas a 95° (requirement «Canto de páginas crema»); la imagen se borra.

## ADDED Requirements

### Requirement: Canto de páginas crema
El canto de páginas de cada libro SHALL ser un bloque crema con líneas finas casi verticales, inclinadas como «/», dibujado como la cara superior 3D del libro entre el lomo y la tapa, con el ancho del lomo y la profundidad del libro. MUST NOT usar imágenes.

#### Scenario: Reposo
- **WHEN** se ve la estantería
- **THEN** cada libro muestra su canto crema con líneas sobre el lomo, sin hueco ni sobresalidas

#### Scenario: Libro levantado
- **WHEN** un libro recibe foco con Tab
- **THEN** el canto crema une el lomo con la tapa de cuero
