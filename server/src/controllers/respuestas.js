/**
 * Traduce un error a respuesta HTTP. Los errores inesperados no exponen detalles.
 */
function responderError(res, error) {
  if (error.status) {
    return res.status(error.status).json({ ok: false, mensaje: error.message });
  }
  console.error(error);
  return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
}

module.exports = { responderError };
