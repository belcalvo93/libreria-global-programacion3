import unittest

from app.core.config import leer_cors_origins


class LeerCorsOriginsTest(unittest.TestCase):
    def test_un_origen(self):
        self.assertEqual(
            leer_cors_origins("http://localhost:8080"),
            ["http://localhost:8080"],
        )

    def test_varios_origenes_con_espacios(self):
        self.assertEqual(
            leer_cors_origins(" http://127.0.0.1:8080 ,  http://localhost:8080"),
            ["http://127.0.0.1:8080", "http://localhost:8080"],
        )

    def test_descarta_elementos_vacios_y_coma_final(self):
        self.assertEqual(
            leer_cors_origins("http://a.example,,http://b.example,"),
            ["http://a.example", "http://b.example"],
        )

    def test_sin_valor_es_lista_vacia(self):
        self.assertEqual(leer_cors_origins(None), [])

    def test_texto_vacio_es_lista_vacia(self):
        self.assertEqual(leer_cors_origins(""), [])

    def test_solo_comas_y_espacios_es_lista_vacia(self):
        self.assertEqual(leer_cors_origins(" , ,"), [])


if __name__ == "__main__":
    unittest.main()
