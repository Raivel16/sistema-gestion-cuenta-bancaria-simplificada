/**
 * Controlador de cuentas: recibe la petición HTTP, llama al servicio
 * y devuelve la respuesta JSON con el código de estado adecuado.
 */
const cuentaService = require('../services/cuentaService');
const { responderError } = require('./respuestas');

async function obtenerCuenta(req, res) {
  try {
    const cuenta = await cuentaService.obtenerCuenta(req.params.id);
    res.status(200).json({ ok: true, cuenta });
  } catch (error) {
    responderError(res, error);
  }
}

async function depositar(req, res) {
  try {
    const resultado = await cuentaService.depositar(req.body);
    res.status(201).json({ ok: true, mensaje: 'Deposito realizado', ...resultado });
  } catch (error) {
    responderError(res, error);
  }
}

async function retirar(req, res) {
  try {
    const resultado = await cuentaService.retirar(req.body);
    res.status(201).json({ ok: true, mensaje: 'Retiro realizado', ...resultado });
  } catch (error) {
    responderError(res, error);
  }
}

async function transferir(req, res) {
  try {
    const resultado = await cuentaService.transferir(req.body);
    res.status(201).json({ ok: true, mensaje: 'Transferencia realizada', ...resultado });
  } catch (error) {
    responderError(res, error);
  }
}

async function obtenerHistorial(req, res) {
  try {
    const movimientos = await cuentaService.obtenerHistorial(req.params.id);
    res.status(200).json({ ok: true, movimientos });
  } catch (error) {
    responderError(res, error);
  }
}

async function obtenerDestino(req, res) {
  try {
    const cuenta = await cuentaService.obtenerDestino(req.params.numero);
    res.status(200).json({ ok: true, cuenta });
  } catch (error) {
    responderError(res, error);
  }
}

module.exports = { obtenerDestino, obtenerCuenta, depositar, retirar, transferir, obtenerHistorial };
