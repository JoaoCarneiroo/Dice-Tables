const express = require('express');
const router = express.Router();
const jogosController = require('../controllers/jogosController');
const checkAuth = require('../middlewares/authentication');

/**
 * @swagger
 * /jogos:
 *   get:
 *     summary: Mostra todos os jogos
 *     tags: [Jogos]
 *     description: Obtém a lista de todos os jogos disponíveis.
 *     responses:
 *       200:
 *         description: Lista de jogos mostrada com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', jogosController.mostrarJogos);

/**
 * @swagger
 * /jogos/{id}:
 *   get:
 *     summary: Mostra os jogos de um café específico
 *     tags: [Jogos]
 *     description: Obtém todos os jogos disponíveis em um café específico.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do café
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de jogos mostrada com sucesso
 *       404:
 *         description: Café não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', jogosController.mostrarJogosID);

/**
 * @swagger
 * /jogos/porID/{id}:
 *   get:
 *     summary: Mostra o jogo pelo ID
 *     tags: [Jogos]
 *     description: Obtém o jogo consoante o ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do Jogo
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jogo mostrado com sucesso
 *       404:
 *         description: Jogo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/porID/:id', jogosController.mostrarJogoPorID);

/**
 * @swagger
 * /jogos:
 *   post:
 *     summary: Cria um novo jogo
 *     tags: [Jogos]
 *     description: Permite que um gestor crie um novo jogo.
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomeJogo:
 *                 type: string
 *                 description: Nome do jogo
 *               notasJogo:
 *                 type: string
 *                 description: Notas sobre o jogo
 *               preco:
 *                 type: number
 *                 description: Preço do jogo
 *               quantidade:
 *                 type: integer
 *                 description: Quantidade disponível
 *     responses:
 *       201:
 *         description: Jogo criado com sucesso
 *       403:
 *         description: Apenas gestores podem adicionar jogos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', checkAuth, jogosController.criarJogo);

/**
 * @swagger
 * /jogos/{id}:
 *   patch:
 *     summary: Atualiza um jogo existente
 *     tags: [Jogos]
 *     description: Permite que um gestor atualize um jogo do seu café.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do jogo a ser atualizado
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomeJogo:
 *                 type: string
 *                 description: Novo nome do jogo
 *               notasJogo:
 *                 type: string
 *                 description: Novas notas sobre o jogo
 *               preco:
 *                 type: number
 *                 description: Novo preço do jogo
 *               quantidade:
 *                 type: integer
 *                 description: Nova quantidade disponível
 *     responses:
 *       200:
 *         description: Jogo atualizado com sucesso
 *       403:
 *         description: Apenas gestores do café podem atualizar este jogo
 *       404:
 *         description: Jogo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.patch('/:id', checkAuth, jogosController.atualizarJogo);

/**
 * @swagger
 * /jogos/{id}:
 *   delete:
 *     summary: Remove um jogo
 *     tags: [Jogos]
 *     description: Permite que um gestor remova um jogo do seu café.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do jogo a ser removido
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jogo apagado com sucesso
 *       403:
 *         description: Apenas gestores do café podem apagar este jogo
 *       404:
 *         description: Jogo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', checkAuth, jogosController.apagarJogo);

/**
 * @swagger
 * /jogos/comprar/{id}:
 *   post:
 *     summary: Compra um jogo
 *     tags: [Jogos]
 *     description: Permite que um utilizador compre um jogo, reduzindo o estoque.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do jogo a ser comprado
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Compra efetuada com sucesso
 *       400:
 *         description: Jogo sem stock
 *       404:
 *         description: Jogo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/comprar/:id', checkAuth, jogosController.comprarJogo);

module.exports = router;
