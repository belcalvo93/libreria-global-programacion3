## ADDED Requirements

### Requirement: El frontend se construye desde el monorepo con nginx
El servicio `frontend` del proyecto `grupo2-elias` SHALL construirse desde el repositorio de la entrega (`belcalvo93/libreria-global-programacion3`), rama `main`, con Build Path `/frontend` y el `Dockerfile` basado en `nginx:1.30-alpine`. El log de construcción MUST mostrar la copia de `public/` y `default.conf.template` y finalizar con éxito (`### Success`).

#### Scenario: Construcción de la imagen en Easypanel
- **GIVEN** el servicio `frontend` configurado con Build Path `/frontend` y builder Dockerfile
- **WHEN** se ejecuta la implementación desde `main`
- **THEN** el log del build ejecuta `COPY public/ /usr/share/nginx/html/` y `COPY default.conf.template /etc/nginx/templates/default.conf.template`, exporta la imagen `docker.io/easypanel/grupo2-elias/frontend:latest` y finaliza con `### Success`

### Requirement: Acceso público por HTTPS y proxy reverso a la API interna
El servicio `frontend` SHALL exponer un dominio público HTTPS apuntando al puerto interno `80` de nginx y reenviar el prefijo `/api/` hacia el servicio interno `apilibreria` configurado mediante `API_UPSTREAM`. `GET /api/health/ready` sobre el dominio HTTPS del frontend MUST responder `200 OK` con `{"estado":"listo","base":"ok"}`.

#### Scenario: Apertura del frontend por HTTPS
- **GIVEN** el servicio `frontend` en ejecución con dominio `https://grupo2-elias-frontend.ugpvou.easypanel.host/`
- **WHEN** un cliente solicita `GET https://grupo2-elias-frontend.ugpvou.easypanel.host/`
- **THEN** nginx responde `200 OK` con `Content-Type: text/html` sirviendo la interfaz de la librería

#### Scenario: Salud de la API a través del proxy reverso (G-07)
- **GIVEN** `API_UPSTREAM=grupo2-elias_apilibreria:8000` en el servicio `frontend`
- **WHEN** se solicita `GET https://grupo2-elias-frontend.ugpvou.easypanel.host/api/health/ready`
- **THEN** la respuesta es `200 OK` con cuerpo JSON `{"estado":"listo","base":"ok"}`
