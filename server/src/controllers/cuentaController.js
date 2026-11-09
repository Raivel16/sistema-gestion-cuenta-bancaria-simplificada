/**
 * Controlador de cuentas: recibe la petición HTTP, llama al servicio
 * y devuelve la respuesta JSON con el código de estado adecuado.
 */
const cuentaService = require('../services/cuentaService');

// Traduce un error a respuesta HTTP. Los errores inesperados no exponen detalles.
function responderError(res, error) {
  if (error.status) {
    return res.status(error.status).json({ ok: false, mensaje: error.message });
  }
  console.error(error);
  return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
}

async function obtenerCuenta(req, res) {
  try {
    const cuenta = await cuentaService.obtenerCuenta(req.params.id);
    res.status(200).json({ ok: true, cuenta });
  } catch (error) {
    responderError(res, error);
  }
}

module.exports = { obtenerCuenta };
