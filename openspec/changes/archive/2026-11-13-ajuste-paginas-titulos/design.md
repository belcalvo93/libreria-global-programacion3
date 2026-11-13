## Decisions

- **D1 Ensamble**: la imagen de páginas sube 3 px por detrás del borde del lomo (`bottom: calc(100% - 3px)`, `translateZ(-1px)`), mide el ancho del lomo + 3 px (retrocede en perspectiva a la derecha, nada a la izquierda) y un relleno (`::before`, `clip-path`) cierra el hueco triangular bajo su borde ondulado, con cara lateral. Un labio de cuero de 5 px (`.libro__lomo::before`, 38 % más oscuro, esquinas superiores de 3 px) monta sobre las hojas. Todo en %/variables.
- **D2 Título**: `.estante h2` centrado con el mismo relleno a ambos lados (el ancho que ocupa el gato).
- **D3 Etiqueta**: `top: calc(0.7 * var(--gato-alto) - 0.4rem)` + `translateY(-100%)`: su borde inferior queda 6 px sobre el gabinete y crece hacia arriba; 16 px a la derecha del gato; ancho máximo `min(32rem, hasta el borde derecho)`. A 320 px, letra de 0,8 rem para que 3 líneas quepan bajo «Estantería».
