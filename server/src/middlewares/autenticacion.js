/**
 * Middlewares de seguridad de /api/cuenta:
 * - autenticar: exige una sesión válida (cabecera "Authorization: Bearer <token>").
 * - soloCuentaPropia: la cuenta pedida debe ser la de la sesión.
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

function soloCuentaPropia(req, res, next) {
  const pedida = req.params.id ?? req.body?.cuenta ?? req.body?.cuentaOrigen;
  // Si falta el dato, la validación del servicio responde 400.
  if (pedida !== undefined && pedida !== req.cuentaNumero) {
    return res.status(403).json({ ok: false, mensaje: 'No tiene permiso para operar sobre esta cuenta' });
  }
  next();
}

module.exports = { autenticar, soloCuentaPropia };
