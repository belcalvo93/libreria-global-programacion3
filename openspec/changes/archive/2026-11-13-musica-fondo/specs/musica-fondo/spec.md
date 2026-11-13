## ADDED Requirements

### Requirement: Música opt-in con la primera interacción
La página SHALL tener un `<audio id="musica-fondo">` con `/audio/ambiente.mp3`, `loop` y `preload="none"`, sin `autoplay`. La música MUST empezar a volumen 0.3 con la primera interacción del usuario (`pointerdown`, `keydown` o `touchstart` en el documento), una sola vez. Si `play()` es rechazado, MUST quedar silenciada sin errores sin capturar.

#### Scenario: Primera interacción
- **WHEN** el usuario abre la página y hace clic en cualquier lugar
- **THEN** la música empieza a sonar a volumen 0.3 y los escuchas de primera interacción se quitan

#### Scenario: Reproducción bloqueada
- **WHEN** el navegador rechaza `play()`
- **THEN** el botón queda en «Activar música» y la página sigue funcionando

### Requirement: Botón de música accesible
La página SHALL mostrar un `<button id="boton-musica" type="button">` fijo en la esquina inferior derecha, de 44x44 px, con foco visible, `aria-pressed` y `aria-label` «Silenciar música» (🔊) o «Activar música» (🔇). Pulsarlo MUST alternar entre reproducción y pausa. Si el usuario la silenció, una interacción posterior con la página MUST NOT reactivarla.

#### Scenario: Silenciar
- **GIVEN** la música sonando
- **WHEN** el usuario pulsa el botón y después hace clic en la página
- **THEN** la música queda en pausa, `aria-pressed="false"` y el clic en la página no la reactiva

#### Scenario: Teclado
- **WHEN** el usuario llega al botón con Tab y pulsa Enter
- **THEN** el botón muestra el foco y alterna la música

### Requirement: Pausa con la pestaña oculta
La música SHALL pausarse cuando la pestaña se oculta (`visibilitychange`) y MUST retomar al volver solo si no estaba silenciada.

#### Scenario: Volver a la pestaña
- **GIVEN** la música sonando
- **WHEN** el usuario cambia de pestaña y vuelve
- **THEN** la música se pausa mientras no se ve y retoma al volver

#### Scenario: Silenciada antes de ocultar
- **GIVEN** la música silenciada por el usuario
- **WHEN** cambia de pestaña y vuelve
- **THEN** la música sigue en pausa

### Requirement: Audio servido por nginx
nginx SHALL servir `/audio/` con `Content-Type: audio/mpeg`, cache de 30 días y soporte de pedidos `Range` (respuesta 206).

#### Scenario: Pedido parcial
- **WHEN** el navegador pide `/audio/ambiente.mp3` con `Range: bytes=0-1023`
- **THEN** nginx responde 206 con `Content-Type: audio/mpeg`
