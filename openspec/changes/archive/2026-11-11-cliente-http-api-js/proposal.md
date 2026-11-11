# Proposal

> **Change retroactivo** (C-02 de `CHANGES.md`). El código ya existe y está commiteado en la rama `feat/api-cliente` (commit `7a62c5f`): este change documenta en OpenSpec lo que **ya está hecho**, sin agregar funcionalidad nueva.

## Why

El Ejercicio 1 de la consigna pide centralizar las peticiones HTTP del front en un único cliente (US-1.7, D-03). Todas las secciones del front (catálogo, altas, ventas, historial) dependen de ese cliente para hablar con la API del TP a través del proxy `/api` de nginx (C-01), así que su contrato tiene que quedar escrito y verificable antes de que C-03, C-04 y C-05 lo consuman.

## What Changes

- `frontend/public/js/api.js` (nuevo, ya commiteado): expone `window.Api` con `get`, `post`, `patch`, `numero` y el constructor `ApiError`. Script clásico en IIFE con `"use strict"` y `var` (D-04).
- Toda petición usa la base `/api`; la ruta se escribe como en FastAPI (barra final en colecciones). Los parámetros de consulta vacíos (`""`, `null`, `undefined`) se omiten.
- Los cuerpos de `post`/`patch` se envían como JSON; las respuestas se devuelven ya parseadas (o `null` si vienen vacías, p. ej. 204).
- Si la respuesta no es 2xx, o no hay conexión, se lanza un `ApiError` con `status` (`0` = sin conexión), `message` en español listo para mostrar y `detalle` con el cuerpo crudo.
- `Api.numero` convierte los Decimal que la API manda como texto (`"1500.00"`) a número, solo para mostrar (D-08).
- `frontend/public/index.html` (modificado, ya commiteado): carga `js/api.js` antes que los demás scripts.

## Capabilities

### New Capabilities
- `cliente-http`: cliente HTTP único del frontend: armado de URL bajo `/api`, envío y lectura de JSON, traducción de errores de la API y de red a mensajes en español, y conversión de Decimales en texto.

### Modified Capabilities
<!-- Ninguna: no hay specs previas en openspec/specs/. -->

## Impact

- **Código**: `frontend/public/js/api.js` (114 líneas) y una línea de `frontend/public/index.html`. Ya implementados; este change no los modifica.
- **Consumidores**: C-03 (catálogo), C-04 (altas) y C-05 (ventas/historial) usan `window.Api`; un cambio de contrato rompe todas las secciones (Governance ALTO en `CHANGES.md`).
- **Dependencias**: C-01 (proxy `/api` de nginx). Sin librerías, CDN ni npm.
- **Backend**: ninguno. Se apoya en el formato de errores de FastAPI documentado en `knowledge-base/11_contrato_api.md`.
