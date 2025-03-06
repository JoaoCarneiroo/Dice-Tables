const express = require('express');
const router = express.Router();
const cafesController = require('../controllers/cafesController');

router.get('/', cafesController.mostrarCafes);
router.get('/:id', cafesController.mostrarCafeID);
router.post('/', cafesController.upload, cafesController.criarCafe); 
router.patch('/:id', cafesController.upload, cafesController.atualizarCafe);
router.delete('/:id', cafesController.apagarCafe);

module.exports = router;
