# Despliegue en Easypanel y ejecución local

Corresponde al Ej. 4 (imagen) y al Ej. 5 (servicios). La consigna usa dos servicios **App** del mismo proyecto: nginx sirve el frontend y reenvía `/api/` al backend por la red interna; el backend se conecta a la base PostgreSQL asignada.

## Servicios (proyecto `grupo2-elias`)
| Servicio | Tipo | Build Path | Builder | Puerto | Dominio |
|----------|------|-----------|---------|--------|---------|
| `apilibreria` (backend) | App | `/backend` (hoy despliega desde `eEmanuel07/Librer-a_Prog.3_2026`, rama `despliegue`, commit `e623a77`; Elías lo pasa a este monorepo y desplegará desde `main` con Build Path `/backend`) | Dockerfile (`Dockerfile`) | 8000 (uvicorn en `0.0.0.0:8000`) | Quitar el dominio automático si Easypanel asignó uno (queda en red interna). Hoy existe uno (ver más abajo) |
| `dblibreria` (Postgres) | Postgres | — | — | 5432 privado | Ninguno |
| `frontend` | App (Belén) | `/frontend` | Dockerfile (`Dockerfile`) | 80 (nginx) | Dominio HTTPS asignado; protocolo interno HTTP, puerto destino 80 |

Valores del contexto del grupo: proyecto `grupo2-elias`, servicio back `apilibreria` (puerto 8000), nombre interno `grupo2-elias_apilibreria`.

## Variables de entorno (solo nombres; valores reales solo en Easypanel)
| Servicio | Variable | Valor / forma |
|----------|----------|---------------|
| frontend | `API_UPSTREAM` | `grupo2-elias_apilibreria:8000` (`host:puerto`, sin `http://` ni barra final) |
| backend | `DATABASE_URL` | `postgresql+asyncpg://USUARIO:CONTRASEÑA@<host-interno-de-dblibreria>:5432/<base>` (la URL interna de Postgres con el driver cambiado a `postgresql+asyncpg`) |
| backend | `SQL_ECHO` | `false` |
| backend | `CORS_ORIGINS` | una o varias URL de origen exacto (esquema + host, sin barra final) separadas por coma. En Easypanel: `https://<dominio-del-front>`; local: `http://127.0.0.1:8080,http://localhost:8080`. El back la lee con `os.getenv("CORS_ORIGINS", "").split(",")`, quitando espacios y vacíos. **A implementar por Elías** (no existe en el código hoy). El dominio lo define Belén al crear el servicio `frontend` (C-08): TBD hasta entonces |

## Pasos
### Backend (Elías)
1. Cambiar la fuente del servicio `apilibreria` a este monorepo: repo `belcalvo93/libreria-global-programacion3`, rama `main`, Build Path `/backend`, Dockerfile `Dockerfile`. Mantener las mismas variables y la misma base.
2. Implementar CORS leyendo `CORS_ORIGINS` y cargar la variable con el dominio del front.
3. Deploy y revisar el log: migraciones (`alembic upgrade head` se ejecuta al arrancar en el `CMD`) y `Uvicorn running on http://0.0.0.0:8000`.
4. Shell del servicio: comprobar salud con
   `python -c "from urllib.request import urlopen; print(urlopen('http://127.0.0.1:8000/health/ready').status)"` → 200.
5. Datos iniciales **solo si hace falta** y con cuidado: `python -m scripts.seed` **vacía todas las tablas** antes de cargar. No correrlo sobre una base con datos del grupo ni después de una demostración.
6. Verificar que el catálogo tenga datos antes de publicar el frontend. Quitar el dominio automático del backend.

### Frontend (Belén)
1. En el mismo proyecto: New Service → App llamado `frontend`; Source: repo y rama; Build Path `/frontend`; builder Dockerfile, ruta `Dockerfile`.
2. Environment: `API_UPSTREAM=grupo2-elias_apilibreria:8000`.
3. Domains: dominio HTTPS asignado, protocolo interno HTTP, puerto 80.
4. Guardar, Deploy, abrir el dominio y comprobar `/api/health/ready` = 200. Probar el catálogo y registrar una venta de prueba desde esa URL.

