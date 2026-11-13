# cliente-http Specification

## Purpose

Cliente HTTP único del frontend de la librería: es el único punto que arma URLs bajo `/api` y llama a la API del TP, y entrega a las secciones datos JSON ya parseados o errores con un mensaje en español listo para mostrar.

## Requirements

### Requirement: Interfaz pública global del cliente
El frontend SHALL exponer un objeto global `window.Api` con las operaciones `get(ruta, parametros)`, `post(ruta, cuerpo)`, `patch(ruta, cuerpo)`, `numero(valor)` y el constructor de errores `ApiError`. Las operaciones `get`, `post` y `patch` MUST devolver una promesa.

#### Scenario: Objeto disponible para los demás scripts
- **GIVEN** `index.html` cargado en el navegador
- **WHEN** un script de sección consulta `window.Api`
- **THEN** encuentra las funciones `get`, `post`, `patch`, `numero` y el constructor `ApiError`

#### Scenario: Las peticiones son asíncronas
- **WHEN** se invoca `Api.get("/libros/")`
- **THEN** el valor devuelto es una promesa que se resuelve o rechaza cuando termina la petición

### Requirement: Carga previa a los scripts de sección
`index.html` SHALL cargar `js/api.js` como script clásico (sin `type="module"`) antes que cualquier otro script de la página, para que `window.Api` exista cuando se ejecuten los scripts de sección.

#### Scenario: Orden de carga
- **WHEN** se inspeccionan las etiquetas `<script>` de `index.html`
- **THEN** la primera es `js/api.js` y le siguen `catalogo.js`, `altas.js`, `ventas.js` y `estante.js`, sin `datos.js` ni `persistencia.js`

### Requirement: URL bajo la base /api
El cliente SHALL construir la URL anteponiendo la base `/api` a la ruta recibida, sin agregar ni quitar barras; la ruta se escribe como en FastAPI (barra final en colecciones, sin barra en recursos con id).

#### Scenario: Ruta de colección
- **WHEN** se invoca `Api.get("/libros/")` sin parámetros
- **THEN** se pide `GET /api/libros/`

#### Scenario: Ruta de recurso con id
- **WHEN** se invoca `Api.get("/libros/3")`
- **THEN** se pide `GET /api/libros/3`

### Requirement: Parámetros de consulta sin valores vacíos
Al recibir parámetros, el cliente SHALL agregarlos como query string codificada y MUST omitir los que valen `""`, `null` o `undefined`. Si no queda ningún parámetro, la URL MUST quedar sin `?`.

#### Scenario: Parámetros con valores
- **WHEN** se invoca `Api.get("/libros/", { limit: 20, offset: 0, titulo: "mapa" })`
- **THEN** se pide `GET /api/libros/?limit=20&offset=0&titulo=mapa`

#### Scenario: Parámetros vacíos omitidos
- **WHEN** se invoca `Api.get("/libros/", { limit: 20, titulo: "", genero_id: null, autor: undefined })`
- **THEN** se pide `GET /api/libros/?limit=20`

#### Scenario: Todos los parámetros vacíos
- **WHEN** se invoca `Api.get("/libros/", { titulo: "" })`
- **THEN** se pide `GET /api/libros/` sin `?`

#### Scenario: El cero no se considera vacío
- **WHEN** se invoca `Api.get("/libros/", { offset: 0 })`
- **THEN** la URL incluye `offset=0`

### Requirement: Envío de cuerpos JSON
Toda petición SHALL enviar el encabezado `Accept: application/json`. `post` y `patch` SHALL serializar el cuerpo con JSON y enviar `Content-Type: application/json`; `get` MUST NOT enviar cuerpo ni `Content-Type`.

#### Scenario: Alta con POST
- **WHEN** se invoca `Api.post("/ventas/", { cliente_id: 2, renglones: [] })`
- **THEN** se envía `POST /api/ventas/` con `Content-Type: application/json` y el cuerpo `{"cliente_id":2,"renglones":[]}`

#### Scenario: Edición con PATCH
- **WHEN** se invoca `Api.patch("/libros/3", { stock: 5 })`
- **THEN** se envía `PATCH /api/libros/3` con el cuerpo JSON `{"stock":5}`

### Requirement: Lectura de respuestas exitosas
Ante una respuesta 2xx, la promesa SHALL resolverse con el cuerpo JSON parseado. Si el cuerpo está vacío (por ejemplo, un 204) o no es JSON válido, MUST resolverse con `null`.

#### Scenario: Respuesta con JSON
- **WHEN** la API responde 200 con `[{"id":1,"precio":"1500.00"}]`
- **THEN** la promesa se resuelve con el arreglo parseado, con `precio` todavía como texto

