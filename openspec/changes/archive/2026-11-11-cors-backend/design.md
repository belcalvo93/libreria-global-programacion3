# Design

## Context

Motivación en `proposal.md` (Why); comportamiento en `specs/cors-api/spec.md`.

Estado actual del backend que condiciona el enfoque:
- `backend/app/main.py` construye `app = FastAPI(..., lifespan=lifespan)` a nivel de módulo y registra los routers. No hay middleware.
- `backend/app/core/config.py` hace `load_dotenv()` al importarse y expone `get_settings()`, que **lanza `RuntimeError` si falta `DATABASE_URL`** y solo se llama dentro del `lifespan` (al arrancar uvicorn).
- El middleware se registra al construir la app, antes de que corra el `lifespan`: la lista de orígenes tiene que estar disponible en ese momento y sin depender de la base.
- No hay tests automáticos en el backend: `backend/test/` solo tiene archivos `.http` manuales (y está en `.dockerignore`).
- `requirements.txt` trae `fastapi[standard]`, que incluye `httpx` (lo necesita `TestClient`). No hay pytest.
- En producción el backend no se expone (se quita el dominio automático; 03 §RBAC) y el front llega por nginx al mismo origen: CORS no es necesario para el front, pero lo pide la consigna (US-5.1) y cubre accesos cross-origin.

## Goals / Non-Goals

**Goals:**
- Lista de orígenes configurable solo por entorno (D-28), sin tocar código para cambiar el dominio del front.
- Lo mínimo abierto: orígenes exactos, los métodos que la API usa y una sola cabecera.
- Que la configuración de CORS se pueda probar sin base de datos y sin recargar módulos.

**Non-Goals:**
- Patrones o comodines de origen (`allow_origin_regex`, `*`, subdominios).
- Validar el formato de cada origen (que tenga esquema, que no tenga barra final): un origen mal escrito simplemente no coincide nunca.
- Mover `CORS_ORIGINS` dentro de `Settings`/`get_settings()`.
- Tests de los endpoints de negocio o con base de datos.

## Decisions

