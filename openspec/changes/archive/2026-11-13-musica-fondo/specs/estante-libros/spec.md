## MODIFIED Requirements

### Requirement: Cola del gato animada
Con movimiento permitido, la cola del gato SHALL ondular: la base se balancea sobre su raíz y la punta la sigue con retraso. Con el cursor cerca la punta MUST dar golpecitos, y muy cerca toda la cola MUST agitarse; al alejarse vuelve a la calma sin saltos. El gato MUST ser una sola imagen (`img/gato.webp`) en tres recortes sin unión visible, y con `prefers-reduced-motion: reduce` la cola MUST quedar quieta.

#### Scenario: Movimiento permitido
- **WHEN** se abre la página sin preferencia de movimiento reducido
- **THEN** la cola se balancea y la punta la sigue con retraso, sin hueco visible entre la cola y el cuerpo

#### Scenario: Cursor cerca
- **WHEN** el cursor pasa cerca de la cola y después se aleja
- **THEN** la punta da golpecitos (y toda la cola se agita si el cursor está muy cerca) y luego vuelve a la calma al terminar el ciclo

#### Scenario: Reducir movimiento
- **GIVEN** el sistema con `prefers-reduced-motion: reduce`
- **WHEN** se abre la página
- **THEN** el gato y su cola están quietos
