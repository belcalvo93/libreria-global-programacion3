# Design

## Context

Change retroactivo: `frontend/public/js/api.js` y su `<script>` en `index.html` ya están commiteados en `feat/api-cliente` (commit `7a62c5f`). Este documento registra las decisiones que el código ya tomó; ver `proposal.md` (Why) y `specs/cliente-http/spec.md` (requisitos).

Restricciones que lo moldean (AGENTS.md y `knowledge-base/08_arquitectura_propuesta.md`):
- Front nativo sin módulos, librerías, CDN ni npm: script clásico en IIFE con `"use strict"` y `var` (D-04).
- El navegador habla con el mismo origen; nginx reenvía `/api/...` al backend sin el prefijo (C-01).
- La API (FastAPI) devuelve errores `{"detail": "texto"}` (404, 409, 503) o, en 422, `{"detail": [{loc, msg}, ...]}`; los Decimal llegan como texto (`knowledge-base/11_contrato_api.md`).

## Goals / Non-Goals

**Goals:**
- Un único lugar que arma URLs y llama a `fetch` (D-03, Ej. 1 de la consigna).
- Que cada sección muestre `error.message` sin tener que interpretar el formato de FastAPI.

**Non-Goals:**
- `DELETE`/`PUT`: la API del TP no los usa desde el front.
- Timeouts, reintentos, cancelación (`AbortController`) o caché.
- Validar la forma de la ruta (barras): el cliente la concatena tal cual.
- Formatear importes como moneda: `numero` solo convierte; el formato es de cada sección.

## Decisions

1. **IIFE que publica `window.Api`** en vez de funciones globales sueltas o módulos ES. Respeta D-04 y deja privados `armarUrl`, `mensajeDeError` y `pedir`. Alternativa descartada: `type="module"` (prohibido por la convención del parcial).
2. **Un solo `pedir(metodo, ruta, opciones)` interno** y tres envoltorios (`get` con parámetros, `post`/`patch` con cuerpo). Evita duplicar el manejo de errores.
3. **`URLSearchParams` y omisión de `""`, `null`, `undefined`** (el `0` y `false` sí se envían). Permite pasar el estado de un formulario de filtros sin limpiarlo antes. Alternativa descartada: dejar que cada sección filtre (duplicación y riesgo de mandar `titulo=` vacío).
4. **Leer el cuerpo con `text()` y luego `JSON.parse` protegido** en lugar de `response.json()`. Así un 204, un cuerpo vacío o un HTML de error del proxy (502/504) no rompen: el cuerpo queda en `null`.
5. **`ApiError` con prototipo de `Error`** (`instanceof Error` es verdadero) y campos `status`, `message`, `detalle`. `status` 0 distingue la falta de conexión de los códigos HTTP.
6. **Prioridad del mensaje**: `detail` en texto → lista 422 (`loc` sin `body`, unidos con « · ») → mensaje por defecto en español por código. El servidor ya escribe sus `detail` en español (tabla de `11_contrato_api.md`), así que se muestran tal cual.
7. **`Api.numero` = `Number(valor)`**: conversión mínima solo para mostrar; nunca se recalculan importes (D-08).
8. **`<script src="js/api.js">` primero** en `index.html` (línea 341), sin `defer`, para que `window.Api` exista al ejecutarse los demás scripts.

## Risks / Trade-offs

- [Contrato compartido por todas las secciones (Governance ALTO)] → la spec `cliente-http` fija el comportamiento; cualquier cambio futuro pasa por un change con delta spec.
- [Los mensajes de validación 422 vienen en inglés desde Pydantic (`Field required`)] → se muestran tal cual con el campo adelante; traducirlos queda fuera de este change.
- [Sin timeout: una petición colgada deja el botón deshabilitado hasta que el navegador corte] → aceptado para el alcance del TP.
- [`ApiError` no captura `stack` (no invoca al constructor de `Error`)] → irrelevante para mostrar mensajes; solo afecta la depuración en consola.
- [Una respuesta 2xx con cuerpo no JSON se resuelve con `null` sin aviso] → la API del TP siempre devuelve JSON en 2xx.

## Divergencias

Verificación del código (`api.js`, `index.html`) contra AGENTS.md, la KB y `CHANGES.md` (C-02). **No se corrigió nada**; la spec describe lo que el código hace. Para decidir por la usuaria:

- **Contrato (código vs. KB/AGENTS.md)**: sin divergencias. Base `/api`, omisión de parámetros vacíos, `ApiError` con `status`/`message`/`detalle`, status 0 = sin conexión, 422 unido con « · », `numero`, IIFE + `"use strict"` + `var`, `fetch` solo en `api.js` y carga de `api.js` antes que los demás scripts: todo coincide.
- **Detalles que el código agrega y la KB no menciona** (no contradicen, se documentan en la spec):
  - Mensajes por defecto cuando no hay `detail`: 404, 409, 422, ≥ 500 y «Error HTTP N.» para el resto.
  - En errores 422 de parámetros de consulta el campo sale con prefijo (`query.limit: ...`), porque solo se quita el segmento `body` de `loc`.
  - 204, cuerpo vacío o cuerpo no JSON → `null` (tanto en éxito como en `detalle` de error).
- **Pruebas manuales de `CHANGES.md` C-02** (`/api/health/ready`, un 404, un 409 y un 422): no hay evidencia en el repo de que se hayan corrido. No se marcan como hechas en `tasks.md`; quedan como seguimiento antes del merge del PR.
- **Estado documental**: `knowledge-base/08` (líneas 13 y 25), D-13 e I-11 dicen que `api.js` no está en `main` y no tiene PR. Sigue siendo cierto hasta mergear el PR; habrá que actualizarlos después.

## UI Mockups

- Decision: no (no UI) — 2026-11-10. `api.js` no agrega ni cambia pantallas, estilos ni interacciones.

## Testing

No hay test runner para el front nativo y el change es retroactivo (documentación/spec de código existente): no aplica el ciclo RED/GREEN de Strict TDD. La verificación fue una lectura del código contra cada escenario de la spec.
