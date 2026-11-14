# paquete-entrega Specification

## Purpose
Define qué lleva y qué no lleva nunca el ZIP de entrega del Grupo 2, y cómo se comprueba su contenido antes de subirlo al aula, para que la corrección pueda reproducir la app sin filtrar secretos.

## Requirements

### Requirement: El ZIP se arma solo con archivos versionados de una ref
El armado SHALL generar `Grupo2_Git_Push_&_Pray.zip` exclusivamente con archivos versionados de una ref de git (por defecto `main`), con todo el contenido bajo la carpeta `Grupo2_Git_Push_&_Pray/`, y SHALL dejarlo fuera del repositorio (por defecto en su carpeta padre).

#### Scenario: Armado con los valores por defecto
- **WHEN** un integrante ejecuta el armado sin argumentos
- **THEN** se crea `Grupo2_Git_Push_&_Pray.zip` en la carpeta padre del repo, con el contenido de `main` bajo `Grupo2_Git_Push_&_Pray/`

#### Scenario: Archivos locales no versionados
- **GIVEN** un `.env`, un `.venv/` o un `__pycache__/` presentes en la carpeta de trabajo
- **WHEN** se arma el ZIP
- **THEN** ninguno de ellos aparece en el ZIP, porque no están versionados

### Requirement: El ZIP contiene lo que pide la consigna
El ZIP SHALL contener solo `frontend/`, `backend/`, `README.md`, `DEPLOY.md` y `evidencia/`, e incluir como mínimo `README.md`, `DEPLOY.md`, `frontend/Dockerfile`, `frontend/default.conf.template`, `frontend/env.example`, `frontend/public/index.html`, `backend/Dockerfile`, `backend/env.example`, `backend/requirements.txt`, `backend/alembic.ini` y al menos una evidencia por cada caso G-01..G-07.

#### Scenario: Archivos obligatorios presentes
- **WHEN** se verifica un ZIP recién armado desde `main`
- **THEN** todos los archivos obligatorios están y cada caso G-01..G-07 tiene al menos un archivo en `evidencia/`

#### Scenario: Falta un archivo obligatorio
- **WHEN** se verifica un ZIP al que le falta, por ejemplo, `DEPLOY.md` o la evidencia de un caso G
- **THEN** la verificación termina con código distinto de 0 e informa en español qué falta

### Requirement: El ZIP no lleva contenido prohibido
El ZIP MUST NOT contener archivos `.env` (nombre `.env` o terminado en `.env`, salvo `env.example`), `.venv/`, `node_modules/`, `__pycache__/`, `backend/DEPLOY.md`, `backend/evidencia/`, `openspec/` ni `knowledge-base/`.

#### Scenario: Restos del TP previo excluidos
- **WHEN** se arma el ZIP desde `main`
- **THEN** no contiene `backend/DEPLOY.md` ni `backend/evidencia/`, aunque sigan versionados en el repo

#### Scenario: Contenido prohibido detectado
- **WHEN** se verifica un ZIP que contiene un `.env` o `backend/DEPLOY.md`
- **THEN** la verificación termina con código distinto de 0 y nombra cada entrada prohibida encontrada

### Requirement: El ZIP no filtra credenciales
La verificación SHALL escanear los archivos de texto del ZIP y MUST fallar ante una URL de PostgreSQL con contraseña que no esté en la lista explícita de marcadores permitidos, una clave privada o un token de servicio conocido. Los marcadores permitidos (por ejemplo `USUARIO:CONTRASENA`, el ejemplo local `postgres`/`postgres` o `...`) SHALL estar documentados en el script.

#### Scenario: Solo marcadores de ejemplo
- **WHEN** los archivos de texto contienen únicamente marcadores permitidos, como `postgresql+asyncpg://USUARIO:CONTRASENA@localhost:5432/libreria`
- **THEN** el escaneo de secretos pasa

#### Scenario: Contraseña con pinta de real
- **WHEN** un archivo de texto contiene, por ejemplo, `postgresql+asyncpg://admin:Xk93hd!s@db:5432/libreria`
- **THEN** la verificación termina con código distinto de 0 y señala el archivo y la línea

### Requirement: El armado informa un resumen
Al terminar sin errores, el armado SHALL imprimir la ruta absoluta del ZIP, su tamaño, la cantidad total de archivos, el conteo por carpeta de primer nivel y la cantidad de evidencias por caso G-01..G-07.

#### Scenario: Resumen tras un armado correcto
- **WHEN** el armado y la verificación terminan bien
- **THEN** la salida muestra la ruta, el tamaño, el total de archivos, el conteo de `frontend/`, `backend/`, `evidencia/` y raíz, y una línea por cada caso G con su cantidad de evidencias
