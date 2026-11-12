# Tasks

> Change de operación: lo ejecuta Elías a mano en Easypanel (proyecto `grupo2-elias`, servicio `apilibreria`, base `dblibreria`). **Strict TDD no aplica** (no hay código): cada tarea dice qué verificar **antes** y **después** (design, decisión 1); si el «antes» no coincide, se frena y se reporta. Governance ALTO: revisar `design.md` antes del grupo 3.
>
> Reglas durante todo el change:
> - **NUNCA** correr `python -m scripts.seed` en la consola de `apilibreria` (hace `TRUNCATE` de todas las tablas).
> - **NUNCA** escribir valores de variables, contraseñas ni la URL de conexión en artefactos, issues, chat o evidencia: solo **nombres**. Capturas del panel de entorno con los valores ocultos o recortados.
> - Rollback en cualquier paso: tarea 6.1.
> - `<dominio-backend>` = dominio público actual de `apilibreria` (KB 12); `<dominio-del-front>` = el que pase Belén (C-08).

## 1. Coordinación

- [x] 1.1 Avisar en la issue #14 y en el grupo que se adelanta la Fase A (antes del viernes 13 a la noche), que el servicio se reimplementa una vez sin cambiar su nombre interno (`grupo2-elias_apilibreria:8000`) ni la base, y que nadie corra el seed en la base desplegada. Verificar: el comentario quedó publicado en #14 y Belén lo leyó (su front depende del nombre interno)

## 2. Fase A — Inventario (solo lectura)

- [x] 2.1 En el panel de `apilibreria`, anotar la fuente actual: repo, rama, Build Path, builder y el commit de la última implementación (historial). Verificar: coincide con `eEmanuel07/Librer-a_Prog.3_2026` / `despliegue`; anotar si el commit es `e623a77` o `6581fcb` (design, riesgos)
  - Resultado (2026-11-12): GitHub `eEmanuel07/Librer-a_Prog.3_2026`, rama `despliegue`, Build Path `/`, builder Dockerfile (archivo por defecto). Última implementación: «Merge pull request #74» = `6581fcb` (no `e623a77`; entre ambos solo cambian docs y evidencia). Rollback: volver a la rama `despliegue`.
- [x] 2.2 Anotar los **nombres** de las variables de entorno del servicio (sin valores). Verificar: están `DATABASE_URL` y `SQL_ECHO`; `CORS_ORIGINS` no existe todavía
  - Resultado: `DATABASE_URL`, `SQL_ECHO`; no existe `CORS_ORIGINS`. Además hay una línea suelta que no es variable (una URL de conexión): se decide con el grupo si se borra.
- [x] 2.3 Anotar dominios y puertos del servicio. Verificar: existe el dominio público automático apuntando al puerto 8000 (resuelve la pregunta abierta «¿el backend conserva su dominio público?»)
  - Resultado: un solo dominio, `https://grupo2-elias-apilibreria.ugpvou.easypanel.host` → `http://grupo2-elias_apilibreria` (interno). En el proyecto todavía no existe el servicio `frontend`.
- [x] 2.4 Foto de datos desde afuera: `curl -s https://<dominio-backend>/health/ready` → 200 con `{"estado":"listo","base":"ok"}`; contar los elementos de `GET /libros/?limit=100`, `GET /ventas/` y anotar `GET /clientes/1` (solo el id y que existe, sin datos personales). Verificar: anotados los tres conteos (resuelve la pregunta abierta «¿la base desplegada tiene datos?»). Si la base está vacía, **no** cargar el seed por cuenta propia: frenar y decidirlo con el grupo
  - Resultado (2026-11-11 y 12): `/health/ready` 200 `{"estado":"listo","base":"ok"}`; 6 libros, 2 ventas, cliente 1 existe; sin cabeceras CORS (preflight 405).
- [x] 2.5 Confirmar que `main` incluye C-09: `git fetch` y `git log origin/main --oneline -- backend/app/main.py` muestra `feat(backend): CORS con orígenes exactos desde CORS_ORIGINS`). Verificar: el commit de `main` a desplegar está anotado

