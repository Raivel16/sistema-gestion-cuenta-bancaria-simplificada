/**
 * Controlador de autenticación: login y logout.
 */
const authService = require('../services/authService');
const { responderError } = require('./respuestas');

async function login(req, res) {
  try {
    const resultado = await authService.login(req.body || {});
    res.status(200).json({ ok: true, ...resultado });
  } catch (error) {
    responderError(res, error);
  }
}

function logout(req, res) {
  authService.cerrarSesion(req.token);
  res.status(200).json({ ok: true, mensaje: 'Sesion cerrada' });
}

module.exports = { login, logout };
