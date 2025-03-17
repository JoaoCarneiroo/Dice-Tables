const express = require('express');
const router = express.Router();
const gestorController = require('../controllers/gestorController');
const checkAuth = require('../middlewares/authentication');


/**
 * @swagger
 * /gestor:
 *   post:
 *     summary: Promove um utilizador a gestor
 *     tags: [Gestores]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ID_Utilizador
 *             properties:
 *               ID_Utilizador:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Utilizador promovido a gestor
 *       400:
 *         description: Utilizador já é um gestor
 *       401:
 *         description: Função restrita a administradores
 *       404:
 *         description: Utilizador não encontrado
 *       500:
 *         description: Erro ao promover utilizador
 */
router.post('/', checkAuth, gestorController.promoverParaGestor);

/**
 * @swagger
 * /gestor:
 *   get:
 *     summary: Obtém todos os gestores
 *     tags: [Gestores]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de gestores obtida com sucesso
 *       401:
 *         description: Função restrita a administradores
 *       500:
 *         description: Erro ao buscar gestores
 */
router.get('/', checkAuth, gestorController.mostrarGestores);

/**
 * @swagger
 * /gestor/{id}:
 *   get:
 *     summary: Obtém um gestor pelo ID
 *     tags: [Gestores]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do gestor
 *     responses:
 *       200:
 *         description: Gestor encontrado
 *       401:
 *         description: Função restrita a administradores
 *       404:
 *         description: Gestor não encontrado
 *       500:
 *         description: Erro ao buscar gestor
 */
router.get('/:id', checkAuth, gestorController.mostrarGestorID);

/**
 * @swagger
 * /gestor/{id}:
 *   delete:
 *     summary: Remove um gestor e rebaixa para utilizador comum
 *     tags: [Gestores]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do gestor a ser despromovido
 *     responses:
 *       200:
 *         description: Gestor despromovido com sucesso
 *       401:
 *         description: Função restrita a administradores
 *       404:
 *         description: Gestor não encontrado
 *       500:
 *         description: Erro ao despromover gestor
 */
router.delete('/:id', checkAuth, gestorController.despromoverGestor);

module.exports = router;
