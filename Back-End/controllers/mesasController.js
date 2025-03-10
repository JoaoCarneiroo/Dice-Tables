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

// Obter todas as Mesas de um café
exports.mostrarMesasID = async (req, res) => {
    try {
        const Cafe = await Cafes.findByPk(req.params.id);

        if (!Cafe) {
            return res.status(404).json({ error: "Café não encontrado." });
        }

        const idCafe = Cafe.ID_Cafe
        
        // Buscar todos os jogos do café
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