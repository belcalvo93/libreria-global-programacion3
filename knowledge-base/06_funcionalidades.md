# Funcionalidades

Organizadas por ejercicio de la consigna (épica), con dueño y casos asociados. Las secciones del `index.html` existen desde el parcial (`catalogo`, `libros`, `clientes`, `ventas`, `historial`).

## Épica 1 — Catálogo y cliente HTTP (Ej. 1, 20 pts) · Hernán (catálogo) / Belén (`api.js`) · G-01
- **US-1.1** Como usuario, veo el catálogo con título, ISBN, precio, editorial y género; si el género es `null`, «Sin clasificar».
- **US-1.2** Busco por título (parcial, sin distinguir mayúsculas) con `GET /libros/?titulo=`.
- **US-1.3** Pagino con `limit`/`offset` (botones Anterior / Siguiente); si llegaron `limit` elementos, probablemente hay más (no hay total en la respuesta). Al cambiar el filtro, `offset` = 0.
- **US-1.4** Abro el detalle de un libro (`GET /libros/{id}`) y veo sus autores con rol y orden.
- **US-1.5** Veo cuatro estados distintos: cargando, lista vacía, búsqueda sin coincidencias y error de conexión (reutilizar los `mensaje-*` con `hidden`).
- **US-1.6** El catálogo expone `window.renderCatalogo()` para que las altas lo refresquen.
- **US-1.7 (técnica)** `js/api.js` expone `window.Api` (`get`, `post`, `patch`, `numero`, `ApiError`). Ver `08_arquitectura_propuesta.md`.

## Épica 2 — Alta de libros y clientes (Ej. 2, 20 pts) · Bruno · G-02, G-03
- **US-2.1** Cargo los selects de editorial y género desde `GET /editoriales/` y `GET /generos/` (género con opción «Sin clasificar» = `null`). Atención: son listados paginados (por defecto 20, máx. 100): pedir `limit=100`.
- **US-2.2** Agrego autorías ingresando el ID del autor → `GET /autores/{id}` → muestro el nombre → elijo rol y orden → lo agrego a una lista que permite quitar.
- **US-2.3** Doy de alta un libro con `POST /libros/` (stock entero ≥ 0, precio > 0, ≥ 1 autoría; «al menos un autor» lo valida el FRONT, lo pide la consigna del Ej. 2: decisión cerrada D-24); un 201 actualiza las vistas con el registro devuelto.
- **US-2.4** Doy de alta un cliente con `POST /clientes/`; busco clientes por ID con `GET /clientes/{id}` (no hay listado).
- **US-2.5** Veo errores 409 (ISBN o email repetido) y 422 con el mensaje del servidor, cerca del formulario.
- **US-2.6 (documentación)** El README documenta que autores y clientes se buscan por ID.

## Épica 3 — Ventas e historial (Ej. 3, 25 pts) · Joaquín · G-04, G-05, G-06
- **US-3.1** Selecciono un cliente buscándolo por ID (`GET /clientes/{id}`) y veo su nombre antes de usarlo.
- **US-3.2** Agrego libros del catálogo (`GET /libros/`), cambio cantidades y quito renglones; el borrador vive en memoria.
- **US-3.3** Confirmo con `POST /ventas/` (botón deshabilitado durante el envío); veo precios unitarios, subtotales y total de la respuesta; el formulario se limpia y el historial se actualiza.
- **US-3.4** Ante 409/422 veo el error y conservo el borrador.
- **US-3.5** Consulto el historial (`GET /ventas/` con `limit`/`offset`) y abro el detalle (`GET /ventas/{id}`): fecha, cliente, renglones e importes históricos.
- **US-3.6** Tras cambiar el precio de un libro con `PATCH /libros/{id}`, las ventas anteriores conservan sus importes (G-05). El front SÍ usa `PATCH /libros/{id}` (solo para este caso).