### Actualización y redeploy
Tras un cambio en la rama, pulsar Deploy en el servicio (un clic en Easypanel; también sirve para redesplegar el sábado si C-07 se mergea después del deploy final del viernes) (reconstruye la imagen; las migraciones ya aplicadas no se repiten). Los datos viven en Postgres, no en el contenedor: comprobar que siguen disponibles tras redesplegar (caso G-07).

## `DEPLOY.md` (raíz del repo; pendiente, lo escribe Belén)
Debe registrar: URL pública, revisión (commit), rutas de build, puertos, proxy, nombres de variables, migraciones, carga inicial, pasos de actualización y los resultados de las comprobaciones. Ya existe `backend/DEPLOY.md` (del TP, despliegue previo del backend en `apilibreria`): no es el `DEPLOY.md` de la entrega, aunque puede reutilizarse como base. No incluir credenciales.

## Diagnóstico (de la consigna)
| Si ves esto | Revisá esto |
|-------------|-------------|
| Falla un `COPY` | El Build Path, los nombres exactos de los archivos y la carpeta `public/` |
| Nginx no arranca o `/api/` devuelve 502 | Los logs del frontend, `API_UPSTREAM`, el nombre interno, el puerto y si el backend está en ejecución |
| `/api/health/ready` falla | Los logs del backend, `DATABASE_URL`, la conexión a PostgreSQL y las migraciones |
| Una petición de la API devuelve 404 | En la pestaña Red del navegador, el prefijo `/api` y la ruta del backend, incluida su barra final |

Lección del despliegue previo del backend (`backend/DEPLOY.md`): con el dominio en el puerto 80 por defecto, el proxy respondía 502; el dominio del backend debe apuntar al 8000.

## URL de referencia (del contexto del grupo)
- Swagger del back desplegado hoy: https://grupo2-elias-apilibreria.ugpvou.easypanel.host/docs (URL pública del servicio actual; la consigna recomienda dejar el backend solo en la red interna).
- URL pública del front: (TBD): la define Belén al crear el servicio `frontend` (C-08); de ese dominio dependen `CORS_ORIGINS`, C-09 y C-10.
- Despliegue actual de `apilibreria`: repo `eEmanuel07/Librer-a_Prog.3_2026`, rama `despliegue`, commit `e623a77`. Cuando Elías lo pase a este repo: rama `main`, Build Path `/backend` (el commit exacto se registra en `DEPLOY.md` al desplegar).

## Ejecución local
### Backend (desde `backend/`)
Usar una base **aparte** (`libreria_tp`): la base `libreria` del contenedor del parcial tiene otras migraciones y choca.
```bash
docker start libreria-db
docker exec -it libreria-db psql -U postgres -c "CREATE DATABASE libreria_tp;"

cd backend
python -m venv .venv
source .venv/Scripts/activate          # Git Bash (Windows)
pip install -r requirements.txt
cp env.example .env                    # DATABASE_URL=postgresql+asyncpg://postgres:<contraseña>@localhost:<puerto>/libreria_tp
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Swagger: http://localhost:8000/docs · Salud: `/health/live`, `/health/ready`.

Si `libreria-db` no existe: `docker run --name libreria-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=<tu_contraseña> -e POSTGRES_DB=libreria -p 5432:5432 -d postgres:16` (otro puerto si el 5432 está ocupado y ajustar el `.env`).

### Frontend (desde `frontend/`, con Docker Desktop abierto)
```bash
docker build -t libreria-frontend .
docker run --rm --name libreria-frontend -p 127.0.0.1:8080:80 -e API_UPSTREAM=host.docker.internal:8000 libreria-frontend
```
En Linux sin Docker Desktop agregar `--add-host=host.docker.internal:host-gateway`. En PowerShell, el comando en una sola línea.
Abrir http://127.0.0.1:8080 y comprobar http://127.0.0.1:8080/api/health/ready → 200. Para ver cambios sin reconstruir: montar `-v "$(pwd)/public:/usr/share/nginx/html"` en el `docker run`; si no, repetir `docker build`.

## Entrega
ZIP por grupo con `frontend/`, `backend/`, `README.md`, `DEPLOY.md` y `evidencia/`, con los Dockerfiles, la configuración versionada de nginx y los archivos de ejemplo de variables; excluir `.env`, credenciales reales y dependencias instaladas. Lo arma Elías. El `README.md` identifica al grupo y explica cómo ejecutar la app localmente y cargar los datos de prueba.
