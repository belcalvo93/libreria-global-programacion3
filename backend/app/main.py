import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings, leer_cors_origins
from app.core.database import crear_fabrica_sesiones, crear_motor
from app.modules.autores.router import router as autores_router
from app.modules.clientes.router import router as clientes_router
from app.modules.editoriales.router import router as editoriales_router
from app.modules.generos.router import router as generos_router
from app.modules.health.router import router as health_router
from app.modules.libros.router import router as libros_router
from app.modules.ventas.router import router as ventas_router

# SQLAlchemy resuelve las relaciones por nombre ("Cliente", "RenglonVenta"...): todos los
# modelos tienen que estar importados antes del primer uso, aunque el módulo
# dueño todavía no registre su router.
import app.modules.clientes.models  # noqa: F401
import app.modules.ventas.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    motor = crear_motor(settings.database_url, echo=settings.sql_echo)
    app.state.engine = motor
    app.state.session_factory = crear_fabrica_sesiones(motor)
    yield
    await motor.dispose()


# Sin "*" ni credenciales: se abre solo lo que la API usa (no hay cookies ni autenticación).
METODOS_PERMITIDOS = ["GET", "POST", "PATCH", "OPTIONS"]
CABECERAS_PERMITIDAS = ["Content-Type"]


def configurar_cors(app: FastAPI, origenes: list[str]) -> None:
    """Habilita CORS solo para los orígenes dados; con la lista vacía no hay CORS."""
    if not origenes:
        return
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origenes,
        allow_methods=METODOS_PERMITIDOS,
        allow_headers=CABECERAS_PERMITIDAS,
        allow_credentials=False,
    )


app = FastAPI(title="Librería", lifespan=lifespan)
configurar_cors(app, leer_cors_origins(os.getenv("CORS_ORIGINS")))

app.include_router(health_router)
app.include_router(editoriales_router)
app.include_router(generos_router)
app.include_router(autores_router)
app.include_router(libros_router)
app.include_router(clientes_router)
app.include_router(ventas_router)

# Cada integrante registra acá el router de su módulo:
# from app.modules.editoriales.router import router as editoriales_router
# app.include_router(editoriales_router)
# ... generos, autores, libros, clientes, ventas
