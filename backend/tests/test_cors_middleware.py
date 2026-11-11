import unittest

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.main import configurar_cors

ORIGEN = "http://localhost:8080"


def crear_app_de_prueba(origenes: list[str]) -> TestClient:
    """App mínima con una ruta, sin base de datos ni lifespan (TestClient sin `with`)."""
    app = FastAPI()

    @app.get("/ping")
    async def ping():
        return {"ok": True}

    configurar_cors(app, origenes)
    return TestClient(app)


class OrigenesPermitidosTest(unittest.TestCase):
    def setUp(self):
        self.cliente = crear_app_de_prueba([ORIGEN])

    def test_origen_permitido_recibe_su_cabecera(self):
        respuesta = self.cliente.get("/ping", headers={"Origin": ORIGEN})
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.headers.get("access-control-allow-origin"), ORIGEN)

    def test_otro_dominio_no_recibe_cabecera(self):
        respuesta = self.cliente.get("/ping", headers={"Origin": "https://otro.ejemplo.com"})
        self.assertNotIn("access-control-allow-origin", respuesta.headers)

    def test_mismo_host_con_otro_puerto_no_recibe_cabecera(self):
        respuesta = self.cliente.get("/ping", headers={"Origin": "http://localhost:9999"})
        self.assertNotIn("access-control-allow-origin", respuesta.headers)


class SinOrigenesTest(unittest.TestCase):
    def test_lista_vacia_no_agrega_cabeceras_cors(self):
        cliente = crear_app_de_prueba([])
        respuesta = cliente.get("/ping", headers={"Origin": ORIGEN})
        self.assertEqual(respuesta.status_code, 200)
        self.assertNotIn("access-control-allow-origin", respuesta.headers)

    def test_lista_vacia_no_registra_el_middleware(self):
        app = FastAPI()
        configurar_cors(app, [])
        self.assertEqual(app.user_middleware, [])


class PreflightTest(unittest.TestCase):
    def setUp(self):
        self.cliente = crear_app_de_prueba([ORIGEN])

    def preflight(self, metodo: str, origen: str = ORIGEN):
        return self.cliente.options(
            "/ping",
            headers={
                "Origin": origen,
                "Access-Control-Request-Method": metodo,
                "Access-Control-Request-Headers": "content-type",
            },
        )

    def test_preflight_permitido_lista_post_y_patch(self):
        respuesta = self.preflight("POST")
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.headers.get("access-control-allow-origin"), ORIGEN)
        metodos = respuesta.headers.get("access-control-allow-methods", "")
        self.assertIn("POST", metodos)
        self.assertIn("PATCH", metodos)

    def test_preflight_de_delete_es_rechazado(self):
        respuesta = self.preflight("DELETE")
        self.assertNotEqual(respuesta.status_code, 200)

    def test_preflight_desde_origen_no_permitido_es_rechazado(self):
        respuesta = self.preflight("POST", origen="https://otro.ejemplo.com")
        self.assertNotEqual(respuesta.status_code, 200)
        self.assertNotIn("access-control-allow-origin", respuesta.headers)


class SinCredencialesNiComodinTest(unittest.TestCase):
    def setUp(self):
        self.cliente = crear_app_de_prueba([ORIGEN])

    def comprobar(self, respuesta):
        self.assertNotEqual(respuesta.headers.get("access-control-allow-origin"), "*")
        self.assertNotIn("access-control-allow-credentials", respuesta.headers)

    def test_respuesta_normal(self):
        self.comprobar(self.cliente.get("/ping", headers={"Origin": ORIGEN}))

    def test_preflight(self):
        self.comprobar(
            self.cliente.options(
                "/ping",
                headers={
                    "Origin": ORIGEN,
                    "Access-Control-Request-Method": "POST",
                    "Access-Control-Request-Headers": "content-type",
                },
            )
        )

    def test_origen_no_permitido(self):
        self.comprobar(self.cliente.get("/ping", headers={"Origin": "https://otro.ejemplo.com"}))


class AppRealTest(unittest.TestCase):
    def test_la_app_real_arranca_y_responde_health_live(self):
        from app.main import app

        respuesta = TestClient(app).get("/health/live")
        self.assertEqual(respuesta.status_code, 200)


if __name__ == "__main__":
    unittest.main()
