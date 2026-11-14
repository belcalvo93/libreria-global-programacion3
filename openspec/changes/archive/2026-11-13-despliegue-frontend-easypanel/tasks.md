# Tasks

> Change de operación y evidencia sobre el servicio `frontend` en Easypanel (`grupo2-elias`). **Strict TDD no aplica** (no hay cambios de código).
>
> Reglas de seguridad:
> - **NUNCA** correr `python -m scripts.seed` en producción.
> - **NUNCA** incluir tokens de webhook ni valores secretos en las capturas o archivos de `evidencia/`.

## 1. Configuración y despliegue del servicio `frontend` en Easypanel

- [x] 1.1 Configurar en el proyecto `grupo2-elias` el servicio App `frontend` con fuente GitHub `belcalvo93/libreria-global-programacion3`, rama `main`, Build Path `/frontend` y builder Dockerfile (`Dockerfile`).
- [x] 1.2 Declarar la variable de entorno `API_UPSTREAM` apuntando al servicio interno `apilibreria` en el puerto `8000` (sin esquema ni barra final) y el dominio HTTPS `https://grupo2-elias-frontend.ugpvou.easypanel.host/` hacia el puerto interno `80`.
- [x] 1.3 Redesplegar el servicio con los cambios finales del frontend mergeados en `main` (PRs #26 a #29, commit `4af13ed`) y verificar en el log del build las etapas `FROM nginx:1.30-alpine`, `COPY public/ /usr/share/nginx/html/`, `COPY default.conf.template /etc/nginx/templates/default.conf.template` y `### Success`.

## 2. Verificación por HTTPS y evidencia de G-07

- [x] 2.1 Comprobar que `https://grupo2-elias-frontend.ugpvou.easypanel.host/` abre por HTTPS (`200 OK`, `Server: nginx/1.30.6`) y que `GET https://grupo2-elias-frontend.ugpvou.easypanel.host/api/health/ready` devuelve `200 OK` con `{"estado":"listo","base":"ok"}`.
- [x] 2.2 Guardar en `evidencia/` las capturas sin secretos (`G-07_frontend_https_health.png`, `G-07_frontend_deployments.png`, `G-07_frontend_build_log.png`) y el informe técnico `G-07_frontend_c08.txt`.
- [x] 2.3 Marcar `[x]` en `C-08` (y `C-11`) dentro de `CHANGES.md` y validar con `openspec validate --strict --all`.
