## ADDED Requirements

### Requirement: Fundido de volumen
Al empezar o retomar, el volumen SHALL subir de 0 a 0.3 en ~1.5 s; al pausar o silenciar MUST bajar a 0 en ~0.6 s y recién entonces pausar. Un cambio nuevo MUST cancelar el fundido en curso, sin temporizadores colgados. `aria-pressed` MUST cambiar al instante. Si `play()` es rechazado, la música queda silenciada como antes.

#### Scenario: Silenciar con fundido
- **GIVEN** la música sonando
- **WHEN** el usuario pulsa el botón
- **THEN** `aria-pressed` pasa a `false` en el acto y el audio se pausa después de ~0.6 s de bajada

#### Scenario: Reactivar durante la bajada
- **WHEN** el usuario vuelve a pulsar el botón antes de que termine la bajada
- **THEN** la bajada se cancela, el audio no se pausa y el volumen sube de nuevo hasta 0.3
