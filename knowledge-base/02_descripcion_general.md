# Descripción General

## Stack tecnológico
| Capa | Tecnologías | Versión / nota |
|------|-------------|----------------|
| Frontend | HTML, CSS y JavaScript nativos (scripts clásicos, sin módulos, sin librerías, sin CDN, sin npm) | — |
| Servidor web / proxy | nginx | imagen `nginx:1.30-alpine` |
| Contenedores | Docker | `frontend/Dockerfile` (nginx) y `backend/Dockerfile` |
| API | FastAPI (handlers `async`), SQLModel, SQLAlchemy asyncio, Pydantic | `fastapi[standard]>=0.111`, `sqlmodel>=0.0.24`, `sqlalchemy[asyncio]>=2.0,<2.1` |
| Driver / migraciones | asyncpg, Alembic, python-dotenv | `asyncpg>=0.30`, `alembic>=1.13` |
| Base de datos | PostgreSQL | local: contenedor `postgres:16` |
| Imagen del backend | `python:3.12-alpine`, usuario sin privilegios (`app`), `HEALTHCHECK` en `/health/ready`, migraciones al arrancar | |
| Despliegue | Easypanel en VPS (proyecto `grupo2-elias`) | |
| Flujo de trabajo | Git + GitHub, OpenSpec (`openspec/`, schema `spec-driven`) | `openspec/config.yaml` sin contexto propio (todo comentado) |

## Arquitectura general
```
Navegador --HTTPS--> Easypanel (proxy, dominio del front)
                          |  HTTP :80
                          v
                   servicio "frontend" (nginx)
                     /        -> public/ (index.html, css/, js/)
                     /api/... -> proxy_pass http://${API_UPSTREAM}/   (sin el prefijo /api)
                          |  red interna
                          v
                   servicio "apilibreria" (FastAPI, uvicorn 0.0.0.0:8000)
                          |
                          v
                   PostgreSQL (servicio "dblibreria", puerto privado)
```
Decisión clave: el navegador solo habla con **un origen** (el del front); nginx reenvía `/api/` al backend por la red interna. Por eso el front llama siempre a `/api/...` (p. ej. `fetch("/api/libros/")`) y la dirección real del backend vive en `API_UPSTREAM`. Consecuencia: ya no se abre `index.html` con doble clic (`file://`); las rutas `/api/...` solo funcionan detrás de nginx.

Backend en capas: `Router -> Service -> UoW (Unit of Work) -> Repository -> base`. El UoW es el único lugar con commit/rollback y traduce `IntegrityError` a `Conflicto` (409) con mensaje propio; los services lanzan `NoEncontrado` (404) y `Conflicto` (409).

## Integraciones externas
| Servicio | Propósito | Tipo |
|----------|-----------|------|
| Easypanel (VPS) | Hospedar front, back y Postgres; HTTPS y dominios | Panel / Docker |
| GitHub (`belcalvo93/libreria-global-programacion3`) | Código del monorepo y PR | Git |
| Origen anterior del backend (`eEmanuel07/Librer-a_Prog.3_2026`, rama `despliegue`) | Fuente actual del servicio `apilibreria`; se pasa a construir desde este monorepo (`/backend`) | Git (Easypanel) |
| «Comprobante» de venta | Aviso **simulado** en el log del backend (`BackgroundTasks`, 0,5 s) tras un `POST /ventas/` exitoso; no envía mail real | Interno |

## API REST
Resumen por recurso (detalle completo, cuerpos, respuestas y marcas «no usado por el front» en `11_contrato_api.md`). Base pública desde el front: `/api`. Los listados devuelven una lista, sin envoltorio.

| Recurso | Endpoints en el código |
|---------|------------------------|
| health | `GET /health/live`, `GET /health/ready` |
| libros | `POST /libros/`, `GET /libros/`, `GET /libros/{id}`, `PATCH /libros/{id}` |
| editoriales | `POST /editoriales/`, `GET /editoriales/`, `GET /editoriales/{id}`, `PATCH /editoriales/{id}`, `GET /editoriales/{id}/libros` |
| generos | `POST /generos/`, `GET /generos/`, `GET /generos/{id}/libros` |
| autores | `POST /autores/`, `GET /autores/{id}`, `PATCH /autores/{id}`, `GET /autores/{id}/libros` |
| clientes | `POST /clientes/`, `GET /clientes/{id}`, `PATCH /clientes/{id}`, `POST /clientes/{id}/perfil`, `GET /clientes/{id}/ventas` |
| ventas | `POST /ventas/`, `GET /ventas/`, `GET /ventas/{id}` (sin PATCH ni DELETE) |

Documentación interactiva del back: `/docs` (local `http://localhost:8000/docs`; desplegado, en el host del servicio backend — ver `12_despliegue_easypanel.md`).

## Estructura del monorepo
Ver `08_arquitectura_propuesta.md`.
