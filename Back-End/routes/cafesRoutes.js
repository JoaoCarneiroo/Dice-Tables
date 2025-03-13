const express = require('express');
const router = express.Router();
const cafesController = require('../controllers/cafesController');
const checkAuth = require('../middlewares/authentication')


router.get('/', cafesController.mostrarCafes);
router.get('/:id', cafesController.mostrarCafeID);
router.post('/', checkAuth, cafesController.upload.single('imagem_cafe'), cafesController.criarCafe); 
router.patch('/:id', checkAuth, cafesController.upload.single('imagem_cafe'), cafesController.atualizarCafe);
router.delete('/:id', checkAuth, cafesController.apagarCafe);

module.exports = router;
