/**
 * Servicio de autenticación: login con usuario y PIN de 4 dígitos.
 * El PIN se guarda con hash (scrypt) y las sesiones viven en memoria:
 * al reiniciar el servidor hay que volver a ingresar.
 */
const crypto = require('crypto');
const cuentaRepository = require('../repositories/cuentaRepository');
const { ErrorNegocio } = require('./cuentaService');

const DURACION_SESION_MS = 60 * 60 * 1000; // 1 hora
const MAX_INTENTOS = 5;
const BLOQUEO_MS = 60 * 1000; // 1 minuto

const sesiones = new Map(); // token -> { numero, expira }
const intentosFallidos = new Map(); // usuario -> { cantidad, bloqueadoHasta }

function hashearPin(pin) {
  const sal = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pin, sal, 32).toString('hex');
  return `${sal}:${hash}`;
}

function verificarPin(pin, almacenado) {
  const [sal, hash] = (almacenado || '').split(':');
  if (!sal || !hash) return false;
  const calculado = crypto.scryptSync(pin, sal, 32);
  return crypto.timingSafeEqual(calculado, Buffer.from(hash, 'hex'));
}

function registrarFallo(usuario) {
  const actual = intentosFallidos.get(usuario) || { cantidad: 0, bloqueadoHasta: 0 };
  actual.cantidad += 1;
  if (actual.cantidad >= MAX_INTENTOS) {
    actual.cantidad = 0;
    actual.bloqueadoHasta = Date.now() + BLOQUEO_MS;
  }
  intentosFallidos.set(usuario, actual);
}

async function login({ usuario, pin }) {
  if (typeof usuario !== 'string' || !usuario.trim() || typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
    throw new ErrorNegocio('Ingrese su usuario y un PIN de 4 digitos', 400);
  }
  const nombre = usuario.trim().toLowerCase();

  const estado = intentosFallidos.get(nombre);
  if (estado && estado.bloqueadoHasta > Date.now()) {
    throw new ErrorNegocio('Demasiados intentos fallidos. Espere un minuto e intente de nuevo', 429);
  }

  const cuenta = await cuentaRepository.buscarPorUsuario(nombre);
  // Mismo mensaje si falla el usuario o el PIN, para no revelar cuál fue.
  if (!cuenta || !verificarPin(pin, cuenta.pinHash)) {
    registrarFallo(nombre);
    throw new ErrorNegocio('Usuario o PIN incorrecto', 401);
  }

  intentosFallidos.delete(nombre);
  const token = crypto.randomBytes(32).toString('hex');
  sesiones.set(token, { numero: cuenta.numero, expira: Date.now() + DURACION_SESION_MS });

  return {
    token,
    cuenta: { numero: cuenta.numero, titular: cuenta.titular, saldo: cuenta.saldo },
  };
}

// Devuelve el número de cuenta de una sesión vigente, o null.
function numeroDeToken(token) {
  const sesion = sesiones.get(token);
  if (!sesion) return null;
  if (sesion.expira < Date.now()) {
    sesiones.delete(token);
    return null;
  }
  return sesion.numero;
}

function cerrarSesion(token) {
  sesiones.delete(token);
}

module.exports = { hashearPin, verificarPin, login, numeroDeToken, cerrarSesion };
