# navegacion-principal Specification

## Purpose
Navegación principal de la página: enlaces ancla a cada sección (Catálogo, Libros, Clientes, Ventas e Historial), presentados como marcapáginas colgantes de una varilla dorada, en una franja fija arriba, accesibles con teclado y que indican la sección activa.

## Requirements

### Requirement: Enlaces ancla a las secciones
La navegación SHALL ser una región de navegación con nombre accesible «Navegación principal». MUST contener, en este orden, enlaces a `#catalogo`, `#libros`, `#clientes`, `#ventas` y `#historial`, con los textos Catálogo, Libros, Clientes, Ventas e Historial. Cada enlace MUST llevar a su sección.

#### Scenario: Ir a una sección
- **WHEN** el usuario activa la etiqueta «Ventas»
- **THEN** la página va a la sección `#ventas` y la URL termina en `#ventas`

#### Scenario: Sin roles de pestaña
- **WHEN** un lector de pantalla recorre la navegación
- **THEN** anuncia 5 enlaces dentro de la navegación «Navegación principal», no pestañas ni un menú

### Requirement: Marcapáginas colgantes
Los enlaces SHALL verse como marcapáginas que cuelgan de una fina línea dorada en el borde superior de la franja: Georgia negrita, fondo borravino oscuro, texto dorado y borde inferior en V. MUST tener un alto total de al menos 44 px y vivir dentro de su propia franja, en el flujo normal, sin superponerse a la escena. En 390 px los cinco MUST caber en una fila sin cortarse.

#### Scenario: Móvil
- **WHEN** la página se ve a 390 px de ancho
- **THEN** los cinco marcapáginas se leen completos en una sola fila, cada uno de al menos 44 px de alto

#### Scenario: Sin solapes
- **WHEN** se mide la punta más baja de cualquier marcapáginas, incluida la de la activa
- **THEN** queda al menos 16 px por encima del borde inferior de la franja y de lo que sigue (título «Estantería», gato y gabinete)

### Requirement: Hover y foco del marcapáginas
Al pasar el cursor o enfocar un marcapáginas, MUST mostrar un borde dorado visible y, con movimiento permitido, bajar unos 4 px. El foco de teclado MUST mostrar además un contorno dorado separado, compatible con el recorte en V.

#### Scenario: Foco con teclado
- **WHEN** el usuario recorre los marcapáginas con Tab
- **THEN** cada uno enfocado muestra su borde dorado y un contorno dorado visible, y baja 4 px con movimiento permitido

### Requirement: Franja de navegación fija
La franja SHALL quedar fija arriba (`position: sticky; top: 0`) por encima del contenido, con fondo azul noche de ~85 % de opacidad y borde inferior dorado fino, de modo que siga a mano al bajar a las secciones. Los títulos de las secciones MUST NOT quedar tapados por la franja al navegar por anclas.

#### Scenario: Bajar a una sección
- **WHEN** el usuario activa «Ventas»
- **THEN** la franja sigue arriba y el título de la sección queda debajo de ella, sin taparse

### Requirement: Sección activa marcada
Solo un enlace a la vez SHALL tener `aria-current="location"`: el de la sección que el usuario eligió, o el de la que está principalmente visible al hacer scroll. Ese enlace MUST distinguirse a la vista también sin depender del color. Si no hay ninguna sección de la navegación a la vista, ningún enlace MUST tenerlo.

#### Scenario: Elegir una sección
- **WHEN** el usuario activa «Clientes»
- **THEN** solo el enlace «Clientes» tiene `aria-current="location"`, con fondo dorado y texto oscuro, y cuelga más abajo que los demás

#### Scenario: Scroll
- **GIVEN** la sección `#historial` ocupa la mayor parte de la pantalla
- **WHEN** el usuario termina de hacer scroll
- **THEN** solo el enlace «Historial» tiene `aria-current="location"`

#### Scenario: Arriba de todo
- **WHEN** la página está en el estante y ninguna sección de la navegación está a la vista
- **THEN** ningún enlace tiene `aria-current`
