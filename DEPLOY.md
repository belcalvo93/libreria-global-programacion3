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
| **Revisión desplegada (Frontend)** | Commit `4af13ed` de la rama `main` (desplegado el 2026-11-13) |
| **Revisión desplegada (Backend)** | Commit `391bb61` de la rama `main` (C-10, desplegado el 2026-11-12) |

> **Nota sobre el backend:** Desde la implementación de C-10 (`391bb61`), el directorio `backend/` no ha sufrido modificaciones en `main`, por lo que el código en ejecución en EasyPanel es idéntico al de la rama principal.

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
- **Límites de recursos:** Sin límites especiales de CPU ni memoria configurados en el panel.
- **Nombre de host interno:** `grupo2-elias_apilibreria:8000`.
- **Responsable:** Elías Tello.

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
Son únicamente tres variables (confirmado: no existen variables adicionales en producción):
- **`DATABASE_URL`**: Cadena de conexión asíncrona a PostgreSQL (`postgresql+asyncpg://...`). En EasyPanel apunta al servicio interno `grupo2-elias_dblibreria:5432`.
- **`SQL_ECHO`**: Booleano (`true`/`false`) para habilitar o silenciar la impresión de consultas SQL en los registros del contenedor.
- **`CORS_ORIGINS`**: Orígenes autorizados en las cabeceras CORS de FastAPI. En producción: `https://grupo2-elias-frontend.ugpvou.easypanel.host`. En desarrollo local: `http://127.0.0.1:8080,http://localhost:8080`.

---

## 5. Migraciones y carga inicial de datos

### Migraciones de base de datos
Se aplican de forma automática en cada arranque del contenedor backend gracias a la instrucción de inicio en `backend/Dockerfile`:

```sh
alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Si la base de datos no está disponible o falla una migración, el comando se interrumpe y el contenedor no inicia, evitando operar con un esquema inconsistente.

### Carga inicial (Seed)
La base de datos `dblibreria` ya contaba con los datos persistidos del despliegue anterior del TP. Al migrar el backend en C-10 **no fue necesario volver a correr el script de seed** y los datos se mantuvieron íntegros. No existen pasos adicionales de carga en producción.

En caso de realizar una instalación en un entorno nuevo desde cero, los datos iniciales de prueba se cargan una única vez desde la consola del servicio con:

```bash
python -m scripts.seed
```

> **Advertencia:** El script de seed vacía las tablas antes de poblar. No debe ejecutarse sobre bases ya operativas para no sobrescribir datos de pruebas o ventas registradas.

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

---

## 8. Resultados de las comprobaciones (Evidencia)

Comprobaciones ejecutadas y verificadas sobre el despliegue integrado en EasyPanel (respaldadas en `evidencia/G-07_*`):

1. **Chequeo de salud integrado:**
   - Petición: `GET https://grupo2-elias-frontend.ugpvou.easypanel.host/api/health/ready`
   - Resultado: Código HTTP `200 OK` con cuerpo JSON `{"estado":"listo","base":"ok"}`.
2. **Políticas de CORS:**
   - Origen autorizado: Solicitudes enviando cabecera `Origin: https://grupo2-elias-frontend.ugpvou.easypanel.host` reciben la cabecera de respuesta `Access-Control-Allow-Origin: https://grupo2-elias-frontend.ugpvou.easypanel.host`.
   - Origen no autorizado: Solicitudes con otro origen no reciben cabecera `Access-Control-Allow-Origin`.
   - Solicitudes Preflight (HTTP OPTIONS): Responden `200 OK` con métodos `GET, POST, PATCH, OPTIONS` y sin cabecera de credenciales (`Access-Control-Allow-Credentials`).
3. **Aislamiento del backend en red interna:**
   - Al haberse eliminado el dominio público del servicio `apilibreria`, la URL anterior `https://grupo2-elias-apilibreria.ugpvou.easypanel.host/health/ready` responde `404 Not Found`.
   - El frontend accede exclusivamente de forma interna a través del proxy inverso de Nginx (`http://grupo2-elias_apilibreria:8000/`).
4. **Persistencia de datos tras redespliegue (Caso G-07):**
   - Se verificó el estado de los datos consultando los endpoints a través del frontend antes y después de redesplegar el servicio `apilibreria`:
     - Antes del redespliegue: 6 libros, 2 ventas (venta 1 por $50000.00 y venta 2 por $77000.00) y cliente 1 existente.
     - Después del redespliegue: Se confirmaron exactamente los mismos 6 libros, las 2 ventas históricas y el cliente 1.
   - Resultado: Persistencia confirmada y documentada en `evidencia/G-07_backend_c10.txt`.
