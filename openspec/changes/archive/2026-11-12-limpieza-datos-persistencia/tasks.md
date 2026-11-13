## 1. Verificación previa
- [x] 1.1 Buscar referencias y dependientes de `DATOS` / `guardarDatos` (ninguno fuera de los dos archivos)

## 2. Borrado
- [x] 2.1 Borrar `frontend/public/js/datos.js` y `frontend/public/js/persistencia.js`
- [x] 2.2 Quitar sus `<script>` de `index.html`

## 3. Documentación
- [x] 3.1 CHANGES.md (C-07 `[x]`), AGENTS.md, KB (D-46 y referencias), spec `cliente-http`

## 4. Verificación
- [x] 4.1 `node --test "frontend/tests/*.test.js"`
- [x] 4.2 `index.html` sin 404 de scripts ni errores de JS en consola
- [x] 4.3 `openspec validate --strict`
