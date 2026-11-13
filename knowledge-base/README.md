# Gatoteca Lunar (Global de Programación III) — Base de Conocimiento

Base de conocimiento generada a partir de la consigna del Global, el contexto del grupo y el código del monorepo. Las fuentes originales están fuera del repo y no se copiaron. Lo desconocido figura como `(TBD)`.

## Índice de Archivos

| Archivo | Contenido |
|---------|-----------|
| [01_vision_y_objetivos.md](01_vision_y_objetivos.md) | Consigna: ejercicios y puntaje, demostración mínima, alcance, fechas |
| [02_descripcion_general.md](02_descripcion_general.md) | Stack, arquitectura front-nginx-API-Postgres, integraciones, resumen de la API |
| [03_actores_y_roles.md](03_actores_y_roles.md) | Actores, ausencia de RBAC, reparto por integrante y dueño de cada archivo |
| [04_modelo_de_datos.md](04_modelo_de_datos.md) | Entidades, ERD, restricciones y seed |
| [05_reglas_de_negocio.md](05_reglas_de_negocio.md) | RN-01..RN-12 del backend y reglas RF del front |
| [06_funcionalidades.md](06_funcionalidades.md) | Historias por ejercicio (épicas 1 a 5) |
| [07_flujos_principales.md](07_flujos_principales.md) | Flujos: catálogo, altas, venta, historial, precio histórico, despliegue, ramas y PR |
| [08_arquitectura_propuesta.md](08_arquitectura_propuesta.md) | Estructura del monorepo, `api.js`, convenciones del front, nginx, variables, seguridad |
| [09_decisiones_y_supuestos.md](09_decisiones_y_supuestos.md) | Decisiones del grupo (reparto, flujo de ramas, sin atribución de IA, diseño light) y supuestos |
| [10_preguntas_abiertas.md](10_preguntas_abiertas.md) | Discrepancias código/contexto y preguntas abiertas priorizadas |
| [11_contrato_api.md](11_contrato_api.md) | Extra: contrato de la API leído del código, con endpoints «no usado por el front» |
| [12_despliegue_easypanel.md](12_despliegue_easypanel.md) | Extra: servicios, Build Path, variables, `DEPLOY.md`, ejecución local, diagnóstico |
| [13_casos_g_y_evidencia.md](13_casos_g_y_evidencia.md) | Extra: casos G-01 a G-07 y evidencia |

## Quick Start para Desarrolladores

1. Entender qué se pide → [01](01_vision_y_objetivos.md), [13](13_casos_g_y_evidencia.md)
2. Entender quién hace qué → [03](03_actores_y_roles.md), [09](09_decisiones_y_supuestos.md)
3. Entender la API → [11](11_contrato_api.md), [04](04_modelo_de_datos.md), [05](05_reglas_de_negocio.md)
4. Entender el front → [08](08_arquitectura_propuesta.md), [06](06_funcionalidades.md), [07](07_flujos_principales.md)
5. Correr y desplegar → [12](12_despliegue_easypanel.md)
6. Antes de codificar → [10](10_preguntas_abiertas.md)

## Resumen Ejecutivo

El grupo 2 conecta el frontend nativo del primer parcial a la API FastAPI + PostgreSQL del TP mediante un cliente `js/api.js` con base `/api`, y lo publica en Easypanel con dos servicios: nginx (frontend, proxy `/api/` → `API_UPSTREAM`) y la API (Build Path `/backend`). La imagen del front ya está mergeada; `api.js` está en revisión (`feat/api-cliente`); faltan catálogo, altas, ventas, CORS, despliegue del front, `DEPLOY.md`, evidencia G-01..G-07 y ZIP. Entrega prevista: sábado 14 de noviembre.
