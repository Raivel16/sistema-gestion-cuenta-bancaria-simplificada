/**
 * Servicio de cuentas: reglas de negocio y validaciones bancarias.
 */
const cuentaRepository = require('../repositories/cuentaRepository');

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

module.exports = { ErrorNegocio, obtenerCuenta };
