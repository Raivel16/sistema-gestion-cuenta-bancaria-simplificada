/**
 * Modelo de Cuenta bancaria.
 * "numero" es el identificador visible que usan la API y el frontend.
 */
const mongoose = require('mongoose');

const cuentaSchema = new mongoose.Schema(
  {
    numero: { type: String, required: true, unique: true, trim: true },
    titular: { type: String, required: true, trim: true },
    saldo: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cuenta', cuentaSchema);
