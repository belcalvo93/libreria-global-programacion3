## ADDED Requirements

### Requirement: Marca Gatoteca Lunar
El sitio SHALL llamarse «Gatoteca Lunar» en el `<title>`, el `<h1>` y el pie de página.

#### Scenario: Título de la página
- **WHEN** se abre la página
- **THEN** el título de la pestaña, el h1 y el pie dicen «Gatoteca Lunar»

### Requirement: Lema bajo el título
Bajo el título SHALL haber un párrafo estático (`.portada__lema`) con el texto «En este lugar, entre estantes y estrellas, cada libro guarda una noche por descubrir.», más chico que el título y con contraste AA. MUST NOT superponerse con la luna, el gato, la estantería ni la nav, y la portada MUST seguir midiendo 100dvh.

#### Scenario: Móvil
- **WHEN** se ve a 320x568
- **THEN** el lema se lee completo en 2 o 3 líneas y no hay scroll horizontal

### Requirement: Libros de la estantería al hover
Al pasar el mouse o dar foco, un libro SHALL levantarse con una leve inclinación y una sombra más marcada, con transición suave solo bajo `prefers-reduced-motion: no-preference`, sin cambiar su tamaño.

#### Scenario: Hover
- **WHEN** el mouse pasa sobre un libro
- **THEN** el libro sale al frente con inclinación y sombra y sus medidas no cambian
