const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservasController');

router.get('/', reservasController.mostrarReservas);
router.get('/:id', reservasController.mostrarReservaID);
router.post('/', reservasController.criarReserva);
router.delete('/:id', reservasController.apagarReserva);

module.exports = router;
