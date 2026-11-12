# CHANGES — Secuencia de Implementación

> Índice canónico de todos los changes del proyecto **Librería Página Viva** (Global de Programación III, Grupo 2 «git push and pray»).
> Cada change es atómico: una persona lo implementa en una sesión y lo cierra con su propio PR.
> **Leer este archivo antes de ejecutar cualquier `/opsx:propose`.**

Integrantes: **B** Belén Calvo · **H** Hernán González · **R** Bruno Fiouchetta · **J** Joaquín Morán · **E** Elías Tello.
Entrega prevista: sábado 14 de noviembre (fecha y canal oficiales: TBD, ver `knowledge-base/10_preguntas_abiertas.md`).

Leyenda de estado: `[x]` hecho (mergeado, o archivado en OpenSpec con su PR por abrir: se aclara en cada entrada) · `[~]` en revisión (rama sin PR) · `[ ]` pendiente.
Leyenda de gobernanza: BAJO (LOW) autonomía plena si pasan las pruebas · MEDIO (MEDIUM) implementar con checkpoints · ALTO (HIGH) proponer y esperar revisión antes de escribir · CRITICO (CRITICAL) solo análisis hasta aprobación. Este proyecto no tiene auth ni pagos, por eso no hay changes CRITICO.

---

## Cómo usar este documento

1. Identificá tu change por el dueño (B, H, R, J o E) y verificá en el árbol que sus dependencias estén **mergeadas** en `main`.
2. Leé los archivos de `knowledge-base/` listados en **Leer antes** de ese change (y `10_preguntas_abiertas.md` si hay un `(TBD)` que te toque).
3. Creá la rama `feat/<tarea>` desde `main` actualizado y corré `/opsx:propose <C-NN-nombre>` → `/opsx:apply` → prueba manual. Solo tocás tu archivo JS y tu sección del `index.html`; commits en español con prefijo (`feat|fix|docs|chore`), uno por idea, **sin atribución de IA**.
4. Corré `/opsx:archive` **antes** de abrir el PR. PR a `main`, revisión de otro integrante, merge común («Create a merge commit»), nunca squash.
5. Marcá el checkbox de **Estado** en este archivo (`[x]`) en el PR o inmediatamente después del merge.

Cronograma del grupo: **mié 11** base (C-01; C-02 es lo primero del día, tras mergear el PR de la fundación) · **jue 12 – vie 13** ejercicios (C-03 a C-06, C-07, C-09) · **vie 13 noche** deploy final (C-08, C-10; con C-07 ya mergeado) · **sáb 14** casos G-01..G-07, evidencia, `DEPLOY.md` y ZIP (C-11, C-12, C-13).

---

## Árbol de dependencias

```
C-01 imagen-frontend-docker [x]  (B)
 ├── C-02 cliente-http-api-js [x]  (B, retroactivo archivado; PR #4 mergeado)
 │     ├── C-03 catalogo-api [x] (H, G-01)
 │     │     ├── C-06 estante-estetica [x] (B, archivado; PR por abrir)
 │     │     └──┐
 │     ├── C-04 altas-libros-clientes (R, G-02/G-03) ──┤  (aviso blando a C-03: window.renderCatalogo)
 │     └── C-05 ventas-historial (J, G-04/G-05/G-06) ──┤
 │                                                      │
 │        C-03 + C-04 + C-05 mergeados ─────────────────┼── C-07 limpieza-datos-persistencia (B)  ★ ÚLTIMA del camino crítico
 │                                                      │
 │        C-03 + C-04 + C-05 mergeados ─────────────────┴── C-08 despliegue-frontend-easypanel (B)
 │                                                              │
C-09 cors-backend [x] (E) ── sin dependencias de código ──────────┤
 │                                                              ▼
 └────────────────────────────────────────── C-10 apilibreria-desde-monorepo (E)   [necesita C-09 y el dominio de C-08]
                                                                │
                              C-08 + C-10 ──────────────────────┼── C-12 deploy-md (B)
                              C-03,C-04,C-05 + C-08 + C-10 ─────┴── C-11 evidencia-casos-g (todos, junta E)
                                                                         │
                                          C-11 + C-12 ───────────────── C-13 zip-entrega (E)
```

