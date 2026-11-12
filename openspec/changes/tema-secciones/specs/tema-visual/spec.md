## ADDED Requirements

### Requirement: Estrella fugaz visible
La cabecera SHALL mostrar una estrella fugaz pequeña con estela dorada y blanca que cruce el cielo en diagonal cada 8 a 12 segundos, detrás del texto y de la navegación. MUST tener `pointer-events: none`, MUST NOT afectar el layout ni generar scroll horizontal y MUST NOT animarse ni mostrarse con `prefers-reduced-motion: reduce`.

#### Scenario: Movimiento permitido
- **WHEN** la página se abre sin preferencia de movimiento reducido
- **THEN** cada ~10 s una estrella con estela cruza la parte superior sin tapar texto

#### Scenario: Movimiento reducido
- **WHEN** el usuario pide reducir el movimiento
- **THEN** la estrella no aparece

### Requirement: Secciones en cristal nocturno
Catálogo, Libros, Clientes, Ventas e Historial SHALL presentarse como tarjetas de cristal nocturno (fondo azul noche semitransparente con fallback opaco, borde dorado tenue, esquinas de 14 a 16 px), con contenido de ancho máximo ~1100 px, títulos dorados con línea y ✦, formularios en dos columnas en escritorio y una en móvil, controles de al menos 44 px de alto con foco dorado visible, tablas con números a la derecha y scroll horizontal interno, y mensajes con borde lateral de color. El contraste MUST cumplir WCAG AA.

#### Scenario: Escritorio
- **WHEN** se ve a 1366x768
- **THEN** la portada mide 100dvh y las secciones se ven como tarjetas de cristal

#### Scenario: Móvil
- **WHEN** se ve a 390x844
- **THEN** los formularios van en una columna, los botones a lo ancho y las tablas hacen scroll dentro de su contenedor
