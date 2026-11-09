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

// JSON mal formado u otros errores no controlados: respuesta JSON sin detalles técnicos.
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, mensaje: 'El cuerpo de la peticion no es un JSON valido' });
  }
  console.error(error);
  res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
});

module.exports = app;
