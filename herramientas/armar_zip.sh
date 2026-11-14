#!/usr/bin/env bash
# =============================================================================
# armar_zip.sh — Arma y verifica el ZIP de entrega del Grupo 2 (C-13).
#
# Uso:
#   herramientas/armar_zip.sh [ref] [carpeta_salida]
#       Arma "Grupo2_Git_Push_&_Pray.zip" con `git archive` desde [ref]
#       (por defecto: main) en [carpeta_salida] (por defecto: la carpeta
#       PADRE del repo, para que el ZIP nunca quede dentro del repositorio),
#       lo verifica y muestra un resumen.
#
#   herramientas/armar_zip.sh --verificar <archivo.zip>
#       Solo verifica un ZIP existente (sirve para probar la verificación
#       contra un ZIP armado a propósito con contenido prohibido).
#
# Sale con código 0 si todo está bien y con código distinto de 0 (y un
# mensaje en español) ante cualquier problema.
#
# Por qué `git archive`: solo entran archivos VERSIONADOS de la ref, así que
# un .env, un .venv/, node_modules/ o __pycache__/ locales no pueden colarse.
# Funciona en Git Bash (Windows): no necesita el comando `zip`.
# =============================================================================
set -euo pipefail
export LC_ALL=C   # comparaciones byte a byte (la Ñ de CONTRASEÑA va como UTF-8)

NOMBRE_ZIP="Grupo2_Git_Push_&_Pray.zip"
PREFIJO="Grupo2_Git_Push_&_Pray"

# Lo que pide la consigna (y nada más).
CONTENIDO=(frontend backend README.md DEPLOY.md evidencia)
# Restos del despliegue del TP previo (URL vieja): siguen en el repo, no en el ZIP.
# De backend/evidencia/ SÍ van los C-07_*.txt (cantidad fija de consultas, sin
# N+1), que cita backend/README.md; el resto es del despliegue anterior.
EXCLUIDOS=(
  ":(exclude)backend/DEPLOY.md"
  ":(exclude)backend/evidencia/vps"
  ":(exclude)backend/evidencia/imagen-local.txt"
  ":(exclude)backend/evidencia/integracion.txt"
)

OBLIGATORIOS=(
  README.md
  DEPLOY.md
  frontend/Dockerfile
  frontend/default.conf.template
  frontend/env.example
  frontend/public/index.html
  backend/Dockerfile
  backend/env.example
  backend/requirements.txt
  backend/alembic.ini
  backend/evidencia/C-07_consultas.txt
  backend/evidencia/C-07_libros.txt
  backend/evidencia/C-07_ventas.txt
)
CASOS_G=(G-01 G-02 G-03 G-04 G-05 G-06 G-07)

# --- Lista de marcadores PERMITIDOS en credenciales --------------------------
# En una URL postgres(ql)(+asyncpg)://usuario:CONTRASEÑA@host o en
# POSTGRES_PASSWORD=..., la contraseña solo se acepta si es uno de estos
# marcadores de ejemplo (expresión regular extendida, anclada completa):
#   CONTRASENA / CONTRASEÑA / PASSWORD / password  → env.example, README, DEPLOY
#   postgres     → ejemplo local de Docker (postgres/postgres) en README y DEPLOY
#   ...          → puntos suspensivos de la documentación
#   <...>        → marcador entre ángulos, p. ej. <tu_contraseña>
#   ${...}       → referencia a una variable de entorno
#   ****         → valor enmascarado
CLAVES_PERMITIDAS='(CONTRASENA|CONTRASEÑA|PASSWORD|password|postgres|\.\.\.|<[^>]*>|\$\{[^}]*\}|\*+)'

# Patrones que nunca pueden aparecer (claves privadas y tokens de servicios).
PATRONES_PROHIBIDOS=(
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'   # clave privada (SSH, TLS, etc.)
  'ghp_[A-Za-z0-9]{30,}'                 # token de GitHub
  'github_pat_[A-Za-z0-9_]{20,}'         # token fino de GitHub
  'AKIA[0-9A-Z]{16}'                     # clave de acceso de AWS
  'sk-[A-Za-z0-9]{20,}'                  # clave de API estilo OpenAI/Stripe
  'xox[abps]-[A-Za-z0-9-]{10,}'          # token de Slack
  '/api/deploy/[0-9a-f]{20,}'            # webhook de despliegue de Easypanel
)

# Extensiones / nombres que se tratan como texto en el escaneo de secretos.
ES_TEXTO='\.(md|txt|py|js|css|html|ini|toml|cfg|yml|yaml|json|conf|template|example|http|sh|mako|sql|csv|env)$|(^|/)(Dockerfile|README|env\.example|\.gitignore|\.dockerignore|\.env)$'

TMP_A_BORRAR=""
trap 'if [ -n "$TMP_A_BORRAR" ]; then rm -rf "$TMP_A_BORRAR"; fi' EXIT

error() { printf 'ERROR: %s\n' "$*" >&2; }
falla() { error "$*"; exit 1; }

