## Why

`js/datos.js` (`DATOS`, datos locales del parcial) y `js/persistencia.js` (localStorage) quedaron obsoletos: Catálogo, Libros, Clientes, Ventas e Historial ya hablan con la API (C-03, C-04 y C-05 mergeados en `main`). Dejarlos carga código muerto y mantiene un `localStorage` que contradice la regla «el borrador vive solo en memoria».

## What Changes

- Borrar `frontend/public/js/datos.js` y `frontend/public/js/persistencia.js`.
- Quitar sus dos `<script>` de `frontend/public/index.html`.
- Actualizar docs (CHANGES.md C-07 `[x]`, AGENTS.md, KB) y la spec `cliente-http` (orden de scripts).
- Ningún test cubría esos archivos: no hay tests que borrar.

## Capabilities

### Modified Capabilities
- `cliente-http`: el orden de carga de scripts ya no incluye `datos.js` ni `persistencia.js`.

## Impact

`frontend/public/js/`, `frontend/public/index.html`, `AGENTS.md`, `CHANGES.md`, `knowledge-base/`, `openspec/specs/cliente-http/spec.md`. Cierra el issue #11.
