# Reglas de Negocio

## Reglas del backend (códigos RN del TP, tal como figuran en el código)
Los códigos `RN-xx` salen de comentarios en `backend/app/**`. El texto completo del TP original no está en el repo; las descripciones de abajo se infieren del código. La numeración está documentada solo parcialmente (ver `10_preguntas_abiertas.md`).

| Código | Regla | Dónde se aplica | Resultado |
|--------|-------|-----------------|-----------|
| RN-01 | El ISBN del libro es único | `libro.isbn` UNIQUE | 409 «El ISBN ya existe o un autor figura dos veces en el libro» |
| RN-02 | El email del cliente es único y no distingue mayúsculas (se guarda en minúsculas y sin espacios) | `cliente.email` UNIQUE + validador | 409 |
| RN-03 | `precio` > 0 (máx. 10 dígitos, 2 decimales) y `stock` entero ≥ 0 | DTO `LibroCreate` / CHECK en base | 422 (DTO) o 409 (CHECK) |
| RN-04 | Composición: los renglones nacen con la venta y se insertan en el mismo commit | `ventas/service.py` | — |
| RN-05 | Una venta tiene al menos un renglón y un libro no puede repetirse | `VentaCreate` (`min_length=1`, validador) + UNIQUE (`venta_id`,`libro_id`) | 422 «Un mismo libro no puede aparecer en dos renglones» |
| RN-06 | **Precio histórico**: el `precio_unitario` se copia del libro al registrar la venta; no cambia si luego cambia `libro.precio` | `ventas/service.py` | — |
| RN-07 | El total lo calcula el servidor (suma de `cantidad × precio_unitario`); el cliente no manda precio ni total | `ventas/service.py`, DTO con `extra="forbid"` | 422 si se envía `precio_unitario`, `total` o `fecha` |
| RN-08 | Las ventas no se modifican ni se borran | sin PATCH/DELETE en el router | — |
| RN-09 | Un cliente tiene como máximo un perfil | `perfil_cliente.cliente_id` UNIQUE | 409 |
| RN-10 | Todo listado se pagina con `limit` (1 a 100, def. 20) y `offset` (≥ 0) | `core/pagination.py` | 422 si no cumple |
| RN-11 | La búsqueda por `titulo` es parcial, sin distinguir mayúsculas; `%` y `_` se toman literalmente | `libros/repository.py` | — |
| RN-12 | Los errores devuelven mensaje propio, nunca texto de la base | `core/errors.py` | `{"detail": "..."}` |

Otras reglas observadas en el código (sin código RN):
- Unicidad de `nombre` en editoriales y géneros (409).
- Una autoría repetida (mismo autor dos veces en un libro) → 409.
- `extra="forbid"` en todos los DTO de entrada: campos desconocidos (p. ej. un `id` en el alta) → 422.
- `POST /ventas/` con libro inexistente → 409 «No existe el libro con id X»; con cliente inexistente → 409 «El cliente indicado no existe».
- `PATCH` rechaza `null` explícito salvo en `genero_id` de libros (null quita el género).
- El stock no se descuenta al vender.

## Reglas de la consigna para el frontend
| Código (propuesto, no oficial) | Regla |
|------|-------|
| RF-01 | La URL base y las peticiones están centralizadas en `js/api.js` (`/api` + ruta exacta del backend, con su barra final: `/api/libros/`) |
| RF-02 | Los registros e importes confirmados vienen de la API; `localStorage` ya no guarda datos; solo el borrador de la venta puede vivir en memoria |
| RF-03 | Al cambiar el filtro de búsqueda, `offset` vuelve a 0 |
| RF-04 | Género nulo se muestra como «Sin clasificar» |
| RF-05 | Se diferencian 4 estados del catálogo: cargando, lista vacía, búsqueda sin coincidencias, error de conexión |
| RF-06 | Alta de libro: precio positivo, stock entero ≥ 0, editorial obligatoria, género opcional, **≥ 1 autoría** (el backend no lo exige: validar en el front), rol ∈ {autor, coautor, traductor, ilustrador}, orden ≥ 1 |
| RF-07 | Alta exitosa = 201; se usa el registro devuelto para actualizar vistas (`window.renderCatalogo()`); ante 409/422 se muestra el mensaje del servidor cerca del formulario |
| RF-08 | Venta: cliente seleccionado, ≥ 1 renglón, cantidades enteras positivas, un renglón por libro; cuerpo con solo `cliente_id` y `renglones[{libro_id, cantidad}]` |
| RF-09 | Se envía el **id** del libro (no el ISBN) como `libro_id`; el contexto del grupo indica que `venta-libro-N` hoy usa el ISBN como `value` y debe pasar al id |
| RF-10 | Botón de confirmar deshabilitado mientras se procesa; tras 201 se muestran precios unitarios, subtotales y total **de la respuesta** (no se recalculan), se limpia el formulario y se actualiza el historial |
| RF-11 | Ante 409/422 se muestra el error y se **conserva el borrador** |
| RF-12 | El historial usa `GET /ventas/` con `limit`/`offset`; el detalle `GET /ventas/{id}` muestra fecha, cliente, renglones e importes históricos |
| RF-13 | `precio`, `precio_unitario`, `subtotal`, `total` pueden llegar como texto → `Api.numero(...)`; `fecha` → `new Date(venta.fecha).toLocaleString("es-AR")` |
| RF-14 | Autores y clientes se buscan por ID porque el backend no tiene listado; **documentarlo en el README** (la consigna pide documentar la opción elegida) |
| RF-15 | Responsive 320–1280 px y foco visible con Tab |
| RF-16 | Datos ficticios; ocultar contraseñas y valores privados en las capturas |