# Ruta nativa para Python en Windows (Git Bash pasa /c/...).
ruta_nativa() {
  if command -v cygpath >/dev/null 2>&1; then cygpath -w "$1"; else printf '%s' "$1"; fi
}

PYTHON=""
for candidato in python3 python py; do
  if command -v "$candidato" >/dev/null 2>&1 && "$candidato" -c "import zipfile" >/dev/null 2>&1; then
    PYTHON="$candidato"; break
  fi
done

# Lista las entradas (sin directorios) de un ZIP, una por línea.
listar_zip() {
  if command -v zipinfo >/dev/null 2>&1; then
    zipinfo -1 "$1" | grep -v '/$' || true
  elif [ -n "$PYTHON" ]; then
    "$PYTHON" -I -c 'import sys,zipfile
for n in zipfile.ZipFile(sys.argv[1]).namelist():
    if not n.endswith("/"): print(n)' "$(ruta_nativa "$1")"
  else
    falla "No hay zipinfo ni Python para leer el ZIP."
  fi
}

# Extrae el ZIP en una carpeta (para el escaneo de secretos).
extraer_zip() {
  if command -v unzip >/dev/null 2>&1; then
    unzip -q -o "$1" -d "$2"
  elif [ -n "$PYTHON" ]; then
    "$PYTHON" -I -c 'import sys,zipfile; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])' \
      "$(ruta_nativa "$1")" "$(ruta_nativa "$2")"
  else
    falla "No hay unzip ni Python para extraer el ZIP."
  fi
}

# -----------------------------------------------------------------------------
# verificar <zip>: devuelve 0 si el ZIP cumple; si no, lista cada problema.
# -----------------------------------------------------------------------------
verificar() {
  local zip="$1" problemas=0
  [ -f "$zip" ] || falla "No existe el ZIP: $zip"

  local tmp; tmp="$(mktemp -d)"
  TMP_A_BORRAR="$tmp"   # se borra al salir (trap EXIT)

  listar_zip "$zip" > "$tmp/entradas_crudas.txt"
  [ -s "$tmp/entradas_crudas.txt" ] || falla "El ZIP está vacío o no se pudo leer: $zip"

  # 1) Todo bajo la carpeta del grupo.
  if grep -v -F "$PREFIJO/" "$tmp/entradas_crudas.txt" | grep -q .; then
    error "Hay entradas fuera de la carpeta '$PREFIJO/':"
    grep -v -F "$PREFIJO/" "$tmp/entradas_crudas.txt" | sed 's/^/  - /' >&2
    problemas=$((problemas + 1))
  fi
  # Rutas relativas (sin la carpeta del grupo).
  sed "s#^$(printf '%s' "$PREFIJO" | sed 's/[&.*^$/]/\\&/g')/##" "$tmp/entradas_crudas.txt" > "$tmp/entradas.txt"

  # 2) Obligatorios.
  local f
  for f in "${OBLIGATORIOS[@]}"; do
    if ! grep -qxF "$f" "$tmp/entradas.txt"; then
      error "Falta el archivo obligatorio: $f"
      problemas=$((problemas + 1))
    fi
  done
  local caso
  for caso in "${CASOS_G[@]}"; do
    if ! grep -E "^evidencia/[^/]*${caso}" "$tmp/entradas.txt" | grep -q .; then
      error "Falta evidencia del caso $caso en evidencia/"
      problemas=$((problemas + 1))
    fi
  done

  # 3) Prohibidos.
  local prohibidos
  prohibidos="$(grep -E \
    -e '(^|/)\.env$' \
    -e '(^|/)[^/]*\.env$' \
    -e '(^|/)\.env\.[^/]*$' \
    -e '(^|/)\.?venv/' \
    -e '(^|/)node_modules/' \
    -e '(^|/)__pycache__/' \
    -e '\.pyc$' \
    -e '^backend/DEPLOY\.md$' \
    -e '^backend/evidencia/vps/' \
    -e '^backend/evidencia/(imagen-local|integracion)\.txt$' \
    -e '^openspec/' \
    -e '^knowledge-base/' \
    "$tmp/entradas.txt" | grep -v -E '(^|/)env\.example$' || true)"
  # Cualquier cosa fuera de lo que pide la consigna (design-system/, AGENTS.md...).
  local fuera
  fuera="$(grep -v -E '^(frontend/|backend/|evidencia/|README\.md$|DEPLOY\.md$)' "$tmp/entradas.txt" || true)"
  if [ -n "$prohibidos" ] || [ -n "$fuera" ]; then
    error "El ZIP contiene entradas prohibidas:"
    printf '%s\n%s\n' "$prohibidos" "$fuera" | grep . | sort -u | sed 's/^/  - /' >&2
    problemas=$((problemas + 1))
  fi

  # 4) Escaneo de secretos en archivos de texto.
  mkdir -p "$tmp/x"
  extraer_zip "$zip" "$tmp/x"
  local raiz="$tmp/x/$PREFIJO" hallazgos="$tmp/secretos.txt"
  : > "$hallazgos"
  [ -d "$raiz" ] || raiz="$tmp/x"
  # Lista de archivos de texto (rutas relativas). Cada grep corre UNA vez sobre
  # todos ellos (en Git Bash lanzar un proceso por archivo es muy lento).
  grep -E "$ES_TEXTO" "$tmp/entradas.txt" | tr '\n' '\0' > "$tmp/textos.lst" || true
  # buscar <opciones de grep> → salida "ruta:línea:coincidencia"
  buscar() { (cd "$raiz" && xargs -0 grep -H "$@" < "$tmp/textos.lst" 2>/dev/null) || true; }
  if [ -s "$tmp/textos.lst" ]; then
    # 4a) URLs de PostgreSQL con contraseña que no es un marcador permitido.
    buscar -noE 'postgres(ql)?(\+asyncpg)?://[^:/@[:space:]]+:[^@[:space:]]+@' \
      | { grep -vE "://[^:/@]+:${CLAVES_PERMITIDAS}@\$" || true; } \
      | sed -E "s#(://[^:/@]*):.*@\$#\1:****@ (contraseña con pinta de real)#" >> "$hallazgos"
    # 4b) POSTGRES_PASSWORD=valor no permitido.
    buscar -noE 'POSTGRES_PASSWORD=[^[:space:]"'"'"']+' \
      | { grep -vE "POSTGRES_PASSWORD=${CLAVES_PERMITIDAS}\$" || true; } \
      | sed "s#=.*#=**** (contraseña con pinta de real)#" >> "$hallazgos"
    # 4c) Claves privadas y tokens (no se imprime el valor, solo archivo:línea).
    local patron
    for patron in "${PATRONES_PROHIBIDOS[@]}"; do
      buscar -nE -e "$patron" | cut -d: -f1,2 \
        | sed "s#\$#: coincide con el patrón prohibido '$patron'#" >> "$hallazgos"
    done
  fi
  if [ -s "$hallazgos" ]; then
    error "Posibles credenciales o secretos en el ZIP (archivo:línea):"
    sed 's/^/  - /' "$hallazgos" >&2
    problemas=$((problemas + 1))
  fi

  if [ "$problemas" -gt 0 ]; then
    error "La verificación del ZIP FALLÓ ($problemas problema(s)). No lo subas: $zip"
    return 1
  fi

  # 5) Resumen.
  local abs; abs="$(cd "$(dirname "$zip")" && pwd -P)/$(basename "$zip")"
  local bytes; bytes="$(wc -c < "$zip" | tr -d ' ')"
  echo "Verificación OK."
  echo "  ZIP:      $abs"
  if command -v cygpath >/dev/null 2>&1; then
    echo "            ($(LC_ALL=C.UTF-8 cygpath -w "$abs"))"
  fi
  echo "  Tamaño:   $bytes bytes ($(awk -v b="$bytes" 'BEGIN{printf "%.2f MB", b/1048576}'))"
  echo "  Archivos: $(wc -l < "$tmp/entradas.txt" | tr -d ' ')"
  echo "  Por carpeta de primer nivel:"
  awk -F/ '{ if (NF>1) print $1"/"; else print "(raíz) "$1 }' "$tmp/entradas.txt" \
    | sort | uniq -c | awk '{c=$1; $1=""; printf "    %-22s %s\n", substr($0,2), c}'
  echo "  Evidencias por caso:"
  for caso in "${CASOS_G[@]}"; do
    printf '    %-6s %s\n' "$caso" "$(grep -cE "^evidencia/[^/]*${caso}" "$tmp/entradas.txt" || true)"
  done
  return 0
}

