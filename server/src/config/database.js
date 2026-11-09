/**
 * Conexión a MongoDB local con Mongoose.
 * También detecta si el servidor admite transacciones (replica set),
 * dato que usa el servicio para realizar las transferencias.
 */
const mongoose = require('mongoose');

let soportaTransacciones = false;

async function conectarDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cuenta_bancaria';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  // "hello" devuelve setName solo cuando MongoDB corre como replica set.
  const info = await mongoose.connection.db.admin().command({ hello: 1 });
  soportaTransacciones = Boolean(info.setName);
  console.log(`MongoDB conectado (${soportaTransacciones ? 'replica set: transacciones activas' : 'standalone: transferencia con compensacion'})`);
}

function admiteTransacciones() {
  return soportaTransacciones;
}

module.exports = { conectarDB, admiteTransacciones };