1. **Parseo en una función pura `leer_cors_origins(valor: str | None) -> list[str]` en `core/config.py`**, no dentro de `get_settings()`. `get_settings()` exige `DATABASE_URL` y corre recién en el `lifespan`; el middleware se configura antes, al construir la app. Una función pura (recibe el texto, devuelve la lista) se prueba sin entorno ni mocks. Implementa D-28: `split(",")`, `strip()` de cada elemento y descarte de vacíos; `None` se trata como `""`. Alternativa descartada: leer `os.getenv` dentro de la función (obliga a manipular `os.environ` en cada test).
2. **`configurar_cors(app, origenes)` en `main.py`, llamada a nivel de módulo** con `leer_cors_origins(os.getenv("CORS_ORIGINS"))`. El `os.getenv` se ejecuta después de importar `config.py`, así que también toma el valor de un `.env` local. Los tests construyen un `FastAPI()` chico, llaman a `configurar_cors` con la lista que quieren y le cuelgan una ruta de prueba: no hace falta `importlib.reload` ni tocar `os.environ`. Alternativa descartada: una fábrica `crear_app()` (cambia la forma en que uvicorn, el Dockerfile y los demás integrantes importan `app.main:app`; regla 7 de flujo: `main.py` lo tocan todos).
3. **Lista vacía → no se agrega el middleware.** Sin `CORSMiddleware` la API no emite ninguna cabecera CORS y el navegador bloquea lo cross-origin, que es el comportamiento de hoy. Agregarlo con `allow_origins=[]` daría el mismo resultado observable pero dejaría un middleware que no hace nada; no agregarlo deja más claro el "apagado". La API arranca igual (no es una variable obligatoria: detrás de nginx no hace falta).
4. **`CORSMiddleware` de FastAPI con `allow_origins=<lista>`, `allow_methods=["GET", "POST", "PATCH", "OPTIONS"]`, `allow_headers=["Content-Type"]`, `allow_credentials=False`.** Nunca `"*"` en ninguno de los tres: los métodos salen del inventario real de routers (16 `GET`, 8 `POST`, 4 `PATCH`; ni `PUT` ni `DELETE`) y `api.js` solo manda `Content-Type` y `Accept` (`Accept` es una cabecera "simple" de CORS y no hace falta listarla). Sin credenciales porque no hay cookies ni autenticación (03 §RBAC). Alternativa descartada: escribir un middleware propio (más código que probar, sin ganancia).
5. **El middleware se registra antes de los `include_router`**, junto a la construcción de `app`. En Starlette el orden de `add_middleware` respecto de los routers no cambia el resultado, pero dejarlo arriba lo hace visible y evita conflictos con las líneas de routers de cada integrante.
6. **Tests en `backend/tests/` con `unittest` y `TestClient`**, carpeta nueva con `__init__.py`, corridos desde `backend/` con `python -m unittest discover -s tests` (`backend/` en `sys.path` para importar `app`). `TestClient(app)` **sin** `with` no ejecuta el `lifespan`, así que no se conecta a la base ni pide `DATABASE_URL`. Dos grupos: unidad de `leer_cors_origins` (un origen, varios con espacios, vacíos y coma final, `None`, `""`) e integración de `configurar_cors` sobre una app de prueba (origen permitido, no permitido, otro puerto, lista vacía, preflight permitido con métodos, preflight de `DELETE`, preflight desde origen no permitido, sin `allow-credentials`). Más un test de humo que importa `app.main` y pide `GET /health/live` (verifica que la app real arranca sin `CORS_ORIGINS` ni base). Alternativa descartada: pytest (no está en `requirements.txt` y el grupo usa `unittest`).
7. **`backend/tests/` va al `.dockerignore`** junto a `test/`: los tests no se usan para correr la API y no tienen por qué entrar en la imagen.
8. **`env.example`**: `CORS_ORIGINS=` vacío y un comentario con el formato, el ejemplo local `http://127.0.0.1:8080,http://localhost:8080` y la forma `https://<dominio-del-front>` para Easypanel. Ningún valor real.

## Risks / Trade-offs

- [Un origen escrito con barra final o con otro esquema (`http` en vez de `https`) no coincide y el front queda bloqueado sin error visible en el servidor] → el comentario de `env.example` y D-28 fijan el formato exacto; el chequeo manual con `curl` de `tasks.md` lo detecta.
- [La variable se lee una sola vez al arrancar] → cambiar `CORS_ORIGINS` en Easypanel exige redeploy/reinicio del servicio (un clic, KB 12).
- [`config.py` hace `load_dotenv()` al importarse: un `.env` local con `CORS_ORIGINS` afecta a la app real] → los tests de comportamiento usan su propia app con `configurar_cors`; el test de humo solo verifica que la app real responde, no sus cabeceras.
- [CORS no es un control de acceso: un cliente que no es navegador (curl, scripts) llama a la API igual] → aceptado; la protección real es no exponer el backend (03 §RBAC) y `extra="forbid"`.
- [Starlette responde 400 a un preflight rechazado y la app real 405 a un `OPTIONS` sin middleware] → la spec solo exige "no 200 y sin `access-control-allow-origin`", que se cumple en ambos casos.

## Migration Plan

1. Mergear con `CORS_ORIGINS` sin cargar en Easypanel: comportamiento idéntico al actual (sin cabeceras CORS).
2. En C-10, cuando Belén pase el dominio del front (C-08), cargar `CORS_ORIGINS=https://<dominio-del-front>` en `apilibreria` y redeployar.
3. Rollback: vaciar o borrar la variable y redeployar (apaga CORS sin tocar código), o revertir el merge.

## Open Questions

- Dominio real del front para `CORS_ORIGINS` en Easypanel: TBD hasta C-08 (lo define Belén). No cambia el código ni los tests.
- `min_length=1` en `LibroCreate.autores` (I-01 / D-24): opcional, fuera de este change; se decide con Bruno y, si se hace, va en su propio change.
