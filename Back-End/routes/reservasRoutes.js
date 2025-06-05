const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservasController');
const checkAuth = require('../middlewares/authentication');

/**
 * @swagger
 * /api/reservas:
 *   get:
 *     summary: Mostra todas as reservas
 *     tags: [Reservas]
 *     description: Obtém a lista de todas as reservas registradas.
 *     responses:
 *       200:
 *         description: Lista de reservas mostrada com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', reservasController.mostrarReservas);

/**
 * @swagger
 * /api/reservas/utilizador:
 *   get:
 *     summary: Mostra as reservas do utilizador autenticado
 *     tags: [Reservas]
 *     description: Obtém todas as reservas feitas pelo utilizador autenticado.
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas do utilizador retornada com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/utilizador', checkAuth, reservasController.mostrarReservasUtilizador);





/**
 * @swagger
 * /api/reservas:
 *   post:
 *     summary: Cria uma nova reserva
 *     tags: [Reservas]
 *     description: Permite que um utilizador autenticado crie uma reserva.
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ID_Mesa:
 *                 type: integer
 *                 description: ID da mesa a ser reservada
 *               ID_Jogo:
 *                 type: integer
 *                 description: ID do jogo a ser utilizado na reserva
 *               Hora_Inicio:
 *                 type: string
 *                 format: date-time
 *                 description: Hora de início da reserva
 *               Hora_Fim:
 *                 type: string
 *                 format: date-time
 *                 description: Hora de fim da reserva
 *     responses:
 *       201:
 *         description: Reserva criada com sucesso
 *       400:
 *         description: Erro na solicitação - horário indisponível ou jogo sem estoque
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', checkAuth, reservasController.criarReserva);

/**
 * @swagger
 * /api/reservas/{id}:
 *   patch:
 *     summary: Atualiza uma reserva existente
 *     tags: [Reservas]
 *     description: Permite que o utilizador que criou a reserva atualize seus detalhes.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da reserva a ser atualizada
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ID_Mesa:
 *                 type: integer
 *                 description: Novo ID da mesa para a reserva
 *               ID_Jogo:
 *                 type: integer
 *                 description: Novo ID do jogo para a reserva
 *               Hora_Inicio:
 *                 type: string
 *                 format: date-time
 *                 description: Nova hora de início da reserva
 *               Hora_Fim:
 *                 type: string
 *                 format: date-time
 *                 description: Nova hora de fim da reserva
 *     responses:
 *       200:
 *         description: Reserva atualizada com sucesso
 *       400:
 *         description: Erro na solicitação - horário indisponível ou jogo sem estoque
 *       403:
 *         description: Acesso negado - somente o criador da reserva pode atualizá-la
 *       404:
 *         description: Reserva não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.patch('/:id', checkAuth, reservasController.atualizarReserva);

/**
 * @swagger
 * /api/reservas/{id}:
 *   delete:
 *     summary: Remove uma reserva
 *     tags: [Reservas]
 *     description: Permite que um utilizador autenticado exclua sua própria reserva.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da reserva a ser removida
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reserva apagada com sucesso
 *       403:
 *         description: Acesso negado - somente o criador da reserva pode apagá-la
 *       404:
 *         description: Reserva não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', checkAuth, reservasController.apagarReserva);

/**
 * @swagger
 * /api/reservas/juntar/{id}:
 *   post:
 *     summary: Juntar-se a um grupo de reservas
 *     tags: [Reservas]
 *     description: Permite que um utilizador autenticado se junte a um grupo de reservas.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do grupo de reservas a que o utilizador deseja se juntar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilizador juntado ao grupo com sucesso
 *       400:
 *         description: Erro na solicitação - ID inválido ou grupo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/juntar/:id', checkAuth, reservasController.juntarGrupo);

/**
 * @swagger
 * /api/reservas/grupo/{id}:
 *   get:
 *     summary: Mostra as reservas de um grupo específico
 *     tags: [Reservas]
 *     description: Obtém todas as reservas de um grupo específico, incluindo os lugares disponíveis.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do grupo de reservas a ser mostrado
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de reservas do grupo retornada com sucesso
 *       404:
 *         description: Grupo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/grupo/:id', reservasController.mostrarReservasComLugares);

/**
 * @swagger
 * /api/reservas/grupo:
 *   get:
 *     summary: Mostra as reservas inscritas do utilizador autenticado
 *     tags: [Reservas]
 *     description: Obtém todas as reservas em que o utilizador está inscrito.
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas do grupo retornada com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/grupo', checkAuth, reservasController.mostrarReservasGrupo);

/**
 * @swagger
 * /api/reservas/sair/{id}:
 *   delete:
 *     summary: Sair de um grupo da reserva que o utilizador se juntou
 *     tags: [Reservas]
 *     description: Permite que um utilizador autenticado saia do grupo que se juntou.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do grupo de reservas do qual o utilizador deseja sair
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilizador saiu do grupo com sucesso
 *       400:
 *         description: Erro na solicitação - ID inválido ou grupo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/sair/:id', checkAuth, reservasController.sairGrupo);


module.exports = router;
