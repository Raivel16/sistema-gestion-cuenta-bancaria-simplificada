/**
 * Modelo de Movimiento (depósito, retiro o transferencia).
 * Guarda los números de cuenta involucrados.
 * En depósitos y retiros solo se usa cuentaOrigen.
 */
const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema({
  tipo: { type: String, required: true, enum: ['deposito', 'retiro', 'transferencia'] },
  monto: { type: Number, required: true, min: 0.01 },
  cuentaOrigen: { type: String, required: true, index: true },
  cuentaDestino: { type: String, index: true },
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Movimiento', movimientoSchema);
