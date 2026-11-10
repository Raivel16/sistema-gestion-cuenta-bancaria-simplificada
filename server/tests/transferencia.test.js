/**
 * Pruebas de las operaciones bancarias contra una base de datos de prueba.
 * Se ejecutan con `npm test` (requiere MongoDB local activo).
 * Usan la base "cuenta_bancaria_test", distinta de la real.
 */
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { conectarDB } = require('../src/config/database');
const cuentaService = require('../src/services/cuentaService');
const cuentaRepository = require('../src/repositories/cuentaRepository');
const movimientoRepository = require('../src/repositories/movimientoRepository');
const Cuenta = require('../src/models/Cuenta');
const Movimiento = require('../src/models/Movimiento');

before(async () => {
  process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/cuenta_bancaria_test';
  await conectarDB();
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  await Cuenta.deleteMany({});
  await Movimiento.deleteMany({});
  await Cuenta.create([
    { numero: 'A', titular: 'Ana', saldo: 100 },
    { numero: 'B', titular: 'Beto', saldo: 50 },
  ]);
});

async function saldo(numero) {
  return (await Cuenta.findOne({ numero })).saldo;
}

async function rechazaCon(promesa, status, mensaje) {
  await assert.rejects(promesa, (error) => {
    assert.equal(error.status, status);
    if (mensaje) assert.match(error.message, mensaje);
    return true;
  });
}

test('deposito valido aumenta el saldo y registra el movimiento', async () => {
  await cuentaService.depositar({ cuenta: 'A', monto: 25.5 });
  assert.equal(await saldo('A'), 125.5);
  assert.equal(await Movimiento.countDocuments({ tipo: 'deposito', cuentaOrigen: 'A' }), 1);
});

test('deposito rechaza montos invalidos y cuentas inexistentes', async () => {
  await rechazaCon(cuentaService.depositar({ cuenta: 'A', monto: 0 }), 400);
  await rechazaCon(cuentaService.depositar({ cuenta: 'A', monto: -5 }), 400);
  await rechazaCon(cuentaService.depositar({ cuenta: 'A', monto: '10' }), 400);
  await rechazaCon(cuentaService.depositar({ cuenta: 'Z', monto: 10 }), 404);
  assert.equal(await saldo('A'), 100);
});

test('retiro valido descuenta y retiro mayor al saldo es rechazado', async () => {
  await cuentaService.retirar({ cuenta: 'A', monto: 40 });
  assert.equal(await saldo('A'), 60);
  await rechazaCon(cuentaService.retirar({ cuenta: 'A', monto: 60.01 }), 400, /insuficiente/);
  assert.equal(await saldo('A'), 60);
});

test('transferencia valida mueve el dinero y registra un movimiento', async () => {
  await cuentaService.transferir({ cuentaOrigen: 'A', cuentaDestino: 'B', monto: 30 });
  assert.equal(await saldo('A'), 70);
  assert.equal(await saldo('B'), 80);
  const movimientos = await Movimiento.find({ tipo: 'transferencia' });
  assert.equal(movimientos.length, 1);
  assert.equal(movimientos[0].cuentaDestino, 'B');
});

test('transferencia rechaza destino inexistente, fondos insuficientes y misma cuenta', async () => {
  await rechazaCon(cuentaService.transferir({ cuentaOrigen: 'A', cuentaDestino: 'Z', monto: 10 }), 404);
  await rechazaCon(cuentaService.transferir({ cuentaOrigen: 'Z', cuentaDestino: 'A', monto: 10 }), 404);
  await rechazaCon(cuentaService.transferir({ cuentaOrigen: 'A', cuentaDestino: 'B', monto: 500 }), 400, /insuficiente/);
  await rechazaCon(cuentaService.transferir({ cuentaOrigen: 'A', cuentaDestino: 'A', monto: 10 }), 400);
  await rechazaCon(cuentaService.transferir({ cuentaOrigen: 'A', cuentaDestino: 'B', monto: -1 }), 400);
  assert.equal(await saldo('A'), 100);
  assert.equal(await saldo('B'), 50);
  assert.equal(await Movimiento.countDocuments(), 0);
});

test('si falla el registro del movimiento la transferencia se revierte por completo', async () => {
  const original = movimientoRepository.crear;
  movimientoRepository.crear = async () => {
    throw new Error('fallo simulado');
  };
  try {
    await assert.rejects(cuentaService.transferir({ cuentaOrigen: 'A', cuentaDestino: 'B', monto: 30 }), /fallo simulado/);
  } finally {
    movimientoRepository.crear = original;
  }
  assert.equal(await saldo('A'), 100);
  assert.equal(await saldo('B'), 50);
});

test('transferencias simultaneas nunca dejan saldo negativo', async () => {
  const intentos = Array.from({ length: 5 }, () =>
    cuentaService.transferir({ cuentaOrigen: 'A', cuentaDestino: 'B', monto: 40 }).catch((e) => e)
  );
  await Promise.all(intentos);
  assert.equal(await saldo('A'), 20);
  assert.equal(await saldo('B'), 130);
  assert.ok((await cuentaRepository.buscarPorNumero('A')).saldo >= 0);
});

test('el historial incluye los titulares de origen y destino de cada transferencia', async () => {
  await cuentaService.transferir({ cuentaOrigen: 'A', cuentaDestino: 'B', monto: 10 });
  await cuentaService.depositar({ cuenta: 'A', monto: 5 });

  const deA = await cuentaService.obtenerHistorial('A');
  const transferencia = deA.find((m) => m.tipo === 'transferencia');
  assert.equal(transferencia.titularOrigen, 'Ana');
  assert.equal(transferencia.titularDestino, 'Beto');
  assert.equal(deA.find((m) => m.tipo === 'deposito').titularDestino, undefined);

  // La cuenta que recibe ve el mismo movimiento, con los mismos nombres.
  const deB = await cuentaService.obtenerHistorial('B');
  assert.equal(deB.length, 1);
  assert.equal(deB[0].titularOrigen, 'Ana');
});
