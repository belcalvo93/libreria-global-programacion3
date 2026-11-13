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
Catálogo, Libros, Clientes, Ventas e Historial SHALL presentarse como tarjetas de cristal nocturno: fondo azul noche semitransparente con fallback opaco, borde dorado tenue y esquinas de 14 a 16 px. El contraste MUST cumplir WCAG AA.

#### Scenario: Detalles de las secciones
- **WHEN** se ve cualquiera de las cinco secciones
- **THEN** el contenido mide como máximo ~1100 px, los títulos son dorados con línea y ✦, los formularios van en dos columnas en escritorio y una en móvil, los controles miden al menos 44 px con foco dorado, las tablas alinean los números a la derecha con scroll horizontal interno y los mensajes llevan borde lateral de color

#### Scenario: Escritorio
- **WHEN** se ve a 1366x768
- **THEN** la portada mide 100dvh y las secciones se ven como tarjetas de cristal

#### Scenario: Móvil
- **WHEN** se ve a 390x844
- **THEN** los formularios van en una columna, los botones a lo ancho y las tablas hacen scroll dentro de su contenedor

### Requirement: Ventas e Historial con componentes propios
Ventas e Historial SHALL usar componentes propios: cliente por ID en una línea, cada libro de la venta en una fila Libro | Cantidad | Precio | quitar, «+ Agregar otro libro» secundario, «Confirmar venta» como único botón primario, «Ver detalle» en el historial, paginación centrada y el cambio de precio en una fila. Los textos visibles MUST NOT usar la palabra «renglón» y el front MUST NOT calcular subtotales ni totales.

#### Scenario: Escritorio
- **WHEN** se ve a 1366x768
- **THEN** etiqueta, campo y botón del cliente van en una línea, «Confirmar venta» queda a la derecha y «Ver detalle» tiene `aria-label` «Ver detalle de la venta N»

#### Scenario: Quitar libro accesible
- **WHEN** hay una fila de libro
- **THEN** el botón de quitar es solo ícono (cruz ✕ con CSS, zona táctil de 44x44 px), muestra solo una cruz, su nombre accesible es «Quitar libro 1» y su tooltip «Quitar libro»

#### Scenario: Móvil
- **WHEN** se ve a 390x844
- **THEN** no hay scroll horizontal de página y Anterior, Página N y Siguiente caben en una línea
