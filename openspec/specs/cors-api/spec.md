# cors-api Specification

## Purpose

Política de orígenes cruzados (CORS) de la API del backend de la librería: qué orígenes puede atender un navegador desde otro dominio, de dónde sale esa lista (la variable de entorno `CORS_ORIGINS`) y qué cabeceras CORS devuelve la API.

## Requirements

### Requirement: Orígenes permitidos desde la variable CORS_ORIGINS
La API SHALL tomar la lista de orígenes permitidos únicamente de la variable de entorno `CORS_ORIGINS`, leída al arrancar. El valor es una o varias URL de origen exacto (esquema + host[:puerto], sin barra final) separadas por coma. Cada elemento MUST recortarse de espacios y los elementos vacíos MUST descartarse.

#### Scenario: Un solo origen
- **GIVEN** `CORS_ORIGINS=https://front.ejemplo.com`
- **WHEN** la API arranca
- **THEN** el único origen permitido es `https://front.ejemplo.com`

#### Scenario: Varios orígenes con espacios
- **GIVEN** `CORS_ORIGINS=http://127.0.0.1:8080, http://localhost:8080`
- **WHEN** la API arranca
- **THEN** los orígenes permitidos son `http://127.0.0.1:8080` y `http://localhost:8080`, sin espacios

#### Scenario: Elementos vacíos y coma final
- **GIVEN** `CORS_ORIGINS=http://localhost:8080,, ,`
- **WHEN** la API arranca
- **THEN** el único origen permitido es `http://localhost:8080`

### Requirement: Sin orígenes configurados no hay CORS
Si `CORS_ORIGINS` no existe, está vacía o solo tiene separadores y espacios, la API SHALL arrancar igual y MUST NOT devolver cabeceras CORS en ninguna respuesta, de modo que el navegador bloquee todo pedido cross-origin. La API MUST NOT fallar al arrancar por la falta de esta variable.

#### Scenario: Variable ausente
- **GIVEN** `CORS_ORIGINS` no está definida
- **WHEN** llega `GET /health/live` con la cabecera `Origin: http://localhost:8080`
- **THEN** la respuesta es 200 y no incluye `access-control-allow-origin`

#### Scenario: Variable vacía
- **GIVEN** `CORS_ORIGINS=` (vacía)
- **WHEN** llega `GET /health/live` con la cabecera `Origin: http://localhost:8080`
- **THEN** la respuesta no incluye `access-control-allow-origin`

### Requirement: Origen permitido recibe su cabecera CORS
Ante un pedido con cabecera `Origin` igual (coincidencia exacta) a uno de los orígenes permitidos, la API SHALL responder con `access-control-allow-origin` igual a ese mismo origen. La API MUST NOT responder nunca con el comodín `*`.

#### Scenario: Pedido simple desde un origen permitido
- **GIVEN** `CORS_ORIGINS=http://localhost:8080`
- **WHEN** llega `GET /health/live` con `Origin: http://localhost:8080`
- **THEN** la respuesta incluye `access-control-allow-origin: http://localhost:8080`

#### Scenario: Nunca comodín
- **GIVEN** cualquier valor de `CORS_ORIGINS`
- **WHEN** la API responde a un pedido con `Origin`
- **THEN** `access-control-allow-origin`, si está, nunca vale `*`

### Requirement: Origen no permitido no recibe cabecera CORS
Ante un pedido cuyo `Origin` no coincide exactamente con ningún origen permitido (otro host, otro esquema, otro puerto o con barra final), la API MUST NOT incluir `access-control-allow-origin` en la respuesta. El endpoint se ejecuta igual; es el navegador el que bloquea la lectura.

#### Scenario: Otro dominio
- **GIVEN** `CORS_ORIGINS=http://localhost:8080`
- **WHEN** llega `GET /health/live` con `Origin: https://malicioso.ejemplo.com`
- **THEN** la respuesta no incluye `access-control-allow-origin`

#### Scenario: Mismo host con otro puerto
- **GIVEN** `CORS_ORIGINS=http://localhost:8080`
- **WHEN** llega `GET /health/live` con `Origin: http://localhost:3000`
- **THEN** la respuesta no incluye `access-control-allow-origin`

### Requirement: Preflight limitado a los métodos y cabeceras de la API
Ante un preflight (`OPTIONS` con `Origin` y `Access-Control-Request-Method`) desde un origen permitido, la API SHALL responder 200 con `access-control-allow-origin` igual al origen y `access-control-allow-methods` limitado a `GET`, `POST`, `PATCH` y `OPTIONS`. La única cabecera de petición admitida MUST ser `Content-Type`.

#### Scenario: Preflight de un POST con JSON
- **GIVEN** `CORS_ORIGINS=http://localhost:8080`
- **WHEN** llega `OPTIONS /libros/` con `Origin: http://localhost:8080`, `Access-Control-Request-Method: POST` y `Access-Control-Request-Headers: content-type`
- **THEN** la respuesta es 200, incluye `access-control-allow-origin: http://localhost:8080` y `access-control-allow-methods` contiene `POST` y `PATCH`

#### Scenario: Preflight de un método que la API no usa
- **GIVEN** `CORS_ORIGINS=http://localhost:8080`
- **WHEN** llega un preflight con `Origin: http://localhost:8080` y `Access-Control-Request-Method: DELETE`
- **THEN** la respuesta no es 200

#### Scenario: Preflight desde un origen no permitido
- **GIVEN** `CORS_ORIGINS=http://localhost:8080`
- **WHEN** llega un preflight con `Origin: https://malicioso.ejemplo.com` y `Access-Control-Request-Method: GET`
- **THEN** la respuesta no es 200 y no incluye `access-control-allow-origin`

### Requirement: Sin credenciales cross-origin
La API SHALL atender los pedidos cross-origin sin credenciales: MUST NOT responder con `access-control-allow-credentials: true`, porque no usa cookies ni autenticación.

#### Scenario: Respuesta a un origen permitido
- **GIVEN** `CORS_ORIGINS=http://localhost:8080`
- **WHEN** llega `GET /health/live` con `Origin: http://localhost:8080`
- **THEN** la respuesta no incluye `access-control-allow-credentials: true`
