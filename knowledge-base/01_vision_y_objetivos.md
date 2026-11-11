# Visión y Objetivos

## Propósito del sistema
Librería web integrada: el frontend del primer parcial (HTML, CSS y JavaScript nativos) se conecta a la API del TP «Librería: catálogo, clientes y ventas con FastAPI y PostgreSQL» (capítulos 1 a 4) y se despliega en una VPS administrada con Easypanel. Es la entrega del **Global de Programación III** (Tecnicatura Universitaria en Programación), Grupo 2 «git push and pray».

Fuentes (fuera del repo, no copiadas): `Global_Consigna.txt` (consigna del Global) y `CONTEXTO (2).md` (contexto de trabajo del grupo). El código leído es el de este monorepo.

Repo: https://github.com/belcalvo93/libreria-global-programacion3 (monorepo con `frontend/` y `backend/`).

## Qué evalúa la consigna
Los registros y los importes confirmados provienen de la API y se guardan en PostgreSQL. La interfaz solo puede mantener en memoria el **borrador** de una venta (sin `localStorage` para datos). Se usan datos ficticios en despliegue y pruebas.

### Ejercicios y puntaje (total 100)
| Ej. | Tema | Puntos | Qué se pide (resumen) |
|-----|------|--------|-----------------------|
| 1 | Catálogo y cliente HTTP | 20 | URL base y `fetch` centralizados (`/api`, conservando la barra final); `GET /libros/` con `titulo`, `limit` (1-100, def. 20) y `offset` (≥0), reiniciar offset al cambiar filtro; mostrar título, ISBN, precio, editorial y género («Sin clasificar» si es nulo); autores vía `GET /libros/{id}`; diferenciar carga, lista vacía, búsqueda sin coincidencias y error de conexión |
| 2 | Alta de libros y clientes | 20 | `POST /libros/` (título, ISBN, precio > 0, stock entero ≥ 0, editorial, género opcional, ≥ 1 autoría con `autor_id`, `rol`, `orden`); opciones desde `GET /editoriales/` y `GET /generos/`; autores verificables con `GET /autores/{id}`; `POST /clientes/` (nombre, email); clientes consultables con `GET /clientes/{id}`; validar campos, mostrar resultado cerca del formulario, 201 = éxito, mostrar mensaje del servidor ante 409/422 y usar el registro devuelto para actualizar vistas |
| 3 | Registrar y consultar ventas | 25 | Armar venta (cliente + libros, cambiar cantidades, quitar renglones; ≥ 1 renglón, cantidades enteras positivas, un renglón por libro); `POST /ventas/` solo con `cliente_id` y `renglones[{libro_id, cantidad}]`; mostrar precios unitarios, subtotales y total **de la respuesta**; limpiar formulario y actualizar historial; deshabilitar botón durante el envío; `GET /ventas/` con `limit`/`offset` y `GET /ventas/{id}`; 409/422 conservando el borrador |
| 4 | Dockerfile del frontend | 15 | `frontend/` con `public/`, `Dockerfile`, `.dockerignore`, `default.conf.template` (nginx 1.30-alpine con proxy `/api/` → backend) |
| 5 | Servicios en Easypanel | 20 | Dos servicios App (backend y frontend) en el mismo proyecto; Build Path `/backend` y `/frontend`; `API_UPSTREAM`; dominio HTTPS al puerto 80; verificar `/api/health/ready` = 200; `DEPLOY.md` |

Criterios de evaluación (consigna): Catálogo y cliente HTTP 20 · Alta de libros y clientes 20 · Ventas e historial 25 · Imagen del frontend 15 · Despliegue y verificación 20. «Se puntúa el funcionamiento observado y su reproducción con la entrega.»

### Demostración mínima
Desde la URL desplegada: consultar el catálogo, registrar una venta con **dos renglones** y volver a abrir el detalle **después de recargar la página**. Los importes del historial deben coincidir con los que devolvió la API.

## Objetivos por actor
| Actor | Objetivo principal | Objetivos secundarios |
|-------|--------------------|-----------------------|
| Usuario de la librería (sin autenticación) | Consultar el catálogo, registrar libros/clientes y ventas, ver el historial | Ver errores claros del servidor (409/422) |
| Corrector (cátedra) | Entrar a la URL pública y comprobar que todo responde | Si algo falla, revisar el código; leer README, DEPLOY.md y evidencia |
| Grupo (5 integrantes) | Entregar a tiempo con reparto sin conflictos | Evidencia G-01 a G-07, ZIP y URL operativa durante la corrección |

Cómo corrigen (contexto del grupo): entran a la URL pública; si todo responde bien, aprueba; si algo falla, recién ahí miran el código.

## Alcance
- Interfaz obligatoria: catálogo, alta de libros, alta de clientes, venta e historial.
- Cliente HTTP único (`js/api.js`), base `/api`.
- Imagen Docker del frontend (nginx) y despliegue de front y back en Easypanel.
- Evidencia de los casos G-01 a G-07 en `evidencia/`.
- Entregables: ZIP por grupo con `frontend/`, `backend/`, `README.md`, `DEPLOY.md` y `evidencia/`; Dockerfiles, configuración del servidor web versionada y archivo de ejemplo de variables; sin `.env`, credenciales reales ni dependencias instaladas.

## Fuera de alcance
- Autenticación, roles y permisos (la API no los tiene).
- Listados de autores y de clientes (no existen en la API; se resuelve por ID).
- Edición de clientes/autores/editoriales y alta de autores/editoriales/géneros desde la UI (ver «no usado por el front» en `11_contrato_api.md`).
- Descuento de stock al vender: «el stock es un dato del catálogo; en este TP el alta de una venta registra sus renglones e importes».
- Librerías, CDN o npm en el front.

## Fechas
| Día | Qué |
|-----|-----|
| Miércoles 11 (nov 2026) | `api.js` y base del repo en `main` |
| Jueves 12 y viernes 13 | Cada integrante hace su ejercicio |
| Viernes 13 a la noche | Deploy final |
| Sábado 14 | Casos G-01 a G-07, evidencia, `DEPLOY.md` y ZIP. **Entrega: sábado 14 de noviembre a la noche** (ZIP al aula + URL pública funcionando) |

La consigna dice que la cátedra comunica por separado el canal y la fecha oficiales: la fecha de arriba proviene del contexto del grupo (confirmar contra el aviso de la cátedra, ver `10_preguntas_abiertas.md`). La URL debe mantenerse operativa durante la corrección.

## Métricas de éxito
- Demostración mínima ejecutable desde la URL pública.
- Casos G-01 a G-07 con evidencia (ver `13_casos_g_y_evidencia.md`).
- `https://<dominio-front>/api/health/ready` responde 200 y los datos persisten tras un redespliegue.
