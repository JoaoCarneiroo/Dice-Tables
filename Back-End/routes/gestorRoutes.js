const express = require('express');
const router = express.Router();
const gestorController = require('../controllers/gestorController');


router.post('/', gestorController.promoverParaGestor);
router.get('/', gestorController.mostrarGestores);
router.get('/:id', gestorController.mostrarGestorID);
router.delete('/:id', gestorController.apagarGestor);


module.exports = router;
