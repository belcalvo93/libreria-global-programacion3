# Tasks

> Strict TDD: en cada pieza, primero el test que falla (RED), después el mínimo código que lo pasa (GREEN) y al final el refactor con los tests en verde. Todos los comandos se corren desde `backend/` con `python -m unittest discover -s tests` (sin base de datos, sin pytest). Governance ALTO: revisar `design.md` con Elías antes de empezar el grupo 2.

## 1. Estructura de tests

- [x] 1.1 Crear `backend/tests/__init__.py` (vacío) y verificar que `python -m unittest discover -s tests` corre y reporta `Ran 0 tests` sin errores de importación
- [x] 1.2 Agregar `tests/` a `backend/.dockerignore`, junto a `test/`, y verificar con `git diff` que es la única línea nueva (design, decisión 7)

## 2. Parseo de `CORS_ORIGINS` (`leer_cors_origins` en `core/config.py`)

- [x] 2.1 RED: crear `backend/tests/test_cors_config.py` (`unittest.TestCase`) con los casos de «Orígenes permitidos desde la variable CORS_ORIGINS»: un origen, varios con espacios, elementos vacíos y coma final; verificar que fallan por `ImportError`/`AttributeError` (la función no existe)
- [x] 2.2 GREEN: escribir `leer_cors_origins(valor: str | None) -> list[str]` en `backend/app/core/config.py` (split por coma, `strip`, descarte de vacíos), sin tocar `get_settings()`; verificar que los tests de 2.1 pasan
- [x] 2.3 TRIANGULAR: sumar casos `None`, `""` y `" , ,"` → lista vacía (requisito «Sin orígenes configurados no hay CORS»); verificar que pasan
- [x] 2.4 REFACTOR: nombres, docstring corto en español y tipado; verificar que la suite sigue en verde

## 3. Middleware CORS (`configurar_cors` en `main.py`)

- [x] 3.1 RED: crear `backend/tests/test_cors_middleware.py` que arma un `FastAPI()` de prueba con una ruta `GET /ping`, llama a `configurar_cors(app, ["http://localhost:8080"])` y usa `TestClient(app)` sin `with`; casos: origen permitido recibe `access-control-allow-origin` igual al origen; origen de otro dominio y del mismo host con otro puerto no la reciben. Verificar que fallan porque `configurar_cors` no existe
- [x] 3.2 GREEN: escribir `configurar_cors(app, origenes)` en `backend/app/main.py` con `CORSMiddleware` (`allow_origins=origenes`, `allow_methods=["GET", "POST", "PATCH", "OPTIONS"]`, `allow_headers=["Content-Type"]`, `allow_credentials=False`); verificar que los tests de 3.1 pasan
- [x] 3.3 RED → GREEN: caso lista vacía (`configurar_cors(app, [])`) → la respuesta a un pedido con `Origin` no trae `access-control-allow-origin`; hacer que con lista vacía no se agregue el middleware y verificar que pasa (requisito «Sin orígenes configurados no hay CORS»)
- [x] 3.4 TRIANGULAR preflight: `OPTIONS /ping` con `Origin` permitido, `Access-Control-Request-Method: POST` y `Access-Control-Request-Headers: content-type` → 200 y `access-control-allow-methods` contiene `POST` y `PATCH`; preflight con `DELETE` → no 200; preflight desde origen no permitido → no 200 y sin `access-control-allow-origin`; verificar que pasan
- [x] 3.5 TRIANGULAR seguridad: ninguna respuesta trae `access-control-allow-origin: *` ni `access-control-allow-credentials: true` (requisitos «Origen permitido recibe su cabecera CORS» y «Sin credenciales cross-origin»); verificar que pasan
- [x] 3.6 Conectar en `main.py`, justo después de construir `app` y antes de los `include_router`: `configurar_cors(app, leer_cors_origins(os.getenv("CORS_ORIGINS")))`, sin tocar las líneas de routers. Test de humo en `test_cors_middleware.py`: importar `app.main` y pedir `GET /health/live` con `TestClient(app)` sin `with` → 200 (la app real arranca sin `CORS_ORIGINS` ni base); verificar que toda la suite pasa
- [x] 3.7 REFACTOR: extraer las constantes de métodos y cabeceras permitidos a nombres en español en `main.py` y comentar en una línea por qué no hay `*` ni credenciales; verificar que la suite sigue en verde

## 4. Configuración documentada

- [x] 4.1 Agregar `CORS_ORIGINS=` (vacío) a `backend/env.example` con un comentario: formato de D-28 (orígenes exactos, esquema + host[:puerto], sin barra final, separados por coma), ejemplo local `http://127.0.0.1:8080,http://localhost:8080`, forma en Easypanel `https://<dominio-del-front>` y que vacía = sin CORS; verificar que no hay ningún valor real ni secreto en el diff
- [x] 4.2 Documentar en `backend/README.md` (sección de variables o de ejecución) la variable `CORS_ORIGINS` y el comando de tests `python -m unittest discover -s tests`; verificar que el comando documentado corre tal cual desde `backend/`

## 5. Verificación manual (integración)

- [x] 5.1 Levantar la API local con `CORS_ORIGINS=http://127.0.0.1:8080,http://localhost:8080` y `uvicorn app.main:app` (base `libreria_tp`, D-21) y comprobar con `curl -i -H "Origin: http://localhost:8080" http://127.0.0.1:8000/health/live` que vuelve `access-control-allow-origin: http://localhost:8080`; con `-H "Origin: https://otro.ejemplo.com"` que no vuelve; y un preflight `curl -i -X OPTIONS -H "Origin: http://localhost:8080" -H "Access-Control-Request-Method: POST" http://127.0.0.1:8000/libros/` → 200. Guardar la salida para la evidencia
- [x] 5.2 Repetir sin `CORS_ORIGINS` (o vacía) y comprobar que la API arranca y no devuelve cabeceras CORS; correr la suite completa una vez más (`python -m unittest discover -s tests`) en verde

## Workflow follow-up

- Revisión de Governance ALTO: Elías aprueba el diff de `main.py` y `config.py` antes del PR.
- `/opsx:archive cors-backend` y marcar `[x]` en C-09 de `CHANGES.md` (y actualizar I-06 en `knowledge-base/10_preguntas_abiertas.md` como resuelta).
- PR `feat/cors-backend` → `main`, revisado por otro integrante, merge común.
- En C-10: cargar `CORS_ORIGINS=https://<dominio-del-front>` en `apilibreria` cuando Belén lo pase (C-08) y redeployar.
- Fuera de este change: `min_length=1` en `LibroCreate.autores` (I-01), a decidir con Bruno.
