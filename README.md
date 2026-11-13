# Gatoteca Lunar · Global de Programación III

Librería web integrada: el frontend del primer parcial (HTML, CSS y JavaScript nativos) conectado a la API del TP (FastAPI + PostgreSQL, capítulos 1 a 4) y desplegado en EasyPanel.

**Grupo 2 · «git push and pray»**  
Integrantes: Belén Calvo · Elías Tello · Hernán González · Bruno Fiouchetta · Joaquín Morán  
Sitio en producción: https://grupo2-elias-frontend.ugpvou.easypanel.host/

---

## Alcance del proyecto

Gatoteca Lunar integra la interfaz de usuario interactiva desarrollada en el primer parcial con el backend de servicios REST desarrollado en FastAPI y persistido en PostgreSQL.

- **Frontend nativo:** Interfaz responsiva desarrollada con HTML5 semántico, CSS3 moderno (con temas visuales «cristal nocturno» y «estante mágico») y JavaScript nativo vanilla (sin dependencias, frameworks ni bundlers npm).
- **Consumo de API:** Centralizado en `frontend/public/js/api.js`, interactuando mediante `fetch` asíncrono con el backend a través del proxy inverso de Nginx.
- **Backend API:** Servicio RESTful en FastAPI con arquitectura por capas (Router → Service → Unit of Work → Repository), migraciones automáticas con Alembic y base de datos relacional PostgreSQL.
- **Infraestructura:** Servicios contenerizados con Docker y orquestados en EasyPanel con red interna aislada y terminación HTTPS.

---

## Estructura del repositorio

```
frontend/
  Dockerfile               Imagen nginx:1.30-alpine; sirve public/ y reenvía /api/ al backend
  default.conf.template    Plantilla de configuración de nginx (proxy_pass con API_UPSTREAM y caché)
  env.example              Variables de entorno de ejemplo para el front (API_UPSTREAM)
  public/                  Archivos estáticos servidos al navegador
    index.html             Estructura principal con navegación por secciones y accesibilidad
    css/styles.css         Estilos globales, variables :root y diseño temático
    js/                    Módulos JavaScript en IIFE con "use strict"
      api.js               Cliente HTTP centralizado (Api.get, Api.post, manejo de errores)
      catalogo.js          Listado paginado de libros, búsqueda y modal de detalle
      altas.js             Formularios de alta de libros y clientes con validaciones
      ventas.js            Borrador de venta interactivo e historial paginado
      estante.js           Renderizado visual del estante de libros interactivo
      musica.js            Controlador de reproducción y fundido de música ambiental
    img/                   Imágenes decorativas, texturas de lomo/tapa y portadas
    audio/                 Pista de música ambiental (ambiente.mp3)
  tests/                   Suite de tests unitarios de frontend para Node.js
backend/                   API REST en FastAPI, Alembic, scripts y Dockerfile
  app/                     Código de la aplicación FastAPI y modelos SQLModel
  migrations/              Migraciones de base de datos gestionadas por Alembic
  scripts/                 Script de carga inicial de datos de prueba (seed.py)
  tests/                   Suite de tests automatizados del backend
evidencia/                 Capturas y registros de verificación de los casos G-01 a G-07
design-system/             Documentación del sistema de diseño y revisiones aprobadas
knowledge-base/            Base de conocimiento canónica del proyecto (13 documentos)
openspec/                  Especificaciones formales, cambios y archivo histórico (OpenSpec)
CHANGES.md                 Mapa de cambios y seguimiento del roadmap (C-01 a C-13)
AGENTS.md                  Instrucciones técnicas para agentes de asistencia y desarrollo
DEPLOY.md                  Documento de arquitectura de infraestructura y despliegue
```

---

## Cómo correrlo en local

### 1. Backend (FastAPI + PostgreSQL)

Se recomienda utilizar una base de datos exclusiva para el proyecto:

```bash
# Iniciar o crear el contenedor de PostgreSQL
docker start libreria-db || docker run --name libreria-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=libreria_tp -p 5432:5432 -d postgres:16
```

Configurar el entorno e iniciar la API:

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate        # En Windows (Git Bash)
pip install -r requirements.txt
cp env.example .env                  # Configurar DATABASE_URL apuntando a libreria_tp
alembic upgrade head                 # Aplica las migraciones
python -m scripts.seed               # Carga los datos iniciales de prueba
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Documentación interactiva de la API: `http://localhost:8000/docs`.

### 2. Frontend (Nginx en contenedor Docker)

Con Docker Desktop en ejecución, desde la raíz del proyecto:

```bash
cd frontend
docker build -t libreria-frontend .
docker run --rm --name libreria-frontend -p 127.0.0.1:8080:80 -e API_UPSTREAM=host.docker.internal:8000 libreria-frontend
```

Acceso local:
- Abrir en el navegador: `http://127.0.0.1:8080/`
- Comprobar salud del proxy y backend: `http://127.0.0.1:8080/api/health/ready` (retorna `200 OK`).

El frontend se comunica exclusivamente a través de rutas relativas `/api/...`; Nginx las reenvía automáticamente al backend sin el prefijo.

---

## Metodología de trabajo

