/**
 * Rutas de /api/cuenta. Solo asocian cada endpoint con su controlador.
 */
const express = require('express');
const cuentaController = require('../controllers/cuentaController');

const router = express.Router();

router.post('/deposito', cuentaController.depositar);
router.get('/:id', cuentaController.obtenerCuenta);

module.exports = router;