## 3. Fase A — Cambio de fuente

- [x] 3.1 Antes: tener a mano los datos de 2.1 para el rollback. En el servicio, cambiar Source a repo `belcalvo93/libreria-global-programacion3`, rama `main`, Build Path `/backend`, builder Dockerfile, archivo `Dockerfile` (sin tocar Domains ni el resto de Environment). Verificar: la pantalla de origen muestra exactamente esos cuatro valores
- [x] 3.2 Agregar la variable `CORS_ORIGINS` vacía. Verificar: en Environment están `DATABASE_URL`, `SQL_ECHO` y `CORS_ORIGINS` (por nombre), y los dos primeros no cambiaron
- [x] 3.3 Implementar (Deploy). Verificar en el log del build: `FROM python:3.12-alpine`, `COPY requirements.txt` y `COPY . .` sin errores; en el log del contenedor: la ejecución de `alembic upgrade head` (sin migraciones nuevas: la cadena es la misma) y `Uvicorn running on http://0.0.0.0:8000`. Si falla: diagnóstico de KB 12 y, si no se resuelve rápido, rollback 6.1
- [x] 3.4 Consola del servicio: `python -c "from urllib.request import urlopen; print(urlopen('http://127.0.0.1:8000/health/ready').status)"`. Verificar: imprime `200`
- [x] 3.5 Repetir la foto de 2.4 por `https://<dominio-backend>`. Verificar: mismos conteos de libros, ventas y el cliente 1 existe (requisito «Los datos persisten entre redespliegues», escenario «Cambio de fuente»); el historial muestra el commit de `main` anotado en 2.5
- [x] 3.6 Verificar CORS apagado: `curl -si -H "Origin: https://otro.ejemplo.com" https://<dominio-backend>/health/live`. Verificar: 200 y sin `access-control-allow-origin` (spec `cors-api`, «Sin orígenes configurados no hay CORS»)
  - Resultado Fase A (2026-11-12, 13:10 GMT): fuente `belcalvo93/libreria-global-programacion3` / `main` / `/backend` / Dockerfile; `CORS_ORIGINS` agregada vacía. Build «Success» desde `python:3.12-alpine`, commit «Merge pull request #19» (`391bb61`, incluye C-09). Log: alembic `Context impl PostgresqlImpl` (sin migraciones nuevas) y `Uvicorn running on http://0.0.0.0:8000`; los healthchecks internos `GET /health/ready` dan 200 (cubre 3.4). Desde afuera: salud 200, 6 libros, 2 ventas, cliente 1 existe; sin cabeceras CORS y preflight 405.
- [x] 3.7 Comentar en #14 el resultado de la Fase A (commit desplegado, conteos, salud 200), sin valores de variables

## 4. Fase B — CORS con el dominio del front (requiere C-08)

- [x] 4.1 Antes: recibir de Belén el dominio exacto del front y confirmar que `https://<dominio-del-front>/api/health/ready` responde 200. Cargar `CORS_ORIGINS=https://<dominio-del-front>` (esquema + host, sin barra final, sin espacios) y reiniciar/implementar el servicio. Verificar: el log vuelve a mostrar `Uvicorn running on http://0.0.0.0:8000`
- [x] 4.2 `curl -si -H "Origin: https://<dominio-del-front>" https://<dominio-backend>/health/live`. Verificar: `access-control-allow-origin: https://<dominio-del-front>` y nunca `*` (escenario «Origen del front»)
- [x] 4.3 `curl -si -H "Origin: https://otro.ejemplo.com" https://<dominio-backend>/health/live`. Verificar: sin `access-control-allow-origin` (escenario «Otro origen»)
- [x] 4.4 Preflight: `curl -si -X OPTIONS -H "Origin: https://<dominio-del-front>" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type" https://<dominio-backend>/libros/`. Verificar: 200 y `access-control-allow-methods` contiene `POST` y `PATCH`, sin `access-control-allow-credentials: true` (spec `cors-api`)

