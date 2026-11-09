/**
 * Servicio de cuentas: reglas de negocio y validaciones bancarias.
 */
const mongoose = require('mongoose');
const { admiteTransacciones } = require('../config/database');
const cuentaRepository = require('../repositories/cuentaRepository');
const movimientoRepository = require('../repositories/movimientoRepository');

// Error con código HTTP asociado (400, 404...). El controller lo traduce a la respuesta.
class ErrorNegocio extends Error {
  constructor(mensaje, status) {
    super(mensaje);
    this.status = status;
  }
}

async function obtenerCuenta(id) {
  const cuenta = await cuentaRepository.buscarPorIdentificador(id);
  if (!cuenta) throw new ErrorNegocio('Cuenta no encontrada', 404);
  return cuenta;
}

// El monto debe ser un número mayor que cero con máximo 2 decimales.
function validarMonto(monto) {
  if (typeof monto !== 'number' || !Number.isFinite(monto)) {
    throw new ErrorNegocio('El monto debe ser un numero', 400);
  }
  if (monto <= 0) throw new ErrorNegocio('El monto debe ser mayor que cero', 400);
  if (Math.round(monto * 100) / 100 !== monto) {
    throw new ErrorNegocio('El monto admite como maximo 2 decimales', 400);
  }
}

// Busca la cuenta por número o responde 404.
async function buscarCuentaExistente(numero, etiqueta = 'Cuenta') {
  if (typeof numero !== 'string' || !numero.trim()) {
    throw new ErrorNegocio(`${etiqueta}: numero de cuenta requerido`, 400);
  }
  const cuenta = await cuentaRepository.buscarPorNumero(numero.trim());
  if (!cuenta) throw new ErrorNegocio(`${etiqueta} no encontrada`, 404);
  return cuenta;
}

// Depósito: aumenta el saldo y registra el movimiento.
// Si no se puede guardar el movimiento, se devuelve el saldo a su valor anterior.
async function depositar({ cuenta: numero, monto }) {
  validarMonto(monto);
  const cuenta = await buscarCuentaExistente(numero);

  const actualizada = await cuentaRepository.actualizarSaldo(cuenta.numero, monto);
  try {
    const movimiento = await movimientoRepository.crear({ tipo: 'deposito', monto, cuentaOrigen: cuenta.numero });
    return { cuenta: actualizada, movimiento };
  } catch (error) {
    await cuentaRepository.actualizarSaldo(cuenta.numero, -monto);
    throw error;
  }
}

// Retiro: descuenta el saldo solo si alcanza (la comprobación se hace en la misma
// operación de MongoDB, por lo que el saldo nunca queda negativo).
async function retirar({ cuenta: numero, monto }) {
  validarMonto(monto);
  const cuenta = await buscarCuentaExistente(numero);

  const actualizada = await cuentaRepository.actualizarSaldo(cuenta.numero, -monto);
  if (!actualizada) throw new ErrorNegocio('Saldo insuficiente', 400);
  try {
    const movimiento = await movimientoRepository.crear({ tipo: 'retiro', monto, cuentaOrigen: cuenta.numero });
    return { cuenta: actualizada, movimiento };
  } catch (error) {
    await cuentaRepository.actualizarSaldo(cuenta.numero, monto);
    throw error;
  }
}

// Con replica set: débito, crédito y movimiento se confirman juntos en una transacción de MongoDB.
async function transferirConTransaccion(origen, destino, monto) {
  const session = await mongoose.startSession();
  try {
    let movimiento;
    await session.withTransaction(async () => {
      const debitada = await cuentaRepository.actualizarSaldo(origen, -monto, session);
      if (!debitada) throw new ErrorNegocio('Saldo insuficiente', 400);
      await cuentaRepository.actualizarSaldo(destino, monto, session);
      movimiento = await movimientoRepository.crear(
        { tipo: 'transferencia', monto, cuentaOrigen: origen, cuentaDestino: destino },
        session
      );
    });
    return movimiento;
  } finally {
    await session.endSession();
  }
}

// Sin replica set (MongoDB standalone): el débito es condicional y atómico; si falla el
// crédito o el registro, se deshacen los pasos ya realizados para no perder dinero.
async function transferirConCompensacion(origen, destino, monto) {
  const debitada = await cuentaRepository.actualizarSaldo(origen, -monto);
  if (!debitada) throw new ErrorNegocio('Saldo insuficiente', 400);

  let acreditada = false;
  try {
    await cuentaRepository.actualizarSaldo(destino, monto);
    acreditada = true;
    return await movimientoRepository.crear({
      tipo: 'transferencia',
      monto,
      cuentaOrigen: origen,
      cuentaDestino: destino,
    });
  } catch (error) {
    if (acreditada) await cuentaRepository.actualizarSaldo(destino, -monto);
    await cuentaRepository.actualizarSaldo(origen, monto);
    throw error;
  }
}

// Transferencia: valida las reglas y mueve el dinero entre dos cuentas.
async function transferir({ cuentaOrigen, cuentaDestino, monto }) {
  validarMonto(monto);
  const origen = await buscarCuentaExistente(cuentaOrigen, 'Cuenta de origen');
  const destino = await buscarCuentaExistente(cuentaDestino, 'Cuenta de destino');
  if (origen.numero === destino.numero) {
    throw new ErrorNegocio('La cuenta de destino debe ser distinta a la de origen', 400);
  }

  const movimiento = admiteTransacciones()
    ? await transferirConTransaccion(origen.numero, destino.numero, monto)
    : await transferirConCompensacion(origen.numero, destino.numero, monto);

  return {
    cuenta: await cuentaRepository.buscarPorNumero(origen.numero),
    movimiento,
  };
}

// Historial: últimos movimientos donde la cuenta es origen o destino.
async function obtenerHistorial(id, limite = 20) {
  const cuenta = await obtenerCuenta(id);
  return movimientoRepository.listarPorCuenta(cuenta.numero, limite);
}

module.exports = { ErrorNegocio, obtenerCuenta, depositar, retirar, transferir, obtenerHistorial };
