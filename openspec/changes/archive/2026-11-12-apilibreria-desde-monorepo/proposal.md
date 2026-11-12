# Proposal

> C-10 de `CHANGES.md` (Ej. 5, US-5.2 · caso G-07, parte del deploy). Dueño: Elías. Issue #14. Governance **ALTO** (producción y base con datos reales del grupo): cada paso se revisa antes de tocar el panel.

## Why

El servicio `apilibreria` de Easypanel todavía se construye desde el repo del TP (`eEmanuel07/Librer-a_Prog.3_2026`, rama `despliegue`, commit `e623a77`, D-27), no desde este monorepo: no tiene el CORS de C-09 (ya mergeado en `main`) ni va a recibir ningún cambio futuro de `backend/`. La consigna del Ej. 5 pide que el backend despliegue desde el repo de la entrega, con CORS por variable de entorno y **sin dominio público** (solo red interna, el front llega por el proxy nginx). Además G-07 exige mostrar que los datos siguen tras un redespliegue (D-15).

Es un change **de operación**: no se espera tocar código. El trabajo lo hace Elías a mano en el panel de Easypanel (proyecto `grupo2-elias`, servicio `apilibreria`, base `dblibreria`); los artefactos dejan el plan, las verificaciones y el rollback.

## What Changes

- **Fase A (se puede hacer ya, C-09 está en `main`)**:
  - Inventario de solo lectura del servicio actual: repo, rama y commit desplegados, nombres de variables, dominios, y si `dblibreria` tiene datos (resuelve las dos preguntas abiertas de `10_preguntas_abiertas.md` que son de Elías).
  - Cambiar la fuente de `apilibreria` a `belcalvo93/libreria-global-programacion3`, rama `main`, Build Path `/backend`, Dockerfile `Dockerfile`; mantener `DATABASE_URL`, `SQL_ECHO` y la misma base `dblibreria`; `CORS_ORIGINS` vacía (igual al comportamiento actual).
  - Deploy y verificación: log con `alembic upgrade head` y `Uvicorn running on http://0.0.0.0:8000`, `/health/ready` = 200 desde la consola del servicio, catálogo con los mismos datos.
- **Fase B (necesita el dominio del front de C-08, Belén)**:
  - `CORS_ORIGINS=https://<dominio-del-front>`, reinicio y verificación con `curl -H "Origin: ..."` según `cors-api`.
  - Quitar el dominio público automático del backend **solo después** de que el front llegue a la API por su proxy (`API_UPSTREAM=grupo2-elias_apilibreria:8000`), para no dejar a nadie sin acceso.
  - Confirmar G-07 (redeploy y datos persistentes) y guardar la evidencia sin secretos.
- Plan de rollback: volver la fuente a `eEmanuel07/Librer-a_Prog.3_2026`, rama `despliegue`, commit `e623a77`.
- Reglas de seguridad: nunca `python -m scripts.seed` sobre la base desplegada (hace `TRUNCATE ... RESTART IDENTITY CASCADE`); nunca escribir valores de variables ni credenciales en artefactos ni evidencia (solo nombres).

## Capabilities

### New Capabilities
- `despliegue-api`: cómo queda desplegada la API en Easypanel y qué se puede comprobar desde afuera y desde la consola: se construye desde `backend/` del monorepo, aplica migraciones al arrancar, responde salud, conserva los datos entre redespliegues, aplica CORS con el origen exacto del front y no tiene dominio público.

### Modified Capabilities
<!-- Ninguna: `cors-api` no cambia (este change solo carga el valor real de CORS_ORIGINS y lo verifica contra esa spec); `cliente-http` es del front. -->

## Impact

- **Código**: ninguno. `backend/`, `frontend/`, `CHANGES.md` y `knowledge-base/` no se tocan en este change (los checkboxes de `CHANGES.md` van al archivar).
- **Infraestructura**: servicio `apilibreria` de Easypanel (fuente, variable `CORS_ORIGINS`, dominio). `dblibreria` no se toca: misma base, misma cadena de migraciones (`24071e705bcf` → `0efd84a6de03`, idéntica en el repo del TP y en `backend/migrations/`).
- **Otros integrantes**: el front de C-08 (Belén) depende de que `apilibreria` siga atendiendo en `grupo2-elias_apilibreria:8000`; la Fase B se coordina con ella. C-11 y C-12 usan la evidencia y los datos que deja este change.
- **Despliegue del TP anterior**: `backend/DEPLOY.md` documenta la URL pública del backend como evidencia del Ej. 10 del parcial (caps. 1 a 4). Cambiar la fuente y quitar el dominio deja de servir ese despliegue tal como se entregó (ver design.md, riesgos).
- **Fuera de alcance**: el servicio `frontend` (C-08), el `DEPLOY.md` de la entrega (C-12), la evidencia de G-01..G-06 (C-11) y cualquier cambio de código del backend.
