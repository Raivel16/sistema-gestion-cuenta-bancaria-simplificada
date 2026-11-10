/**
 * Rutas de /api/cuenta. Solo asocian cada endpoint con su controlador.
 * Todas exigen sesión, y las que operan sobre una cuenta exigen que sea la propia.
 */
const express = require('express');
const cuentaController = require('../controllers/cuentaController');
const { autenticar, soloCuentaPropia } = require('../middlewares/autenticacion');

const router = express.Router();

router.use(autenticar);

router.get('/destino/:numero', cuentaController.obtenerDestino);
router.post('/deposito', soloCuentaPropia('body', 'cuenta'), cuentaController.depositar);
router.post('/retiro', soloCuentaPropia('body', 'cuenta'), cuentaController.retirar);
router.post('/transferencia', soloCuentaPropia('body', 'cuentaOrigen'), cuentaController.transferir);
router.get('/:id/historial', soloCuentaPropia('params', 'id'), cuentaController.obtenerHistorial);
router.get('/:id', soloCuentaPropia('params', 'id'), cuentaController.obtenerCuenta);

module.exports = router;
