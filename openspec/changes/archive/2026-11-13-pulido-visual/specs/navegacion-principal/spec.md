## MODIFIED Requirements

### Requirement: Marcapáginas colgantes
Los enlaces SHALL verse como marcapáginas que cuelgan de una fina línea dorada en el borde superior de la franja: Georgia negrita, fondo borravino oscuro, texto dorado y borde inferior en V. MUST tener un alto total de al menos 44 px y vivir dentro de su propia franja, en el flujo normal, sin superponerse a la escena. La franja MUST medir lo justo para el marcapáginas activo (3.75 rem en escritorio), sin una banda vacía debajo. En 390 px los cinco MUST caber en una fila sin cortarse.

#### Scenario: Móvil
- **WHEN** la página se ve a 390 px de ancho
- **THEN** los cinco marcapáginas se leen completos en una sola fila, cada uno de al menos 44 px de alto

#### Scenario: Sin solapes
- **WHEN** se mide la punta más baja de cualquier marcapáginas, incluida la de la activa
- **THEN** queda unos 8 px (0.5 rem) por encima del borde inferior de la franja y no toca lo que sigue (título «Estantería», gato y gabinete)
