## ADDED Requirements

### Requirement: Formulario de libros en bloques
El formulario «Libros» SHALL agruparse en tres bloques visibles con `fieldset` y `legend`: «1. Datos del libro», «2. Autores» y «3. Guardar». El bloque «Autores» MUST incluir la ayuda «Buscá al autor por su ID, elegí su rol y agregalo. Tiene que haber al menos uno.» y la lista de autorías agregadas justo debajo de los controles. Los ids, `name` y `for` de los campos MUST conservarse.

#### Scenario: Lista dentro de Autores
- **WHEN** se agrega una autoría
- **THEN** aparece en la tabla dentro del bloque «Autores», antes del botón «Agregar libro»

### Requirement: Orden sugerido
El campo «Orden» SHALL autocompletarse con el menor número entero positivo no usado por las autorías agregadas tras agregar, quitar o guardar, y MUST seguir siendo editable.

#### Scenario: Siguiente número
- **WHEN** se agrega la primera autoría con orden 1
- **THEN** el campo «Orden» muestra 2
