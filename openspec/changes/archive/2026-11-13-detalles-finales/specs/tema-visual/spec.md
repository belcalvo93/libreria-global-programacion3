## ADDED Requirements

### Requirement: Favicon de la luna y color de barra
La página SHALL enlazar en `<head>` un favicon derivado de `img/luna.webp` (`/favicon.ico` con 16, 32 y 48 px, `/favicon-32.png` y `/apple-touch-icon.png` de 180 px) y `<meta name="theme-color" content="#0e1128">`. nginx MUST responder 200 a `/favicon.ico` con cache.

#### Scenario: Sin 404 del favicon
- **WHEN** se abre la página detrás de nginx
- **THEN** la pestaña muestra la luna y la consola no registra un 404 de `/favicon.ico`

### Requirement: Saltar al contenido
El primer elemento enfocable del `<body>` SHALL ser un enlace «Saltar al contenido» a `#catalogo`, oculto hasta recibir foco. Con foco MUST verse arriba a la izquierda, sobre el nav, con el estilo del tema y foco visible. Al activarlo, el foco MUST pasar a la sección del catálogo.

#### Scenario: Teclado
- **WHEN** el usuario abre la página y pulsa Tab y después Enter
- **THEN** primero aparece «Saltar al contenido» y luego el foco queda en la sección Catálogo; el siguiente Tab va al buscador

#### Scenario: Pantalla angosta
- **WHEN** se hace lo mismo a 320 px de ancho
- **THEN** el enlace se ve completo, sin scroll horizontal

### Requirement: Pie libre del botón de música
El pie de página SHALL reservar abajo al menos 4 rem extra, de modo que al llegar al final de la página el botón flotante de música no tape contenido, de 320 a 1280 px.

#### Scenario: Final de la página
- **WHEN** el usuario baja hasta el final a 320 px
- **THEN** el texto del pie queda por encima del botón de música
