const Mesas = require('../models/mesasModel');
const Gestor = require('../models/gestorModel');
const Cafes = require('../models/cafeModel');

// Obter todas as Mesas
exports.mostrarMesas = async (req, res) => {
    try {
        const mesas = await Mesas.findAll();
        res.json(mesas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obter um Jogo por ID de um Jogo
exports.mostrarMesaPorID = async (req, res) => {
    try {
        const { id } = req.params;

        // Procurar o Jogo pelo ID
        const mesa = await Mesas.findByPk(id);

        if (!mesa) {
            return res.status(404).json({ error: "Mesa não encontrada." });
        }

        res.json(mesa);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obter todas as Mesas de um café
exports.mostrarMesasID = async (req, res) => {
    try {
        const Cafe = await Cafes.findByPk(req.params.id);

        if (!Cafe) {
            return res.status(404).json({ error: "Café não encontrado." });
        }

        const idCafe = Cafe.ID_Cafe;
        
        // Buscar todas as mesas do café
        const mesas = await Mesas.findAll({
            where: { ID_Cafe: idCafe }
        });

        res.json(mesas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Criar uma nova Mesa (apenas se o utilizador autenticado for gestor do café)
exports.criarMesa = async (req, res) => {
    try {
        const { nome_mesa, lugares } = req.body;
        
        // Verificar se o utilizador autenticado é gestor de um café
        if (!req.user.isGestor) { 
            return res.status(403).json({ error: "Apenas gestores podem criar mesas" });
        }

        const gestor = await Gestor.findOne({
            where: { ID_Utilizador: req.user.id }
        });

        if (!gestor) {
            return res.status(403).json({ error: "Ainda não tens um café a gerir" });
        }

        // Criação da mesa associada ao café do gestor autenticado
        const novaMesa = await Mesas.create({
            ID_Cafe: gestor.ID_Cafe,
            Nome_Mesa: nome_mesa,
            Lugares: lugares
        });

        res.status(201).json(novaMesa);
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => err.message);
            return res.status(400).json({ error: validationErrors });
        }
        res.status(500).json({ error: error.message });
    }
};

// Atualizar uma Mesa (apenas se o utilizador for gestor do café)
exports.atualizarMesa = async (req, res) => {
    try {
        // Procurar a Mesa pelo ID
        const mesa = await Mesas.findByPk(req.params.id);
        if (!mesa) return res.status(404).json({ error: 'Mesa não encontrada' });

        const { nome_mesa, lugares } = req.body;

        // Verificar se o utilizador autenticado é gestor do café da mesa
        const gestor = await Gestor.findOne({
            where: { ID_Utilizador: req.user.id, ID_Cafe: mesa.ID_Cafe }
        });

        if (!gestor) {
            return res.status(403).json({ error: "Apenas gestores do café podem atualizar esta mesa." });
        }

        // Atualizar a mesa
        mesa.Lugares = lugares ?? mesa.Lugares;
        mesa.Nome_Mesa = nome_mesa ?? mesa.Nome_Mesa;
        await mesa.save();

        res.json({ message: "Mesa atualizada com sucesso!", mesa });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => err.message);
            return res.status(400).json({ error: validationErrors });
        }
        res.status(500).json({ error: error.message });
    }
};

// Deletar uma Mesa (apenas se o utilizador for gestor do café)
exports.apagarMesa = async (req, res) => {
    try {
        // Procurar a Mesa pelo ID
        const mesa = await Mesas.findByPk(req.params.id);
        if (!mesa) return res.status(404).json({ error: 'Mesa não encontrada' });

        // Verificar se o utilizador autenticado é gestor do café da mesa
        const gestor = await Gestor.findOne({
            where: { ID_Utilizador: req.user.id, ID_Cafe: mesa.ID_Cafe }
        });

        if (!gestor) {
            return res.status(403).json({ error: "Apenas gestores do café podem apagar esta mesa." });
        }

        // Apagar a Mesa
        await mesa.destroy();

        res.json({ message: "Mesa apagada com sucesso!" });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => err.message);
            return res.status(400).json({ error: validationErrors });
        }
        res.status(500).json({ error: error.message });
    }
};
