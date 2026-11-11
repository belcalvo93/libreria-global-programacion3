# Spec Delta

## Purpose

Catálogo de libros del frontend de la librería, servido desde la API del TP: listado paginado, búsqueda por título, detalle con autorías y estados visibles. También define los puntos de integración que usan las demás secciones.

## ADDED Requirements

### Requirement: Listado desde la API
Al abrir la página, el catálogo SHALL pedir a la API la primera página de libros (`GET /api/libros/` con `limit` 5 y `offset` 0) y MUST mostrar los libros recibidos en el orden en que llegan. El catálogo MUST NOT usar datos locales ni filas escritas en el HTML.

#### Scenario: Carga inicial con el seed
- **GIVEN** la base con los 6 libros del seed
- **WHEN** se abre la página
- **THEN** se pide `GET /api/libros/?limit=5&offset=0` y la tabla muestra los 5 primeros libros, ordenados por id

#### Scenario: Sin filas fijas
- **WHEN** la API responde con una lista de 2 libros
- **THEN** la tabla muestra exactamente esas 2 filas, y ninguna fila del HTML del parcial

### Requirement: Columnas de la tabla
Cada fila SHALL mostrar título, ISBN, precio, editorial y género del libro, y un control para abrir su detalle. El precio MUST mostrarse con dos decimales a partir del valor de la API, sin recalcularlo. El texto MUST insertarse como texto, nunca como HTML.

#### Scenario: Fila completa
- **WHEN** la API devuelve `{ "titulo": "Ficciones", "isbn": "978-950-04-0001-2", "precio": "18000.00", "editorial": { "nombre": "Emecé" }, "genero": { "nombre": "Cuento" } }`
- **THEN** la fila muestra «Ficciones», «978-950-04-0001-2», «18000.00», «Emecé» y «Cuento»

#### Scenario: Datos con marcado HTML
- **WHEN** un título llega como `<b>Rayuela</b>`
- **THEN** la celda muestra literalmente `<b>Rayuela</b>`, sin interpretarlo como HTML

### Requirement: Género nulo como «Sin clasificar»
Si el libro no tiene género (`genero` es `null`), la columna y el detalle SHALL mostrar «Sin clasificar».

#### Scenario: Antología sin género
- **WHEN** la API devuelve la «Antología de la literatura fantástica» con `"genero": null`
- **THEN** su género se muestra como «Sin clasificar»

### Requirement: Búsqueda por título
Al enviar el formulario de búsqueda (Enter o botón «Buscar»), el catálogo SHALL pedir `GET /api/libros/` con el texto ingresado, sin espacios al principio ni al final, como `titulo`. La búsqueda MUST reiniciar `offset` a 0. Si el texto queda vacío, se pide el listado sin `titulo`. Enviar el formulario MUST NOT recargar la página.

#### Scenario: Búsqueda parcial
- **GIVEN** el catálogo en la página 2
- **WHEN** el usuario escribe «  aleph » y pulsa Enter
- **THEN** se pide `GET /api/libros/?titulo=aleph&limit=5&offset=0` y la página no se recarga

#### Scenario: Búsqueda vacía
- **WHEN** el usuario borra el texto y pulsa «Buscar»
- **THEN** se pide `GET /api/libros/?limit=5&offset=0`, sin el parámetro `titulo`

### Requirement: Paginación con limit y offset
El catálogo SHALL ofrecer «Anterior» y «Siguiente» y mostrar el número de página. «Siguiente» suma 5 a `offset` y MUST estar habilitado solo si la última respuesta trajo 5 libros. «Anterior» resta 5 y MUST estar deshabilitado en la primera página. Ambos conservan el filtro.

#### Scenario: Avanzar con el seed
- **GIVEN** la página 1 con 5 libros y sin filtro
- **WHEN** el usuario pulsa «Siguiente»
- **THEN** se pide `GET /api/libros/?limit=5&offset=5`, se muestra 1 libro, «Siguiente» queda deshabilitado y se lee «Página 2»

#### Scenario: Volver a la primera página
- **GIVEN** la página 2 con el filtro «a»
- **WHEN** el usuario pulsa «Anterior»
- **THEN** se pide `GET /api/libros/?titulo=a&limit=5&offset=0` y «Anterior» queda deshabilitado

#### Scenario: Página siguiente vacía
- **GIVEN** la página 1 trajo exactamente 5 libros y no hay más
- **WHEN** el usuario pulsa «Siguiente» y la API responde `[]`
- **THEN** se sigue mostrando la página 1 con sus libros, `offset` vuelve a 0 y «Siguiente» queda deshabilitado

