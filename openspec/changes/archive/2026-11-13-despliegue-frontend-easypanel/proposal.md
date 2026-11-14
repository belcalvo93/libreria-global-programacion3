# Proposal

> C-08 de `CHANGES.md` (Ej. 5, US-5.3 · caso G-07, imagen y despliegue del frontend). Dueña original: Belén (evidencia y cierre completados con Hernán). Issue #12. Governance **ALTO** (infraestructura de producción en Easypanel).

## Why

La consigna del Ejercicio 5 y el caso de prueba G-07 exigen desplegar el frontend en contenedores detrás de nginx en Easypanel (proyecto `grupo2-elias`), sirviendo los archivos estáticos por HTTPS desde un dominio público y reenviando `/api/` a la API interna (`apilibreria:8000`) mediante la variable `API_UPSTREAM`, de modo que el navegador hable con un único origen y `/api/health/ready` responda `200 OK`.

Es un change **de operación y verificación** (como C-10): la imagen y la plantilla de nginx ya fueron definidas en C-01 (`frontend/Dockerfile` y `frontend/nginx/default.conf.template`), y la limpieza final del frontend entró en C-07 y C-06f..h. Este change documenta la configuración del servicio `frontend` en Easypanel, verifica el build de la imagen y la respuesta de `/api/health/ready` por HTTPS, y deja la evidencia de G-07 del frontend en `evidencia/`.

## What Changes

- Servicio App `frontend` en Easypanel (`grupo2-elias`):
  - Fuente: repositorio `belcalvo93/libreria-global-programacion3`, rama `main`, Build Path `/frontend`, builder Dockerfile (`Dockerfile`).
  - Variable de entorno (por nombre, sin exponer secretos): `API_UPSTREAM` apuntando al servicio interno `apilibreria` en el puerto `8000`.
  - Dominio público HTTPS `https://grupo2-elias-frontend.ugpvou.easypanel.host/` hacia el puerto interno `80` del contenedor nginx.
- Redeploy final con `main` actualizado (incluyendo C-07 y los ajustes visuales hasta PR #29, commit `4af13ed`).
- Evidencia de G-07 del frontend en `evidencia/`:
  - `evidencia/G-07_frontend_c08.txt`: informe técnico con la configuración sin secretos, etapas del build y salidas de `curl` a `/` y `/api/health/ready`.
  - `evidencia/G-07_frontend_https_health.png`: captura de la aplicación por HTTPS y petición `GET /api/health/ready` devolviendo `200 OK` (`{"estado":"listo","base":"ok"}`).
  - `evidencia/G-07_frontend_deployments.png`: historial de implementaciones exitosas del servicio `frontend` en Easypanel.
  - `evidencia/G-07_frontend_build_log.png`: log de construcción de la imagen Docker (`nginx:1.30-alpine`, `COPY public/`, `COPY default.conf.template`, `Success`).

## Capabilities

### New Capabilities
- `despliegue-frontend`: cómo queda desplegado el servicio `frontend` en Easypanel y qué se comprueba desde afuera y en el panel: construcción de la imagen desde `/frontend`, acceso público por HTTPS y proxy reverso `/api/` hacia el backend interno con `/api/health/ready` = 200.

### Modified Capabilities
<!-- Ninguna -->

## Impact

- **Código**: ninguno en `frontend/` ni `backend/`.
- **Infraestructura**: servicio `frontend` en el proyecto `grupo2-elias` de Easypanel, acoplado por red interna con `apilibreria` y cuyo origen alimenta `CORS_ORIGINS` en C-10.
- **Evidencia y documentación**: agrega `evidencia/G-07_frontend_*` para C-11 y cierra C-08 en `CHANGES.md`.
