## Decisions

- **D1 Restaurar, no revertir**: se copian las reglas de `.libro__tope` tal como estaban antes del commit que introdujo la imagen (`0893df5`), sin `git revert` de commits completos, para no perder lomo, tapa, estrella, título centrado ni etiqueta.
- **D2 Sin restos**: se borran `.libro__tope::before` (relleno con `clip-path`) y `.libro__lomo::before` (labio de cuero), que solo existían para ensamblar la imagen.
