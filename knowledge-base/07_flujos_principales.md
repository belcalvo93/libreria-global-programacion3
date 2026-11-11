# Flujos Principales

Convención en los diagramas: `Api.*` es el cliente de `js/api.js`; las rutas se escriben con su barra final cuando la tienen.

## F1 — Consulta del catálogo (G-01)
```
Usuario escribe título / pulsa Buscar / Siguiente
  -> estado "cargando"
  -> Api.get("/libros/", { titulo, limit, offset })       (offset = 0 si cambió el filtro)
       200 []  y sin filtro  -> "lista vacía"
       200 []  y con filtro  -> "búsqueda sin coincidencias"
       200 [..]              -> tabla (título, ISBN, precio, editorial, género | "Sin clasificar")
       ApiError status 0     -> "error de conexión"
  -> clic en un libro: Api.get("/libros/" + id) -> detalle con autores (rol, orden)
```

## F2 — Alta de libro (G-02)
```
Carga de la sección: GET /editoriales/?limit=100 y GET /generos/?limit=100 -> selects
Agregar autoría: ID -> GET /autores/{id} (404 -> mensaje) -> nombre + rol + orden -> lista (con quitar)
Enviar: validar (título, ISBN, precio > 0, stock entero >= 0, editorial, >= 1 autoría)
  -> POST /libros/ {isbn, titulo, precio, stock, editorial_id, genero_id|null, autores:[{autor_id, rol, orden}]}
       201 -> mostrar éxito cerca del formulario + window.renderCatalogo()
       409 -> detail (ISBN repetido, o editorial/género/autor inexistente, o autor repetido)
       422 -> campos inválidos (api.js los junta en un texto)
```
Repetir el ISBN debe dar 409 (parte del caso G-02).

## F3 — Alta y búsqueda de cliente (G-03)
```
POST /clientes/ {nombre, email} -> 201 ClienteRead | 409 (email repetido, sin distinguir mayúsculas) | 422 (email inválido)
Buscar por ID: GET /clientes/{id} -> ClienteRead (con perfil o null) | 404
```

## F4 — Registrar una venta (G-04, G-06)
```
Elegir cliente: GET /clientes/{id} -> mostrar nombre
Agregar libros del catálogo (libro_id = id, no ISBN) / cambiar cantidades / quitar renglones   [borrador en memoria]
Confirmar: validar (>= 1 renglón, enteros > 0, sin libros repetidos) ; deshabilitar botón
  -> POST /ventas/ {cliente_id, renglones:[{libro_id, cantidad}]}      (nada más)
       201 VentaRead -> mostrar precio_unitario, subtotal y total DE LA RESPUESTA; limpiar formulario; refrescar historial
       409 -> cliente o libro inexistente ("El cliente indicado no existe" / "No existe el libro con id X") ; borrador conservado
       422 -> cuerpo inválido (p. ej. libros repetidos) ; borrador conservado
  -> finally: rehabilitar botón
Backend: el servidor copia el precio del libro a cada renglón, calcula el total y agenda el aviso simulado de comprobante.
```

## F5 — Historial y detalle tras recargar (demostración mínima)
```
GET /ventas/?limit&offset -> VentaResumen[] (id, fecha, total, cliente)
clic en una venta: GET /ventas/{id} -> VentaRead (fecha, cliente, renglones con importes históricos)
Recargar la página y reabrir la misma venta -> la API devuelve el mismo detalle (persistencia en PostgreSQL)
```

## F6 — Precio histórico (G-05)
```
PATCH /libros/{id} {"precio": <otro>} -> 200 LibroRead (nuevo precio en el catálogo)
GET /ventas/{id_anterior} -> mismos precio_unitario / subtotal / total que antes
```

## F7 — Despliegue (G-07)
```
Local:   backend (alembic upgrade head, seed, uvicorn :8000) + docker build/run del front con API_UPSTREAM -> http://127.0.0.1:8080
Easypanel: backend (Build Path /backend) -> frontend (Build Path /frontend, API_UPSTREAM=<proyecto>_<servicio>:8000, dominio HTTPS -> 80)
Verificar: https://<dominio-front>/api/health/ready = 200 -> catálogo -> venta de prueba -> redeploy -> los datos siguen
```
Detalle y diagnóstico en `12_despliegue_easypanel.md`.

## F8 — Trabajo del equipo (ramas y PR)
```
git checkout main && git pull
git checkout -b feat/<tarea>                 (ej. feat/catalogo-api)
/opsx:propose <nombre> -> /opsx:apply -> probar a mano -> /opsx:archive   (antes del PR)
commits en español con prefijo (feat|fix|docs|chore), uno por idea, sin atribución de IA
PR a main -> lo revisa otro integrante -> merge común ("Create a merge commit"), nunca squash
```
Nunca subir `.env`, contraseñas ni credenciales.
