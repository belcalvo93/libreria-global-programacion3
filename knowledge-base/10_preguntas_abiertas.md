# Preguntas Abiertas e Inconsistencias

## Inconsistencias detectadas

### Código vs. contrato del contexto del grupo
| # | Código | Contexto / consigna | Impacto | Resolución propuesta |
|---|--------|---------------------|---------|----------------------|
| I-01 | `LibroCreate.autores` es `list[AutoriaCreate]` sin `min_length`: el backend **acepta un libro sin autores** | Contexto y consigna: «al menos un autor» | Un alta sin autores daría 201 | Resuelto (D-24): se valida ≥ 1 autoría en el front (Bruno); opcionalmente `min_length=1` en el back (Elías) |
| I-02 | `PATCH /libros/{id}` acepta `isbn`, `titulo`, `precio`, `stock`, `editorial_id`, `genero_id` y puede devolver 404, 409 y 422 | Contexto: «Cambiar precio (G-05)», respuesta `LibroRead` sin 404/409 | Documentación incompleta | Enviar solo `{ "precio": ... }`; documentar errores |
| I-03 | `GET /editoriales/` y `GET /generos/` están paginados (def. 20, máx. 100) | Contexto: «listas» sin mencionar la paginación | Con más de 20 registros faltarían opciones en los selects | Pedir `limit=100` |
| I-04 | `ClienteRead.perfil` puede traer un objeto `{id, cliente_id, telefono, direccion}` (el seed crea un perfil para el cliente 1) | Contexto: ejemplo con `"perfil": null` | Ninguno si el front ignora `perfil` | Ignorar `perfil` (no usado) |
| I-05 | `GET /health/ready` devuelve `{"estado":"listo","base":"ok"}` o 503 con `detail` | Contexto: «200 / 503» | Ninguno | — |
| I-06 | **No hay CORS** en `backend/app/main.py` ni variable `CORS_ORIGINS` | Contexto: Elías hace CORS con variable de entorno | Con el proxy nginx (mismo origen) no bloquea al front; sí a un acceso cross-origin | Elías lo implementa (C-09, ver `12_despliegue_easypanel.md`); el dominio a permitir lo define Belén en C-08 |
| I-07 | Los mensajes de 409 en ventas son «No existe el libro con id X» y «El cliente indicado no existe» | Contexto: «409 cliente o libro inexistente» (sin texto) | Ninguno | Mostrar `error.message` tal cual |
| I-08 | Existen además `GET /health/live`, `GET /editoriales/{id}`, `POST` de editoriales/géneros/autores, PATCH de clientes/autores/editoriales, `POST /clientes/{id}/perfil`, `GET /clientes/{id}/ventas` y listados `/{recurso}/{id}/libros` | Contexto: contrato acotado | Ninguno | Marcados «no usado por el front» en `11_contrato_api.md` |

### Entre documentos y repo
| # | Hallazgo | Detalle |
|---|----------|---------|
| I-09 | Dueño de `js/api.js` | `README.md` del repo (reparto «propuesta») lo asigna a **Hernán**; el contexto del grupo y el reparto decidido lo asignan a **Belén**. Vale Belén (rama `feat/api-cliente`) |
| I-10 | Reparto desactualizado en `README.md` | README: Elías hace «servicios en Easypanel, DEPLOY.md»; reparto decidido: Belén despliega el frontend y escribe `DEPLOY.md`, Elías hace CORS, `/backend`, evidencia y ZIP. Belén además tiene estante y estética (README lo menciona pero el contexto no). Conviene actualizar el README |
| I-11 | `api.js` «ya está hecho» (contexto) | Está en el PR de C-02 (rama `feat/api-cliente`); `main` lo incorpora, junto con la carga en `index.html`, al mergearlo. No bloquea a nadie |
| I-12 | `frontend/public/` en `main` solo tiene `index.html`, `css/styles.css` y `js/{altas,catalogo,datos,persistencia,ventas}.js`; no hay `img/` | La consigna y el README mencionan `img/` |
| I-13 | `DEPLOY.md` y `evidencia/` figuran en el README pero no existen en la raíz | Los crean Belén y Elías. Existen `backend/DEPLOY.md` y `backend/evidencia/` del TP anterior |
| I-14 | `openspec/config.yaml` no define `context` ni `rules` (todo comentado) | Los artefactos OpenSpec no reciben convenciones del proyecto; considerar copiar allí las convenciones del front y «escribir en español» |
| I-15 | Consigna: ejemplo de `backend/Dockerfile` con `python:3.12-slim` y `CMD alembic ... && exec uvicorn ...` | El Dockerfile del repo usa `python:3.12-alpine`, usuario `app`, `HEALTHCHECK` y `CMD ["sh","-c",...]` equivalente; cumple (escucha en `0.0.0.0:8000`, aplica migraciones) |
| I-16 | Local: `env.example` del backend usa la base `libreria`; el grupo debe usar `libreria_tp` | Cambiar `DATABASE_URL` en el `.env` local |
| I-17 | Contexto: `venta-libro-N` usa el **ISBN** como `value` en el HTML heredado | No verificado en `ventas.js`/`index.html`; Joaquín debe pasar al `id` del libro |
| I-18 | El contexto pide «Documentar en el README que autores y clientes se buscan por ID» | El README actual no lo documenta |

## Preguntas abiertas (priorizadas)
| Prioridad | Pregunta | Bloquea | Decisor |
|-----------|----------|---------|---------|
| Alta | ¿Cuál es el dominio del frontend para `CORS_ORIGINS`? (TBD) Lo define Belén al crear el servicio `frontend` (C-08); hasta entonces sigue TBD | C-09, C-10, G-07, DEPLOY.md | Belén (pasa el dato a Elías) |
| Media | ¿La base desplegada ya tiene datos de pruebas del grupo? ¿Hace falta recargar el seed (que vacía tablas)? | Datos de G-01..G-06 | Elías |
| Media | ¿El backend conserva hoy su dominio público automático? La consigna pide quitarlo | Cierre del Ej. 5 | Elías |
| Media | Texto completo de las reglas RN del TP original (aquí solo se infiere del código) | Documentación | Equipo |
| Baja | Fecha y canal oficiales de entrega comunicados por la cátedra (el grupo asume sábado 14 de noviembre a la noche) | Cronograma | Grupo |

## Resueltas (pasaron a `09_decisiones_y_supuestos.md`)
- Orden de C-07 respecto del deploy final → D-23.
- «Al menos un autor»: validación en el front → D-24.
- Alcance de «estante y estética» (C-06) → D-25.
- Aprobación del design-system y valor de `visual_design.mode` → D-26 (y D-10).
- Rama y commit de `apilibreria` → D-27.
- Formato de `CORS_ORIGINS` → D-28.
- Rama del servicio `frontend` (C-08) → D-29.
- Cuándo se abre el PR de `api.js` → D-13 (miércoles 11, después de mergear la fundación).
- Filtro `genero_id` de `GET /libros/` en el catálogo → D-30 (no se usa; lo decidió Hernán en C-03).
