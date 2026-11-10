/**
 * Middlewares de seguridad de /api/cuenta:
 * - autenticar: exige una sesión válida (cabecera "Authorization: Bearer <token>").
 * - soloCuentaPropia: el campo de cuenta de la ruta debe coincidir con la cuenta de la sesión.
 */
const authService = require('../services/authService');

function autenticar(req, res, next) {
  const cabecera = req.headers.authorization || '';
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : '';
  const numero = authService.numeroDeToken(token);

  if (!numero) {
    return res.status(401).json({ ok: false, mensaje: 'Sesion no valida o expirada. Ingrese nuevamente' });
  }
  req.token = token;
  req.cuentaNumero = numero;
  next();
}

// Revisa el campo exacto que usa cada ruta (por ejemplo "params","id" o "body","cuentaOrigen").
// Si el cliente indica otra cuenta distinta a la de la sesión, responde 403.
function soloCuentaPropia(lugar, campo) {
  return (req, res, next) => {
    const pedida = req[lugar]?.[campo];
    // Si falta el dato, el controlador usa la cuenta de la sesión.
    if (pedida !== undefined && pedida !== req.cuentaNumero) {
      return res.status(403).json({ ok: false, mensaje: 'No tiene permiso para operar sobre esta cuenta' });
    }
    next();
  };
}

module.exports = { autenticar, soloCuentaPropia };
