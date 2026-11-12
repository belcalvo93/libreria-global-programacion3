# ventas-historial Specification

## Purpose
Ventas e historial del frontend de la librería, contra la API del TP: armado del borrador en memoria, registro con `POST /ventas/` mostrando los importes de la respuesta, historial paginado con detalle y comprobación del precio histórico.

## Requirements

### Requirement: Cliente por ID
La venta SHALL tomar el cliente por su ID. El botón «Buscar cliente» MUST pedir `GET /api/clientes/{id}` y mostrar el nombre y el email del cliente, o el aviso de que no existe. Un 404 MUST NOT impedir confirmar la venta.

#### Scenario: Cliente existente
- **WHEN** se escribe `1` y se toca «Buscar cliente»
- **THEN** se pide `GET /api/clientes/1` y se muestra «Lucía Fernández (lucia@example.com)»

#### Scenario: Cliente inexistente
- **WHEN** se busca el ID `999`
- **THEN** la API responde 404 y se muestran «No existe un cliente con ese ID» y el mensaje del servidor

### Requirement: Borrador en memoria con libros de la API
Los renglones SHALL ofrecer los libros de `GET /api/libros/`, con el `id` del libro como `value` (no el ISBN). Se MUST poder agregar renglones, cambiar cantidades y quitar renglones. El borrador MUST vivir solo en memoria, sin `localStorage`. Un mismo libro MUST NOT quedar elegido en dos renglones.

#### Scenario: Libro repetido
- **GIVEN** un borrador con Rayuela en el renglón 1
- **WHEN** se elige Rayuela en el renglón 2
- **THEN** el renglón 2 vuelve a su valor anterior y se avisa «Ese libro ya está en el renglón 1»

### Requirement: Validación antes de enviar
Al confirmar, el front SHALL validar que haya un ID de cliente entero positivo, al menos un renglón, un libro en cada renglón, cantidades enteras mayores que cero y un renglón por libro. Si algo falla, MUST mostrar el problema y MUST NOT enviar la venta.

#### Scenario: Cantidad no entera
- **WHEN** un renglón tiene cantidad `1.5` y se confirma
- **THEN** se muestra «La cantidad del renglón N tiene que ser un número entero mayor que cero.» y no se hace ningún `POST`

### Requirement: Registro con los importes de la respuesta
Confirmar SHALL enviar `POST /api/ventas/` con `cliente_id` y `renglones[{libro_id, cantidad}]` y ningún otro campo. El botón MUST estar deshabilitado mientras viaja la petición y rehabilitarse al terminar. Ante un 201, el front MUST mostrar precio unitario, subtotal y total tal como vienen en la respuesta (sin recalcularlos), limpiar el formulario y refrescar el historial.

#### Scenario: Venta válida con dos renglones (G-04)
- **WHEN** el cliente 2 compra 2 Rayuela y 1 El Aleph y se confirma
- **THEN** el botón se deshabilita durante el envío, la API responde 201 y «Venta confirmada» muestra 25000.00 × 2 = 50000.00, 19500.00 × 1 = 19500.00 y total 69500.00 copiados de la respuesta; el formulario vuelve a un renglón vacío y el historial suma la venta

### Requirement: Rechazos sin perder el borrador
Ante un 409 o un 422, el front SHALL mostrar el mensaje del servidor y MUST conservar el borrador tal como estaba. El historial MUST quedar igual.

#### Scenario: Cliente inexistente al confirmar (G-06)
- **GIVEN** un borrador válido con el ID de cliente `999`
- **WHEN** se confirma
- **THEN** la API responde 409, se muestra «El cliente indicado no existe», los renglones y cantidades siguen iguales y el historial no cambia

#### Scenario: Libro repetido enviado directamente (G-06)
- **WHEN** desde la consola del navegador se envía `Api.post("/ventas/", {cliente_id: 1, renglones: [{libro_id: 1, cantidad: 1}, {libro_id: 1, cantidad: 2}]})`
- **THEN** la API responde 422 «Un mismo libro no puede aparecer en dos renglones» y el historial no cambia

### Requirement: Historial y detalle
El historial SHALL salir de `GET /api/ventas/?limit=10&offset=…` con «Anterior» y «Siguiente», y cada venta MUST poder abrir su detalle con `GET /api/ventas/{id}`: fecha, cliente, renglones e importes históricos. Como los datos vienen de la API, MUST seguir disponibles después de recargar la página.

#### Scenario: Detalle después de recargar (G-04)
- **GIVEN** la venta confirmada en G-04
- **WHEN** se recarga la página y se toca «Ver detalle de la venta N»
- **THEN** el detalle muestra los mismos renglones, precios unitarios, subtotales y total que el 201

### Requirement: Precio histórico
El historial SHALL ofrecer un formulario para cambiar el precio de un libro con `PATCH /api/libros/{id}` enviando solo `{"precio": …}`. Después del cambio, las ventas anteriores MUST seguir mostrando los importes con los que se vendieron.

#### Scenario: Cambio de precio de Rayuela (G-05)
- **GIVEN** la venta de G-04 abierta en el detalle, con Rayuela a 25000.00
- **WHEN** se cambia el precio de Rayuela a 31000
- **THEN** la API responde 200, el catálogo y los selectores muestran 31000.00 y el detalle, pedido de nuevo a la API, sigue mostrando Rayuela a 25000.00, subtotal 50000.00 y total 69500.00
