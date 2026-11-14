# Design

## Context

El contenedor del frontend (`frontend/Dockerfile`, basado en `nginx:1.30-alpine`) copia `public/` en `/usr/share/nginx/html/` y `nginx/default.conf.template` en `/etc/nginx/templates/default.conf.template`. Al iniciar, el entrypoint oficial de nginx ejecuta `envsubst '${API_UPSTREAM}'` y deja configurado el proxy reverso de `/api/` hacia `http://${API_UPSTREAM}/`.

En Easypanel (proyecto `grupo2-elias`):
- El servicio `apilibreria` corre en la red interna en el puerto `8000` (sin dominio público tras C-10).
- El servicio `frontend` construye desde `belcalvo93/libreria-global-programacion3`, rama `main`, Build Path `/frontend`, y expone por HTTPS el dominio `https://grupo2-elias-frontend.ugpvou.easypanel.host/` apuntando al puerto interno `80`.

## Goals / Non-Goals

**Goals:**
- Verificar que la imagen del frontend se construye sin errores en Easypanel desde `/frontend`.
- Confirmar que la URL pública responde `200 OK` por HTTPS y que `/api/health/ready` responde `200 OK` (`{"estado":"listo","base":"ok"}`) a través del proxy reverso nginx.
- Registrar la evidencia de G-07 del frontend en `evidencia/` sin exponer tokens de webhook, direcciones privadas de administración ni valores sensibles.

**Non-Goals:**
- Modificar `frontend/Dockerfile` o `frontend/nginx/default.conf.template` (ya cerrados en C-01 y C-06).
- Tocar la base de datos `dblibreria` o ejecutar `scripts.seed` en producción.

## Decisions

1. **Change operativo retroactivo (mismo patrón que C-10).** No se modifica código de producción; cada tarea registra la verificación observable en Easypanel y desde la URL pública HTTPS.
2. **Recorte de datos sensibles en capturas del panel.** La vista de implementaciones de Easypanel incluye un bloque inferior «Activación de implementación» con una URL de webhook y la barra del navegador con la IP/puerto del panel. Las capturas `G-07_frontend_deployments.png` y `G-07_frontend_build_log.png` se guardan recortando esos elementos, siguiendo el mismo criterio aplicado en `G-07_deployments.png` del backend.
3. **Verificación doble (navegador + `curl`).** Se documenta tanto la captura en Chrome con DevTools (`Network` + `Console`) como la salida de `curl -sI` y `curl -si` en `evidencia/G-07_frontend_c08.txt`.

## Risks / Trade-offs

- [Exposición accidental del token de webhook de deploy en la captura de Implementaciones] → Mitigado recortando el bloque «Activación de implementación» antes de versionar `G-07_frontend_deployments.png`.
- [Desfase entre el código de `main` y el contenedor desplegado] → El servicio se reimplementó tras mergear los PRs #26 a #29 (commit `4af13ed`), quedando alineado con el frontend final.
