# Actores y Roles

## Actores del sistema
| Actor | Descripción | Cómo interactúa |
|-------|-------------|-----------------|
| Usuario de la librería | Persona que opera la interfaz web (en la práctica, el grupo y el corrector) | Navega la SPA estática y dispara llamadas a `/api/...` |
| Navegador / front (JS nativo) | Cliente HTTP vía `window.Api` (`js/api.js`) | `fetch` hacia `/api` |
| nginx (servicio frontend) | Sirve `public/` y reenvía `/api/` | `proxy_pass` a `API_UPSTREAM` |
| API FastAPI (servicio `apilibreria`) | Reglas de negocio y persistencia | REST/JSON |
| PostgreSQL (`dblibreria`) | Persistencia | Interno, puerto privado |
| Corrector (cátedra) | Evalúa desde la URL pública | Ejecuta la demostración mínima y los casos G |

## RBAC — Matriz de permisos
**No hay autenticación ni roles** en el sistema (ni en el front ni en la API). Cualquier visitante puede ejecutar todos los endpoints expuestos. No hay rutas protegidas.

| Rol | Recurso | Permisos |
|-----|---------|----------|
| (anónimo) | Todos | Los que expone la API (ver `11_contrato_api.md`) |

Mitigaciones relevantes: el backend no se expone públicamente (se quita el dominio automático en Easypanel; solo es alcanzable por la red interna desde nginx); el puerto de PostgreSQL se mantiene privado; `extra="forbid"` en los DTO de entrada.

## Rutas públicas
- Frontend: `https://<dominio-front>/` (HTTPS terminado en Easypanel; HTTP interno a nginx puerto 80).
- API bajo `https://<dominio-front>/api/...` (por el proxy).
- Salud: `/api/health/ready` → 200.
- URL pública del front: (TBD — la asigna Easypanel).

## Equipo y propiedad de archivos (Grupo 2 «git push and pray»)
Integrantes: Belén Calvo (B), Hernán González (H), Bruno Fiouchetta (R), Joaquín Morán (J), Elías Tello (E).

| Integrante | Responsabilidad | Ej. | Casos |
|-----------|-----------------|-----|-------|
| Belén (B) | Estructura del repo, imagen del front (**HECHA y mergeada**: `Dockerfile`, `.dockerignore`, `default.conf.template`, `public/`), cliente HTTP `js/api.js` (rama `feat/api-cliente`, **sin PR, en revisión**), servicio `frontend` en Easypanel, `DEPLOY.md`, estante de libros y estética (después del catálogo de Hernán), limpieza final de `datos.js` y `persistencia.js` | 4 y 5 | G-07 (imagen) |
| Hernán (H) | Catálogo desde la API: búsqueda, paginación `limit`/`offset`, detalle del libro | 1 | G-01 |
| Bruno (R) | Alta de libros (con autorías) y de clientes | 2 | G-02, G-03 |
| Joaquín (J) | Ventas e historial | 3 | G-04, G-05, G-06 |
| Elías (E) | CORS en el backend, pasar `apilibreria` a construirse desde este repo (`/backend`), juntar evidencia y armar el ZIP | 5 | G-07 (deploy) |
| Todos | Casos G-01 a G-07 y evidencia | — | — |

Cada uno toca solo su archivo JS y su sección del `index.html`:

| Archivo | Dueño |
|---------|-------|
| `js/api.js` | Belén (en `feat/api-cliente`; los demás solo lo usan) |
| `js/catalogo.js` + `<section id="catalogo">` | Hernán |
| `js/altas.js` + `<section id="libros">` y `<section id="clientes">` | Bruno |
| `js/ventas.js` + `<section id="ventas">` y `<section id="historial">` | Joaquín |
| `backend/` | Elías |
| `frontend/Dockerfile`, `default.conf.template`, `css/` general | Belén |
| `js/datos.js`, `js/persistencia.js` | No se borran hasta la tarea final de limpieza de Belén (depende de H, R y J mergeados) |

Orden de dependencias: `api.js` primero (lo usan altas y ventas); el estante/estética de Belén va después del catálogo de Hernán; la limpieza final va última.
