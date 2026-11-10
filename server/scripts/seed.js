/**
 * Seed: inicializa MongoDB con cuentas y movimientos de prueba.
 * Se puede ejecutar varias veces: restablece las mismas cuentas
 * y recrea sus movimientos, sin generar duplicados.
 * Uso: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const cuentaRepository = require('../src/repositories/cuentaRepository');
const { hashearPin } = require('../src/services/authService');
const movimientoRepository = require('../src/repositories/movimientoRepository');

const cuentas = [
  { numero: '001-0001', titular: 'Ana Torres', saldo: 1500, usuario: 'ana', pin: '1111' },
  { numero: '001-0002', titular: 'Luis Ramirez', saldo: 800.5, usuario: 'luis', pin: '2222' },
  { numero: '001-0003', titular: 'Carla Mendoza', saldo: 2500, usuario: 'carla', pin: '3333' },
  { numero: '001-0004', titular: 'Jorge Quispe', saldo: 120, usuario: 'jorge', pin: '4444' },
];

function haceDias(dias) {
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
}

const movimientos = [
  { tipo: 'deposito', monto: 1000, cuentaOrigen: '001-0001', fecha: haceDias(5) },
  { tipo: 'retiro', monto: 200, cuentaOrigen: '001-0001', fecha: haceDias(4) },
  { tipo: 'transferencia', monto: 150, cuentaOrigen: '001-0003', cuentaDestino: '001-0001', fecha: haceDias(3) },
  { tipo: 'deposito', monto: 500.5, cuentaOrigen: '001-0002', fecha: haceDias(2) },
  { tipo: 'transferencia', monto: 50, cuentaOrigen: '001-0001', cuentaDestino: '001-0002', fecha: haceDias(1) },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cuenta_bancaria', {
    serverSelectionTimeoutMS: 5000,
  });

  await movimientoRepository.eliminarPorCuentas(cuentas.map((c) => c.numero));
  for (const cuenta of cuentas) {
    const { pin, ...datos } = cuenta;
    await cuentaRepository.guardarCuenta({ ...datos, pinHash: hashearPin(pin) });
  }
  await movimientoRepository.insertarVarios(movimientos);

  console.log(`Seed completado: ${cuentas.length} cuentas y ${movimientos.length} movimientos.`);
  cuentas.forEach((c) => console.log(` - ${c.numero}  ${c.titular}  S/ ${c.saldo}  usuario: ${c.usuario}  PIN: ${c.pin}`));
}

seed()
  .catch((error) => {
    console.error('Error en el seed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
