const express = require('express');
const router = express.Router();
const gestorController = require('../controllers/gestorController');
const checkAuth = require('../middlewares/authentication')

router.post('/', checkAuth, gestorController.promoverParaGestor);
router.get('/', checkAuth, gestorController.mostrarGestores);
router.get('/:id', checkAuth, gestorController.mostrarGestorID);
router.delete('/:id', checkAuth, gestorController.despromoverGestor);


module.exports = router;
