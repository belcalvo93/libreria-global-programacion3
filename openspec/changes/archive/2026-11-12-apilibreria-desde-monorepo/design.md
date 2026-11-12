# Design

## Context

Motivación en `proposal.md` (Why); comportamiento verificable en `specs/despliegue-api/spec.md`; el CORS en sí ya está especificado en `openspec/specs/cors-api/spec.md` (C-09, mergeado).

Estado actual que condiciona el enfoque:
- `apilibreria` construye desde `eEmanuel07/Librer-a_Prog.3_2026`, rama `despliegue` (D-27: commit `e623a77`). `backend/DEPLOY.md` registra como desplegado `6581fcb`; entre los dos commits solo hay documentación y evidencia, así que el comportamiento es el mismo, pero el commit real se confirma en el inventario (tarea 2).
- `backend/` del monorepo es el mismo TP (commit `7520e4c`, «API del TP (rama despliegue) en backend/») más el CORS de C-09. La cadena de migraciones es **idéntica**: `24071e705bcf` (init) → `0efd84a6de03` (género); `alembic upgrade head` sobre `dblibreria` no tiene nada nuevo que aplicar.
- El `Dockerfile` corre `alembic upgrade head && exec uvicorn ... --host 0.0.0.0 --port 8000`, con `HEALTHCHECK` sobre `/health/ready` (D-22). Sin `DATABASE_URL` o sin base, el contenedor termina con error.
- `CORS_ORIGINS` vacía o ausente = sin cabeceras CORS (spec `cors-api`), que es exactamente el comportamiento del servicio actual.
- `scripts/seed.py` hace `TRUNCATE ... RESTART IDENTITY CASCADE` de todas las tablas antes de cargar.
- Hoy el backend tiene dominio público (`grupo2-elias-apilibreria.ugpvou.easypanel.host`, KB 12) apuntando al puerto 8000; la consigna pide dejarlo solo en red interna.
- El dominio del front lo define Belén en C-08 y sigue TBD.

## Goals / Non-Goals

**Goals:**
- `apilibreria` construyendo desde `main` del monorepo, sin cortar el servicio más que el tiempo de una implementación y sin tocar los datos.
- Desacoplar de C-08 todo lo que se pueda: la Fase A no necesita el dominio del front.
- Cada paso con una verificación observable (log, URL, comando) antes y después, y un rollback de un paso.
- Evidencia de G-07 sin secretos.

**Non-Goals:**
- Cambios de código en `backend/` (si una verificación falla por código, se abre otro change).
- Crear o configurar el servicio `frontend` (C-08) ni escribir el `DEPLOY.md` de la entrega (C-12).
- Recargar datos iniciales o limpiar la base.
- Automatizar el despliegue (webhooks, auto-deploy).

## Decisions

1. **Sin Strict TDD: verificación antes / después.** No hay código de producción que escribir, así que RED/GREEN no aplica. Cada tarea de `tasks.md` define qué se observa **antes** (estado esperado de partida, sirve de red de seguridad como el *safety net*) y qué se observa **después** (criterio de aceptación tomado de `despliegue-api` o `cors-api`). Si el «antes» no coincide, se frena y se reporta, igual que una falla preexistente.
2. **Dos fases, la A independiente de C-08.** Fase A: inventario + cambio de fuente con `CORS_ORIGINS` vacía. Como vacía equivale al comportamiento actual, el cambio de fuente es observablemente neutro y se puede hacer ahora que C-09 está en `main`. Fase B: cargar el origen real, verificar CORS y quitar el dominio, con el dato de C-08. Alternativa descartada: hacer todo junto el viernes a la noche (concentra el riesgo en la misma ventana que el deploy del front).
3. **Inventario de solo lectura primero.** Antes de cambiar nada se registran: repo/rama/commit actuales, nombres de las variables (nunca valores), dominios y puertos, y el estado de los datos (`GET /libros/`, `GET /clientes/1`, `GET /ventas/` por la URL pública que todavía existe). Esto resuelve dos preguntas abiertas de `10_preguntas_abiertas.md` (datos en la base desplegada y dominio automático) y deja la «foto antes» contra la que se compara todo lo demás.
4. **Mismas variables, misma base.** Solo se cambian los campos de origen (repo, rama, Build Path, builder). `DATABASE_URL` y `SQL_ECHO` no se reescriben: se verifica que sigan presentes por nombre. Se agrega `CORS_ORIGINS` vacía en la Fase A para dejar la variable visible en el panel.
5. **La URL pública del backend se usa para verificar y se quita al final.** Mientras exista, sirve para comparar el catálogo antes/después desde afuera. Se quita solo cuando `https://<dominio-del-front>/api/health/ready` = 200 (el front ya llega por `API_UPSTREAM=grupo2-elias_apilibreria:8000`); así nunca queda la API sin ningún acceso. Después, las verificaciones de la API se hacen por el front o por la consola del servicio.
6. **Verificación de CORS con `curl` desde afuera… y por la consola.** Con el dominio del backend todavía puesto, `curl -i -H "Origin: https://<dominio-del-front>" https://<dominio-backend>/health/live`. Después de quitarlo, la misma prueba desde la consola del servicio con Python (`urllib.request` con cabecera `Origin` contra `127.0.0.1:8000`), porque la imagen Alpine no trae `curl`. Pasar por `/api/` del front no sirve para probar CORS: es mismo origen.
7. **Rollback = volver la fuente atrás.** Repo `eEmanuel07/Librer-a_Prog.3_2026`, rama `despliegue`, commit `e623a77`, Build Path `/` y Dockerfile `Dockerfile`, e Implementar. La base no se toca en ningún paso, así que el rollback no necesita restaurar datos (las migraciones son las mismas). Si el problema es solo el dominio, se vuelve a agregar apuntando al puerto 8000 (lección de `backend/DEPLOY.md`: con el 80 da 502).
8. **Reglas de seguridad durante la operación.** Nunca `python -m scripts.seed` en la consola del servicio (vacía las tablas; aviso de KB 13). Nunca copiar valores de variables, contraseñas ni la URL de conexión en artefactos, issues o evidencia: solo nombres. Las capturas del panel de entorno se toman con los valores ocultos o recortados.
9. **Coordinación antes de empezar.** El roadmap ubica C-10 el viernes 13 a la noche; la Fase A se adelanta. Por la regla del proyecto (no adelantar sin avisar), lo primero es avisar en la issue #14 y en el grupo, incluida Belén (su front depende del nombre interno del servicio).