## 5. Fase B — Backend solo en red interna y G-07

- [x] 5.1 Gate antes de quitar el dominio: `https://<dominio-del-front>/api/health/ready` → 200 y `https://<dominio-del-front>/api/libros/` → 200 con el catálogo (el front llega por `API_UPSTREAM=grupo2-elias_apilibreria:8000`). Si no, **no** seguir: resolver con Belén (escenario «Front todavía sin proxy»)
- [x] 5.2 Quitar el dominio automático de `apilibreria`. Verificar: `https://<dominio-backend>/health/ready` ya no responde con la API, y `https://<dominio-del-front>/api/libros/` sigue en 200 (escenario «Dominio quitado»)
- [x] 5.3 Repetir 4.2 y 4.3 desde la consola del servicio (sin `curl` en Alpine): `python -c "from urllib.request import Request, urlopen; r=urlopen(Request('http://127.0.0.1:8000/health/live', headers={'Origin':'https://<dominio-del-front>'})); print(r.status, r.headers.get('access-control-allow-origin'))"`. Verificar: `200 https://<dominio-del-front>`; con otro `Origin`: `200 None`
- [x] 5.4 G-07: anotar una venta existente (`GET /api/ventas/` por el front: id y total), Implementar otra vez el servicio y repetir. Verificar: la misma venta sigue con los mismos importes y los conteos de 2.4 se mantienen o solo crecieron por pruebas del grupo (escenario «Redespliegue (G-07)»)
  - Resultado Fase B (2026-11-12): `CORS_ORIGINS` con el dominio del front y redeploy; CORS OK desde afuera (front con su origen, otro sin cabecera, preflight 200 sin credenciales); front `/api/health/ready` y `/api/libros/` 200; dominio público quitado (404); CORS OK desde la consola; G-07 OK (6 libros, ventas 1 = 50000.00 y 2 = 77000.00, cliente 1, iguales antes y después del redeploy). Evidencia en texto: `evidencia/G-07_backend_c10.txt`; faltan capturas del panel.
- [x] 5.5 Evidencia sin secretos, nombrada `G-07_...` y entregada para C-11: log con `alembic upgrade head` + `Uvicorn running`, salud 200 desde la consola, salida de las pruebas CORS, panel de Domains sin dominio, historial con el commit de `main`, y venta antes/después del redeploy. Verificar: ninguna captura muestra valores de variables ni contraseñas
- [x] 5.6 Comentar en #14 el cierre (commit desplegado, origen CORS cargado por nombre de variable, dominio quitado, G-07 ok) y pasarle a Belén los datos para C-12 (`DEPLOY.md`): Build Path, puerto, nombres de variables, commit

## 6. Rollback (solo si algo falla)

- [x] 6.1 (no aplicó: no hizo falta rollback) Volver Source a repo `eEmanuel07/Librer-a_Prog.3_2026`, rama `despliegue`, commit `e623a77`, Build Path `/`, Dockerfile `Dockerfile`, e Implementar; si se había quitado el dominio y hace falta diagnosticar, volver a agregarlo con puerto 8000. Verificar: log con `Uvicorn running`, `/health/ready` = 200 y los conteos de 2.4. Avisar en #14. (Marcar como no aplicable si no hizo falta)

## Workflow follow-up

- Revisión de Governance ALTO: Elías revisa `design.md` y el orden de las fases antes de tocar el panel.
- Al archivar (`/opsx:archive apilibreria-desde-monorepo`): marcar `[x]` en C-10 de `CHANGES.md` y pasar a «Resueltas» en `knowledge-base/10_preguntas_abiertas.md` las preguntas de datos en la base y dominio automático, con lo que dio el inventario.
- En esta misma rama, por separado: C-09 ya está mergeado (PR #18), así que en `CHANGES.md` pasa de `[~]` a `[x]` (estado y tabla).
- Actualizar en `knowledge-base/12_despliegue_easypanel.md` la fila de `apilibreria` (fuente nueva, sin dominio) y la «URL de referencia» del Swagger público, que deja de existir.
