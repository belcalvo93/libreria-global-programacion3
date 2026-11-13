# Despliegue en EasyPanel — Gatoteca Lunar

Documento de referencia de la infraestructura y el despliegue del proyecto integrado **Gatoteca Lunar** (Global de Programación III, UTN FRM).

**Grupo 2 · «git push and pray»**  
Integrantes: Belén Calvo · Elías Tello · Hernán González · Bruno Fiouchetta · Joaquín Morán

---

## 1. URL pública y estado de salud

| Parámetro | Detalle |
|---|---|
| **URL pública del frontend** | https://grupo2-elias-frontend.ugpvou.easypanel.host/ (HTTPS) |
| **Chequeo de salud integrado** | https://grupo2-elias-frontend.ugpvou.easypanel.host/api/health/ready |
| **Respuesta esperada** | Código HTTP `200 OK` con JSON `{"estado":"listo","base":"ok"}` |
| **Revisión desplegada** | Commit `4af13ed` de la rama `main` |
| **Fecha de despliegue** | 2026-11-13 |

---

## 2. Infraestructura en EasyPanel (proyecto `grupo2-elias`)

El despliegue está configurado en un VPS administrado con EasyPanel bajo el proyecto **`grupo2-elias`**, compuesto por dos servicios de tipo **App** y un servicio de base de datos **PostgreSQL**:

### Servicio `frontend` (App)
- **Fuente:** Repositorio Git del monorepo (`https://github.com/belcalvo93/libreria-global-programacion3.git`).
- **Rama:** `main`.
- **Ruta de compilación (Build Path):** `/frontend`.
- **Método de compilación:** Dockerfile (`frontend/Dockerfile` basado en `nginx:1.30-alpine`).
- **Dominio asignado:** `https://grupo2-elias-frontend.ugpvou.easypanel.host` (con terminación SSL/HTTPS automática provista por EasyPanel / Traefik).
- **Enrutamiento interno:** Redirige el tráfico HTTPS entrante al puerto interno `80` del contenedor (`http://grupo2-elias_frontend:80`).
- **Responsable:** Belén Calvo.

### Servicio `apilibreria` (App — Backend)
- **Fuente:** Mismo repositorio monorepo, rama `main`.
- **Ruta de compilación (Build Path):** `/backend`.
- **Método de compilación:** Dockerfile (`backend/Dockerfile` basado en `python:3.12-alpine`).
- **Puerto:** `8000` (proceso `uvicorn` escuchando en `0.0.0.0:8000`).
- **Red y acceso:** Conectado a la red interna privada del proyecto EasyPanel. **Sin dominio público asignado** (se eliminó el dominio público tras la verificación de C-10 para aislar la API; todas las peticiones externas acceden a través del proxy inverso del frontend).
- **Nombre de host interno:** `grupo2-elias_apilibreria:8000`.
- **Responsable:** Elías Tello. Cualquier configuración adicional de red o límites de recursos en el panel queda a confirmar por Elías.

### Servicio `dblibreria` (Base de datos PostgreSQL)
- **Tipo:** Servicio PostgreSQL nativo en EasyPanel.
- **Red interna:** `grupo2-elias_dblibreria`, puerto `5432`.
- **Persistencia:** Volumen gestionado por Docker/EasyPanel en el servidor host, independiente del ciclo de vida de los contenedores de aplicación.

---

## 3. Proxy inverso del frontend (Nginx)

El servidor web del frontend utiliza la plantilla `frontend/default.conf.template`, procesada al arrancar el contenedor con `envsubst`:

- **Archivos estáticos:** Sirve el frontend construido en `/usr/share/nginx/html/` (directorio `frontend/public/` del repositorio).
- **Reenvío de API:** Las solicitudes a `/api/*` se reenvían mediante `proxy_pass http://${API_UPSTREAM}/;` al backend interno, quitando el prefijo `/api/`.
- **Políticas de caché en cliente:**
  - `/img/`: Caché prolongado de 30 días (`expires 30d; add_header Cache-Control "public";`) para texturas de lomo, tapa, estrellas y fondo.
  - `/audio/`: Caché de 30 días con tipo MIME explícito (`audio/mpeg mp3`) para la música ambiental (`ambiente.mp3`), soportando solicitudes parciales HTTP Range (206) para el loop y el salto de audio.
  - Íconos y favicons (`favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`): Caché de 7 días (`expires 7d;`), permitiendo renovación sin alterar nombres de archivo.

