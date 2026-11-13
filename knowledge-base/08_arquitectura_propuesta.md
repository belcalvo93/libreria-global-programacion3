# Arquitectura Propuesta (frontend y convenciones)

## Estructura del monorepo
```
frontend/
  Dockerfile               nginx:1.30-alpine, sirve public/ y aplica la plantilla
  .dockerignore
  default.conf.template    proxy: /api/... -> backend (sin el prefijo /api)
  env.example              API_UPSTREAM
  public/
    index.html             secciones: catalogo, libros, clientes, ventas, historial
    css/styles.css         CSS del parcial (política de diseño light)
    js/api.js              cliente HTTP (en el PR de C-02, rama feat/api-cliente; queda en main al mergearlo)
    js/catalogo.js  js/altas.js  js/ventas.js
backend/                   API del TP: app/ (core/, modules/<recurso>/{models,schemas,repository,service,router}.py),
                           migrations/, scripts/seed.py, test/*.http, Dockerfile, .dockerignore, env.example, requirements.txt, DEPLOY.md (del TP)
openspec/                  config.yaml (schema spec-driven)
README.md                  (existe)
DEPLOY.md                  (raíz; pendiente, lo escribe Belén)
evidencia/                 (raíz; pendiente, casos G-01 a G-07; el backend tiene su propio backend/evidencia/ del TP)
knowledge-base/            esta KB
```
Orden de carga de scripts en `index.html` (clásicos, sin módulos): `api.js` primero, luego los demás. En la rama `feat/api-cliente` (PR de C-02) `index.html` ya carga `api.js` primero; `main` lo incorpora al mergear ese PR. Hoy `index.html` carga `api.js`, `catalogo.js`, `altas.js`, `ventas.js` y `estante.js` (sin `datos.js` ni `persistencia.js`, eliminados en C-07).

## Cliente HTTP: `js/api.js` (dueña: Belén)
Expone `window.Api`:
- `Api.get(ruta, parametros)`, `Api.post(ruta, cuerpo)`, `Api.patch(ruta, cuerpo)`, `Api.numero(valor)` (convierte Decimal en texto a número).
- Base `/api` ya incluida: escribir la ruta como en FastAPI, **con la barra final cuando la tiene** (`/libros/`, `/ventas/`) y sin barra en las rutas con id (`/libros/3`).
- Los parámetros vacíos (`""`, `null`, `undefined`) se omiten.
- Si falla lanza `Api.ApiError`: `error.status` (HTTP; `0` = sin conexión), `error.message` (texto en español listo para mostrar: el `detail` del servidor, o los campos del 422 unidos con « · »), `error.detalle`.
- Es el único lugar que arma URLs y llama a `fetch`.

Patrón de uso:
```js
try { boton.disabled = true; var venta = await Api.post("/ventas/", cuerpo); }
catch (error) { mensajeError.textContent = error.message; mensajeError.hidden = false; }
finally { boton.disabled = false; }
```

## Convenciones del front (no romperlas)
- Solo `textContent` y `createElement`; nada de `innerHTML` con datos (XSS).
- `event.preventDefault()` como primera línea de cada `submit`.
- Mensajes con el atributo `hidden`, nunca `style.display`; los errores llevan texto, no solo color.
- Sin estilos inline: clases y variables de `:root`.
- Scripts clásicos (sin `type="module"`), cada archivo en una **IIFE** con `"use strict"` y `var`. Comunicación entre archivos mediante funciones en `window` (`window.renderCatalogo`, `window.actualizarSelectsVenta`, ...).
- Funciones asíncronas con `async/await` + `try/catch`.
- Sin librerías, CDN ni npm.
- Responsive 320–1280 px, foco visible con Tab.
- Cada integrante toca solo su archivo JS y su sección del `index.html` (ver propiedad en `03_actores_y_roles.md`).

## Contenedor del frontend y proxy
`Dockerfile`:
```
FROM nginx:1.30-alpine
ENV NGINX_ENVSUBST_FILTER=^API_UPSTREAM$
COPY public/ /usr/share/nginx/html/
COPY default.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
```
`default.conf.template`: `listen 80`, raíz `/usr/share/nginx/html`, `location /` con `try_files $uri $uri/ =404`, `location /api/` con `proxy_pass http://${API_UPSTREAM}/;`. La barra final del `proxy_pass` hace que `/api/libros/` llegue a FastAPI como `/libros/`. `NGINX_ENVSUBST_FILTER` limita la sustitución a `API_UPSTREAM` para no romper las `$` de nginx (`$uri`).

`.dockerignore`: `.git`, `**/.env`, `**/.env.*`, `**/node_modules`, `**/.DS_Store`.

## Seguridad
- Sin credenciales en repo ni imágenes (`.gitignore` excluye `.env*` salvo `env.example`; ambos `.dockerignore` los excluyen del build).
- Backend: imagen con usuario sin privilegios; mensajes de error propios (RN-12); `extra="forbid"`; consultas con parámetros ligados.
- Backend no expuesto: sin dominio propio en Easypanel; PostgreSQL con puerto privado.
- XSS: render con `textContent`/`createElement`.
- CORS: con el proxy nginx el navegador usa un solo origen, pero la consigna del grupo pide CORS por variable de entorno en el back (`CORS_ORIGINS`). **Hoy `backend/app/main.py` no tiene CORS** (pendiente de Elías).

## Variables de entorno
| Variable | Servicio | Formato / ejemplo | Estado |
|----------|----------|-------------------|--------|
| `API_UPSTREAM` | frontend | `host:puerto`, sin `http://` ni barra final. Local (Docker Desktop): `host.docker.internal:8000`. Easypanel: `grupo2-elias_apilibreria:8000` | en `frontend/env.example` |
| `DATABASE_URL` | backend | `postgresql+asyncpg://USUARIO:CONTRASENA@host:puerto/base` (valores reales solo en el entorno privado) | en `backend/env.example`; obligatoria (sin ella el contenedor falla al arrancar) |
| `SQL_ECHO` | backend | `true`/`false` (por defecto `false`) | opcional |
| `CORS_ORIGINS` | backend | URLs de origen exacto separadas por coma, ej. `https://<dominio-del-front>` | **no existe todavía en el código** (a cargo de Elías) |

## Backend: capas y errores (resumen)
`Router -> Service -> UoW -> Repository`. Routers sin lógica; services con reglas y `await uow.commit(...)`; repositorios solo con consultas (`joinedload`/`selectinload`, `lazy="raise"` para evitar N+1). `Conflicto` -> 409, `NoEncontrado` -> 404, validación Pydantic -> 422.
