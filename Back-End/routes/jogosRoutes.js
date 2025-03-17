const express = require('express');
const router = express.Router();
const jogosController = require('../controllers/jogosController');
const checkAuth = require('../middlewares/authentication')

router.post('/comprar/:id', checkAuth, jogosController.comprarJogo);

router.get('/', jogosController.mostrarJogos);
router.get('/:id', jogosController.mostrarJogosID);
router.post('/', checkAuth, jogosController.criarJogo);
router.patch('/:id', checkAuth, jogosController.atualizarJogo);
router.delete('/:id', checkAuth, jogosController.apagarJogo);


module.exports = router;