- **Especificaciones con OpenSpec:** Todo cambio de arquitectura o funcionalidad se define y aprueba previamente mediante especificaciones formales en `openspec/` y seguimiento centralizado en `CHANGES.md`.
- **Flujo de Git y Pull Requests:**
  - Desarrollo sobre ramas cortas por tarea (`feat/*`, `fix/*`, `docs/*`) originadas a partir de `main` actualizado.
  - Los cambios se integran a `main` únicamente mediante Pull Request.
  - Revisión cruzada obligatoria por parte de otro integrante del equipo antes de autorizar el merge.
  - Integración mediante merge commit común (*Create a merge commit*), prohibiendo rebase o squash para preservar el historial.
  - Commits semánticos en español sin atribución automática de herramientas de IA.

---

## Tests automatizados

El proyecto cuenta con suites de tests automatizados en ambas capas:

### Frontend
Tests unitarios ejecutados directamente con el test runner nativo de Node.js (sin frameworks externos):

```bash
node --test "frontend/tests/*.test.js"
```

- **Estado actual:** **120 tests pasando sobre 120 ejecutados** (`120/120 pass`, 0 fallos).
- **Módulos evaluados:**
  - `altas.test.js`: Validaciones de formularios, control de errores por campo, unicidad de autorías y payloads para la API.
  - `catalogo.test.js`: Paginación, formato de precios, manejo de estados de carga (`aria-busy`), vistas vacías y foco de accesibilidad.
  - `estante.test.js`: Algoritmos de ordenamiento, alturas, anchos y colores de lomos, y animación de la cola del gato.
  - `musica.test.js`: Máquina de estados del reproductor, volumen inicial, fundidos (fade-in / fade-out), interacción inicial y sincronización con pestañas.
  - `ventas.test.js`: Validación de borrador de ventas, agregación de líneas, cálculo de importes y formateo de fechas.

### Backend
Tests de integración y unidad implementados con `unittest` en Python para la verificación de endpoints, persistencia y políticas de CORS:

```bash
cd backend
python -m unittest discover -s tests
```

---

## Reparto de tareas del equipo

El trabajo se distribuyó de acuerdo a los requerimientos de la cátedra, verificado en `CHANGES.md` y en el historial de Pull Requests:

| Integrante | Tareas y responsabilidades | Changes / PRs |
|---|---|---|
| **Belén Calvo** | Configuración de monorepo, Dockerfile de frontend con Nginx, cliente HTTP centralizado (`js/api.js`), diseño visual («cristal nocturno», estante de libros, audio y favicons), limpieza de archivos obsoletos y despliegue del frontend en EasyPanel. | C-01 (PR #1), C-02 (PR #4), C-06 (PR #20, #25, #28, #29), C-07 (PR #26), C-08 |
| **Elías Tello** | Configuración de CORS en backend, migración del servicio `apilibreria` al monorepo en EasyPanel con red interna aislada, rediseño y pulido visual de la estantería y recolección de evidencias. | C-09 (PR #18), C-10 (PR #21), pulido visual (PR #27), evidencia G-07 |
| **Hernán González** | Módulo de Catálogo (`js/catalogo.js`): consumo de `/libros/` con limit y offset, filtrado por título, estados de carga accesibles, modal de detalle de libro y evidencia G-01. | C-03 (PR #19), G-01 |
| **Bruno Fiouchetta** | Módulo de Altas (`js/altas.js`): alta de libros y clientes por POST, validaciones dinámicas por campo con ARIA, asignación de autorías con orden automático, manejo de errores 409/422 y documentación final C-12 (`DEPLOY.md` y `README.md`). | C-04 (PR #22), C-12, G-02, G-03 |
| **Joaquín Morán** | Módulo de Ventas e Historial (`js/ventas.js`): registro de ventas por POST con control de stock, historial paginado con limit/offset, vista de detalle por ID y evidencias de ventas. | C-05 (PR #23), G-04, G-05, G-06 |

---

## Limitaciones y mejoras futuras

1. **Búsqueda de entidades relacionadas por ID:**
   - La API actual del backend no expone endpoints de listado para autores ni clientes (`GET /autores/` y `GET /clientes/` no existen en la API).
   - Por esta razón, tanto en la asignación de autorías al crear libros como en la selección de clientes para una venta, la vinculación se realiza ingresando directamente el **ID numérico** de la entidad (`GET /api/autores/{id}` y `GET /api/clientes/{id}`).
   - Con los datos iniciales provistos por el seed, existen autores con IDs del `1` al `5` y clientes con IDs del `1` al `3`.
2. **Alta de autores y editoriales:**
   - No existen endpoints para registrar nuevos autores ni nuevas editoriales desde la interfaz (`POST /autores/` y `POST /editoriales/` no están implementados en el backend).
   - Como mejora futura se plantea incorporar estos endpoints para permitir un flujo de alta completamente autónomo desde el frontend.

---

## Música de fondo

La página tiene una música ambiental **opcional**: el tema «Midnight in the Gatoteca» (`frontend/public/audio/ambiente.mp3`, 168 s, 96 kbps, ~2 MB, recortado desde el segundo 8 y con fade-in). Origen y licencia: tema «Midnight in the Gatoteca», generado por Belén con Gemini Hydrogen (plan pago); uso en este trabajo académico sin fines comerciales.

- No suena al abrir la página: arranca a volumen bajo con la **primera interacción** (clic, toque o tecla), porque los navegadores bloquean el audio automático.
- El botón redondo de abajo a la derecha (🔊 / 🔇) la **silencia o la activa**. Si la silenciaste, seguir usando la página no la vuelve a encender.
- Se pausa sola si cambiás de pestaña y retoma al volver (si no estaba silenciada). No se guarda nada en el navegador: cada visita empieza igual.
