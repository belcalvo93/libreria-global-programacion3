# Modelo de Datos

Fuente: `backend/app/modules/*/models.py`, migraciones en `backend/migrations/versions/` (`24071e705bcf_init_schemas`, `0efd84a6de03_genero_y_libro_genero_id`) y `backend/scripts/seed.py`. El frontend no tiene modelo propio: los datos viven en PostgreSQL.

## Entidades
| Tabla | Campos | Restricciones |
|-------|--------|---------------|
| `editorial` | `id`, `nombre`, `pais` | `nombre` UNIQUE |
| `genero` | `id`, `nombre` | `nombre` UNIQUE |
| `autor` | `id`, `nombre`, `nacionalidad` | — |
| `libro` | `id`, `isbn`, `titulo`, `precio` NUMERIC(10,2), `stock`, `editorial_id` FK, `genero_id` FK (nullable) | `isbn` UNIQUE; CHECK `precio > 0`; CHECK `stock >= 0` |
| `libro_autor` (autoría) | `libro_id` FK, `autor_id` FK (PK compuesta), `rol`, `orden` | CHECK `orden >= 1`; CHECK `rol IN ('autor','coautor','traductor','ilustrador')` |
| `cliente` | `id`, `nombre`, `email` | `email` UNIQUE (se normaliza a minúsculas y sin espacios) |
| `perfil_cliente` | `id`, `cliente_id` FK, `telefono`, `direccion` | `cliente_id` UNIQUE (uno a uno, opcional) |
| `venta` | `id`, `cliente_id` FK, `fecha` timestamptz (UTC), `total` NUMERIC(12,2) | CHECK `total >= 0` |
| `renglon_venta` | `id`, `venta_id` FK (ON DELETE CASCADE), `libro_id` FK, `cantidad`, `precio_unitario` NUMERIC(10,2) | CHECK `cantidad > 0`; CHECK `precio_unitario > 0`; UNIQUE (`venta_id`, `libro_id`) |

## ERD
```
editorial 1 ──< libro >── 0..1 genero
                 │ 1
                 │
                 ∧ N
            libro_autor (rol, orden)
                 ∨ N
                 │ 1
               autor

cliente 1 ── 0..1 perfil_cliente
cliente 1 ──< venta 1 ──< renglon_venta >── 1 libro
```
- Libro ↔ Autor es muchos a muchos con atributos (`rol`, `orden`).
- Venta compone sus renglones (nacen y mueren con la venta).
- El género es opcional: `genero: null` en la API se muestra como «Sin clasificar» en el front.

## Estado de la API sobre el modelo
- `precio` y los importes se serializan como **texto decimal** (`"1500.00"`): usar `Api.numero(...)` antes de operar.
- `fecha` en ISO 8601 (UTC).
- El **stock no se descuenta** al vender (el servicio de ventas no lo toca).

## Seed data (`python -m scripts.seed`)
Borra **todas** las tablas (`TRUNCATE ... RESTART IDENTITY CASCADE`; los ids arrancan en 1) y carga datos ficticios. Correrlo repetido deja siempre lo mismo.

| Tabla | Filas | Contenido |
|-------|-------|-----------|
| editorial | 3 | Sudamericana (Argentina), Alfaguara (España), Emecé (Argentina) |
| genero | 3 | Novela, Cuento, Ensayo |
| autor | 5 | Julio Cortázar, Ricardo Piglia, Silvina Ocampo, Adolfo Bioy Casares, Jorge Luis Borges |
| libro | 6 | Rayuela (25000.00, stock 12), Ficciones (18000.00, 8), El Aleph (19500.00, 6), Respiración artificial (27000.00, 5), La invención de Morel (16000.00, 10), Antología de la literatura fantástica (30000.00, 4; **sin género**, útil para probar «Sin clasificar»). Total de la venta semilla: 18000 + 2 × 16000 = 50000.00 |
| libro_autor | 8 | Antología: Borges (autor, orden 1), Ocampo y Bioy (coautor, 2 y 3) |
| cliente | 3 | Lucía Fernández, Tomás Ríos, Camila Torres (emails `@example.com`) |
| perfil_cliente | 1 | Solo para el cliente 1 |
| venta | 1 | De Lucía: 1 × Ficciones + 2 × La invención de Morel |

Nota operativa: como los ids parten de 1 tras el seed, los autores 1 a 5 y los clientes 1 a 3 son los que el front puede buscar por ID sin listado. **El seed vacía las tablas: no volver a correrlo sobre la base desplegada** si ya hay datos del grupo (ver `12_despliegue_easypanel.md`).