Notas de dependencia:
- C-01 está hecha (PR #1): es la base de todo el frente.
- `js/datos.js` y `js/persistencia.js` **no se borran** hasta C-07; hasta entonces las secciones que aún usan `DATOS` siguen funcionando.
- C-04 llama a `window.renderCatalogo()` (lo expone C-03); es una dependencia **blanda**: C-04 debe guardar con `typeof window.renderCatalogo === "function"` y no bloquearse si C-03 aún no está mergeado.
- C-08 y C-10 quedan acoplados: el dominio del front (que asigna Easypanel al crear el servicio; lo define Belén en C-08) alimenta `CORS_ORIGINS`. C-09 y C-10 dependen de ese dato, que sigue (TBD) hasta C-08.

### Paralelismo por fase

```
GATE 0: C-01 ✓ (hecha)
  → C-02 cliente-http-api-js                 [B — mié 11: change retroactivo hecho y archivado; PR de feat/api-cliente en revisión, api.js queda en main al mergearlo; no bloquea a nadie]
  → C-09 cors-backend                        [E — independiente: solo toca backend/]

GATE 1: C-02 ✓ (api.js mergeado)             ← PRIMER FORK
  → C-03 catalogo-api                        [H]
  → C-04 altas-libros-clientes               [R]
  → C-05 ventas-historial                    [J]
  (B: revisa PRs; prepara C-08 hasta donde no dependa de las funcionalidades)

GATE 2: C-03 ✓ (catálogo mergeado)
  → C-06 estante-estetica                    [B]

GATE 3: C-03 ✓ + C-04 ✓ + C-05 ✓            ← FORK de cierre
  → C-07 limpieza-datos-persistencia         [B]
  → C-08 despliegue-frontend-easypanel       [B — con C-07 mergeado ANTES del deploy final del vie 13 noche]

GATE 4: C-08 ✓ (dominio del front) + C-09 ✓ (CORS)
  → C-10 apilibreria-desde-monorepo          [E]

GATE 5: C-08 ✓ + C-10 ✓ (vie 13 noche → sáb 14)
  → C-12 deploy-md                           [B]
  → C-11 evidencia-casos-g                   [H: G-01 · R: G-02, G-03 · J: G-04, G-05, G-06 · B: G-07 imagen · E: G-07 deploy y recolección]

GATE 6: C-11 ✓ + C-12 ✓
  → C-13 zip-entrega                         [E]
```

### Camino crítico (5 changes — mínimo irreducible hacia el código final)

```
C-01 ✓ → C-02 → C-03 | C-04 | C-05 (las tres en paralelo; manda la más lenta) → C-07 ★
```

★ C-07 (limpieza de `datos.js` y `persistencia.js`) es la **última** tarea del camino crítico: depende de que H, R y J estén mergeados. Decisión: se mergea ANTES del deploy final del viernes 13 a la noche; si se atrasa, se redespliega el sábado (en Easypanel es un clic).

Cadena de entrega (corre en paralelo y se cierra con evidencia y ZIP): `C-09 → C-10 → C-12 / C-11 → C-13`, apoyada en `C-08`. C-06 (estante y estética) no está en el camino crítico: es acotable o recortable si falta tiempo.

### Plan óptimo con 5 integrantes

| Paso | B (Belén) | H (Hernán) | R (Bruno) | J (Joaquín) | E (Elías) |
|------|-----------|------------|-----------|-------------|-----------|
| 0 · mié 11 | C-02: change retroactivo ya archivado; PR de `feat/api-cliente` en revisión (`api.js` queda en main al mergearlo; no bloquea a nadie) | — | — | — | C-09 cors-backend |
| 1 · jue 12 | Revisar y mergear C-02 (con otro revisor); revisar PRs | C-03 catalogo-api | C-04 altas-libros-clientes | C-05 ventas-historial | C-09 (cierre y PR) |
| 2 · vie 13 día | C-06 estante-estetica (tras C-03 mergeado) | Cierre de C-03 y PR; revisiones | Cierre de C-04 y PR | Cierre de C-05 y PR | Preparar C-10 (repo, rama, Build Path) |
| 3 · vie 13 tarde | C-07 limpieza (con H, R, J mergeados) | — | — | — | — |
| 4 · vie 13 noche | C-08 despliegue del frontend | — | — | — | C-10 apilibreria desde monorepo (con dominio del front y C-09) |
| 5 · sáb 14 | C-12 DEPLOY.md · G-07 (imagen) | G-01 (en C-11) | G-02, G-03 (en C-11) | G-04, G-05, G-06 (en C-11) | C-11 recolecta evidencia · G-07 deploy · C-13 ZIP |

---

## FASE 1 — Base e imagen del frontend

### [C-01] `imagen-frontend-docker`
- **Estado**: `[x]` hecha y mergeada (PR #1, `feat/frontend-docker`). Si pasó por OpenSpec o no: (TBD).
- **Dueño**: B (Belén) · **Ej.**: 4 (15 pts) · US-4.1..4.3
- **Scope**:
  - `frontend/Dockerfile` (`nginx:1.30-alpine`, `NGINX_ENVSUBST_FILTER=^API_UPSTREAM$`), `.dockerignore`, `default.conf.template` con `proxy_pass` de `/api/` a `API_UPSTREAM`, `env.example`.
  - `frontend/public/` con `index.html`, `css/styles.css`, `js/*`.
  - Verificación local: `docker build` + `docker run` y `/api/health/ready` = 200 bajo el origen del front.
- **Dependencias**: ninguna
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/08_arquitectura_propuesta.md`
  - `knowledge-base/12_despliegue_easypanel.md` §Ejecución local → Frontend
  - `knowledge-base/09_decisiones_y_supuestos.md` D-02, D-12

### [C-02] `cliente-http-api-js`
- **Estado**: `[x]` hecha y mergeada (PR #4, `feat/api-cliente`, merge `9b0e52a`). **Change RETROACTIVO** verificado contra el código y archivado en OpenSpec (`openspec/changes/archive/2026-11-11-cliente-http-api-js/`; spec en `openspec/specs/cliente-http/spec.md`). Las pruebas manuales de abajo siguen siendo la guía de verificación (no hay constancia en el repo de que se hayan corrido: sin confirmar).
- **Dueño**: B (Belén) · **Ej.**: 1 (parte técnica, US-1.7)
- **Scope**:
  - `frontend/public/js/api.js` expone `window.Api` con `get`, `post`, `patch`, `numero`, `ApiError` (IIFE, `var`, `"use strict"`).
  - Base `/api`; errores en español: 404, 409 y 422 (junta los `detail` de validación en un texto) y status 0 = error de conexión.
  - Decimales llegan como texto (`"1500.00"`): `numero` los convierte solo para mostrar; nunca se recalcula un importe (D-08).
  - Cargar `js/api.js` en `index.html` antes de los scripts de sección (sección del HTML de Belén).
  - Pruebas manuales: salud `/api/health/ready`, un 404, un 409 y un 422 de ejemplo.
- **Dependencias**: `C-01` (usa el proxy `/api` de nginx)
- **Governance**: ALTO (todos los demás changes del front lo consumen; un error de contrato rompe todas las secciones)
- **Leer antes**:
  - `knowledge-base/08_arquitectura_propuesta.md` §`api.js` y convenciones del front
  - `knowledge-base/11_contrato_api.md` §Convenciones comunes y §Mensajes de error
  - `knowledge-base/06_funcionalidades.md` US-1.7
  - `knowledge-base/09_decisiones_y_supuestos.md` D-03, D-04, D-13
  - `knowledge-base/10_preguntas_abiertas.md` I-09, I-11

---

## FASE 2 — Funcionalidades del frontend

> Fork: C-03, C-04 y C-05 corren en paralelo porque cada integrante toca solo su archivo JS y su sección del `index.html` (sin conflictos de merge). Todas parten de `api.js` mergeado (C-02).

### [C-03] `catalogo-api`
- **Estado**: `[x]` hecha y mergeada (PR #19, `feat/catalogo-api`, merge `391bb61`); implementada, probada (G-01 local) y archivada en OpenSpec (`openspec/changes/archive/2026-11-11-catalogo-api/`; spec en `openspec/specs/catalogo-libros/spec.md`)
- **Dueño**: H (Hernán) · **Ej.**: 1 (20 pts) · US-1.1..1.6 · **Caso**: G-01 · Rama de ejemplo: `feat/catalogo-api`
- **Scope**:
  - `js/catalogo.js` + `<section id="catalogo">` consumiendo `GET /libros/?titulo=&limit=&offset=` (búsqueda parcial por título, `offset` = 0 al cambiar el filtro).
  - Tabla: título, ISBN, precio, editorial y género (`null` → «Sin clasificar»).
  - Paginación Anterior / Siguiente: si llegaron `limit` elementos, probablemente hay más (sin total en la respuesta).
  - Detalle `GET /libros/{id}` con autores (rol y orden).
  - Cuatro estados: cargando, lista vacía, búsqueda sin coincidencias, error de conexión (reutilizar los `mensaje-*` con `hidden`).
  - Exponer `window.renderCatalogo()` para que las altas lo refresquen.
  - Prueba manual de G-01 contra el seed (la «Antología de la literatura fantástica» no tiene género).
- **Dependencias**: `C-02`
- **Governance**: MEDIO
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §Épica 1
  - `knowledge-base/07_flujos_principales.md` §F1
  - `knowledge-base/11_contrato_api.md` §`GET /libros/` y `LibroResumen`/`LibroRead`
  - `knowledge-base/13_casos_g_y_evidencia.md` G-01 y pistas del seed
  - `knowledge-base/10_preguntas_abiertas.md` (filtro `genero_id`: baja prioridad, decide Hernán)

### [C-04] `altas-libros-clientes`
- **Estado**: `[x]` implementada, probada con 10 tests unitarios en `frontend/tests/altas.test.js` y archivada en OpenSpec (`openspec/changes/archive/2026-11-12-altas-libros-clientes/`; spec en `openspec/specs/altas-libros-clientes/spec.md`); falta prueba manual E2E de G-02/G-03 detrás de nginx y PR a `main`
- **Dueño**: R (Bruno) · **Ej.**: 2 (20 pts) · US-2.1..2.6 · **Casos**: G-02, G-03
- **Scope**:
  - `js/altas.js` + `<section id="libros">` y `<section id="clientes">`.
  - Selects de editorial y género con `GET /editoriales/?limit=100` y `GET /generos/?limit=100` (género opcional → `null`).
  - Autorías: ID de autor → `GET /autores/{id}` (404 → mensaje) → nombre + rol (`autor|coautor|traductor|ilustrador`) + orden (≥ 1) → lista con quitar.
  - `POST /libros/` validando en el front: título, ISBN, precio > 0, stock entero ≥ 0, editorial, **≥ 1 autoría validada en el FRONT** (decisión cerrada, D-24: lo pide la consigna del Ej. 2; el DTO del backend no lo exige, I-01); 201 → mensaje de éxito cerca del formulario y `window.renderCatalogo()` si existe.
  - `POST /clientes/` y búsqueda `GET /clientes/{id}` (no hay listado de clientes).
  - Errores 409 (ISBN/email repetido) y 422 mostrando el mensaje del servidor.
  - Documentar en el README que autores y clientes se buscan por ID (US-2.6, I-18).
  - Pruebas manuales de G-02 (incluye repetir el ISBN → 409) y G-03 (repetir email → 409).
- **Dependencias**: `C-02` (blanda: `C-03` por `window.renderCatalogo`)
- **Governance**: MEDIO
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §Épica 2
  - `knowledge-base/07_flujos_principales.md` §F2 y §F3
  - `knowledge-base/11_contrato_api.md` §Cuerpos de entrada (`POST /libros/`, `POST /clientes/`)
  - `knowledge-base/05_reglas_de_negocio.md` (RN-10 paginación y reglas de libros/clientes)
  - `knowledge-base/10_preguntas_abiertas.md` I-01, I-03 y `knowledge-base/09_decisiones_y_supuestos.md` D-24 (autor mínimo validado en el front)

### [C-05] `ventas-historial`
- **Estado**: `[ ]` pendiente
- **Dueño**: J (Joaquín) · **Ej.**: 3 (25 pts) · US-3.1..3.6 · **Casos**: G-04, G-05, G-06
- **Scope**:
  - `js/ventas.js` + `<section id="ventas">` y `<section id="historial">`.
  - Elegir cliente por ID (`GET /clientes/{id}`) y mostrar el nombre; agregar libros desde `GET /libros/` usando el **`id` del libro, no el ISBN** (I-17); cambiar cantidades y quitar renglones; borrador solo en memoria (sin `localStorage`).
  - `POST /ventas/ {cliente_id, renglones:[{libro_id, cantidad}]}` sin más campos; validar ≥ 1 renglón, enteros > 0 y sin libros repetidos; deshabilitar el botón durante el envío y rehabilitarlo en `finally`.
  - 201: mostrar `precio_unitario`, `subtotal` y `total` **de la respuesta** (nunca recalcular, D-08), limpiar el formulario y refrescar el historial.
  - 409/422: mostrar el error y conservar el borrador.
  - Historial `GET /ventas/?limit&offset` y detalle `GET /ventas/{id}` (fecha, cliente, renglones, importes históricos); debe sobrevivir a recargar la página.
  - G-05: `PATCH /libros/{id}` enviando solo `{"precio": ...}`; la venta anterior conserva sus importes.
  - Pruebas manuales de G-04, G-05 y G-06.
- **Dependencias**: `C-02`
- **Governance**: MEDIO (importes históricos y estado del borrador)
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §Épica 3
  - `knowledge-base/07_flujos_principales.md` §F4, §F5 y §F6
  - `knowledge-base/11_contrato_api.md` §`POST /ventas/`, `VentaRead`/`VentaResumen` y errores de ventas
  - `knowledge-base/05_reglas_de_negocio.md` (RN-06 precio histórico)
  - `knowledge-base/13_casos_g_y_evidencia.md` G-04, G-05, G-06

### [C-06] `estante-estetica`
- **Estado**: `[x]` hecho y **archivado** el 2026-11-12 (`openspec/changes/archive/2026-11-12-estante-estetica/`; specs sincronizadas en `openspec/specs/estante-libros/`, `navegacion-principal/` y `tema-visual/`). Design system **revisión 9 aprobada por Belén Calvo el 2026-11-12**. **Falta abrir el PR** de `feat/estante-estetica` a `main` (con aviso a Hernán, Bruno y Joaquín del cambio visual global; revisión de otro integrante y merge común). Seguimiento manual abierto: tarea 5.4 (lector de pantalla NVDA o Narrador), que no se automatiza
- **Dueño**: B (Belén) · **Ej.**: transversal (sin puntaje propio en la consigna según la KB)
- **Scope** (D-25, ampliado en D-31 a D-41):
  - **Tema global «librería mágica»**: el clima de una librería encantada de noche en todo el front.
    - Cielo nocturno con la imagen `fondo-noche.webp` (1920x1072) y un velo azul noche, fijo detrás de toda la página; luna (imagen) y una estrella fugaz ocasional.
    - Dorado como acento y violeta suave como segundo acento.
    - `.card`, formularios, tablas, botones y mensajes en tema oscuro con contraste AA y foco dorado.
    - Se reasignan las variables `--color-*` de `:root` y se agregan `--magia-*`, `--lomo-*`, `--oro-lomo`, `--nogal*`, `--libro-prof`, `--fuente-titulo`, `--fuente-encabezados` y `--mov-*`. Los hex y los contrastes están en `design-system/README.md` (revisión 9) y en `design.md` D2 del change.
  - **Tipografía**: Georgia (título normal sin contorno; `h2`, `h3` y pestañas en negrita) y fuentes del sistema; **sin fuentes locales** (se eliminó Almendra: ya no hay `fonts/` ni `types` en nginx).
  - **Inicio en una pantalla**: un bloque de 100dvh con cabecera, nav y estantería enteras a 1366x768, 1920x1080 y 390x844; las demás secciones siguen debajo y las anclas del nav no cambian.
  - **Estantería**: `<section id="estante">` en la pantalla de inicio, un **gabinete compacto de madera** (nogal con vetas, fondo en sombra cálida con luz dorada y repisa de madera) con hasta 12 libros de lomo de `GET /libros/?limit=12` (en escritorio entran los 12; el resto, con scroll horizontal).
    - Cada libro es un `<button>` de lomo de cuero con bandas doradas y el título en vertical de abajo hacia arriba, en blanco, directo sobre el cuero y **nunca recortado** (hasta 80 caracteres). Con el cursor o el foco sale al frente, se inclina mostrando su tapa en 3D y destella (con «reducir movimiento» solo cambian brillo y borde), y aparece una etiqueta con el título completo. Al hacer clic abre el detalle con `window.mostrarDetalleLibro(id, boton)`.
    - El color (`id % 5`) y la inclinación (`id % 7`) salen del id; el ancho (3.5 a 6 rem), la altura (11 a 16 rem) y el tamaño de letra, del largo del título y del id, con alturas desparejas a propósito. Todo con clases.
    - Portada real opcional (`img/portadas/<isbn>`) solo para los ISBN de una lista en `estante.js` (hoy vacía) y solo al salir el libro.
    - Muestra estados de carga, vacío y error.
  - **Gato y luna**: imágenes `img/gato.webp` (364x960, arriba a la izquierda del gabinete, mirando a la luna) y `img/luna.webp` (380x380, decorativas, `alt=""`, `aria-hidden`). El gato se sienta sobre el mueble y su resplandor respira; el gato (110 a 140 px) se sienta sobre el borde superior derecho del mueble y la luna (90 a 120 px) está entera arriba a la derecha, detrás del contenido y sin pisar la navegación. Origen de las imágenes: TBD.
  - **Nav**: el mismo `<nav>`, ahora una franja fija con **marcapáginas colgantes** de una varilla dorada (la activa, dorada y más larga), y `aria-current="location"` por clic, hash o scroll. El título «Librería Página Viva» es un enlace que vuelve al inicio (`#inicio`).
  - **Escena continua**: la estantería no tiene tarjeta; el cielo estrellado se ve de borde a borde detrás de toda la portada.
  - **Movimiento**: todo se declara solo con `prefers-reduced-motion: no-preference`. Responsive de 320 a 1280 px. Sin recursos remotos.
  - **Archivos**:
    - `css/styles.css`;
    - `index.html` (solo `#estante`, el `<script>` final y lo decorativo de nav y cabecera; el texto del título no cambia);
    - `js/estante.js` (nuevo);
    - `img/` (se versiona);
    - `default.conf.template` (solo el cache de `/img/`);
    - `tests/estante.test.js` (nuevo);
    - `design-system/README.md`.

    No se toca `catalogo.js`, `altas.js`, `ventas.js`, `api.js`, el HTML de las secciones ajenas ni `backend/`.
  - **Riesgo**: el tema cambia el aspecto de las secciones de Hernán, Bruno y Joaquín (solo CSS). Las tasks §6 exigen verificarlas a mano y el PR debe avisarles.
  - Se hace **después** del catálogo de Hernán (C-03 mergeado) para no pisar su sección.
- **Dependencias**: `C-03`
- **Governance**: MEDIO (antes BAJO: el tema reasigna estilos compartidos que afectan secciones ajenas)
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §Épica transversal
  - `knowledge-base/08_arquitectura_propuesta.md` §convenciones del front
  - `knowledge-base/09_decisiones_y_supuestos.md` D-10, D-14
  - `knowledge-base/09_decisiones_y_supuestos.md` D-25 (alcance del estante) y `design-system/README.md`

### [C-07] `limpieza-datos-persistencia`
- **Estado**: `[ ]` pendiente
- **Dueño**: B (Belén) · **Ej.**: cierre del front · **ÚLTIMA tarea del camino crítico** · **se mergea ANTES del deploy final del vie 13 a la noche** (D-23); si se atrasa, se redespliega el sábado (un clic en Easypanel)
- **Scope**:
  - Borrar `frontend/public/js/datos.js` y `frontend/public/js/persistencia.js`.
  - Quitar sus `<script>` del `index.html` y verificar con búsqueda que ninguna sección use `DATOS` ni `persistencia`.
  - Prueba manual de las cinco secciones (`catalogo`, `libros`, `clientes`, `ventas`, `historial`) y consola sin errores.
  - Hasta que este change se mergee, esos archivos **no se borran** (D-16).
- **Dependencias**: `C-03, C-04, C-05` (los tres mergeados)
- **Governance**: ALTO (borrado de archivos; se propone y se espera revisión antes de escribir)
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §Tarea final — Limpieza
  - `knowledge-base/09_decisiones_y_supuestos.md` D-09, D-16
  - `knowledge-base/03_actores_y_roles.md` §Equipo y propiedad de archivos

---

## FASE 3 — Servicios y despliegue (Ej. 5, 20 pts)

### [C-09] `cors-backend`
- **Estado**: `[x]` hecha y mergeada (PR #18, `feat/cors-backend`, merge `5afb40c`): change propuesto, aplicado y archivado en OpenSpec (`openspec/changes/archive/2026-11-11-cors-backend/`; spec en `openspec/specs/cors-api/spec.md`); 18 tests con `unittest` en `backend/tests/`. El `min_length=1` de I-01 quedó afuera (a acordar con Bruno). El dominio del front para `CORS_ORIGINS` sigue TBD hasta C-08.
- **Dueño**: E (Elías) · **Ej.**: 5 · US-5.1
- **Scope**:
  - `backend/app/main.py`: middleware CORS leyendo la variable `CORS_ORIGINS` (hoy no existe, I-06). Formato: una o varias URL de origen exacto (esquema + host, sin barra final) separadas por coma; se lee con `os.getenv("CORS_ORIGINS", "").split(",")`, quitando espacios y vacíos. Local: `CORS_ORIGINS=http://127.0.0.1:8080,http://localhost:8080`.
  - Agregar `CORS_ORIGINS` a `backend/env.example` (solo el nombre; el valor `https://<dominio-del-front>` se carga en Easypanel).
  - Opcional a decidir con Bruno: `min_length=1` en `LibroCreate.autores` (I-01).
  - Tests: origen permitido, origen no permitido, variable ausente.
  - Con el proxy nginx (mismo origen) el front funciona sin CORS; este change cubre accesos cross-origin y el requisito de la consigna.
- **Dependencias**: ninguna de código (el valor real de `CORS_ORIGINS` depende del dominio del front que define Belén en `C-08`; TBD hasta entonces)
- **Governance**: ALTO (configuración de seguridad del backend)
- **Leer antes**:
  - `knowledge-base/12_despliegue_easypanel.md` §Variables de entorno y §Backend (Elías)
  - `knowledge-base/10_preguntas_abiertas.md` I-01, I-06
  - `knowledge-base/11_contrato_api.md` §Convenciones comunes
  - `knowledge-base/03_actores_y_roles.md` §RBAC (mitigaciones: backend no expuesto, `extra="forbid"`)

### [C-08] `despliegue-frontend-easypanel`
- **Estado**: `[ ]` pendiente
- **Dueño**: B (Belén) · **Ej.**: 5 · US-5.3 · **Caso**: G-07 (imagen)
- **Scope**:
  - Servicio App `frontend` en el proyecto `grupo2-elias`: repo `belcalvo93/libreria-global-programacion3`, rama `main`, Build Path `/frontend`, builder Dockerfile (`Dockerfile`).
  - Variable `API_UPSTREAM=grupo2-elias_apilibreria:8000` (`host:puerto`, sin `http://` ni barra final).
  - Dominio HTTPS asignado, protocolo interno HTTP, puerto destino 80. **URL pública: (TBD)**: la define Belén al crear el servicio y sigue TBD hasta esta tarea; se la pasa a Elías para `CORS_ORIGINS` (C-09 y C-10 dependen de ese dato).
  - Verificar `https://<dominio-front>/api/health/ready` = 200, catálogo y una venta de prueba desde esa URL.
  - Deploy final del vie 13 a la noche con C-07 ya mergeado; si C-07 se atrasa, redeploy el sábado (un clic en Easypanel, no cambia comportamiento). Redeploy tras cada merge relevante.
- **Dependencias**: `C-01, C-02, C-03, C-04, C-05` (para el deploy final; un primer alta del servicio solo para obtener dominio puede hacerse antes con `C-01`)
- **Governance**: ALTO (infraestructura de producción)
- **Leer antes**:
  - `knowledge-base/12_despliegue_easypanel.md` §Servicios, §Frontend (Belén) y §Diagnóstico
  - `knowledge-base/07_flujos_principales.md` §F7
  - `knowledge-base/08_arquitectura_propuesta.md` (nginx y variables)
  - `knowledge-base/10_preguntas_abiertas.md` (dominio del front / `CORS_ORIGINS`)

### [C-10] `apilibreria-desde-monorepo`
- **Estado**: `[ ]` pendiente
- **Dueño**: E (Elías) · **Ej.**: 5 · US-5.2 · **Caso**: G-07 (deploy)
- **Scope**:
  - Cambiar la fuente del servicio `apilibreria` (hoy despliega desde `eEmanuel07/Librer-a_Prog.3_2026`, rama `despliegue`, commit `e623a77`) a `belcalvo93/libreria-global-programacion3`, rama `main`, Build Path `/backend`, Dockerfile `Dockerfile`; mantener las mismas variables (`DATABASE_URL`, `SQL_ECHO`) y la misma base `dblibreria`.
  - Cargar `CORS_ORIGINS=https://<dominio-del-front>` con el dominio de C-08 (dato TBD hasta que Belén cree el servicio `frontend`).
  - Revisar log: `alembic upgrade head` y `Uvicorn running on http://0.0.0.0:8000`; salud `/health/ready` = 200 desde el shell del servicio.
  - **No** correr `python -m scripts.seed` sobre una base con datos (vacía todas las tablas); verificar que el catálogo tenga datos.
  - Quitar el dominio automático del backend (hoy existe uno público) para dejarlo solo en red interna.
  - Confirmar G-07: datos persistentes tras redeploy.
- **Dependencias**: `C-09`, `C-08` (dominio del front)
- **Governance**: ALTO (producción, base de datos con datos reales del grupo)
- **Leer antes**:
  - `knowledge-base/12_despliegue_easypanel.md` §Backend (Elías) y §Actualización y redeploy
  - `knowledge-base/09_decisiones_y_supuestos.md` D-15, D-21, D-22, D-27
  - `knowledge-base/10_preguntas_abiertas.md` (datos en la BD desplegada, dominio automático)
  - `knowledge-base/13_casos_g_y_evidencia.md` G-07 y aviso del seed

---

## FASE 4 — Evidencia y entrega

### [C-12] `deploy-md`
- **Estado**: `[ ]` pendiente
- **Dueño**: B (Belén) · **Ej.**: 5 · US-5.4
- **Scope**:
  - `DEPLOY.md` en la **raíz** del repo (distinto de `backend/DEPLOY.md`, que puede reutilizarse como base).
  - Contenido: URL pública, revisión (commit), rutas de build, puertos, proxy, **nombres** de variables (nunca valores), migraciones, carga inicial, pasos de actualización y resultados de las comprobaciones.
  - Sin credenciales.
  - Actualizar el reparto desactualizado del `README.md` (I-10) y su mención de `evidencia/` y `DEPLOY.md` si hace falta.
- **Dependencias**: `C-08, C-10`
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/12_despliegue_easypanel.md` §`DEPLOY.md`
  - `knowledge-base/10_preguntas_abiertas.md` I-10, I-13
  - `knowledge-base/01_vision_y_objetivos.md` (consigna y entrega)

### [C-11] `evidencia-casos-g`
- **Estado**: `[ ]` pendiente
- **Dueño**: todos ejecutan sus casos; **E** junta la evidencia en `evidencia/` (carpeta aún inexistente en la raíz)
- **Scope**:
  - Ejecutar desde la **URL pública** con datos ficticios: G-01 (H), G-02 y G-03 (R), G-04, G-05 y G-06 (J), G-07 (B imagen / E deploy).
  - Por caso: pasos, resultado observado, captura de UI y captura de F12 → Red (método, ruta con `/api`, código de estado, respuesta) en `evidencia/` con nombre `G-0X_...`. Ocultar contraseñas y valores privados.
  - Evidencia de G-07: build de la imagen, `/api/health/ready` = 200, redeploy y datos persistentes.
  - Demostración mínima final: abrir por HTTPS, catálogo, venta de dos renglones, recargar y reabrir el detalle con importes iguales a los del 201.
  - No volver a correr `scripts.seed` en la base desplegada. La evidencia heredada de `backend/evidencia/` no sustituye la del Global.
- **Dependencias**: `C-03, C-04, C-05, C-08, C-10`
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/13_casos_g_y_evidencia.md`
  - `knowledge-base/07_flujos_principales.md` §F5, §F6, §F7
  - `knowledge-base/11_contrato_api.md` (códigos y mensajes esperados)
  - `knowledge-base/01_vision_y_objetivos.md` §Demostración mínima

### [C-13] `zip-entrega`
- **Estado**: `[ ]` pendiente
- **Dueño**: E (Elías) · **Ej.**: 5 · US-5.5
- **Scope**:
  - ZIP por grupo con `frontend/`, `backend/`, `README.md`, `DEPLOY.md` y `evidencia/`, incluyendo Dockerfiles, configuración versionada de nginx y archivos de ejemplo de variables.
  - Excluir `.env`, credenciales reales y dependencias instaladas (`.venv`, `node_modules`, etc.).
  - El `README.md` identifica al grupo y explica cómo ejecutar localmente y cargar los datos de prueba.
  - Fecha y canal de entrega: (TBD).
- **Dependencias**: `C-11, C-12` (el repo debería incluir además C-06 y C-07 si ya se mergearon; ver dudas)
- **Governance**: MEDIO (riesgo de filtrar secretos en el ZIP)
- **Leer antes**:
  - `knowledge-base/12_despliegue_easypanel.md` §Entrega
  - `knowledge-base/13_casos_g_y_evidencia.md`
  - `knowledge-base/01_vision_y_objetivos.md` §Fechas y entrega

---

## Resumen

| ID | Change | Dueño | Ej. / Casos | Estado | Dependencias | Governance |
|----|--------|-------|-------------|--------|--------------|------------|
| C-01 | `imagen-frontend-docker` | B | 4 | `[x]` hecha (PR #1) | — | BAJO |
| C-02 | `cliente-http-api-js` | B | 1 (técnica) | `[x]` hecha (PR #4), retroactivo archivado | C-01 | ALTO |
| C-03 | `catalogo-api` | H | 1 · G-01 | `[x]` hecha (PR #19), archivada | C-02 | MEDIO |
| C-04 | `altas-libros-clientes` | R | 2 · G-02, G-03 | `[x]` hecha y archivada; PR por abrir (falta prueba E2E detrás de nginx) | C-02 (blanda C-03) | MEDIO |
| C-05 | `ventas-historial` | J | 3 · G-04, G-05, G-06 | `[ ]` | C-02 | MEDIO |
| C-06 | `estante-estetica` | B | transversal | `[x]` hecha y archivada (revisión 9 aprobada); PR por abrir | C-03 | MEDIO |
| C-07 | `limpieza-datos-persistencia` | B | cierre del front | `[ ]` | C-03, C-04, C-05 | ALTO |
| C-08 | `despliegue-frontend-easypanel` | B | 5 · G-07 | `[ ]` | C-01, C-02, C-03, C-04, C-05 | ALTO |
| C-09 | `cors-backend` | E | 5 | `[x]` hecha (PR #18), archivada | — | ALTO |
| C-10 | `apilibreria-desde-monorepo` | E | 5 · G-07 | `[ ]` | C-09, C-08 | ALTO |
| C-11 | `evidencia-casos-g` | todos / E | G-01..G-07 | `[ ]` | C-03, C-04, C-05, C-08, C-10 | BAJO |
| C-12 | `deploy-md` | B | 5 | `[ ]` | C-08, C-10 | BAJO |
| C-13 | `zip-entrega` | E | 5 | `[ ]` | C-11, C-12 | MEDIO |

**Totales**: 13 changes en 4 fases · 6 gates de paralelismo (GATE 0 a GATE 6, con 2 forks) · camino crítico de 5 changes terminando en C-07.

**Primer change recomendado**: `C-02` (cliente-http-api-js), lo primero del miércoles 11 tras mergear el PR de la fundación: el change retroactivo ya está propuesto y archivado (`/opsx:propose` + `/opsx:archive`); falta solo el PR de `feat/api-cliente` (revisión y merge), porque bloquea a Hernán, Bruno y Joaquín. En paralelo, Elías puede arrancar `C-09`.

## Pendientes y (TBD) que afectan a este plan

- URL pública del front y dominio exacto para `CORS_ORIGINS`: (TBD) hasta que Belén cree el servicio `frontend` (C-08); C-09 y C-10 dependen de ese dato.
- Resuelto: formato de `CORS_ORIGINS` (una o varias URL de origen exacto separadas por coma, sin barra final) y rama del servicio `frontend` (`main`); ver D-28 y D-29.
- Datos en la base desplegada y dominio público automático de `apilibreria`: pendientes de confirmar con Elías (C-10).
- ~~Valores de la paleta «librería mágica» (C-06)~~: resueltos (D-31; hex y contrastes en `design-system/README.md`). Pendiente solo la aprobación de la revisión 4 (D-32 y D-33).
- Fecha y canal oficiales de entrega: (TBD).

Resuelto (ver `knowledge-base/09_decisiones_y_supuestos.md` D-23..D-27): C-07 se mergea antes del deploy final; «al menos un autor» se valida en el front; alcance de C-06; aprobación del design-system; rama y commit de `apilibreria`.
- Branch names de C-04, C-05, C-06 a C-13 son sugeridos por el reparto (`feat/<tarea>`); solo `feat/api-cliente` y el ejemplo `feat/catalogo-api` aparecen en la KB.