### Requirement: Estados de la vista
El catálogo SHALL mostrar, cada uno con su propio texto, un estado de cargando, uno de lista vacía, uno de búsqueda sin coincidencias y uno de error. Los mensajes que no aplican MUST quedar ocultos. Los errores MUST explicarse con texto, no solo con color.

#### Scenario: Cargando
- **WHEN** hay una petición del listado en curso
- **THEN** se ve el mensaje de cargando y los botones de búsqueda y paginación quedan deshabilitados

#### Scenario: Lista vacía
- **WHEN** la API responde `[]` a la primera página sin filtro
- **THEN** se ve «No hay libros en el catálogo.», la tabla está oculta y los demás mensajes también

#### Scenario: Búsqueda sin coincidencias
- **WHEN** la API responde `[]` a la primera página con el filtro «zzz»
- **THEN** se ve «No se encontraron libros con ese título.» y la tabla está oculta

#### Scenario: Error de conexión
- **WHEN** la petición falla sin respuesta del servidor
- **THEN** se ve el mensaje de error con el texto «No se pudo conectar con el servidor. Revisá tu conexión.» y la tabla está oculta

#### Scenario: Error de la API
- **WHEN** la API responde 503 con `{"detail": "La base de datos no está disponible"}`
- **THEN** el mensaje de error muestra «La base de datos no está disponible»

### Requirement: Respuestas fuera de orden
Si una petición del listado termina después de otra iniciada más tarde, el catálogo MUST descartar la respuesta vieja y mostrar solo la de la última petición.

#### Scenario: Búsquedas superpuestas
- **GIVEN** una búsqueda «a» todavía en curso
- **WHEN** el usuario busca «ficciones» y la respuesta de «a» llega última
- **THEN** la tabla muestra el resultado de «ficciones»

### Requirement: Detalle del libro con autores
Al pedir el detalle de un libro, el catálogo SHALL consultar `GET /api/libros/{id}` y mostrar título, ISBN, precio, stock, editorial, género y las autorías con nombre del autor, rol y orden, ordenadas por `orden` ascendente. El foco MUST moverse al detalle y cerrarlo MUST ocultarlo.

#### Scenario: Detalle de la Antología
- **WHEN** el usuario abre el detalle de la «Antología de la literatura fantástica»
- **THEN** se pide `GET /api/libros/{id}` y se listan Borges (autor, 1), Ocampo (coautor, 2) y Bioy Casares (coautor, 3), con género «Sin clasificar»

#### Scenario: Libro inexistente
- **WHEN** la API responde 404 con `{"detail": "El libro no existe"}`
- **THEN** el detalle muestra el error «El libro no existe» y la tabla del catálogo no cambia

### Requirement: Refresco desde otras secciones
El frontend SHALL exponer `window.renderCatalogo()`, que recarga desde la API la página y el filtro actuales y devuelve una promesa que se resuelve al terminar el render. Si la carga falla, la promesa MUST resolverse igual: el error queda en la vista.

#### Scenario: Refresco tras un alta
- **GIVEN** el catálogo en la página 1 sin filtro
- **WHEN** la sección de altas llama a `window.renderCatalogo()`
- **THEN** se vuelve a pedir `GET /api/libros/?limit=5&offset=0` y la tabla refleja la respuesta

#### Scenario: Refresco con error
- **WHEN** se llama a `window.renderCatalogo()` y el servidor no responde
- **THEN** la promesa se resuelve sin lanzar y se ve el mensaje de error del catálogo

### Requirement: Detalle reutilizable
El frontend SHALL exponer `window.mostrarDetalleLibro(id)`, que abre el mismo detalle del catálogo para el libro indicado y devuelve una promesa.

#### Scenario: Apertura desde otra sección
- **WHEN** otro script llama a `window.mostrarDetalleLibro(3)`
- **THEN** se pide `GET /api/libros/3` y se muestra el detalle de ese libro

### Requirement: Accesibilidad y adaptabilidad
Todos los controles nuevos del catálogo (búsqueda, paginación, detalle, cerrar) SHALL alcanzarse con Tab, mostrar foco visible y tener un nombre accesible. La sección MUST usarse sin desplazamiento horizontal de la página entre 320 y 1280 px; la tabla puede desplazarse dentro de su contenedor.

#### Scenario: Navegación con teclado
- **WHEN** el usuario recorre la sección con Tab
- **THEN** llega a búsqueda, «Buscar», cada «Ver detalle», «Anterior», «Siguiente» y «Cerrar detalle», y cada uno muestra el foco

#### Scenario: Pantalla angosta
- **WHEN** la ventana mide 320 px de ancho
- **THEN** la página no se desplaza en horizontal y la tabla se desplaza dentro de su contenedor
