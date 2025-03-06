const express = require('express');
const router = express.Router();
const utilizadoresController = require('../controllers/utilizadoresController');

router.get('/', utilizadoresController.mostrarUtilizadores);
router.get('/:id', utilizadoresController.mostrarUtilizadorID);
router.post('/', utilizadoresController.criarUtilizador);
router.patch('/:id', utilizadoresController.atualizarUtilizador);
router.delete('/:id', utilizadoresController.apagarUtilizador);


module.exports = router;
