# Casos de prueba G-01 a G-07 y evidencia

Se ejecutan **desde la URL pública** con datos ficticios. Se registran pasos, resultado observado y evidencia en el `README.md` o en `evidencia/` (carpeta aún inexistente en la raíz; la crea quien junta la evidencia, Elías). Capturas de pantalla y de F12 → Red. **Ocultar contraseñas y valores privados.**

| Caso | Qué probar (resultado esperado) | Responsable | Endpoints involucrados |
|------|--------------------------------|-------------|------------------------|
| G-01 Catálogo | Buscar por título, avanzar con `limit` y `offset`, probar una búsqueda sin coincidencias, abrir el detalle de un libro | Hernán | `GET /libros/`, `GET /libros/{id}` |
| G-02 Alta de libro | Crear un libro con stock, género opcional y autorías; consultar el detalle; repetir el ISBN y verificar el 409 | Bruno | `POST /libros/`, `GET /libros/{id}`, `GET /editoriales/`, `GET /generos/`, `GET /autores/{id}` |
| G-03 Alta de cliente | Crear un cliente y recuperarlo por ID; repetir el email y verificar el 409 | Bruno | `POST /clientes/`, `GET /clientes/{id}` |
| G-04 Venta | Registrar una venta válida con dos renglones; verificar 201 y consultar el detalle después de recargar | Joaquín | `POST /ventas/`, `GET /ventas/`, `GET /ventas/{id}` |
| G-05 Precio histórico | Cambiar el precio con `PATCH /libros/{id}` y verificar que la venta anterior conserva sus importes | Joaquín | `PATCH /libros/{id}`, `GET /ventas/{id}` |
| G-06 Rechazo | Probar un ID inexistente (409) y renglones repetidos (422); el historial queda igual | Joaquín | `POST /ventas/`, `GET /ventas/` |
| G-07 Despliegue | La imagen del frontend se construye; la URL pública abre por HTTPS; la API devuelve 200 en salud; los datos siguen tras un redespliegue | Belén (imagen) / Elías (deploy) | `GET /api/health/ready` |

## Pistas para ejecutar los casos con el seed
- Autores con ID 1 a 5 y clientes con ID 1 a 3 (ver `04_modelo_de_datos.md`) sirven para G-02, G-03 y G-04.
- La «Antología de la literatura fantástica» no tiene género: útil para ver «Sin clasificar» (G-01).
- Para G-06: usar un `cliente_id` o `libro_id` inexistente (409) y el mismo `libro_id` en dos renglones (422); verificar con `GET /ventas/` que no se agregó ninguna venta.
- El 409 por ISBN repetido (G-02) y por email repetido (G-03) devuelven `detail` en texto.
- Aviso: no volver a correr `python -m scripts.seed` en la base desplegada una vez que hay datos de las pruebas (vacía las tablas).

## Evidencia: qué guardar
| Evidencia | Formato | Dónde |
|-----------|---------|-------|
| Captura del resultado visible en la UI por caso | PNG | `evidencia/` (nombrar `G-0X_...`) |
| Captura de F12 → Red (petición, método, ruta con `/api`, código de estado, respuesta) | PNG | `evidencia/` |
| Build de la imagen del front y `/api/health/ready` = 200 | Texto o PNG | `evidencia/` |
| Redeploy y datos persistentes | PNG | `evidencia/` |

Evidencia heredada del TP (backend, caso C-07 y D-01..D-08) en `backend/evidencia/`: no sustituye la del Global.

## Demostración mínima (checklist final)
1. Abrir la URL pública por HTTPS.
2. Consultar el catálogo.
3. Registrar una venta con dos renglones.
4. Recargar la página y reabrir el detalle de la venta desde el historial.
5. Los importes coinciden con los devueltos por la API en el 201.