---

## 4. Variables de entorno

Solo se documentan los nombres y su propósito. Los valores reales y contraseñas residen en EasyPanel y en los archivos locales `.env` (excluidos del control de versiones).

### Frontend
- **`API_UPSTREAM`**: Dirección de red interna (`host:puerto`) hacia donde el proxy inverso de nginx reenvía las peticiones de `/api/`.
  - En EasyPanel: `grupo2-elias_apilibreria:8000`.
  - En local (Docker Desktop): `host.docker.internal:8000`.

### Backend
- **`DATABASE_URL`**: Cadena de conexión asíncrona a PostgreSQL (`postgresql+asyncpg://...`). En EasyPanel apunta a `grupo2-elias_dblibreria:5432`.
- **`SQL_ECHO`**: Booleano (`true`/`false`) para habilitar o silenciar la impresión de consultas SQL en los registros del contenedor.
- **`CORS_ORIGINS`**: Orígenes autorizados en las cabeceras CORS de FastAPI. En producción: `https://grupo2-elias-frontend.ugpvou.easypanel.host`. En desarrollo local: `http://127.0.0.1:8080,http://localhost:8080`.

Cualquier otra variable de entorno específica del entorno de producción queda a confirmar por Elías.

---

## 5. Migraciones y carga inicial de datos

### Migraciones de base de datos
Se aplican de forma automática en cada arranque del contenedor backend gracias a la instrucción de inicio en `backend/Dockerfile`:

```sh
alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Si la base de datos no está disponible o falla una migración, el comando se interrumpe y el contenedor no inicia, evitando operar con un esquema inconsistente.

### Carga inicial (Seed)
Se ejecuta por única vez desde la **Consola** del servicio `apilibreria` en EasyPanel:

```bash
python -m scripts.seed
```

> **Advertencia:** El script de seed vacía las tablas antes de poblar los datos de prueba iniciales (libros, autores, clientes, géneros, editoriales). No debe ejecutarse durante actualizaciones rutinarias para no sobrescribir datos reales o ventas registradas. Pasos adicionales de carga: a confirmar por Elías.

---

## 6. Pasos de actualización (Redeploy)

1. Enviar los cambios validados a la rama `main` de GitHub mediante Pull Request aprobado.
2. Ingresar a EasyPanel y abrir el proyecto `grupo2-elias`.
3. **Actualizar el frontend:**
   - Seleccionar el servicio `frontend`.
   - Presionar el botón **Implementar** (Deploy).
   - EasyPanel descargará el último commit de `main`, construirá la imagen con `frontend/Dockerfile` y reiniciará el contenedor.
4. **Actualizar el backend (si hubo cambios en `backend/`):**
   - El backend **no** se redespliega solo.
   - Si hubo modificaciones en el backend o en las migraciones de Alembic, ingresar al servicio `apilibreria` y presionar **Implementar**.
   - Alembic correrá las nuevas migraciones automáticamente al inicio.
5. **Verificación post-despliegue:**
   - Probar el chequeo de salud: `GET https://grupo2-elias-frontend.ugpvou.easypanel.host/api/health/ready` (código esperado: 200).
   - Abrir el sitio en el navegador y validar la carga del estante, el catálogo y las altas.

---

## 7. Cómo correr en local

### 1. Base de datos y backend

Desde la raíz del repositorio:

```bash
# Iniciar contenedor de base de datos local
docker start libreria-db || docker run --name libreria-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=libreria_tp -p 5432:5432 -d postgres:16
```

Preparar el entorno de Python e iniciar la API:

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate        # En Windows (Git Bash)
pip install -r requirements.txt
cp env.example .env                  # Configurar DATABASE_URL apuntando a libreria_tp
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Documentación interactiva disponible en `http://localhost:8000/docs`.

### 2. Frontend con Docker

Desde el directorio `frontend/`:

```bash
cd frontend
docker build -t libreria-frontend .
docker run --rm --name libreria-frontend -p 127.0.0.1:8080:80 -e API_UPSTREAM=host.docker.internal:8000 libreria-frontend
```

Abrir en el navegador:
- Aplicación: `http://127.0.0.1:8080/`
- Salud del sistema: `http://127.0.0.1:8080/api/health/ready`
