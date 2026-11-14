# Proposal

> C-13 de `CHANGES.md` (Ej. 5, US-5.5 · entrega del Global). Dueño: Elías. Governance **MEDIO** (riesgo de filtrar secretos o dependencias instaladas en el ZIP que se sube al aula).

## Why

La consigna pide un **ZIP por grupo** con `frontend/`, `backend/`, `README.md`, `DEPLOY.md` y `evidencia/`, que incluya los Dockerfiles, la configuración versionada de nginx y los archivos de ejemplo de variables, y que **no** lleve `.env`, credenciales reales ni dependencias instaladas. Ya están cerrados C-11 (evidencia G-01..G-07) y C-12 (`DEPLOY.md` y `README.md`), así que solo falta empaquetar. Armarlo a mano desde la carpeta de trabajo es frágil: un `.env` local, un `.venv` o un `__pycache__` se cuelan fácil, y nadie revisa el contenido antes de subirlo. Queremos un armado **reproducible** y **verificado** que cualquiera del grupo pueda correr el sábado 14.

## What Changes

- Nuevo script `herramientas/armar_zip.sh` (bash, compatible con Git Bash en Windows), con argumentos opcionales `[ref] [carpeta_salida]` (por defecto `main` y la carpeta **padre** del repo, para que el ZIP nunca quede dentro del repositorio):
  - Arma `Grupo2_Git_Push_&_Pray.zip` con `git archive` desde la ref indicada, de modo que solo entran archivos **versionados** (nunca `.env`, `.venv`, `node_modules` ni archivos locales). Todo el contenido va bajo la carpeta `Grupo2_Git_Push_&_Pray/`.
  - Incluye solo `frontend/`, `backend/`, `README.md`, `DEPLOY.md` y `evidencia/`; excluye `backend/DEPLOY.md` y `backend/evidencia/` (restos del despliegue del TP previo, con una URL vieja), que siguen en el repo.
  - **Verifica** el ZIP generado y termina con error (código distinto de 0 y mensaje claro en español) si falta un archivo obligatorio, si aparece algo prohibido o si el escaneo de secretos encuentra una credencial con pinta de real.
  - Imprime un resumen: ruta, tamaño, cantidad de archivos, conteo por carpeta de primer nivel y cantidad de evidencias por caso G-01..G-07.
- Se genera el ZIP real desde `main` y se deja en la carpeta padre del repo, listo para subir al aula.
- Se marca C-13 `[x]` en `CHANGES.md`.

## Capabilities

### New Capabilities
- `paquete-entrega`: contenido y verificación del ZIP de entrega del grupo — qué carpetas y archivos debe llevar, qué no puede llevar nunca (variables reales, dependencias instaladas, restos del TP previo, material interno del proceso) y cómo se comprueba antes de subirlo.

### Modified Capabilities
<!-- Ninguna -->

## Impact

- **Código**: ninguno en `frontend/` ni `backend/` (no se tocan archivos ajenos). Se agrega `herramientas/armar_zip.sh`.
- **Documentación**: no se edita `README.md` (pertenece a C-12, de Bruno). Se actualiza `CHANGES.md` al archivar.
- **Entrega**: el ZIP queda **fuera** del repo (carpeta padre) y no se versiona.
- **Fuera de alcance**: `openspec/`, `knowledge-base/`, `design-system/`, `AGENTS.md`, `CLAUDE.md` y `CHANGES.md` no van en el ZIP (la consigna no los pide). Subir el ZIP al aula lo hace el grupo a mano.
