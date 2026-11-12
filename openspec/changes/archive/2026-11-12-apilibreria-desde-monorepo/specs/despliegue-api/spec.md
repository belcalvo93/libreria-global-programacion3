## ADDED Requirements

### Requirement: La API se construye desde el monorepo
El servicio `apilibreria` del proyecto `grupo2-elias` SHALL construirse desde el repositorio de la entrega (`belcalvo93/libreria-global-programacion3`), rama `main`, con Build Path `/backend` y el `Dockerfile` de esa carpeta. El commit desplegado MUST poder identificarse desde el panel (historial de implementaciones) para registrarlo en la evidencia.

#### Scenario: Fuente configurada
- **GIVEN** el servicio `apilibreria` en Easypanel
- **WHEN** se mira su configuración de origen
- **THEN** el repositorio es `belcalvo93/libreria-global-programacion3`, la rama `main`, el Build Path `/backend` y el builder Dockerfile con archivo `Dockerfile`

#### Scenario: Commit desplegado identificable
- **GIVEN** una implementación terminada del servicio
- **WHEN** se abre el historial de implementaciones
- **THEN** se ve el commit de `main` que se construyó, y es igual o posterior al merge de C-09

### Requirement: Migraciones al arrancar sobre la misma base
Al arrancar, la API SHALL aplicar `alembic upgrade head` sobre la base `dblibreria` existente antes de atender pedidos, y MUST NOT repetir migraciones ya aplicadas ni perder datos. Si la base no responde, el contenedor MUST terminar con error en lugar de quedar atendiendo.

#### Scenario: Arranque normal
- **GIVEN** `DATABASE_URL` apunta a `dblibreria` y la base responde
- **WHEN** se implementa el servicio
- **THEN** el log muestra la ejecución de `alembic upgrade head` y después `Uvicorn running on http://0.0.0.0:8000`

#### Scenario: Base ya migrada
- **GIVEN** `dblibreria` ya está en la última revisión
- **WHEN** se redespliega el servicio
- **THEN** alembic no aplica ninguna migración nueva y la API arranca

### Requirement: Salud lista desde la red interna
Con el servicio en ejecución, `GET /health/ready` SHALL responder 200 cuando la base responde. Debe poder comprobarse desde la consola del propio servicio y, una vez que existe el front, desde `https://<dominio-del-front>/api/health/ready`.

#### Scenario: Salud desde la consola
- **GIVEN** el servicio `apilibreria` en ejecución
- **WHEN** se pide `http://127.0.0.1:8000/health/ready` desde la consola del servicio
- **THEN** la respuesta es 200

#### Scenario: Salud a través del front
- **GIVEN** el servicio `frontend` con `API_UPSTREAM=grupo2-elias_apilibreria:8000`
- **WHEN** se pide `https://<dominio-del-front>/api/health/ready`
- **THEN** la respuesta es 200

### Requirement: Los datos persisten entre redespliegues
Los datos del catálogo, clientes y ventas SHALL vivir en `dblibreria` y MUST seguir disponibles después de cambiar la fuente del servicio y después de cada redespliegue. El cambio de fuente MUST NOT ejecutar la carga de datos iniciales que vacía las tablas.

#### Scenario: Cambio de fuente
- **GIVEN** el catálogo tiene N libros antes de cambiar la fuente
- **WHEN** el servicio se implementa desde el monorepo
- **THEN** `GET /libros/` devuelve los mismos N libros

#### Scenario: Redespliegue (G-07)
- **GIVEN** una venta registrada antes del redespliegue
- **WHEN** se vuelve a implementar el servicio
- **THEN** esa venta sigue apareciendo en `GET /ventas/` con los mismos importes

### Requirement: CORS con el origen exacto del front desplegado
En producción, `CORS_ORIGINS` SHALL contener únicamente el origen exacto del front desplegado (`https://<dominio-del-front>`, sin barra final), y la API MUST comportarse según la capability `cors-api` con ese valor. Mientras el dominio del front no exista, la variable MUST quedar vacía (sin CORS).

#### Scenario: Origen del front
- **GIVEN** `CORS_ORIGINS=https://<dominio-del-front>`
- **WHEN** llega `GET /health/live` con `Origin: https://<dominio-del-front>`
- **THEN** la respuesta incluye `access-control-allow-origin: https://<dominio-del-front>`

#### Scenario: Otro origen
- **GIVEN** `CORS_ORIGINS=https://<dominio-del-front>`
- **WHEN** llega `GET /health/live` con `Origin: https://otro.ejemplo.com`
- **THEN** la respuesta no incluye `access-control-allow-origin`

### Requirement: Backend sin dominio público
Una vez que el front llega a la API por su proxy nginx, el servicio `apilibreria` MUST NOT tener dominio público: solo es alcanzable en la red interna del proyecto como `grupo2-elias_apilibreria:8000`. El dominio MUST NOT quitarse antes de que el front responda 200 en `/api/health/ready`.

#### Scenario: Dominio quitado
- **GIVEN** el front responde 200 en `https://<dominio-del-front>/api/health/ready`
- **WHEN** se quita el dominio automático de `apilibreria`
- **THEN** la URL pública anterior del backend deja de responder con la API y `https://<dominio-del-front>/api/libros/` sigue respondiendo 200

#### Scenario: Front todavía sin proxy
- **GIVEN** el front no responde 200 en `/api/health/ready`
- **WHEN** se evalúa quitar el dominio del backend
- **THEN** el dominio se mantiene hasta resolverlo
