# Contrato de la API del TP (leído del código)

Fuente: `backend/app/modules/*/router.py` y `schemas.py` (rama `chore/openspec-init`, mismo código que `main`). Base pública desde el front: `/api` (nginx quita el prefijo). Los listados devuelven **una lista JSON** (sin envoltorio ni total).

## Convenciones comunes
- **Paginación** (todos los listados; RN-10): `limit` 1–100 (por defecto 20), `offset` ≥ 0. Fuera de rango → 422. Para saber si hay más: si llegaron `limit` elementos, probablemente hay más.
- **Errores**: propios `{"detail": "mensaje"}` (404, 409, 503); validación 422 `{"detail": [{"loc": [...], "msg": "..."}]}`.
- **Decimales** (`precio`, `precio_unitario`, `subtotal`, `total`) llegan como **texto** (`"1500.00"`); `fecha` en ISO 8601.
- Entradas con `extra="forbid"`: campo desconocido → 422.
- Las rutas de colección llevan barra final (`/libros/`); las de recurso no (`/libros/3`).

## Tabla de endpoints y uso por el front
| Método y ruta | Uso en el front | Éxito | Errores |
|---------------|-----------------|-------|---------|
| `GET /health/ready` | Sí (verificación de despliegue, `/api/health/ready`) | 200 `{"estado":"listo","base":"ok"}` | 503 «La base de datos no está disponible» |
| `GET /health/live` | **No usado por el front** (no toca la base) | 200 | — |
| `GET /libros/?limit&offset&titulo&genero_id` | Sí (catálogo, selector de ventas). `genero_id` **no usado por el front** (filtro opcional) | 200 `LibroResumen[]` (orden por `id`) | 422 |
| `GET /libros/{id}` | Sí (detalle con autores) | 200 `LibroRead` | 404 «El libro no existe» |
| `POST /libros/` | Sí (alta, Bruno) | 201 `LibroRead` | 409, 422 |
| `PATCH /libros/{id}` | **Sí** (caso G-05, cambio de precio) | 200 `LibroRead` | 404, 409, 422 |
| `GET /editoriales/?limit&offset` | Sí (select del alta de libro) | 200 `EditorialRead[]` | 422 |
| `GET /generos/?limit&offset` | Sí (select del alta de libro) | 200 `GeneroRead[]` | 422 |
| `GET /autores/{id}` | Sí (verificar autor por ID; no hay listado) | 200 `AutorRead` | 404 |
| `POST /clientes/` | Sí (alta, Bruno) | 201 `ClienteRead` | 409, 422 |
| `GET /clientes/{id}` | Sí (buscar cliente por ID; no hay listado) | 200 `ClienteRead` | 404 |
| `POST /ventas/` | Sí (Joaquín) | 201 `VentaRead` | 409, 422 |
| `GET /ventas/?limit&offset` | Sí (historial) | 200 `VentaResumen[]` | 422 |
| `GET /ventas/{id}` | Sí (detalle) | 200 `VentaRead` | 404 «La venta no existe» |
| `GET /editoriales/{id}` | **No usado por el front** | 200 `EditorialRead` | 404 |
| `PATCH /editoriales/{id}` | **No usado por el front** | 200 `EditorialRead` | 404, 409, 422 |
| `POST /editoriales/` | **No usado por el front** | 201 `EditorialRead` | 409, 422 |
| `GET /editoriales/{id}/libros` | **No usado por el front** | 200 `LibroDeEditorial[]` | 404 |
| `POST /generos/` | **No usado por el front** | 201 `GeneroRead` | 409, 422 |
| `GET /generos/{id}/libros` | **No usado por el front** | 200 `LibroDeGenero[]` | 404 |
| `POST /autores/` | **No usado por el front** | 201 `AutorRead` | 409, 422 |
| `PATCH /autores/{id}` | **No usado por el front** | 200 `AutorRead` | 404, 409, 422 |
| `GET /autores/{id}/libros` | **No usado por el front** | 200 `LibroDeAutor[]` | 404 |
| `PATCH /clientes/{id}` | **No usado por el front** | 200 `ClienteRead` | 404, 409, 422 |
| `POST /clientes/{id}/perfil` | **No usado por el front** | 201 `PerfilRead` | 404, 409 (perfil ya existente), 422 |
| `GET /clientes/{id}/ventas?limit&offset` | **No usado por el front** | 200 `VentaRead[]` | 404 |

No existen en el código: `GET /autores/`, `GET /clientes/`, `GET /generos/{id}`, `PATCH`/`DELETE` de ventas, `DELETE` de ningún recurso.

