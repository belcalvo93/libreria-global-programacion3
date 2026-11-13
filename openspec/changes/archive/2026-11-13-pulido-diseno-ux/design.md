## Decisions

- **D1 Marca**: reemplazo textual en todo el repo salvo `openspec/changes/archive/` (historial). Las claves `paginaViva.*` de localStorage viejo no se tocan.
- **D2 Lema**: `<p class="portada__lema">` dentro de `header`, tras el h1. El header pasa a columna. Con `<= 48rem` el alto de cabecera es `max(luna + 1.2rem, 7rem)` (7rem sin luna a `<= 24rem`) para que quepa en 2 o 3 líneas sin empujar la estantería (la portada sigue midiendo 100dvh). En escritorio el ancho máximo evita la luna.
- **D3 Formulario**: tres `fieldset.form__bloque`. Los ids, `name` y `for` no cambian. La tabla de autorías y su mensaje vacío pasan dentro del bloque «Autores». Los botones de buscar y agregar autoría son secundarios; «Agregar libro» ocupa todo el ancho.
- **D4 Orden**: `siguienteOrden(autorias)` devuelve el menor entero positivo no usado; se aplica tras agregar, quitar y guardar. El campo sigue editable.
- **D5 Hover**: se suma `rotateZ(-1.5deg)` al levante 3D existente y una sombra mayor en lomo y tapa; transición de `box-shadow`. Sin cambiar tamaños.
