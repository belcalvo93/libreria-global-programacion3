/* ==========================================================================
   Librería Página Viva — Cliente HTTP de la API (Global, Ejercicio 1)
   Único lugar donde se arma la URL y se llama a fetch.
   - Base pública: "/api". Nginx reenvía /api/... al backend sin el prefijo.
   - Las rutas se escriben como en FastAPI, con su barra final: "/libros/".
   - Si la respuesta no es 2xx (o no hay conexión) se lanza un ApiError
     con el código y un mensaje en español listo para mostrar.
   Uso:
     var libros = await Api.get("/libros/", { limit: 20, offset: 0, titulo: "mapa" });
     var venta  = await Api.post("/ventas/", { cliente_id: 2, renglones: [...] });
     try { ... } catch (error) { mensaje.textContent = error.message; }
   ========================================================================== */
(function () {
  "use strict";

  var API_BASE = "/api";

  // Error propio: status 0 = sin conexión; si no, el código HTTP.
  function ApiError(status, mensaje, detalle) {
    this.name = "ApiError";
    this.status = status;
    this.message = mensaje;
    this.detalle = detalle;
  }
  ApiError.prototype = Object.create(Error.prototype);
  ApiError.prototype.constructor = ApiError;

  // Arma "/api/libros/?limit=20&offset=0" omitiendo parámetros vacíos.
  function armarUrl(ruta, parametros) {
    var url = API_BASE + ruta;
    if (!parametros) {
      return url;
    }
    var query = new URLSearchParams();
    Object.keys(parametros).forEach(function (clave) {
      var valor = parametros[clave];
      if (valor !== undefined && valor !== null && valor !== "") {
        query.append(clave, valor);
      }
    });
    var texto = query.toString();
    return texto ? url + "?" + texto : url;
  }

  // FastAPI devuelve {"detail": "texto"} o, en un 422, {"detail": [{loc, msg}, ...]}.
  function mensajeDeError(status, cuerpo) {
    var detalle = cuerpo && cuerpo.detail;
    if (typeof detalle === "string" && detalle) {
      return detalle;
    }
    if (Array.isArray(detalle) && detalle.length > 0) {
      return detalle.map(function (error) {
        var campo = Array.isArray(error.loc)
          ? error.loc.filter(function (parte) { return parte !== "body"; }).join(".")
          : "";
        return campo ? campo + ": " + error.msg : error.msg;
      }).join(" · ");
    }
    if (status === 404) { return "No se encontró el recurso pedido."; }
    if (status === 409) { return "La operación entra en conflicto con los datos guardados."; }
    if (status === 422) { return "Los datos enviados no son válidos."; }
    if (status >= 500) { return "Error del servidor. Probá de nuevo en unos minutos."; }
    return "Error HTTP " + status + ".";
  }

  async function pedir(metodo, ruta, opciones) {
    opciones = opciones || {};
    var config = { method: metodo, headers: { "Accept": "application/json" } };
    if (opciones.cuerpo !== undefined) {
      config.headers["Content-Type"] = "application/json";
      config.body = JSON.stringify(opciones.cuerpo);
    }

    var respuesta;
    try {
      respuesta = await fetch(armarUrl(ruta, opciones.parametros), config);
    } catch (errorDeRed) {
      throw new ApiError(0, "No se pudo conectar con el servidor. Revisá tu conexión.", null);
    }

    // 204 o cuerpo vacío: no hay JSON para leer.
    var texto = await respuesta.text();
    var cuerpo = null;
    if (texto) {
      try {
        cuerpo = JSON.parse(texto);
      } catch (errorDeFormato) {
        cuerpo = null;
      }
    }

    if (!respuesta.ok) {
      throw new ApiError(respuesta.status, mensajeDeError(respuesta.status, cuerpo), cuerpo);
    }
    return cuerpo;
  }

  window.Api = {
    get: function (ruta, parametros) {
      return pedir("GET", ruta, { parametros: parametros });
    },
    post: function (ruta, cuerpo) {
      return pedir("POST", ruta, { cuerpo: cuerpo });
    },
    patch: function (ruta, cuerpo) {
      return pedir("PATCH", ruta, { cuerpo: cuerpo });
    },
    // Los Decimal de la API (precio, subtotal, total) pueden llegar como texto.
    numero: function (valor) {
      return Number(valor);
    },
    ApiError: ApiError
  };
})();
