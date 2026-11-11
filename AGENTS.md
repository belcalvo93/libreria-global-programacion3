# Librería Página Viva (Global de Programación III) — Instrucciones para Agentes

> Lo PRIMERO que todo agente lee al entrar al repo. Generado desde `knowledge-base/` y `CHANGES.md`.
> `CLAUDE.md` solo importa este archivo (`@AGENTS.md`): editar únicamente acá.

Grupo 2 «git push and pray»: Belén (B), Hernán (H), Bruno (R), Joaquín (J), Elías (E). Entrega prevista: sábado 14 de noviembre.

---

## Stack Tecnológico

| Capa | Tecnología | Versión / nota |
|------|------------|----------------|
| Frontend | HTML, CSS y JS nativos: scripts clásicos (sin módulos), cada archivo en IIFE con `"use strict"` y `var`; sin librerías, CDN ni npm | — |
| Servidor web / proxy | nginx | `nginx:1.30-alpine`; sirve `frontend/public/` y reenvía `/api/` a `API_UPSTREAM` (sin el prefijo) |
| Backend | FastAPI async + SQLModel/SQLAlchemy asyncio + Pydantic; PostgreSQL; Alembic; asyncpg | `python:3.12-alpine`; capas Router → Service → UoW → Repository |
| Contenedores | Docker (`frontend/Dockerfile`, `backend/Dockerfile`) | — |
| Despliegue | Easypanel en VPS, proyecto `grupo2-elias`: servicios `apilibreria` (back, puerto 8000, Build Path `/backend`), `dblibreria` (Postgres) y `frontend` (Build Path `/frontend`) | — |
| Proceso | Git + GitHub, OpenSpec (`openspec/`, schema `spec-driven`) | — |

El navegador habla con un solo origen: el front llama siempre a `/api/...` (ej. `Api.get("/libros/")`). Detalle: [knowledge-base/02_descripcion_general.md](knowledge-base/02_descripcion_general.md) y [08_arquitectura_propuesta.md](knowledge-base/08_arquitectura_propuesta.md).

---

## Base de Conocimiento

Fuente de verdad en `knowledge-base/` (índice: [README.md](knowledge-base/README.md)). **Leé el archivo relevante ANTES de implementar.**

| Archivo | Cuándo leerlo |
|---------|---------------|
| [01_vision_y_objetivos.md](knowledge-base/01_vision_y_objetivos.md) | Consigna, ejercicios, puntaje, alcance |
| [03_actores_y_roles.md](knowledge-base/03_actores_y_roles.md) | Reparto por integrante y dueño de cada archivo |
| [04_modelo_de_datos.md](knowledge-base/04_modelo_de_datos.md) | Entidades, restricciones, seed |
| [05_reglas_de_negocio.md](knowledge-base/05_reglas_de_negocio.md) | RN-01..RN-12 y reglas RF del front |
| [06_funcionalidades.md](knowledge-base/06_funcionalidades.md) | Historias por ejercicio |
| [07_flujos_principales.md](knowledge-base/07_flujos_principales.md) | Flujos E2E, ramas y PR |
| [08_arquitectura_propuesta.md](knowledge-base/08_arquitectura_propuesta.md) | Estructura, `api.js`, convenciones del front, nginx, variables |
| [09_decisiones_y_supuestos.md](knowledge-base/09_decisiones_y_supuestos.md) | Decisiones D-01..D-29 del grupo |
| [10_preguntas_abiertas.md](knowledge-base/10_preguntas_abiertas.md) | Pendientes (dominio del front / `CORS_ORIGINS`, datos en la BD, fecha de entrega) |
| [11_contrato_api.md](knowledge-base/11_contrato_api.md) | Endpoints, errores, decimales como texto |
| [12_despliegue_easypanel.md](knowledge-base/12_despliegue_easypanel.md) | Servicios, variables, ejecución local, diagnóstico |
| [13_casos_g_y_evidencia.md](knowledge-base/13_casos_g_y_evidencia.md) | Casos G-01..G-07 y evidencia |

Diseño: política **light** (`system-only`, revisión 1, aprobada el 2026-11-10): se reutiliza el CSS del parcial (`frontend/public/css/styles.css`, variables de `:root`); no hay mockups por change. C-06 suma un estante de libros y una paleta «librería mágica» (valores TBD) en `:root`. Ver [design-system/README.md](design-system/README.md).

---

## Skills Disponibles

Fuente: `.atl/skill-registry.md`. Cargá la skill del contexto ANTES de escribir.

| Agente | Rol | Skills que carga |
|--------|-----|------------------|
| Frontend (H, R, J, B) | HTML/CSS/JS nativos, UI, accesibilidad | `web-design-guidelines`, `emil-design-eng` (`design-taste-frontend-v1` solo principios: es React/Tailwind) |
| Diseño | Política light, CSS compartido (dueña: Belén) | `design-system` |
| Backend (E) | FastAPI / Postgres / CORS | Sin skills específicas en el registry; guiarse por `knowledge-base/11` y `08` |
| Orquestación | OPSX / fundación / docs | `openspec-propose`, `openspec-apply-change`, `openspec-archive-change`, `openspec-explore`, `kb-creator`, `roadmap-generator`, `agent-instruction`, `find-skill`, `skill-creator` |

