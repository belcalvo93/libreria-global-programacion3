import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    database_url: str
    sql_echo: bool = False


def get_settings() -> Settings:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError(
            "Falta la variable de entorno DATABASE_URL. "
            "Copiá env.example como .env y completalo."
        )
    sql_echo = os.getenv("SQL_ECHO", "false").strip().lower() in {"1", "true", "yes", "si"}
    return Settings(database_url=database_url, sql_echo=sql_echo)


def leer_cors_origins(valor: str | None) -> list[str]:
    """Convierte el texto de CORS_ORIGINS (orígenes separados por coma) en una lista.

    Se quitan los espacios de cada elemento y se descartan los vacíos; sin valor
    queda una lista vacía, que significa "sin CORS".
    """
    if not valor:
        return []
    return [origen.strip() for origen in valor.split(",") if origen.strip()]
