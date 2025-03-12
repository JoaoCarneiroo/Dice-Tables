const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservasController');
const checkAuth = require('../middlewares/authentication')

router.get('/', reservasController.mostrarReservas);
router.get('/utilizador', checkAuth, reservasController.mostrarReservasUtilizador);
router.post('/', checkAuth, reservasController.criarReserva);
router.patch('/:id', checkAuth, reservasController.atualizarReserva);
router.delete('/:id', checkAuth, reservasController.apagarReserva);

module.exports = router;