# -----------------------------------------------------------------------------
# Entrada
# -----------------------------------------------------------------------------
if [ "${1:-}" = "--verificar" ]; then
  [ -n "${2:-}" ] || falla "Uso: $0 --verificar <archivo.zip>"
  verificar "$2"
  exit $?
fi
if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  sed -n '2,20p' "$0"; exit 0
fi

REF="${1:-main}"
REPO="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)" || falla "No se encontró el repositorio git."
REPO="$(cd "$REPO" && pwd -P)"
SALIDA="${2:-$(dirname "$REPO")}"
[ -d "$SALIDA" ] || falla "No existe la carpeta de salida: $SALIDA"
SALIDA="$(cd "$SALIDA" && pwd -P)"

case "$SALIDA/" in
  "$REPO"/*) falla "La carpeta de salida está dentro del repo ($SALIDA). Elegí una de afuera para no versionar el ZIP." ;;
esac

COMMIT="$(git -C "$REPO" rev-parse --verify --quiet "${REF}^{commit}")" \
  || falla "La ref '$REF' no existe en el repo."

DESTINO="$SALIDA/$NOMBRE_ZIP"
echo "Armando '$NOMBRE_ZIP' desde '$REF' ($(git -C "$REPO" log -1 --format='%h %s' "$COMMIT"))..."
git -C "$REPO" archive --format=zip --prefix="$PREFIJO/" -o "$DESTINO" "$COMMIT" -- \
  "${CONTENIDO[@]}" "${EXCLUIDOS[@]}" \
  || falla "git archive no pudo armar el ZIP."

verificar "$DESTINO"
