# Design

## Context

El repo es un monorepo con `frontend/`, `backend/`, `evidencia/`, `README.md` y `DEPLOY.md` en la raíz (C-11 y C-12 cerrados), más material interno del proceso (`openspec/`, `knowledge-base/`, `design-system/`, `AGENTS.md`, `CLAUDE.md`, `CHANGES.md`). `backend/` arrastra del TP previo `backend/DEPLOY.md` y `backend/evidencia/` (con una URL de despliegue vieja). Los `.gitignore` ya excluyen `.env`, `.venv/`, `__pycache__/` y `node_modules/`. Herramientas disponibles en Git Bash: `git`, `unzip`/`zipinfo` y Python 3; **no** hay `zip`.

## Goals / Non-Goals

**Goals:**
- Armado reproducible en un solo comando y verificación automática del ZIP.
- Que la verificación sea su propia prueba: se puede correr contra un ZIP malo y debe fallar.

**Non-Goals:**
- Modificar `frontend/`, `backend/` ni `README.md` (archivos de otros changes / integrantes).
- Subir el ZIP al aula (lo hace el grupo a mano).

## Decisions

1. **`git archive --format=zip` en vez de comprimir la carpeta de trabajo.** Solo entran archivos versionados de la ref, así que un `.env` o un `.venv` locales no pueden colarse. No requiere `zip` (que no está en Git Bash). Alternativa descartada: `Compress-Archive` de PowerShell o `zip -r` con listas de exclusión, que dependen del estado local y de recordar cada exclusión.
2. **Pathspecs explícitos + `:(exclude)`.** Se pasan `frontend backend README.md DEPLOY.md evidencia` y `:(exclude)backend/DEPLOY.md`, `:(exclude)backend/evidencia`. Con `--prefix="Grupo2_Git_Push_&_Pray/"` todo queda bajo una carpeta. Alternativa descartada: atributos `export-ignore` en `.gitattributes`, que afectan cualquier `git archive` del repo y son menos visibles.
3. **Nombre con `&` siempre entre comillas.** `Grupo2_Git_Push_&_Pray.zip` es decisión del grupo; el script lo guarda en una variable y lo cita en cada uso.
4. **Verificación separada del armado (`--verificar <zip>`).** El script tiene un modo que solo verifica un ZIP existente. Así se puede probar contra un ZIP armado a propósito con contenido prohibido (RED) y contra el real (GREEN), sin tocar el repo.
5. **Lectura del ZIP: `zipinfo -1` / `unzip -p` si existen; si no, Python (`zipfile`).** Se detectan las herramientas al inicio. El escaneo de secretos lee cada entrada de texto (por extensión: `.md .txt .py .js .css .html .ini .toml .yml .yaml .json .conf .template .example .http .sh .mako`, `Dockerfile`, `README`, `env.example`, `.gitignore`, `.dockerignore`).
6. **Lista explícita de marcadores permitidos para credenciales.** En una URL `postgres(ql)?(+asyncpg)?://usuario:contraseña@`, la contraseña se acepta solo si es un marcador: `CONTRASENA`, `CONTRASEÑA`, `PASSWORD`, `password`, `postgres` (ejemplo local de Docker), `...`, o algo entre `<...>`/`${...}`. Lo mismo para `POSTGRES_PASSWORD=`. También fallan claves privadas (`-----BEGIN ... PRIVATE KEY-----`) y tokens con formato conocido (`ghp_`, `github_pat_`, `AKIA...`, `sk-...`, `xox[bp]-`). La lista vive documentada en el script.
7. **Salida por defecto en la carpeta padre del repo.** Así el ZIP nunca queda en el árbol de trabajo ni se commitea por accidente.

## Risks / Trade-offs

- [Una ref sin pushear o desactualizada] → Por defecto se usa `main`; el resumen muestra el commit armado para comprobarlo antes de subir.
- [Falso negativo del escaneo de secretos (un secreto con otro formato)] → Mitigado porque solo entran archivos versionados, ya revisados en PRs; el escaneo es una red adicional, no la única.
- [`backend/README.md` enlaza a `evidencia/` del backend, que se excluye] → El enlace queda colgado dentro del ZIP; se informa y no se edita `backend/` (fuera de este change).
- [Archivos grandes (audio de ~2 MB)] → Se aceptan: son parte del frontend desplegado.
