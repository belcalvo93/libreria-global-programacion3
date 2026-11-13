# Gatoteca Lunar · Global de Programación III

Librería web integrada: el frontend del primer parcial (HTML, CSS y JavaScript nativos) conectado a la API del TP (FastAPI + PostgreSQL, capítulos 1 a 4) y desplegado en Easypanel.

**Grupo 2 · "git push and pray"**

Integrantes: Belén Calvo · Elías Tello · Hernán González · Bruno Fiouchetta · Joaquín Morán

## Estructura

```
frontend/
  Dockerfile               nginx: sirve public/ y reenvía /api/ al backend
  default.conf.template    plantilla del proxy (usa API_UPSTREAM)
  env.example              nombre y formato de las variables
  public/                  index.html, css/, js/, img/
backend/                   API del TP (FastAPI, Alembic, Dockerfile)
evidencia/                 casos G-01 a G-07
DEPLOY.md                  despliegue en Easypanel
```

## Cómo correrlo en local

### 1. Backend (desde `backend/`)

Base de datos aparte para el TP (si ya tenés el contenedor `libreria-db` del parcial):

```bash
docker start libreria-db
docker exec -it libreria-db psql -U postgres -c "CREATE DATABASE libreria_tp;"
```

Entorno y API:

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate        # Git Bash en Windows
pip install -r requirements.txt
cp env.example .env                  # DATABASE_URL=postgresql+asyncpg://postgres:<contraseña>@localhost:<puerto>/libreria_tp
alembic upgrade head
python -m scripts.seed               # datos de prueba
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Documentación de la API: http://localhost:8000/docs

### 2. Frontend (desde `frontend/`, con Docker Desktop abierto)

```bash
cd frontend
docker build -t libreria-frontend .
docker run --rm --name libreria-frontend -p 127.0.0.1:8080:80 -e API_UPSTREAM=host.docker.internal:8000 libreria-frontend
```

Abrir http://127.0.0.1:8080 · Comprobar http://127.0.0.1:8080/api/health/ready → 200.

El front llama siempre a `/api/...` (por ejemplo `fetch("/api/libros/")`); nginx lo reenvía al backend sin el prefijo.

## Música de fondo

La página tiene una música ambiental **opcional**: el tema «Midnight in the Gatoteca» (`frontend/public/audio/ambiente.mp3`, 168 s, 96 kbps, ~2 MB, recortado desde el segundo 8 y con fade-in), generado y aportado por Belén Calvo. *(Herramienta de generación y licencia: a confirmar por Belén.)*

- No suena al abrir la página: arranca a volumen bajo con la **primera interacción** (clic, toque o tecla), porque los navegadores bloquean el audio automático.
- El botón redondo de abajo a la derecha (🔊 / 🔇) la **silencia o la activa**. Si la silenciaste, seguir usando la página no la vuelve a encender.
- Se pausa sola si cambiás de pestaña y retoma al volver (si no estaba silenciada). No se guarda nada en el navegador: cada visita empieza igual.

## Uso del frontend: búsqueda por ID

La API del backend no expone endpoints de listado para autores ni para clientes (`GET /autores/` y `GET /clientes/` no existen). Por eso, en las secciones **Libros** (autorías) y **Clientes**, tanto los autores como los clientes se buscan por su **ID** numérico (`GET /api/autores/{id}` y `GET /api/clientes/{id}`). Con los datos iniciales del seed hay autores del `1` al `5` y clientes del `1` al `3`.

## Reparto de tareas (propuesta)

| Integrante | Tarea | Ejercicio |
| --- | --- | --- |
| Belén | Monorepo, Dockerfile y nginx, README, estética (estante de libros) | 4 |
| Hernán | `js/api.js` (cliente fetch y errores), catálogo desde la API con limit/offset y detalle | 1 |
| Bruno | Alta de libros (editoriales, géneros, autorías) y clientes por POST, errores 409/422 | 2 |
| Joaquín | Venta por POST, historial con limit/offset y detalle por ID | 3 |
| Elías | CORS por variable de entorno, servicios en Easypanel, DEPLOY.md | 5 |
| Todos | Casos G-01 a G-07 y evidencia | — |

Orden: Hernán primero (`api.js`), porque las altas y las ventas lo usan.

## Flujo de trabajo

Una rama por tarea desde `main` actualizado → PR a `main` → lo aprueba otro integrante → merge común (*Create a merge commit*). Commits en español con prefijo (`feat`, `fix`, `docs`, `chore`). No subir `.env` ni credenciales.