## Risks / Trade-offs

- [El build desde `/backend` falla (Build Path mal escrito, `COPY` sin archivos)] → el contenedor viejo sigue hasta que la nueva implementación termina bien; si no, rollback (decisión 7). Diagnóstico de KB 12: revisar Build Path y nombres exactos.
- [El servicio arranca pero `/health/ready` da 503] → revisar en el log `DATABASE_URL` y la conexión a `dblibreria`; las variables no cambiaron, así que es el primer indicio para hacer rollback.
- [Alguien corre el seed sobre la base desplegada] → pierde todos los datos de prueba del grupo y los de G-01..G-06. Mitigación: regla explícita en `tasks.md` y en el aviso al grupo; no hay backup automático (riesgo aceptado, ver Open Questions).
- [`CORS_ORIGINS` con barra final o `http` en lugar de `https`] → no coincide nunca y el CORS queda apagado sin error en el servidor; lo detecta la verificación con `Origin` de la Fase B.
- [Quitar el dominio antes de que el front funcione] → la API queda sin acceso externo para diagnosticar. Mitigación: la condición de la decisión 5 es un *gate* de la tarea.
- [**Despliegue del TP anterior**] → `backend/DEPLOY.md` presenta la URL pública de `apilibreria` como el despliegue del Ej. 10 del parcial (caps. 1 a 4), «en línea hasta que se publiquen las notas», construido desde la rama `despliegue` tal como se entregó. Cambiar la fuente y, sobre todo, quitar el dominio deja de servir ese despliegue. D-15 decide reutilizar `apilibreria`; hay que confirmar que las notas de ese parcial ya no dependen de la URL (ver Open Questions).
- [Commit registrado distinto del real (`e623a77` en la KB, `6581fcb` en `backend/DEPLOY.md`)] → el inventario lo confirma desde el historial de implementaciones; el rollback usa el commit `e623a77` (cabeza de `despliegue`, mismo código que `6581fcb`).

## Migration Plan

1. Avisar al grupo (issue #14 + chat).
2. Fase A: inventario → cambio de fuente con `CORS_ORIGINS` vacía → Implementar → verificar log, salud y catálogo contra la foto del inventario.
3. Esperar el dominio del front (C-08).
4. Fase B: cargar `CORS_ORIGINS` → reiniciar → verificar CORS → verificar el front por el proxy → quitar el dominio del backend → verificar que el front sigue → redeploy y G-07 → evidencia.
5. Rollback en cualquier punto: decisión 7.

## Open Questions

- ¿La base desplegada tiene datos de pruebas del grupo? → la resuelve la tarea de inventario (Fase A), con el conteo de libros, clientes y ventas.
- ¿El backend conserva su dominio público automático? → la resuelve el inventario; hoy KB 12 dice que sí.
- Dominio del front para `CORS_ORIGINS`: TBD hasta C-08 (Belén). Bloquea solo la Fase B.
- ¿Las notas del parcial (caps. 1 a 4, Ej. 10) ya se publicaron, o la cátedra todavía necesita la URL pública del despliegue del TP? Si la necesita, quitar el dominio o cambiar la fuente se coordina antes con el grupo y el profesor.
- ¿Hace falta un respaldo de `dblibreria` antes de la Fase A (por ejemplo un `pg_dump` desde la consola del Postgres)? No es necesario para este change porque la base no se toca, pero bajaría el riesgo del seed accidental.
