# Decisiones y Supuestos

## Decisiones de diseño y de proceso
| ID | Decisión | Motivo / consecuencia |
|----|----------|-----------------------|
| D-01 | Monorepo (`frontend/` + `backend/`) en `belcalvo93/libreria-global-programacion3` | Un solo repo para el ZIP y para Easypanel con Build Path `/frontend` y `/backend` |
| D-02 | nginx sirve `public/` y reenvía `/api/` al backend; el front usa siempre `/api/...` | Un solo origen, sin exponer el backend; la dirección interna se configura en `API_UPSTREAM` |
| D-03 | Un único cliente HTTP, `js/api.js`, con base `/api` y errores en español | Reutilización y manejo uniforme de 404/409/422/red |
| D-04 | Scripts clásicos con IIFE, `var`, `"use strict"`; comunicación por funciones en `window` | Convención del parcial; sin módulos, sin librerías |
| D-05 | Autores y clientes se buscan por ID (`GET /autores/{id}`, `GET /clientes/{id}`) | La API no tiene listados; hay que documentarlo en el README (consigna: «documentá qué opción elegiste») |
| D-06 | Para selects se usa `GET /editoriales/` y `GET /generos/` con `limit=100` | Son listados paginados (RN-10); con el límite por defecto (20) podrían quedar opciones afuera |
| D-07 | `PATCH /libros/{id}` se usa solo para el caso G-05 (cambio de precio) | El resto de los PATCH no se consume |
| D-08 | El front muestra siempre los importes de la respuesta de la API, nunca los recalcula | Precio histórico (RN-06) |
| D-09 | El borrador de la venta vive solo en memoria; no hay `localStorage` para datos | Consigna |
| D-10 | Política de diseño **light**: no se crea un sistema de diseño ni mockups por cambio; se reutiliza el CSS del parcial (`css/styles.css`) y las variables de `:root` | Decisión del grupo. En el estado del orquestador (`.active-orchestrator-state.json`) es `visual_design.mode: system-only`, revisión 1 (ver D-26) |
| D-11 | Reparto por integrante: B Belén, H Hernán, R Bruno, J Joaquín, E Elías (detalle en `03_actores_y_roles.md`) | Cada uno toca solo su archivo JS y su sección del HTML para evitar conflictos |
| D-12 | Imagen del front (Dockerfile, `.dockerignore`, `default.conf.template`) **hecha y mergeada** (PR #1) | — |
| D-13 | `js/api.js` está en la rama `feat/api-cliente` **sin PR (en revisión)**. Tras mergear el PR de la fundación, Belén hace su change retroactivo (propose/archive) y su PR: es lo primero del miércoles 11 | Bloquea a Bruno y Joaquín (lo usan); orden: `api.js` primero |
| D-14 | Belén despliega el servicio `frontend` en Easypanel, escribe `DEPLOY.md`, hace estante y estética (después del catálogo de Hernán) | Ajuste de reparto decidido |
| D-15 | Elías hace CORS en el backend, cambia `apilibreria` para construirse desde este repo (`/backend`), junta evidencia y arma el ZIP | Ajuste de reparto decidido |
| D-16 | `datos.js` y `persistencia.js` no se borran hasta la tarea final de limpieza de Belén (depende de H, R y J mergeados) | Evita romper secciones que aún dependen de `DATOS` |
| D-17 | Flujo de ramas: `feat/<tarea>` desde `main` actualizado → PR → revisión de otro integrante → **merge común** («Create a merge commit»), nunca squash | Convención del grupo |
| D-18 | Commits en español, uno por idea, con prefijo `feat(...)`, `fix(...)`, `docs(...)`, `chore(...)` | Convención |
| D-19 | **Sin atribución de IA** en commits ni PR (nada de `Co-Authored-By`, `Claude-Session` ni «Generated with ...») | Convención del grupo |
| D-20 | Cada cambio pasa por OpenSpec: `/opsx:propose` → `/opsx:apply` → prueba manual → `/opsx:archive` **antes** del PR | Flujo del grupo |
| D-21 | Para correr en local se usa una base aparte `libreria_tp` (la base `libreria` del contenedor del parcial tiene otras migraciones y choca) | Evita conflictos de migración |
| D-22 | Backend con `python:3.12-alpine` + usuario `app` + `HEALTHCHECK` + `alembic upgrade head` al arrancar | Heredado del TP (`backend/DEPLOY.md`); la consigna da un ejemplo con `python:3.12-slim` y CMD equivalente |
| D-23 | C-07 (limpieza de `datos.js` y `persistencia.js`) se mergea **antes** del deploy final del viernes 13 a la noche. Si se atrasa, se redespliega el sábado | En Easypanel redesplegar es un clic; C-07 no cambia comportamiento. Resuelve la pregunta abierta sobre el orden C-07 vs. deploy |
| D-24 | «Al menos un autor» lo valida el **front** (Bruno, C-04), antes del `POST /libros/` | Lo pide la consigna del Ej. 2. El backend no lo exige (`LibroCreate.autores` sin `min_length`, I-01); un `min_length=1` en el back queda como opcional de Elías |
| D-25 | Alcance de «estante y estética» (C-06, Belén, después del catálogo de Hernán): sección propia con un estante de libros cuyos lomos salen del catálogo de la API (al pasar el cursor se levantan; al clic abren `GET /libros/{id}`), etiquetas de navegación arriba del estante (similar a un menú) y paleta «librería mágica» en variables de `:root` (valores TBD). La tabla del catálogo se mantiene | Cierra la pregunta de alcance. Posibles `img/` o recursos locales: (TBD) |
| D-26 | Design-system aprobado por el usuario el 2026-11-10: `Mode: system-only`, `Revision: 1`, `Approval: approved`; `visual_design.status: approved` en `.active-orchestrator-state.json` | Política light (ver D-10). La paleta nueva de C-06 subirá la revisión y pedirá nueva aprobación |
| D-27 | `apilibreria` hoy despliega desde `eEmanuel07/Librer-a_Prog.3_2026`, rama `despliegue`, commit `e623a77`. Cuando Elías lo pase a este repo, desplegará desde `main` con Build Path `/backend` | Reemplaza los TBD de rama y commit en `12_despliegue_easypanel.md` y C-10 |
| D-28 | Formato de `CORS_ORIGINS`: una o varias URL de origen exacto (esquema + host, sin barra final) separadas por coma. Local: `http://127.0.0.1:8080,http://localhost:8080`; Easypanel: `https://<dominio-del-front>`. En el back: `os.getenv("CORS_ORIGINS", "").split(",")`, quitando espacios y vacíos | Cierra el TBD de formato. El dominio concreto sigue dependiendo de C-08 |
| D-29 | El servicio `frontend` de Easypanel (C-08) despliega desde la rama `main` de este repo, Build Path `/frontend` | Cierra el TBD de rama |

## Supuestos inferidos
- **Suposición:** el corrector no ejecuta el código; evalúa «funcionamiento observado» desde la URL pública (consigna + contexto del grupo).
- **Suposición:** el proyecto Easypanel es `grupo2-elias`, el backend es `apilibreria` (puerto 8000) y su nombre interno es `grupo2-elias_apilibreria` (del contexto del grupo y de `frontend/env.example`).
- **Suposición:** el aviso de comprobante del backend es solo un log (no hay integración de mail).
- **Suposición:** los códigos `RN-xx` del backend corresponden al TP original; su texto completo no está en este repo.
- **Suposición:** el número de página siguiente se infiere por «llegaron `limit` elementos» porque la API no devuelve totales.
- **Suposición:** las fechas son de 2026 (la fecha de las convenciones coincide con los commits del repo).
