const express = require('express');
const router = express.Router();
const utilizadoresController = require('../controllers/utilizadoresController');
const checkAuth = require('../middlewares/authentication');

/**
 * @swagger
 * /api/autenticar/verificar/gestor:
 *   get:
 *     summary: Verifica se o utilizador autenticado é um gestor
 *     tags: [Utilizadores]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Verificação realizada com sucesso
 *       401:
 *         description: Não autorizado (token inválido ou ausente)
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/verificar/gestor', checkAuth, utilizadoresController.verificarSeGestor);

/**
 * @swagger
 * /api/autenticar/verificar/admin:
 *   get:
 *     summary: Verifica se o utilizador autenticado é um admin
 *     tags: [Utilizadores]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Verificação realizada com sucesso
 *       401:
 *         description: Não autorizado (token inválido ou ausente)
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/verificar/admin', checkAuth, utilizadoresController.verificarSeAdmin);
/**
 * @swagger
 * /api/autenticar:
 *   get:
 *     summary: Obtém todos os utilizadores
 *     tags: [Utilizadores]
 *     responses:
 *       200:
 *         description: Lista de utilizadores obtida com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', utilizadoresController.mostrarUtilizadores);

/**
 * @swagger
 * /api/autenticar/{id}:
 *   get:
 *     summary: Obtém um utilizador pelo ID
 *     tags: [Utilizadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do utilizador
 *     responses:
 *       200:
 *         description: Utilizador encontrado
 *       404:
 *         description: Utilizador não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/utilizador/:id', utilizadoresController.mostrarUtilizadorID);

/**
 * @swagger
 * /api/autenticar/utilizador:
 *   get:
 *     summary: Obtém informações do utilizador autenticado
 *     tags: [Utilizadores]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Dados do utilizador autenticado retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 nome:
 *                   type: string
 *                   example: "João Silva"
 *                 email:
 *                   type: string
 *                   example: "joao@email.com"
 *                 cargo:
 *                   type: string
 *                   example: "Administrador"
 *       401:
 *         description: Não autorizado (token inválido ou ausente)
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/utilizador', checkAuth, utilizadoresController.mostrarUtilizadorAutenticado);

/**
 * @swagger
 * /api/autenticar:
 *   post:
 *     summary: Cria um novo utilizador
 *     tags: [Utilizadores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - password
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilizador criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', utilizadoresController.criarUtilizador);

/**
 * @swagger
 * /api/autenticar/confirmar-email/{token}:
 *   get:
 *     summary: Confirma o email do utilizador
 *     tags: [Utilizadores]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de confirmação enviado por email
 *     responses:
 *       200:
 *         description: Email confirmado com sucesso
 *       400:
 *         description: Token inválido ou expirado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/confirmar-email/:token', utilizadoresController.confirmarEmail);

/**
 * @swagger
 * /api/autenticar/login:
 *   post:
 *     summary: Autentica um utilizador
 *     tags: [Utilizadores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilizador autenticado com sucesso
 *         headers:
 *           Set-Cookie:
 *             description: Authentication session cookie
 *             schema:
 *               type: string
 *               example: "Authentication=random-session-token; Path=/; HttpOnly; Secure; SameSite=Strict"
 *       400:
 *         description: Utilizador já autenticado
 *       401:
 *         description: Credenciais inválidas
 *       404:
 *         description: Utilizador não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/login', utilizadoresController.login);

/**
 * @swagger
 * /api/autenticar/2fa:
 *   post:
 *     summary: Ativa a autenticação de dois fatores para o utilizador autenticado
 *     tags: [Utilizadores]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Autenticação de dois fatores ativada com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/login/2fa', utilizadoresController.verificarCodigo2FA);

/**
 * @swagger
 * /api/autenticar/logout:
 *   post:
 *     summary: Termina a sessão do utilizador com login
 *     tags: [Utilizadores]
 *     responses:
 *       200:
 *         description: Utilizador desconectado com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/logout', utilizadoresController.logout);

/**
 * @swagger
 * /api/autenticar:
 *   patch:
 *     summary: Atualiza o utilizador autenticado
 *     tags: [Utilizadores]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilizador atualizado com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Utilizador não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.patch('/', checkAuth, utilizadoresController.atualizarUtilizador);

/**
 * @swagger
 * /api/autenticar:
 *   delete:
 *     summary: Remove o utilizador autenticado
 *     tags: [Utilizadores]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Utilizador removido com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Utilizador não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/', checkAuth, utilizadoresController.apagarUtilizador);



module.exports = router;
