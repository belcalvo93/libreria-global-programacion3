# Tasks

> Change de herramienta de entrega (script bash). **Strict TDD** adaptado: la verificación del script es la prueba. Primero se corre `--verificar` contra ZIPs malos armados a propósito en una carpeta temporal fuera del repo (RED: debe fallar), y después contra el ZIP real (GREEN: debe pasar).
>
> Reglas de seguridad:
> - **NUNCA** dejar el ZIP ni archivos temporales dentro del repo.
> - **NUNCA** editar `frontend/`, `backend/` ni `README.md` en este change.

## 1. Verificación del ZIP (la prueba)

- [x] 1.1 Crear `herramientas/armar_zip.sh` con el modo `--verificar <zip>`: detecta `zipinfo`/`unzip` o cae a Python, y comprueba archivos obligatorios, evidencia por caso G-01..G-07 y contenido prohibido. Verificar: `bash -n` sin errores.
- [x] 1.2 RED: armar en una carpeta temporal fuera del repo ZIPs malos (uno con `backend/DEPLOY.md` y un `.env` falso, otro con una `DATABASE_URL` con contraseña real y otro sin `DEPLOY.md`) y comprobar que `--verificar` termina con código distinto de 0 y mensajes en español que nombran cada problema.
- [x] 1.3 Agregar el escaneo de secretos con lista explícita y documentada de marcadores permitidos (`USUARIO:CONTRASENA`, `postgres`/`postgres` local, `...`, `<...>`). Verificar: el ZIP con contraseña real falla y los marcadores del repo no generan falsos positivos.

## 2. Armado del ZIP

- [x] 2.1 Implementar el armado con `git archive --format=zip --prefix="Grupo2_Git_Push_&_Pray/"` desde `[ref]` (por defecto `main`) hacia `[carpeta_salida]` (por defecto la carpeta padre del repo), con pathspecs `frontend backend README.md DEPLOY.md evidencia` y `:(exclude)` para `backend/DEPLOY.md` y `backend/evidencia`; luego verificar y mostrar el resumen. Verificar: GREEN, el armado real desde `main` pasa la verificación.
- [x] 2.2 Comprobar que el resumen muestra ruta, tamaño, total de archivos, conteo por carpeta de primer nivel y evidencias por caso G, y que `git status` no muestra el ZIP ni temporales en el repo.

## 3. Cierre

- [x] 3.1 Registrar en este archivo la evidencia RED/GREEN y validar con `openspec validate --strict --all`.

## Evidencia RED / GREEN (2026-11-13)

Herramientas detectadas en Git Bash: `git 2.55`, `zipinfo`, `unzip`, Python 3.14 (no hay `zip`; no hace falta). Los ZIPs malos se armaron en el scratchpad de la sesión (fuera del repo) a partir de un `git archive` correcto, mutándolo y recomprimiéndolo con Python; después se borraron.

**RED** — `herramientas/armar_zip.sh --verificar <zip-malo>`:

| ZIP malo | Qué tenía | Resultado |
|----------|-----------|-----------|
| `m1.zip` | `backend/DEPLOY.md`, `backend/.env` (con marcadores), `backend/app/__pycache__/*.pyc`, `openspec/config.yaml` | Código 1 · «El ZIP contiene entradas prohibidas» con las 4 rutas |
| `m2.zip` | `DATABASE_URL=postgresql+asyncpg://admin:<real>@db...`, `POSTGRES_PASSWORD=<real>`, un token `ghp_…`, una clave privada OpenSSH | Código 1 · «Posibles credenciales o secretos» con `archivo:línea` de los 4 casos y el valor enmascarado (`****`) |
| `m3.zip` | Sin `DEPLOY.md` y sin ninguna evidencia `G-07_*` | Código 1 · «Falta el archivo obligatorio: DEPLOY.md» y «Falta evidencia del caso G-07» |

Casos de borde: ref inexistente (`no-existe`) → código 1; carpeta de salida dentro del repo → código 1 («Elegí una de afuera»).

**GREEN** — `herramientas/armar_zip.sh` (ref `main` = `0a205d1`), código 0:

```
Verificación OK.
  ZIP:      C:\Users\elias\Documents\Facu\3 - Tercer Semestre\Programación III\Giulliano\TP\Grupo2_Git_Push_&_Pray.zip
  Tamaño:   13659366 bytes (13.03 MB)
  Archivos: 139
  Por carpeta de primer nivel:
    (raíz) DEPLOY.md      1
    (raíz) README.md      1
    backend/               73
    evidencia/             37
    frontend/              27
  Evidencias por caso:
    G-01 5 · G-02 4 · G-03 4 · G-04 8 · G-05 4 · G-06 7 · G-07 8
```

Sin falsos positivos con los marcadores del repo (`USUARIO:CONTRASENA` en `backend/env.example`, `POSTGRES_PASSWORD=postgres` en `README.md`/`DEPLOY.md`, `postgresql+asyncpg://...` en `DEPLOY.md`). El `backend/.venv/` local (ignorado) no entra en el ZIP. `git status` solo muestra `herramientas/` y el change; el ZIP queda en la carpeta padre del repo.

Observaciones:
- `frontend/public/audio/ambiente.mp3` (~2 MB) y las capturas de `evidencia/` (~0,4–0,6 MB cada una) explican el tamaño; son parte de la entrega.
- `backend/README.md` enlaza a `evidencia/` del backend (caso C-07 del TP), que queda excluida: el enlace queda colgado dentro del ZIP. No se edita `backend/` en este change.
- Se agregó `herramientas/.gitattributes` (`*.sh text eol=lf`) para que el script no se rompa con `core.autocrlf=true`.

## Workflow follow-up

- Archivar el change y marcar C-13 `[x]` en `CHANGES.md` (sección y tabla resumen) con el script y el nombre del ZIP.
- PR a `main` revisado por otro integrante (lo abre el orquestador).