## Cuerpos de entrada
```json
// POST /libros/   (extra="forbid")
{ "isbn": "9789500100011", "titulo": "...", "precio": 1500, "stock": 10,
  "editorial_id": 1, "genero_id": null,
  "autores": [ { "autor_id": 1, "rol": "autor", "orden": 1 },
               { "autor_id": 3, "rol": "traductor", "orden": 2 } ] }
```
- `isbn` y `titulo`: texto no vacío. `precio` > 0 (máx. 10 dígitos, 2 decimales). `stock` entero ≥ 0. `genero_id` opcional (`null` = «Sin clasificar»).
- `rol` ∈ `autor | coautor | traductor | ilustrador`; `orden` ≥ 1.
- **El DTO no exige al menos un autor** (`autores: list[AutoriaCreate]` sin `min_length`): el «al menos una autoría» lo valida el **FRONT** (lo pide la consigna del Ej. 2; decisión cerrada, D-24). Bruno lo implementa en `altas.js` (C-04) antes de enviar el `POST`.

```json
// PATCH /libros/{id}   (solo se aplican los campos enviados; los autores no se tocan)
{ "isbn"?: "...", "titulo"?: "...", "precio"?: 2500, "stock"?: 3, "editorial_id"?: 2, "genero_id"?: null }
```
- Un `null` explícito se rechaza (422) salvo en `genero_id` (quita el género).

```json
// POST /clientes/   (email se guarda en minúsculas y sin espacios)
{ "nombre": "Ana Pérez", "email": "ana@ejemplo.com" }
```

```json
// POST /ventas/   (solo estos campos; precio, total o fecha -> 422)
{ "cliente_id": 2, "renglones": [ { "libro_id": 1, "cantidad": 2 }, { "libro_id": 4, "cantidad": 1 } ] }
```
- `renglones` con ≥ 1 elemento; `cantidad` > 0; un `libro_id` no puede repetirse (422 «Un mismo libro no puede aparecer en dos renglones»).

Otros cuerpos (todos **no usados por el front**): `EditorialCreate {nombre, pais}`, `EditorialUpdate`, `GeneroCreate {nombre}`, `AutorCreate {nombre, nacionalidad}`, `AutorUpdate`, `ClienteUpdate {nombre?, email?}`, `PerfilCreate {telefono, direccion}`.

## Respuestas
```json
// LibroResumen (listado)  ·  LibroRead = LibroResumen + "autores" (ordenados por "orden")
{ "id": 1, "isbn": "...", "titulo": "...", "precio": "1500.00", "stock": 10,
  "editorial": { "id": 1, "nombre": "...", "pais": "..." },
  "genero": { "id": 1, "nombre": "..." } | null,
  "autores": [ { "autor": { "id": 1, "nombre": "...", "nacionalidad": "..." }, "rol": "autor", "orden": 1 } ] }

// EditorialRead { id, nombre, pais }   GeneroRead { id, nombre }   AutorRead { id, nombre, nacionalidad }

// ClienteRead
{ "id": 2, "nombre": "...", "email": "...", "perfil": { "id": 1, "cliente_id": 2, "telefono": "...", "direccion": "..." } | null }

// VentaResumen (historial)  ·  VentaRead = VentaResumen + "renglones"
{ "id": 1, "fecha": "2026-11-12T15:30:00Z", "total": "5000.00",
  "cliente": { "id": 2, "nombre": "...", "email": "..." },
  "renglones": [ { "libro_id": 1, "titulo": "...", "cantidad": 2, "precio_unitario": "1500.00", "subtotal": "3000.00" } ] }
```
Respuestas de endpoints no usados por el front: `LibroDeAutor {libro_id, isbn, titulo, rol, orden}`, `LibroDeEditorial` y `LibroDeGenero {id, isbn, titulo, precio, stock}`, `PerfilRead`.

## Mensajes de error observados en el código (409 / 404)
| Situación | Código | `detail` |
|-----------|--------|----------|
| ISBN repetido o autor repetido en el libro | 409 | «El ISBN ya existe o un autor figura dos veces en el libro» |
| Editorial, género o autor inexistente al crear/editar libro | 409 | «La editorial, el género o algún autor indicado no existe» |
| CHECK de libro | 409 | «Los datos del libro no cumplen las reglas del catálogo» |
| Libro inexistente | 404 | «El libro no existe» |
| Venta con libro inexistente | 409 | «No existe el libro con id X» |
| Venta con cliente inexistente | 409 | «El cliente indicado no existe» |
| Venta inexistente | 404 | «La venta no existe» |
| Email/nombre/perfil repetido, FK, etc. en otros módulos | 409 | mensajes propios por módulo (no leídos uno a uno aquí; ver `service.py` de cada módulo) — (TBD) |

## Discrepancias entre el código y el contrato del contexto del grupo
Ver la lista completa en `10_preguntas_abiertas.md` (sección «Inconsistencias detectadas»).
