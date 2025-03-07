const express = require('express');
const router = express.Router();
const utilizadoresController = require('../controllers/utilizadoresController');
const checkAuth = require('../middlewares/authentication')

router.get('/', utilizadoresController.mostrarUtilizadores);
router.get('/:id', utilizadoresController.mostrarUtilizadorID);
router.post('/', utilizadoresController.criarUtilizador);
router.patch('/', checkAuth, utilizadoresController.atualizarUtilizador);
router.delete('/', checkAuth, utilizadoresController.apagarUtilizador);


router.post('/login', utilizadoresController.login);



module.exports = router;
