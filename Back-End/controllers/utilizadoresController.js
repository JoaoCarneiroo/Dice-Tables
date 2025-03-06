const Utilizador = require('../models/utilizadorModel');
const bcrypt = require('bcrypt');

// Obter todos os utilizadores
exports.mostrarUtilizadores = async (req, res) => {
    try {
        const utilizadores = await Utilizador.findAll({
            attributes: ['ID_Utilizador', 'Nome', 'Email'] // Evita expor senhas
        });
        res.json(utilizadores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obter um utilizador pelo ID
exports.mostrarUtilizadorID = async (req, res) => {
    try {
        const utilizador = await Utilizador.findByPk(req.params.id, {
            attributes: ['ID_Utilizador', 'Nome', 'Email']
        });
        if (!utilizador) {
            return res.status(404).json({ error: 'Utilizador não encontrado' });
        }
        res.json(utilizador);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Criar um novo utilizador
exports.criarUtilizador = async (req, res) => {
    const { nome, email, password } = req.body;

    if (!nome || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
        // Hash da senha antes de salvar
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const novoUtilizador = await Utilizador.create({
            Nome: nome,
            Email: email,
            Password: hashedPassword
        });

        res.status(201).json({ id: novoUtilizador.ID_Utilizador, message: 'Utilizador criado com sucesso!' });
    } catch (err) {
        // Sequelize valida automaticamente os campos Nome e Email
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: err.errors.map(e => e.message) });
        }
        res.status(500).json({ error: err.message });
    }
};

// Atualizar um utilizador
exports.atualizarUtilizador = async (req, res) => {
    const { nome, email, password } = req.body;

    try {
        const utilizador = await Utilizador.findByPk(req.params.id);
        if (!utilizador) {
            return res.status(404).json({ error: 'Utilizador não encontrado' });
        }

        // Atualizar apenas os campos enviados
        if (nome) {
            utilizador.Nome = nome;
        }
        if (email) {
            utilizador.Email = email;
        }
        if (password) {
            utilizador.Password = await bcrypt.hash(password, 10);
        }

        await utilizador.save();
        res.json({ message: 'Utilizador atualizado com sucesso!' });
    } catch (err) {
        // Sequelize valida automaticamente os campos Nome e Email
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: err.errors.map(e => e.message) });
        }
        res.status(500).json({ error: err.message });
    }
};

// Remover um utilizador
exports.apagarUtilizador = async (req, res) => {
    try {
        const utilizador = await Utilizador.findByPk(req.params.id);
        if (!utilizador) {
            return res.status(404).json({ error: 'Utilizador não encontrado' });
        }

        await utilizador.destroy();
        res.json({ message: 'Utilizador removido com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
