/**
 * Repositorio de movimientos: único lugar donde se consulta la colección Movimiento.
 */
const Movimiento = require('../models/Movimiento');

async function crear(datos, session) {
  const [movimiento] = await Movimiento.create([datos], session ? { session } : undefined);
  return movimiento;
}

// Movimientos donde la cuenta es origen o destino, del más reciente al más antiguo.
function listarPorCuenta(numero, limite) {
  return Movimiento.find({ $or: [{ cuentaOrigen: numero }, { cuentaDestino: numero }] })
    .sort({ fecha: -1, _id: -1 })
    .limit(limite);
}

function eliminarPorCuentas(numeros) {
  return Movimiento.deleteMany({
    $or: [{ cuentaOrigen: { $in: numeros } }, { cuentaDestino: { $in: numeros } }],
  });
}

function insertarVarios(lista) {
  return Movimiento.insertMany(lista);
}

module.exports = { crear, listarPorCuenta, eliminarPorCuentas, insertarVarios };
