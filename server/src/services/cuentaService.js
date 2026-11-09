/**
 * Servicio de cuentas: reglas de negocio y validaciones bancarias.
 */
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

module.exports = { ErrorNegocio, obtenerCuenta, depositar, retirar };
