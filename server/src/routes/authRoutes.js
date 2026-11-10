/**
 * Rutas de /api/auth.
 */
const express = require('express');
const authController = require('../controllers/authController');
const { autenticar } = require('../middlewares/autenticacion');

const router = express.Router();

router.post('/login', authController.login);
router.post('/logout', autenticar, authController.logout);

module.exports = router;
