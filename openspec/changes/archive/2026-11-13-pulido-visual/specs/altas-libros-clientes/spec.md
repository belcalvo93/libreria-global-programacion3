## ADDED Requirements

### Requirement: Errores por campo
Si la validación del frente falla, los formularios de libros y de clientes SHALL mostrar, además del mensaje general, un mensaje con «⚠» y texto debajo de cada campo inválido, marcar ese campo con `aria-invalid="true"` y asociarle el mensaje con `aria-describedby`, y MUST llevar el foco al primer campo inválido. El mensaje de autorías va debajo de la lista de autorías. Al corregir un campo (escribir o elegir) su error MUST desaparecer.

#### Scenario: Libro con datos faltantes
- **WHEN** el usuario envía el formulario de libros sin título y con stock `-1`
- **THEN** se ven «Escribí el título.» bajo el título y «El stock tiene que ser un número entero desde 0.» bajo el stock, ambos campos tienen `aria-invalid="true"`, el foco queda en el título y no se llama a `POST /api/libros/`

#### Scenario: Sin autorías
- **WHEN** el usuario envía el formulario de libros con todos los datos pero sin autorías
- **THEN** se ve «Agregá al menos un autor.» debajo de la lista de autorías y el campo de ID de autor queda marcado como inválido

#### Scenario: Email inválido
- **WHEN** el usuario envía el formulario de clientes con el email `ana@`
- **THEN** se ve «El email no tiene un formato válido.» bajo el email, que queda marcado como inválido y con el foco

#### Scenario: Corregir el campo
- **GIVEN** el título marcado con error
- **WHEN** el usuario escribe en el título
- **THEN** el mensaje del título se oculta y el campo deja de tener `aria-invalid`

### Requirement: Duplicado marcado en su campo
Cuando la API responde 409 al crear un libro o un cliente, el formulario SHALL mostrar el mensaje del servidor también debajo del campo duplicado (ISBN en libros, email en clientes), marcarlo como inválido y llevarle el foco. Otros errores de la API MUST mostrarse solo en el mensaje general.

#### Scenario: ISBN repetido
- **WHEN** se envía un libro con un ISBN ya registrado y la API responde 409
- **THEN** el mensaje del servidor aparece en el mensaje general y debajo del ISBN, que queda marcado como inválido y con el foco

#### Scenario: Email repetido
- **WHEN** se envía un cliente con un email ya registrado y la API responde 409
- **THEN** el mensaje del servidor aparece debajo del email, que queda marcado como inválido

## MODIFIED Requirements

### Requirement: Formulario de libros en bloques
El formulario «Libros» SHALL agruparse en dos bloques visibles con `fieldset` y `legend`: «1. Datos del libro» y «2. Autores», seguidos del botón «Agregar libro» al pie del formulario, a todo el ancho y fuera de los bloques. El bloque «Autores» MUST incluir la ayuda «Buscá al autor por su ID, elegí su rol y agregalo. Tiene que haber al menos uno.» y la lista de autorías agregadas justo debajo de los controles. Los ids, `name` y `for` de los campos MUST conservarse.

#### Scenario: Lista dentro de Autores
- **WHEN** se agrega una autoría
- **THEN** aparece en la tabla dentro del bloque «Autores», antes del botón «Agregar libro»

#### Scenario: Botón al pie
- **WHEN** se ve el formulario «Libros»
- **THEN** no hay un bloque «3. Guardar» y el botón «Agregar libro» es el último control del formulario, a todo el ancho
