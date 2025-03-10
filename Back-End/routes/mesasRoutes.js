const express = require('express');
const router = express.Router();
const mesasController = require('../controllers/mesasController');
const checkAuth = require('../middlewares/authentication')

router.get('/', mesasController.mostrarMesas);
router.get('/:id', mesasController.mostrarMesasID);
router.post('/', checkAuth, mesasController.criarMesa);
router.patch('/:id', checkAuth, mesasController.atualizarMesa);
router.delete('/:id', checkAuth, mesasController.apagarMesa);


module.exports = router;
