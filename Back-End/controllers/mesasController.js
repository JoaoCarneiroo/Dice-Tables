const Mesas = require('../models/mesasModel');
const Gestor = require('../models/gestorModel');

// Obter todos as Mesas
exports.mostrarMesas = async (req, res) => {
    try {
        const mesas = await Mesas.findAll();
        res.json(mesas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Criar uma nova Mesa (apenas se o utilizador autenticado for gestor do café)
exports.criarMesa = async (req, res) => {
    try {
        const { lugares } = req.body;

        // Verificar se o utilizador autenticado é gestor de um café
        const gestor = await Gestor.findOne({
            where: { ID_Utilizador: req.user.id }
        });

        if (!gestor) {
            return res.status(403).json({ error: "Apenas gestores podem criar mesas." });
        }

        // Criar a mesa associada ao café do gestor autenticado
        const novaMesa = await Mesas.create({
            ID_Cafe: gestor.ID_Cafe,
            Lugares: lugares
        });

        res.status(201).json(novaMesa);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Atualizar uma Mesa (apenas se o utilizador for gestor do café)
exports.atualizarMesa = async (req, res) => {
    try {
        // Procurar a Mesa pelo ID
        const mesa = await Mesas.findByPk(req.params.id);
        if (!mesa) return res.status(404).json({ error: 'Mesa não encontrada' });

        const { lugares } = req.body;


        // Verificar se o utilizador autenticado é gestor do café da mesa
        const gestor = await Gestor.findOne({
            where: { ID_Utilizador: req.user.id, ID_Cafe: mesa.ID_Cafe }
        });

        if (!gestor) {
            return res.status(403).json({ error: "Apenas gestores do café podem atualizar esta mesa." });
        }

        // Atualizar a mesa
        mesa.Lugares = lugares;
        await mesa.save();

        res.json({ message: "Mesa atualizada com sucesso!", mesa });
    } catch (error) {
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
        res.status(500).json({ error: error.message });
    }
};