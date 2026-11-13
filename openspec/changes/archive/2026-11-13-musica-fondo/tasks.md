## 1. Servidor

- [x] 1.1 Verificar que `frontend/public/audio/ambiente.mp3` exista
- [x] 1.2 `location /audio/` en `frontend/default.conf.template` (cache 30 días, `audio/mpeg`, `Range`)

## 2. Música (TDD)

- [x] 2.1 Tests de `siguienteEstado` y `vistaBoton` en `frontend/tests/musica.test.js` (rojo)
- [x] 2.2 `frontend/public/js/musica.js`: capa pura (verde)
- [x] 2.3 Capa DOM: primera interacción, botón, `visibilitychange`, `play()` con `try/catch`
- [x] 2.4 `<audio>`, botón y `<script>` en `index.html`; estilos del botón en `styles.css`

## 3. Cola del gato (TDD)

- [x] 3.1 Tests de `estadoColaPorDistancia` y `pasoCola` en `frontend/tests/estante.test.js` (rojo)
- [x] 3.2 Capa pura en `estante.js` (verde) y capa DOM (`pointermove`, `animationiteration`)
- [x] 3.3 Cola en dos tramos en `index.html` y `styles.css`

## 4. Verificación y docs

- [x] 4.1 `node --test "frontend/tests/*.test.js"` y `openspec validate --strict --all`
- [x] 4.2 Prueba en navegador (botón, primera interacción, pestaña oculta, cola, 320 a 1280 px)
- [x] 4.3 `CHANGES.md` (C-06g), KB (decisión), `README.md` (origen del audio y botón), `design-system/README.md` (revisión 15 pendiente)
