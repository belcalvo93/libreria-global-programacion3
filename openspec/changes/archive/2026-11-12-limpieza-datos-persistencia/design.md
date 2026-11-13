## Context

Búsqueda previa (grep en `frontend/`, tests, `index.html`, docs, OpenSpec, KB, AGENTS.md): ningún JS usa `DATOS`, `guardarDatos` ni `localStorage` salvo los dos archivos a borrar (`ventas.js` solo lo menciona en un comentario). Los tests no los importan.

## Decisions

- **D1 Borrado completo**: se eliminan ambos archivos y sus `<script>`; no se deja stub.
- **D2 Sin migración**: las claves `paginaViva.*` que `persistencia.js` guardó en los navegadores quedan huérfanas e inofensivas; no se limpian.
- **D3 Historia**: las menciones de D-16 y de changes archivados no se reescriben (son historia); se agrega D-46 en la KB.

## Risks

Si algún navegador tiene el `index.html` viejo en caché, pedirá los scripts borrados (404 inocuo). Mitigación: recarga forzada.
