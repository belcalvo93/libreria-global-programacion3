## MODIFIED Requirements

### Requirement: Carga previa a los scripts de sección
`index.html` SHALL cargar `js/api.js` como script clásico (sin `type="module"`) antes que cualquier otro script de la página, para que `window.Api` exista cuando se ejecuten los scripts de sección.

#### Scenario: Orden de carga
- **WHEN** se inspeccionan las etiquetas `<script>` de `index.html`
- **THEN** la primera es `js/api.js` y le siguen `catalogo.js`, `altas.js`, `ventas.js` y `estante.js`, sin `datos.js` ni `persistencia.js`
