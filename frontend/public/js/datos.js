/* ==========================================================================
   Librería Página Viva — Datos locales (Ejercicio 3)
   Capa de datos estáticos con los valores congelados del Ejercicio 1
   (openspec/changes/archive/2026-10-14-ejercicio-1-html/design.md §5).
   Las ventas las agrega el Ejercicio 5 (V-001 de ejemplo). Sin librerías ni fetch.
   ========================================================================== */

// `var` a propósito: script clásico (sin type="module", compatible con
// apertura por doble clic en file://) y global accesible desde js/catalogo.js.
var DATOS = {
  editoriales: [
    { id: "faro-austral", nombre: "Editorial Faro Austral" },
    { id: "puente-alto", nombre: "Ediciones Puente Alto" }
  ],
  generos: [
    { id: "fantasia-urbana", nombre: "Fantasía Urbana" },
    { id: "ensayo-breve", nombre: "Ensayo Breve" }
  ],
  autores: [
    { id: "lucia-ferreyra", nombre: "Lucía Ferreyra" },
    { id: "tomas-iriarte", nombre: "Tomás Iriarte" },
    { id: "camila-duarte", nombre: "Camila Duarte" }
  ],
  libros: [
    {
      id: "el-mapa-de-las-horas-lentas",
      titulo: "El mapa de las horas lentas",
      isbn: "9789500100011",
      precio: 1500,
      editorialId: "faro-austral",
      generoId: "fantasia-urbana",
      autorIds: ["lucia-ferreyra"]
    },
    {
      id: "cronicas-del-patio-interior",
      titulo: "Crónicas del patio interior",
      isbn: "9789500100028",
      precio: 2000,
      editorialId: "puente-alto",
      generoId: "ensayo-breve",
      autorIds: ["tomas-iriarte"]
    },
    {
      id: "noche-de-vidrio-molido",
      titulo: "Noche de vidrio molido",
      isbn: "9789500100035",
      precio: 1750,
      editorialId: "faro-austral",
      generoId: null,
      autorIds: ["camila-duarte"]
    },
    {
      id: "manual-para-perder-trenes",
      titulo: "Manual para perder trenes",
      isbn: "9789500100042",
      precio: 2300,
      editorialId: "puente-alto",
      generoId: "fantasia-urbana",
      autorIds: ["lucia-ferreyra", "tomas-iriarte"]
    },
    {
      id: "el-oficio-de-la-marea",
      titulo: "El oficio de la marea",
      isbn: "9789500100059",
      precio: 3100,
      editorialId: "faro-austral",
      generoId: "ensayo-breve",
      autorIds: ["camila-duarte"]
    },
    {
      id: "inventario-de-luces-minimas",
      titulo: "Inventario de luces mínimas",
      isbn: "9789500100066",
      precio: 2800,
      editorialId: "puente-alto",
      generoId: null,
      autorIds: ["tomas-iriarte"]
    }
  ],
  clientes: [
    { id: "valentina-rios", nombre: "Valentina Ríos", email: "valentina.rios@ejemplo.com" },
    { id: "martin-aguirre", nombre: "Martín Aguirre", email: "martin.aguirre@ejemplo.com" },
    { id: "sofia-benitez", nombre: "Sofía Benítez", email: "sofia.benitez@ejemplo.com" }
  ],
  ventas: [
    {
      id: "V-001",
      fecha: "2026-10-14",
      clienteId: "valentina-rios",
      clienteNombre: "Valentina Ríos",
      renglones: [
        { libroId: "el-mapa-de-las-horas-lentas", titulo: "El mapa de las horas lentas", cantidad: 2, precioUnitario: 1500, subtotal: 3000 },
        { libroId: "cronicas-del-patio-interior", titulo: "Crónicas del patio interior", cantidad: 1, precioUnitario: 2000, subtotal: 2000 }
      ],
      total: 5000
    }
  ]
};
