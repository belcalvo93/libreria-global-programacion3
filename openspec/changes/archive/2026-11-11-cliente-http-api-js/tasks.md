# Tasks

> Change retroactivo: todas las tareas ya estaban hechas en el commit `7a62c5f` (rama `feat/api-cliente`). Se verificaron leyendo el código contra `specs/cliente-http/spec.md`.

## 1. Cliente HTTP `js/api.js`

- [x] 1.1 Crear `frontend/public/js/api.js` como IIFE con `"use strict"` y `var` que expone `window.Api` (`get`, `post`, `patch`, `numero`, `ApiError`); verificado leyendo el archivo (requisito «Interfaz pública global del cliente»)
- [x] 1.2 Armar la URL con base `/api` y omitir parámetros `""`, `null` y `undefined` (sin `?` si no queda ninguno); verificado contra los escenarios de «URL bajo la base /api» y «Parámetros de consulta sin valores vacíos»
- [x] 1.3 Enviar `Accept: application/json` y, en `post`/`patch`, el cuerpo JSON con `Content-Type: application/json`; leer la respuesta como texto y devolver `null` si viene vacía o no es JSON; verificado contra «Envío de cuerpos JSON» y «Lectura de respuestas exitosas»
- [x] 1.4 Lanzar `ApiError` con `status`, `message` en español y `detalle`: `detail` en texto, lista 422 unida con « · », mensajes por defecto (404, 409, 422, ≥ 500, otros) y status 0 sin conexión; verificado contra los escenarios de los cuatro requisitos de error
- [x] 1.5 `Api.numero(valor)` convierte Decimal en texto a número solo para mostrar (D-08); verificado contra «Conversión de Decimales en texto»

## 2. Integración en `index.html`

- [x] 2.1 Cargar `<script src="js/api.js">` en `frontend/public/index.html` antes de `datos.js`, `persistencia.js`, `catalogo.js`, `altas.js` y `ventas.js`; verificado en la línea 341 (requisito «Carga previa a los scripts de sección»)
- [x] 2.2 Confirmar que no hay `fetch` fuera de `js/api.js`; verificado con una búsqueda de `fetch` en `frontend/public/js/` e `index.html` (requisito «Único punto de acceso HTTP»)

## Workflow follow-up

- Correr las pruebas manuales de C-02 con el front levantado: `/api/health/ready`, un 404, un 409 y un 422 de ejemplo (no hay evidencia de que ya se hayan hecho).
- Abrir el PR de `feat/api-cliente` hacia `main`.
- Tras el merge, actualizar `knowledge-base/08` (líneas 13 y 25), D-13 e I-11, que todavía dicen que `api.js` no está en `main`.
