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
router.post('/deposito', soloCuentaPropia, cuentaController.depositar);
router.post('/retiro', soloCuentaPropia, cuentaController.retirar);
router.post('/transferencia', soloCuentaPropia, cuentaController.transferir);
router.get('/:id/historial', soloCuentaPropia, cuentaController.obtenerHistorial);
router.get('/:id', soloCuentaPropia, cuentaController.obtenerCuenta);

module.exports = router;
