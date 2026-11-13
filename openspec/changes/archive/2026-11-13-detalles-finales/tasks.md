## 1. Favicon y color de barra

- [x] 1.1 Generar `favicon.ico` (16/32/48), `favicon-32.png` y `apple-touch-icon.png` (180) desde `img/luna.webp`
- [x] 1.2 `<link rel="icon">`, `<link rel="apple-touch-icon">` y `<meta name="theme-color">` en `index.html`
- [x] 1.3 nginx: `/favicon.ico` y `/apple-touch-icon.png` con cache; verificar 200 sin 404 en consola

## 2. Saltar al contenido

- [x] 2.1 `<a class="saltar" href="#catalogo">` primero en el `<body>` y `tabindex="-1"` en `#catalogo`
- [x] 2.2 Estilos `.saltar` (oculto hasta el foco, cristal nocturno, sobre el nav)

## 3. Fundido de la música (TDD)

- [x] 3.1 Tests de `siguienteVolumen` y `pasoPorCuadro` (rojo)
- [x] 3.2 Funciones puras (verde) y fundido con un solo `requestAnimationFrame` cancelable en `musica.js`

## 4. Margen al pie

- [x] 4.1 `padding-bottom` del `footer` (~4 rem más)

## 5. Verificación y docs

- [x] 5.1 `node --test "frontend/tests/*.test.js"` y `openspec validate --strict --all`
- [x] 5.2 Navegador detrás de nginx: favicon 200, Tab a 320 y 1366 px, fundido, pie
- [x] 5.3 `CHANGES.md` (C-06h), KB (D-54), `design-system/README.md` (revisión 16 pendiente y origen del favicon)
