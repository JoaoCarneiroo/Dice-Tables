const express = require('express');
const router = express.Router();
const cafesController = require('../controllers/cafesController');
const checkAuth = require('../middlewares/authentication');


/**
 * @swagger
 * /cafes:
 *   get:
 *     summary: Obtém todos os cafés
 *     tags: [Cafés]
 *     description: Retorna uma lista de todos os cafés cadastrados.
 *     responses:
 *       200:
 *         description: Lista de cafés retornada com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', cafesController.mostrarCafes);

/**
 * @swagger
 * /cafes/{id}:
 *   get:
 *     summary: Obtém um café pelo ID
 *     tags: [Cafés]
 *     description: Retorna os detalhes de um café específico.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do café
 *     responses:
 *       200:
 *         description: Dados do café retornados com sucesso
 *       404:
 *         description: Café não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

router.get('/porID/:id', cafesController.mostrarCafeID);

/**
 * @swagger
 * /cafes/gestor:
 *   get:
 *     summary: Obtém o café gerenciado pelo usuário autenticado (gestor)
 *     tags: [Cafés]
 *     description: Retorna os detalhes do café associado ao gestor autenticado. Acesso restrito a gestores.
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Detalhes do café retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Cafe:
 *                   type: integer
 *                   description: ID do café
 *                 Nome_Cafe:
 *                   type: string
 *                   description: Nome do café
 *                 Local:
 *                   type: string
 *                   description: Localização do café
 *                 Tipo_Cafe:
 *                   type: string
 *                   description: Tipo de café (Sem Jogos ou Com Jogos)
 *                 Horario_Abertura:
 *                   type: string
 *                   description: Horário de abertura do café
 *                 Horario_Fecho:
 *                   type: string
 *                   description: Horário de fechamento do café
 *                 Imagem_Cafe:
 *                   type: string
 *                   description: URL da imagem do café
 *       403:
 *         description: Função restrita a gestores - O usuário não tem permissão para acessar este recurso
 *       202:
 *         description: Nenhum café encontrado para este gestor
 *       500:
 *         description: Erro interno do servidor
 */


router.get('/gestor', checkAuth, cafesController.mostrarCafeGestor);

/**
 * @swagger
 * /cafes:
 *   post:
 *     summary: Cria um novo café
 *     tags: [Cafés]
 *     description: Permite que um gestor cadastrado crie um novo café.
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nome_cafe:
 *                 type: string
 *               local:
 *                 type: string
 *               tipo_cafe:
 *                 type: string
 *               horario_abertura:
 *                 type: string
 *                 format: time
 *               horario_fecho:
 *                 type: string
 *                 format: time
 *               imagem_cafe:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Café criado com sucesso
 *       401:
 *         description: Acesso não autorizado
 *       403:
 *         description: Gestor já possui um café cadastrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', checkAuth, cafesController.upload.single('imagem_cafe'), cafesController.criarCafe);

/**
 * @swagger
 * /cafes/{id}:
 *   patch:
 *     summary: Atualiza um café existente
 *     tags: [Cafés]
 *     description: Permite que um gestor autenticado atualize as informações do seu café.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do café
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nome_cafe:
 *                 type: string
 *               local:
 *                 type: string
 *               tipo_cafe:
 *                 type: string
 *               horario_abertura:
 *                 type: string
 *                 format: time
 *               horario_fecho:
 *                 type: string
 *                 format: time
 *               imagem_cafe:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Café atualizado com sucesso
 *       401:
 *         description: Acesso não autorizado
 *       403:
 *         description: Utilizador não tem permissão para alterar este café
 *       404:
 *         description: Café não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.patch('/:id', checkAuth, cafesController.upload.single('imagem_cafe'), cafesController.atualizarCafe);

/**
 * @swagger
 * /cafes/{id}:
 *   delete:
 *     summary: Remove um café
 *     tags: [Cafés]
 *     description: Permite que um gestor autenticado remova um café que lhe pertence.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do café a ser removido
 *     responses:
 *       200:
 *         description: Café removido com sucesso
 *       401:
 *         description: Acesso não autorizado
 *       403:
 *         description: Utilizador não tem permissão para remover este café
 *       404:
 *         description: Café não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', checkAuth, cafesController.apagarCafe);

module.exports = router;
