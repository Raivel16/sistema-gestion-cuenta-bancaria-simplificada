/**
 * Pruebas de autenticación y permisos de la API (HTTP real sobre un puerto libre).
 * Se ejecutan con `npm test` y usan la base "cuenta_bancaria_test".
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { conectarDB } = require('../src/config/database');
const app = require('../src/app');
const authService = require('../src/services/authService');
const Cuenta = require('../src/models/Cuenta');

let servidor;
let base;

before(async () => {
  process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/cuenta_bancaria_test';
  await conectarDB();
  await Cuenta.deleteMany({});
  await Cuenta.create([
    { numero: 'A', titular: 'Ana', saldo: 100, usuario: 'ana', pinHash: authService.hashearPin('1111') },
    { numero: 'B', titular: 'Beto', saldo: 50, usuario: 'beto', pinHash: authService.hashearPin('2222') },
  ]);
  servidor = app.listen(0);
  base = `http://127.0.0.1:${servidor.address().port}/api`;
});

after(async () => {
  servidor.close();
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

async function llamar(ruta, { metodo = 'GET', token, cuerpo } = {}) {
  const respuesta = await fetch(`${base}${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  return { status: respuesta.status, datos: await respuesta.json() };
}

async function ingresar(usuario, pin) {
  const { datos } = await llamar('/auth/login', { metodo: 'POST', cuerpo: { usuario, pin } });
  return datos.token;
}

test('login correcto devuelve token y cuenta sin el hash del PIN', async () => {
  const { status, datos } = await llamar('/auth/login', { metodo: 'POST', cuerpo: { usuario: 'Ana', pin: '1111' } });
  assert.equal(status, 200);
  assert.ok(datos.token);
  assert.equal(datos.cuenta.numero, 'A');
  assert.equal(JSON.stringify(datos).includes('pinHash'), false);
});

test('login rechaza PIN incorrecto (401), usuario inexistente (401) y formato invalido (400)', async () => {
  assert.equal((await llamar('/auth/login', { metodo: 'POST', cuerpo: { usuario: 'ana', pin: '0000' } })).status, 401);
  assert.equal((await llamar('/auth/login', { metodo: 'POST', cuerpo: { usuario: 'nadie', pin: '1111' } })).status, 401);
  assert.equal((await llamar('/auth/login', { metodo: 'POST', cuerpo: { usuario: 'ana', pin: 'abcd' } })).status, 400);
});

test('sin sesion las rutas de cuenta responden 401', async () => {
  assert.equal((await llamar('/cuenta/A')).status, 401);
  assert.equal((await llamar('/cuenta/deposito', { metodo: 'POST', cuerpo: { cuenta: 'A', monto: 5 } })).status, 401);
});

test('cada usuario solo opera sobre su cuenta (403 en la ajena)', async () => {
  const token = await ingresar('ana', '1111');
  assert.equal((await llamar('/cuenta/A', { token })).status, 200);
  assert.equal((await llamar('/cuenta/B', { token })).status, 403);
  assert.equal((await llamar('/cuenta/B/historial', { token })).status, 403);
  assert.equal((await llamar('/cuenta/deposito', { metodo: 'POST', token, cuerpo: { cuenta: 'B', monto: 5 } })).status, 403);
  assert.equal(
    (await llamar('/cuenta/transferencia', { metodo: 'POST', token, cuerpo: { cuentaOrigen: 'B', cuentaDestino: 'A', monto: 5 } })).status,
    403
  );
  assert.equal((await Cuenta.findOne({ numero: 'B' })).saldo, 50);
});

test('consulta del titular de destino: solo numero y titular, 404 si no existe', async () => {
  const token = await ingresar('ana', '1111');
  const ok = await llamar('/cuenta/destino/B', { token });
  assert.equal(ok.status, 200);
  assert.deepEqual(ok.datos.cuenta, { numero: 'B', titular: 'Beto' });
  assert.equal((await llamar('/cuenta/destino/ZZZ', { token })).status, 404);
});

test('logout invalida el token', async () => {
  const token = await ingresar('beto', '2222');
  assert.equal((await llamar('/auth/logout', { metodo: 'POST', token })).status, 200);
  assert.equal((await llamar('/cuenta/B', { token })).status, 401);
});

test('tras 5 intentos fallidos el usuario se bloquea (429)', async () => {
  for (let i = 0; i < 5; i++) {
    await llamar('/auth/login', { metodo: 'POST', cuerpo: { usuario: 'beto', pin: '0000' } });
  }
  assert.equal((await llamar('/auth/login', { metodo: 'POST', cuerpo: { usuario: 'beto', pin: '2222' } })).status, 429);
});
