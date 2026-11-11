# Proposal

> C-09 de `CHANGES.md` (Ej. 5, US-5.1). Dueño: Elías. Governance **ALTO** (configuración de seguridad del backend): el diseño se revisa antes de escribir código.

## Why

La consigna pide que el backend habilite CORS a partir de una variable de entorno (US-5.1), y hoy `backend/app/main.py` no tiene CORS ni existe `CORS_ORIGINS` (I-06). Con el proxy nginx el front habla con un solo origen y no lo necesita, pero cualquier acceso cross-origin (otro dominio, el front servido aparte durante una prueba) queda bloqueado por el navegador sin que la API lo pueda configurar. Es independiente del resto del roadmap, así que se puede cerrar ahora y dejar listo el código para cuando Belén defina el dominio del front (C-08).

## What Changes

- `backend/app/core/config.py`: nueva función pura `leer_cors_origins(valor)` que convierte el texto de `CORS_ORIGINS` en una lista de orígenes exactos (separados por coma, sin espacios ni elementos vacíos), con el formato de D-28.
- `backend/app/main.py`: nueva función `configurar_cors(app, origenes)` que agrega `CORSMiddleware` de FastAPI con la lista recibida, llamada al construir la app con `leer_cors_origins(os.getenv("CORS_ORIGINS"))`. Si la lista queda vacía, no agrega el middleware: sin cabeceras CORS el navegador bloquea todo pedido cross-origin. Nunca se usa el comodín `*`.
- Solo se habilitan los métodos que la API usa (`GET`, `POST`, `PATCH`, `OPTIONS`), la cabecera `Content-Type` y sin credenciales (la API no tiene cookies ni autenticación).
- `backend/env.example`: se agrega `CORS_ORIGINS=` vacío, con un comentario con el ejemplo local y la forma del valor en Easypanel (sin valores reales).
- `backend/tests/` (nuevo): primeros tests automáticos del backend, con `unittest` y `TestClient`, sin base de datos: origen permitido, origen no permitido, variable ausente o vacía, preflight `OPTIONS` y el parseo de la variable.

## Capabilities

### New Capabilities
- `cors-api`: política de orígenes cruzados de la API del backend: de dónde sale la lista de orígenes permitidos, cómo se interpreta `CORS_ORIGINS` y qué cabeceras CORS devuelve la API ante pedidos simples y preflight.

### Modified Capabilities
<!-- Ninguna: la única spec existente es `cliente-http` (frontend), que no cambia. -->

## Impact

- **Código**: `backend/app/core/config.py` y `backend/app/main.py` (registro de middleware, antes de los routers). No cambia ningún endpoint ni el contrato de `knowledge-base/11_contrato_api.md`.
- **Configuración**: nueva variable `CORS_ORIGINS` en `env.example` y, más adelante, en el servicio `apilibreria` de Easypanel (C-10). Vacía o ausente = comportamiento actual (sin CORS).
- **Front**: ninguno. Detrás de nginx sigue siendo mismo origen.
- **Dependencias**: ninguna nueva. `CORSMiddleware` viene con FastAPI y `TestClient` usa `httpx`, que ya trae `fastapi[standard]`.
- **Fuera de alcance**: el `min_length=1` opcional en `LibroCreate.autores` (I-01 / D-24), que se decide con Bruno; el deploy en Easypanel y la carga de la variable (C-10); el dominio real del front (TBD hasta C-08).