> Los compact rules de cada skill los resuelve el orquestador desde `.atl/skill-registry.md` (generado por `skill-registry`; no versionado — no está en el repo).

---

## Roadmap de Changes

Plan completo en [CHANGES.md](CHANGES.md) (13 changes, 4 fases). **Leelo y revisá las dependencias y los «Leer antes» del change ANTES de `/opsx:propose`.**

- **Fase 1** — C-01 `imagen-frontend-docker` (B, hecha) · C-02 `cliente-http-api-js` (B, `js/api.js`, en revisión; tras mergear el PR de esta fundación, Belén hace su change retroactivo propose/archive y su PR: lo primero del miércoles 11).
- **Fase 2** — C-03 `catalogo-api` (H) · C-04 `altas-libros-clientes` (R) · C-05 `ventas-historial` (J) · C-06 `estante-estetica` (B) · C-07 `limpieza-datos-persistencia` (B).
- **Fase 3** — C-09 `cors-backend` (E) · C-08 `despliegue-frontend-easypanel` (B) · C-10 `apilibreria-desde-monorepo` (E).
- **Fase 4** — C-12 `deploy-md` (B) · C-11 `evidencia-casos-g` (todos) · C-13 `zip-entrega` (E).
- **Camino crítico**: `C-01 → C-02 → C-03 | C-04 | C-05 → C-07`. Abiertos ahora: cierre de C-02 y C-09 (independiente).

---

## Reglas Duras (específicas del proyecto)

> Reglas globales ya definidas en `~/.claude/CLAUDE.md` (orquestador, governance, TDD, engram): el proyecto las hereda. Acá viven solo las reglas **específicas de este proyecto** + las universales que el global no cubra. Confirmadas por el grupo; romperlas es un defecto.

**Frontend**
- NUNCA `innerHTML` con datos → usar solo `textContent` y `createElement`.
- NUNCA un `submit` sin `event.preventDefault()` → debe ser la primera línea del handler.
- NUNCA `style.display` para mensajes → usar el atributo `hidden`. Los errores llevan texto, no solo color.
- NUNCA estilos inline → clases y variables de `:root`.
- NUNCA promesas encadenadas sueltas → `async/await` con `try/catch`; mostrar `error.message` de `Api.ApiError`.
- NUNCA recalcular importes → mostrar los de la respuesta de la API (precio histórico, RN-06 / D-08).
- NUNCA operar un Decimal (llega como texto) sin pasarlo antes por `Api.numero`.
- NUNCA `fetch` ni URLs armadas fuera de `js/api.js` → usar `Api.get/post/patch` con base `/api` (barra final en colecciones: `/libros/`). Motivo: el Ej. 1 de la consigna pide centralizar las peticiones HTTP en un único cliente.
- NUNCA `localStorage` para datos → el borrador de la venta vive solo en memoria.
- NUNCA módulos, librerías, CDN ni npm → scripts clásicos, IIFE `"use strict"`, `var`.
- NUNCA abrir `index.html` con `file://` → probar siempre detrás de nginx (`http://127.0.0.1:8080`).
- Responsive 320–1280 px y foco visible con Tab en todo control nuevo.

**Propiedad y alcance**
- NUNCA tocar archivos ajenos → cada integrante modifica solo su archivo JS y su sección del `index.html` (ver `knowledge-base/03_actores_y_roles.md`).
- NUNCA borrar `js/datos.js` ni `js/persistencia.js` → solo en C-07 (Belén), cuando H, R y J estén mergeados. C-07 se mergea ANTES del deploy final del viernes 13 a la noche; si se atrasa, se redespliega el sábado.
- NUNCA editar `backend/` ni `frontend/` fuera de tu change → solo el dueño del change correspondiente.
- NUNCA subir `.env` ni credenciales → solo `env.example` con nombres de variables.

**Git y proceso**
- Flujo: `git checkout main && git pull` → rama `feat/<tarea>` → `/opsx:propose` → `/opsx:apply` → prueba manual → `/opsx:archive` **antes** del PR.
- NUNCA squash ni push directo a `main` → PR revisado por otro integrante y merge común («Create a merge commit»).
- Commits en español, uno por idea, con prefijo `feat|fix|docs|chore`.
- NUNCA atribución de IA en commits ni PR → sin `Co-Authored-By`, `Claude-Session` ni «Generated with ...».
- NUNCA commitear ni buildear sin pedido explícito del integrante.

---

## Flujo de Trabajo

```
1. Leer la KB relevante (knowledge-base/)        → entender el dominio
2. Identificar el change en CHANGES.md           → respetar dependencias
3. git checkout main && git pull; rama feat/<tarea>
4. /opsx:propose C-NN-nombre                     → proposal + design + specs + tasks
5. /opsx:apply                                   → cargando las skills; respetar reglas duras
6. Probar a mano (docker build/run, ver KB 12)
7. /opsx:archive C-NN-nombre + marcar [x] en CHANGES.md
8. PR a main → revisión de otro integrante → merge común
```

Ante conflicto entre la KB y este archivo, las reglas duras prevalecen.
