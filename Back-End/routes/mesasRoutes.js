const express = require('express');
const router = express.Router();
const mesasController = require('../controllers/mesasController');
const checkAuth = require('../middlewares/authentication');


/**
 * @swagger
 * /api/mesas:
 *   get:
 *     summary: Mostra todas as mesas
 *     tags: [Mesas]
 *     description: Obtém a lista de todas as mesas disponíveis.
 *     responses:
 *       200:
 *         description: Lista de mesas mostrada com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', mesasController.mostrarMesas);

/**
 * @swagger
 * /api/mesas/porID/{id}:
 *   get:
 *     summary: Mostra a mesa pelo ID
 *     tags: [Mesas]
 *     description: Obtém a mesa consoante o ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da Mesa
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mesa mostrada com sucesso
 *       404:
 *         description: Mesa não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/porID/:id', mesasController.mostrarMesaPorID);

/**
 * @swagger
 * /api/mesas/{id}:
 *   get:
 *     summary: Mostra as mesas de um café específico
 *     tags: [Mesas]
 *     description: Obtém todas as mesas associadas a um determinado café.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do café
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de mesas do café mostrada com sucesso
 *       404:
 *         description: Café não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', mesasController.mostrarMesasID);

/**
 * @swagger
 * /api/mesas:
 *   post:
 *     summary: Cria uma nova mesa
 *     tags: [Mesas]
 *     description: Permite que um gestor autenticado crie uma nova mesa para seu café.
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lugares:
 *                 type: integer
 *                 description: Número de lugares na mesa
 *     responses:
 *       201:
 *         description: Mesa criada com sucesso
 *       403:
 *         description: Acesso negado - apenas gestores podem criar mesas
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', checkAuth, mesasController.criarMesa);

/**
 * @swagger
 * /api/mesas/{id}:
 *   patch:
 *     summary: Atualiza uma mesa existente
 *     tags: [Mesas]
 *     description: Permite que um gestor autenticado atualize uma mesa do seu café.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da mesa a ser atualizada
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lugares:
 *                 type: integer
 *                 description: Novo número de lugares na mesa
 *     responses:
 *       200:
 *         description: Mesa atualizada com sucesso
 *       403:
 *         description: Acesso negado - apenas gestores do café podem atualizar a mesa
 *       404:
 *         description: Mesa não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.patch('/:id', checkAuth, mesasController.atualizarMesa);

/**
 * @swagger
 * /api/mesas/{id}:
 *   delete:
 *     summary: Exclui uma mesa
 *     tags: [Mesas]
 *     description: Permite que um gestor autenticado exclua uma mesa do seu café.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da mesa a ser excluída
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mesa apagada com sucesso
 *       403:
 *         description: Acesso negado - apenas gestores do café podem apagar a mesa
 *       404:
 *         description: Mesa não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', checkAuth, mesasController.apagarMesa);

module.exports = router;
