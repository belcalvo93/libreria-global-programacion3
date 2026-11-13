## Decisions

- **D1 Páginas**: la imagen ya trae la perspectiva (paralelogramo), así que sobre la cara 3D rotada se deformaba doble y quedaba flotando. `.libro__tope` pasa a ser un canto plano apoyado sobre el borde superior del lomo (`bottom: calc(100% - 0.2rem)`), con el ancho del lomo y `aspect-ratio: 496 / 158`. Sin cambios de tamaño ni layout del libro; alineado a la izquierda del lomo.
- **D2 Tapa**: mismas capas que el lomo (color + brillo dorado + capa negra 32 % + textura con `overlay`, `cover`).
- **D3 Estrella**: `::after` de la tapa con la imagen (26 % del ancho, `aspect-ratio: 117 / 175`, `brightness(1.2)` y `drop-shadow` dorado). Decorativa: sin texto accesible.
- **D4 Origen**: recortes de un libro de imagen propia generada con Gemini por Belén.