#### Scenario: Respuesta sin contenido
- **WHEN** la API responde 204 sin cuerpo
- **THEN** la promesa se resuelve con `null`

### Requirement: Error de la API como ApiError
Ante una respuesta que no es 2xx, la promesa SHALL rechazarse con un `ApiError` (instancia de `Error`, `name` = `"ApiError"`) cuyo `status` es el código HTTP, `message` es un texto en español listo para mostrar y `detalle` es el cuerpo parseado (o `null`).

#### Scenario: Conflicto con detail propio
- **WHEN** la API responde 409 con `{"detail": "El ISBN ya existe o un autor figura dos veces en el libro"}`
- **THEN** se rechaza con `ApiError` de `status` 409, `message` igual a ese `detail` y `detalle` igual al cuerpo recibido

#### Scenario: Recurso inexistente con detail propio
- **WHEN** la API responde 404 con `{"detail": "El libro no existe"}`
- **THEN** `error.message` es «El libro no existe» y `error.status` es 404

### Requirement: Mensaje de validación 422
Si el `detail` del error es una lista de validación de FastAPI, el mensaje SHALL armarse con un texto por error `campo: msg`, donde `campo` es `loc` sin el segmento `body` unido con `.`, y los textos MUST unirse con « · ». Si no queda campo, se usa solo `msg`.

#### Scenario: Dos campos inválidos en el cuerpo
- **WHEN** la API responde 422 con `{"detail": [{"loc": ["body", "precio"], "msg": "Input should be greater than 0"}, {"loc": ["body", "stock"], "msg": "Field required"}]}`
- **THEN** `error.message` es `precio: Input should be greater than 0 · stock: Field required`

#### Scenario: Error de parámetro de consulta
- **WHEN** la API responde 422 con `{"detail": [{"loc": ["query", "limit"], "msg": "Input should be less than or equal to 100"}]}`
- **THEN** `error.message` es `query.limit: Input should be less than or equal to 100`

### Requirement: Mensajes por defecto en español
Si la respuesta de error no trae un `detail` utilizable (texto no vacío o lista no vacía), el cliente SHALL usar un mensaje en español según el código: 404, 409, 422, 5xx, o `Error HTTP <código>.` para el resto.

#### Scenario: 404 sin detail
- **WHEN** la API responde 404 con cuerpo vacío
- **THEN** `error.message` es «No se encontró el recurso pedido.»

#### Scenario: 409 sin detail
- **WHEN** la API responde 409 sin `detail`
- **THEN** `error.message` es «La operación entra en conflicto con los datos guardados.»

#### Scenario: 422 sin detail
- **WHEN** la API responde 422 con `{"detail": []}`
- **THEN** `error.message` es «Los datos enviados no son válidos.»

#### Scenario: Error del servidor
- **WHEN** el proxy responde 502 con un cuerpo HTML
- **THEN** `error.message` es «Error del servidor. Probá de nuevo en unos minutos.» y `error.detalle` es `null`

#### Scenario: Otro código
- **WHEN** la API responde 401 sin cuerpo
- **THEN** `error.message` es «Error HTTP 401.»

### Requirement: Error de conexión con status 0
Si la petición no llega a obtener respuesta (red caída, servidor inalcanzable), la promesa SHALL rechazarse con un `ApiError` de `status` 0, `message` «No se pudo conectar con el servidor. Revisá tu conexión.» y `detalle` `null`.

#### Scenario: Sin conexión
- **GIVEN** el servidor no es alcanzable
- **WHEN** se invoca `Api.get("/libros/")`
- **THEN** se rechaza con `ApiError` de `status` 0 y el mensaje de conexión en español

### Requirement: Conversión de Decimales en texto
`Api.numero(valor)` SHALL convertir a número un Decimal que la API envía como texto, solo para mostrarlo; los importes se toman siempre de la respuesta y nunca se recalculan (D-08).

#### Scenario: Precio en texto
- **WHEN** se invoca `Api.numero("1500.00")`
- **THEN** devuelve el número `1500`

#### Scenario: Valor no numérico
- **WHEN** se invoca `Api.numero("abc")`
- **THEN** devuelve `NaN`

### Requirement: Único punto de acceso HTTP
Ningún script del frontend fuera de `js/api.js` SHALL llamar a `fetch` ni armar URLs de la API; las secciones MUST usar `Api.get`, `Api.post` o `Api.patch`.

#### Scenario: Búsqueda de fetch
- **WHEN** se busca `fetch(` en `frontend/public/js/` y en `index.html`
- **THEN** la única llamada está en `js/api.js`
