/**
 * Repositorio de cuentas: único lugar donde se consulta la colección Cuenta.
 * Las funciones aceptan una "session" opcional (para transacciones).
 */
const mongoose = require('mongoose');
const Cuenta = require('../models/Cuenta');

// Busca por número de cuenta; si el valor es un ObjectId válido también prueba por _id.
async function buscarPorIdentificador(id, session) {
  const porNumero = await Cuenta.findOne({ numero: id }).session(session || null);
  if (porNumero || !mongoose.isValidObjectId(id)) return porNumero;
  return Cuenta.findById(id).session(session || null);
}

async function buscarPorNumero(numero, session) {
  return Cuenta.findOne({ numero }).session(session || null);
}

// Suma (o resta si monto es negativo) al saldo y redondea a 2 decimales.
// Cuando es una resta exige saldo suficiente en la misma operación,
// así el saldo nunca queda negativo. Devuelve null si no se cumple el filtro.
function actualizarSaldo(numero, monto, session) {
  const filtro = monto < 0 ? { numero, saldo: { $gte: -monto } } : { numero };
  return Cuenta.findOneAndUpdate(
    filtro,
    [{ $set: { saldo: { $round: [{ $add: ['$saldo', monto] }, 2] } } }],
    { returnDocument: 'after', updatePipeline: true, session: session || undefined }
  );
}

// Usado por el seed: crea la cuenta o restablece sus datos.
function guardarCuenta(datos) {
  return Cuenta.findOneAndUpdate({ numero: datos.numero }, datos, {
    upsert: true,
    returnDocument: 'after',
    setDefaultsOnInsert: true,
  });
}

module.exports = { buscarPorIdentificador, buscarPorNumero, actualizarSaldo, guardarCuenta };
