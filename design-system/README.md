# Design system — Librería Página Viva

Mode: system-only
Revision: 1
Approval: approved (2026-11-10, by user)

> Política "light": se REUTILIZA el CSS del parcial. No se crea un sistema nuevo ni se piden mockups por change.
> Aprobada explícitamente por el usuario el 2026-11-10 (política light, revisión 1). Un cambio a variables de `:root` o a componentes compartidos sube `Revision:` y vuelve `Approval` a `pending`.

## Política visual del proyecto

- `system-only`: hay UI, pero no se pide mockup por change. Los changes visuales que tengan `design.md` registran `Decision: no (project policy)`.
- No se crean `tokens.css`, `brand.js`, `components.html`, `assets/` ni `previews/`: no aplican en política light. La fuente de verdad es el CSS existente.
- Dueña del CSS general: Belén.
- Cambiar la política requiere pedido explícito del usuario.

## Fuente

- `frontend/public/css/styles.css` (CSS del parcial, único archivo de estilos externo; solo fuentes del sistema, sin librerías, frameworks ni CDNs).
- Se estiliza por clase y estructura, nunca por id.
- Cualquier cambio a variables de `:root` o a componentes compartidos sube `Revision:` y vuelve la aprobación a `pending`.

## Tokens (`:root`)

- Color: `--color-fondo` #f5f2ec, `--color-superficie` #ffffff, `--color-texto` #26313b, `--color-texto-suave` #5a6a76, `--color-borde` #d9d3c8, `--color-primario` #245b8c, `--color-primario-oscuro` #1a4266, `--color-primario-claro` #e8f0f8, `--color-peligro` #b3261e, `--color-peligro-oscuro` #8c1d17, `--color-foco` #0b57d0.
- Estados: `--color-error-fondo|texto|borde` (#fdecea / #7a1b12 / #c0392b) y `--color-ok-fondo|texto|borde` (#e9f7ee / #14532d / #2e8b57).
- Tipografía: `--font-sans` (system-ui y fallbacks), `--font-mono` (ui-monospace y fallbacks), `--fs-base` 1rem, `--fs-sm` 0.875rem, `--fs-lg` 1.25rem, `--fs-titulo` clamp(1.5rem, 4vw, 2rem).
- Espaciado (escala de 4px): `--esp-1` 0.25rem, `--esp-2` 0.5rem, `--esp-3` 0.75rem, `--esp-4` 1rem, `--esp-5` 1.5rem, `--esp-6` 2rem.
- Forma y elevación: `--radio` 8px, `--radio-sm` 4px, `--sombra` 0 1px 3px rgba(0,0,0,.12).

## Componentes

- Estructura: `header`, `nav` (lista centrada, enlaces con `min-height` 44px), `footer`, `main` (grid, `max-width` 72rem).
- `.card`: tarjeta con `h2` subrayado en color primario.
- Formularios: `.form` (1 columna; 2 desde 48rem) y `.form__grupo` (label + control; funciona dentro y fuera de `.form`).
- Renglón de venta: `.form .form__grupo:has(output)` (selector estructural; en 48rem+ pasa a 4 columnas). Sin `:has()` cae a pila vertical.
- Controles: `input`, `select` (`min-height` 44px), `select[multiple]`, `output` (monoespaciada, fondo primario claro), `details`/`summary`.
- Botones: `.btn` (ancho completo, 44px) y `.btn.btn--peligro` (acción de quitar).
- Tablas: `.tabla-contenedor` (único responsable del scroll horizontal) y `.tabla` (celdas con `nowrap`).
- Mensajes de estado: `.mensaje` (base), `.mensaje--error` (marcador ⚠) y `.mensaje--ok` (marcador ✓). El estado no depende solo del color.
- `hidden`: `[hidden] { display: none !important; }` es la única excepción de `!important`. Los `.mensaje` llevan `hidden` en el HTML y el JS lo quita/pone para mostrarlos u ocultarlos. No usar `display` inline ni clases ad hoc para ocultar.

## Reglas

1. Sin estilos inline (`style=""`): todo va en `styles.css`.
2. Colores, tipografía, espaciado y radios salen de las variables de `:root`; no hardcodear valores.
3. Foco visible en todo control interactivo (`:focus-visible`, anillo 3px `--color-foco`). Nunca suprimir `outline` sin reemplazo.
4. Responsive de 320 a 1280 px, mobile-first, breakpoint en 48rem, sin scroll horizontal de página (el scroll de tablas va en `.tabla-contenedor`).
5. Contenido dinámico con `textContent` (nunca `innerHTML` con datos del usuario o de la API).
6. Objetivos táctiles de 44px mínimo; contraste AA.
7. Los mensajes de estado reutilizan `.mensaje`, `.mensaje--error`, `.mensaje--ok` y el atributo `hidden`.
8. Sin librerías, frameworks, CDNs ni fuentes remotas.

## Decisiones abiertas (TBD)

- Nombre de marca final: (TBD). El parcial usa "Librería Página Viva".
- Logo e imágenes: (TBD); no hay assets de marca definidos en el parcial.
- Modo oscuro: (TBD); no existe.
- Movimiento/animaciones y `prefers-reduced-motion`: (TBD); el CSS actual no define transiciones.
- Estilos para estados nuevos de la integración con la API (carga, vacío): (TBD).
- Paleta «librería mágica» (C-06, Belén): se define como variables nuevas de `:root` en `styles.css`; valores: (TBD valores). No se inventan colores acá; al fijarlos se sube `Revision:` y se pide nueva aprobación.
- Alcance visual de C-06 (decidido): sección propia con un estante de libros cuyos lomos salen del catálogo de la API (al pasar el cursor se levantan; al hacer clic abren el detalle `GET /libros/{id}`), etiquetas de navegación arriba del estante (similar a un menú) y la paleta anterior. La tabla del catálogo se mantiene. Los estilos del estante se suman por clase a `styles.css`, sin estilos inline.

## Reemplazo

Los valores visuales se cambian en `:root` de `frontend/public/css/styles.css`; no hay otro punto de reemplazo. Coordinar con Belén (dueña del CSS general) y subir `Revision:`.
