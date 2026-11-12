# Spec Delta

## Purpose

Alta de libros (con editoriales, géneros y autorías por ID) y gestión de clientes (alta y búsqueda por ID) en el frontend de la librería, consumiendo la API del TP sin datos fijos ni persistencia local.

## ADDED Requirements

### Requirement: Carga de editoriales y géneros desde la API
Al abrir la página, la sección de libros SHALL pedir editoriales (`GET /api/editoriales/?limit=100`) y géneros (`GET /api/generos/?limit=100`) para poblar sus selectores. El selector de género MUST incluir la opción «Sin clasificar» asociada a `null`, y los selectores MUST NOT conservar opciones fijas del HTML del parcial.

#### Scenario: Carga inicial exitosa
- **WHEN** la API devuelve editoriales y géneros al iniciar
- **THEN** el selector de editorial muestra las editoriales recibidas y el de género incluye «Sin clasificar» junto a los géneros recibidos

#### Scenario: Falla la carga inicial de selectores
- **WHEN** falla la petición de editoriales o géneros por error de red o servidor
- **THEN** se muestra el mensaje de error en la sección de libros usando texto visible

### Requirement: Búsqueda de autores por ID y armado de autorías
Para agregar autorías a un libro, el formulario SHALL permitir buscar un autor por su ID mediante `GET /api/autores/{id}`, elegir un rol (`autor`, `coautor`, `traductor`, `ilustrador`) y un orden entero `>= 1`, y agregarlo a una lista en memoria con opción de quitarlo. El formulario MUST NOT permitir agregar dos veces el mismo autor, y pulsar Enter en el campo de ID del autor MUST buscar el autor sin enviar el formulario del libro.

#### Scenario: Enter en el campo de ID del autor
- **WHEN** el usuario escribe un ID en el campo de búsqueda de autor y pulsa Enter
- **THEN** se consulta `GET /api/autores/{id}` y no se envía `POST /api/libros/` ni se muestra el error de autorías faltantes

#### Scenario: Autor encontrado y agregado
- **WHEN** el usuario busca el autor con ID `1`, selecciona rol `autor` y orden `1`, y pulsa «Agregar autoría»
- **THEN** se consulta `GET /api/autores/1`, se muestra el nombre del autor y la autoría aparece en la lista con su botón para quitar

#### Scenario: Autor inexistente
- **WHEN** el usuario busca un ID de autor inexistente y la API responde 404
- **THEN** se muestra el mensaje de error devuelto por el servidor sin agregar la autoría

#### Scenario: Autor ya agregado en la lista
- **WHEN** el usuario intenta agregar una autoría para un `autor_id` que ya figura en la lista
- **THEN** se muestra un mensaje de error claro y no se duplica el autor en la lista

### Requirement: Validación en el frente antes de crear un libro
Antes de enviar `POST /api/libros/`, el formulario SHALL validar que el título y el ISBN no estén vacíos, el precio sea mayor que 0 (máximo 2 decimales), el stock sea un entero `>= 0`, exista editorial seleccionada y haya al menos una autoría agregada (D-24). Si falta alguno, MUST mostrar el error sin enviar la petición.

#### Scenario: Intento de alta sin autorías
- **GIVEN** título, ISBN, precio `1500`, stock `5` y editorial seleccionados, pero lista de autorías vacía
- **WHEN** el usuario envía el formulario de libro
- **THEN** el frente muestra que debe agregarse al menos una autoría y no llama a `POST /api/libros/`

#### Scenario: Stock negativo o decimal
- **WHEN** el usuario ingresa stock `-1` o `1.5` y envía el formulario
- **THEN** el frente muestra un error de validación y no llama a `POST /api/libros/`

### Requirement: Alta de libro contra la API
Con datos válidos, el formulario SHALL deshabilitar el botón de envío y enviar `POST /api/libros/` con `isbn`, `titulo`, `precio`, `stock`, `editorial_id`, `genero_id` (`null` si «Sin clasificar») y `autores`. Ante 201 MUST limpiar el formulario, mostrar confirmación con los datos devueltos y llamar a `window.renderCatalogo()` si existe.

#### Scenario: Alta exitosa con género opcional nulo
- **WHEN** el usuario completa un libro válido con género «Sin clasificar» y el servidor responde 201
- **THEN** se envía `genero_id: null`, se muestra el libro creado en la tabla de la sesión sin recargar, se limpia el formulario y se llama a `window.renderCatalogo()`

#### Scenario: ISBN repetido (caso G-02)
- **WHEN** se envía un libro con un ISBN existente y la API responde 409
- **THEN** se muestra el mensaje de error del servidor cerca del formulario de libros sin limpiar los campos ingresados

#### Scenario: Datos rechazados por el servidor
- **WHEN** se envía un libro y la API responde 422
- **THEN** se muestra el mensaje armado por `Api` con los `detail` de validación cerca del formulario de libros, sin limpiar los campos ni la lista de autorías

### Requirement: Alta de cliente y manejo de conflictos
El formulario de clientes SHALL validar nombre no vacío y email con formato válido antes de enviar `POST /api/clientes/` con `{ nombre, email }`. Ante 201 MUST mostrar la confirmación incluyendo el ID asignado y reflejar el registro devuelto. Ante 409 o 422 MUST mostrar el mensaje del servidor cerca del formulario.

#### Scenario: Alta de cliente exitosa (caso G-03)
- **WHEN** el usuario envía nombre y email válidos y la API responde 201 con el `ClienteRead`
- **THEN** se muestra el mensaje de confirmación con el ID devuelto, se agrega a la tabla de la sesión y se limpia el formulario

#### Scenario: Email repetido (caso G-03)
- **WHEN** se envía un email ya registrado (incluso con distinta capitalización) y la API responde 409
- **THEN** se muestra el `detail` devuelto por el servidor cerca del formulario de clientes

### Requirement: Búsqueda de cliente por ID
La sección de clientes SHALL ofrecer un formulario para consultar un cliente por ID mediante `GET /api/clientes/{id}`, ya que la API no dispone de listado de clientes. Si existe, MUST mostrar su ID, nombre y email; si responde 404, MUST mostrar el mensaje de error con texto.

#### Scenario: Recuperar cliente creado por ID (caso G-03)
- **WHEN** el usuario ingresa el ID del cliente recién creado y pulsa «Buscar cliente»
- **THEN** se pide `GET /api/clientes/{id}` y se muestran el ID, nombre y email devueltos

#### Scenario: Cliente no encontrado
- **WHEN** el usuario busca un ID inexistente y la API responde 404
- **THEN** se oculta cualquier resultado previo y se muestra el mensaje de error del servidor

### Requirement: Seguridad, convenciones y documentación del alcance
Las secciones `#libros` y `#clientes` MUST NOT usar `innerHTML`, `style.display`, estilos inline, `fetch` directo, `DATOS`, `localStorage`, filas fijas del parcial ni recargar la página al enviar formularios. Todos los controles nuevos MUST alcanzarse con Tab y usarse sin scroll horizontal de página entre 320 y 1280 px. `README.md` MUST documentar que autores y clientes se buscan por ID.

#### Scenario: Texto con marcado HTML en respuesta de la API
- **WHEN** el nombre de un autor o cliente contiene `<script>alert(1)</script>`
- **THEN** se muestra literalmente como texto mediante `textContent` sin interpretarse como HTML

#### Scenario: Documentación en README
- **WHEN** se revisa `README.md`
- **THEN** consta explícitamente que autores y clientes se buscan por ID (`GET /autores/{id}` y `GET /clientes/{id}`) porque la API no expone listados
