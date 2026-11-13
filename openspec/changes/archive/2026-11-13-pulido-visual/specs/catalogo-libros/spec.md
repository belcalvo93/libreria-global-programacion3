## ADDED Requirements

### Requirement: Aviso de carga en la búsqueda
Mientras hay una petición del listado en curso, el catálogo SHALL cambiar el texto del botón de búsqueda a «Buscando…», deshabilitar la búsqueda, «Anterior» y «Siguiente», marcar el contenedor de la tabla como ocupado (`aria-busy="true"`) y atenuarlo. Al terminar, con éxito o con error, MUST volver el texto «Buscar en el catálogo», quitar la marca de ocupado y habilitar los botones según la paginación.

#### Scenario: Búsqueda en curso
- **WHEN** el usuario busca «aleph» y la API todavía no respondió
- **THEN** el botón dice «Buscando…» y está deshabilitado, «Anterior» y «Siguiente» también, y el contenedor de la tabla tiene `aria-busy="true"` y se ve atenuado

#### Scenario: Respuesta recibida
- **GIVEN** la primera página con 5 libros recibidos
- **WHEN** termina la petición
- **THEN** el botón vuelve a decir «Buscar en el catálogo» y está habilitado, «Anterior» queda deshabilitado, «Siguiente» habilitado y el contenedor ya no tiene `aria-busy`

#### Scenario: Error de la API
- **WHEN** la petición falla
- **THEN** se ve el mensaje de error y los controles vuelven a su estado normal

### Requirement: Buscador en una fila
Desde 48rem, el formulario de búsqueda del catálogo SHALL mostrarse en una sola fila de todo el ancho: la etiqueta arriba, el campo ancho y el botón a su lado. En pantallas angostas MUST apilarse sin scroll horizontal.

#### Scenario: Escritorio
- **WHEN** se ve el catálogo a 1366x768
- **THEN** el campo de búsqueda y «Buscar en el catálogo» están en la misma fila

## MODIFIED Requirements

### Requirement: Accesibilidad y adaptabilidad
Todos los controles nuevos del catálogo (búsqueda, paginación, detalle, cerrar) SHALL alcanzarse con Tab, mostrar foco visible y tener un nombre accesible. La sección MUST usarse sin desplazamiento horizontal de la página entre 320 y 1920 px; por debajo de 48rem la tabla se muestra como tarjetas (una por libro, cada dato con su etiqueta) y desde 48rem puede desplazarse dentro de su contenedor.

#### Scenario: Navegación con teclado
- **WHEN** el usuario recorre la sección con Tab
- **THEN** llega a búsqueda, «Buscar en el catálogo», cada «Ver detalle», «Anterior», «Siguiente» y «Cerrar detalle», y cada uno muestra el foco

#### Scenario: Pantalla angosta
- **WHEN** la ventana mide 320 px de ancho
- **THEN** la página no se desplaza en horizontal y cada libro se ve como una tarjeta con sus datos etiquetados, sin desplazar la tabla de costado
