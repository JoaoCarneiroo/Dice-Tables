const Jogos = require('../models/jogosModel');
const Gestor = require('../models/gestorModel');
const Cafes = require('../models/cafeModel');

// Comprar um jogo
exports.comprarJogo = async (req, res) => {
    try {
        const { id } = req.params; // ID do jogo

        // Procurar o Jogo
        const jogo = await Jogos.findByPk(id);
        if (!jogo) {
            return res.status(404).json({ error: "Jogo não encontrado." });
        }

        // Verificar se o jogo tem stock disponível
        if (jogo.Quantidade < 1) {
            return res.status(400).json({ error: "Este jogo está sem stock." });
        }

        // Reduzir o stock do jogo
        await jogo.update({ Quantidade: jogo.Quantidade - 1 });

        res.status(200).json({ message: "Compra efetuada com sucesso!", jogo });

    } catch (error) {
        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({ error: error.errors.map(e => e.message) });
        }
        res.status(500).json({ error: error.message });
    }
};

// Obter todos os jogos
exports.mostrarJogos = async (req, res) => {
    try {
        const jogos = await Jogos.findAll();
        res.json(jogos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obter todos os Jogos de um café
exports.mostrarJogosID = async (req, res) => {
    try {
        const Cafe = await Cafes.findByPk(req.params.id);

        // Verificar se o café existe
        if (!Cafe) {
            return res.status(404).json({ error: "Café não encontrado." });
        }

        const idCafe = Cafe.ID_Cafe;

        // Buscar todos os jogos do café
        const jogos = await Jogos.findAll({
            where: { ID_Cafe: idCafe }
        });

        res.json(jogos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obter um Jogo por ID de um Jogo
exports.mostrarJogoPorID = async (req, res) => {
    try {
        const { id } = req.params;

        // Procurar o Jogo pelo ID
        const jogo = await Jogos.findByPk(id);

        if (!jogo) {
            return res.status(404).json({ error: "Jogo não encontrado." });
        }

        res.json(jogo);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Criar um novo Jogo (apenas se o utilizador autenticado for gestor do café)
exports.criarJogo = async (req, res) => {
    try {
        const { nomeJogo, notasJogo, preco, quantidade } = req.body;

        // Verificar se o utilizador autenticado é gestor de um café
        if (!req.user.isGestor) { 
            return res.status(403).json({ error: "Apenas gestores podem adicionar jogos." });
        }

        const gestor = await Gestor.findOne({
            where: { ID_Utilizador: req.user.id }
        });

        if (!gestor) { 
            return res.status(403).json({ error: "Ainda não tens um café a gerir." });
        }

        const cafe = await Cafes.findByPk(gestor.ID_Cafe);

        if (cafe.Tipo_Cafe == 1) { 
            return res.status(403).json({ error: "Altere o tipo de café" });
        }

        // Criar o jogo associado ao café do gestor autenticado
        const novoJogo = await Jogos.create({
            ID_Cafe: gestor.ID_Cafe,
            Nome_Jogo: nomeJogo,
            Notas_Jogo: notasJogo,
            Preco: preco,
            Quantidade: quantidade
        });

        res.status(201).json(novoJogo);
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => err.message);
            return res.status(400).json({ error: validationErrors });
        }
        res.status(500).json({ error: error.message });
    }
};

// Atualizar um Jogo (apenas se o utilizador for gestor do café)
exports.atualizarJogo = async (req, res) => {
    const { nomeJogo, notasJogo, preco, quantidade } = req.body;
    try {
        // Buscar o jogo pelo ID
        const jogo = await Jogos.findByPk(req.params.id);
        if (!jogo) {
            return res.status(404).json({ error: "Jogo não encontrado." });
        }

        // Verificar se o utilizador autenticado é gestor do café onde o jogo está
        const gestor = await Gestor.findOne({
            where: { ID_Utilizador: req.user.id, ID_Cafe: jogo.ID_Cafe }
        });

        if (!gestor) {
            return res.status(403).json({ error: "Apenas gestores do café podem atualizar este jogo." });
        }

        // Atualizar apenas os campos enviados
        if (nomeJogo !== undefined && nomeJogo !== "") {
            jogo.Nome_Jogo = nomeJogo;
        }
        if (notasJogo !== undefined && notasJogo !== "") {
            jogo.Notas_Jogo = notasJogo;
        }
        if (preco !== undefined && preco !== "") {
            jogo.Preco = preco;
        }
        if (quantidade !== undefined && quantidade !== "") {
            jogo.Quantidade = quantidade;
        }

        // Salvar as alterações
        await jogo.save();

        res.json({ message: "Jogo atualizado com sucesso!", jogo });

    } catch (err) {
        if (err.name === "SequelizeValidationError") {
            return res.status(400).json({ error: err.errors.map(e => e.message) });
        }
        res.status(500).json({ error: err.message });
    }
};

// Deletar um Jogo (apenas se o utilizador for gestor do café)
exports.apagarJogo = async (req, res) => {
    try {
        const { id } = req.params; // ID do jogo

        // Buscar o jogo
        const jogo = await Jogos.findByPk(id);
        if (!jogo) {
            return res.status(404).json({ error: "Jogo não encontrado." });
        }

        // Verificar se o utilizador autenticado é gestor do café onde o jogo está
        const gestor = await Gestor.findOne({
            where: { ID_Utilizador: req.user.id, ID_Cafe: jogo.ID_Cafe }
        });

        if (!gestor) {
            return res.status(403).json({ error: "Apenas gestores do café podem apagar este jogo." });
        }

        // Deletar o jogo
        await jogo.destroy();

        res.json({ message: "Jogo apagado com sucesso!" });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => err.message);
            return res.status(400).json({ error: validationErrors });
        }
        res.status(500).json({ error: error.message });
    }
};
