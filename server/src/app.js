/**
 * Configuración de la aplicación Express (middlewares y rutas).
 */
const express = require('express');
const cors = require('cors');
const cuentaRoutes = require('./routes/cuentaRoutes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/cuenta', cuentaRoutes);

// Cualquier otra ruta no existe.
app.use((req, res) => {
  res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada' });
});

module.exports = app;