## Épica 4 — Imagen del frontend (Ej. 4, 15 pts) · Belén · HECHA y mergeada (PR #1)
- **US-4.1** `frontend/public/` con `index.html`, `css/`, `js/` (y `img/` si aplica).
- **US-4.2** `Dockerfile` (`nginx:1.30-alpine`, `NGINX_ENVSUBST_FILTER=^API_UPSTREAM$`), `.dockerignore`, `default.conf.template` y `env.example`.
- **US-4.3** Verificación local: `docker build` + `docker run` y `/api/health/ready` = 200 bajo el origen del front.

## Épica 5 — Servicios en Easypanel (Ej. 5, 20 pts) · Elías (backend, evidencia, ZIP) / Belén (frontend, DEPLOY.md) · G-07
- **US-5.1** CORS por variable de entorno en el backend (`CORS_ORIGINS`) — Elías.
- **US-5.2** El servicio `apilibreria` se construye desde este monorepo (Build Path `/backend`) con las mismas variables y la misma base — Elías.
- **US-5.3** Servicio App `frontend` (Build Path `/frontend`, Dockerfile, `API_UPSTREAM`, dominio HTTPS → puerto 80) — Belén.
- **US-5.4** `DEPLOY.md` en la raíz con URL pública, revisión (commit), rutas de build, puertos, proxy, nombres de variables, migraciones, carga inicial y pasos de actualización — Belén.
- **US-5.5** Evidencia en `evidencia/` y ZIP final — Elías.

## Épica transversal — Estante y estética · Belén (después del catálogo de Hernán)
- **Alcance decidido (D-25, ampliado en D-31 a D-35)**. Propuesta: `openspec/changes/estante-estetica/`.
- **Estantería**: sección propia `#estante`, en la pantalla de inicio (junto a la cabecera y el nav, en 100dvh), un gabinete compacto de madera con hasta 12 libros de lomo de `GET /libros/?limit=12` (en escritorio entran los 12; en pantallas angostas se desplaza horizontalmente).
  - Cada libro es un botón de lomo de cuero con bandas doradas y el título en vertical de abajo hacia arriba, en blanco y siempre completo (sin recorte); los lomos son más anchos y más altos según el título y de alturas desparejas. Con el cursor o el foco sale al frente, se inclina mostrando su tapa y destella (con «reducir movimiento» solo cambian brillo y borde), y aparece una etiqueta con el título completo. Al hacer clic abre el detalle (`GET /libros/{id}`) con `window.mostrarDetalleLibro`.
  - Color e inclinación salen del id; ancho, altura y tamaño de letra, del largo del título y del id (D-33 y D-34). Hay una capa opcional de portadas reales por ISBN, solo al salir el libro (hoy sin imágenes).
  - Muestra estados de carga, vacío y error.
- **Gato y luna**: imágenes decorativas (`img/gato.webp`, `img/luna.webp`); el gato se sienta sobre el estante y el gato nuevo se sienta arriba a la izquierda del gabinete, mirando a la luna, y la luna (~120 px) queda entera, detrás del contenido, arriba a la derecha.
- **Navegación**: etiquetas tipo pestaña arriba del estante. Es el mismo `<nav>` con sus enlaces ancla, con `aria-current` en la sección activa.
- **Tema «librería mágica» en todo el front**:
  - cielo nocturno con estrellas, luna (imagen) y estrella fugaz;
  - dorado y violeta suave como acentos;
  - tipografía Georgia (título normal sin contorno; encabezados y pestañas en negrita), sin fuentes locales;
  - componentes en tema oscuro con contraste AA;
  - todo se apaga con `prefers-reduced-motion`.

  Los valores están en `design-system/README.md` (revisión 9, **aprobada** por Belén Calvo el 2026-11-12; C-06 archivado, falta el PR).
- La tabla del catálogo de Hernán se mantiene; el estante no la reemplaza. Se hace después de C-03 mergeado.

## Tarea final — Limpieza · Belén
- Eliminar `js/datos.js` y `js/persistencia.js` cuando Hernán, Bruno y Joaquín estén mergeados y ninguna sección use `DATOS`. Se mergea ANTES del deploy final del viernes 13 a la noche (D-23); si se atrasa, se redespliega el sábado.

## Endpoints disponibles y no consumidos
Ver la tabla «usado / no usado por el front» en `11_contrato_api.md`.
