const Utilizador = require('../models/utilizadorModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secretKey = 'carneiro_secret';

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
        const utilizador = await Utilizador.findByPk(req.user.id);
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
    console.log(JSON.stringify(req.user))
    try {
        const utilizador = await Utilizador.findByPk(req.user.id);
        if (!utilizador) {
            return res.status(404).json({ error: 'Utilizador não encontrado' });
        }

        if(req.user.isAdmin) res.status(401).json({ error: 'Operação não permitida' })

        await utilizador.destroy();

        // Limpeza da Cookie
        res.clearCookie('Authorization', {
            httpOnly: true,  // Garante que o cookie só possa ser acessado pelo servidor
            secure: process.env.NODE_ENV === 'production',  // Em produção, você usaria cookies seguros
            sameSite: 'Strict'  // Aplique a política de SameSite
        });

        res.json({ message: 'Utilizador removido com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const utilizador = await Utilizador.findOne({ where: { Email: email } });

        if (!utilizador) {
            return res.status(404).json({ error: 'Utilizador não encontrado' });
        }

        // Comparar a senha fornecida com o hash da senha no banco de dados
        const match = await bcrypt.compare(password, utilizador.Password);
        
        if (!match) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        var isAdmin = utilizador.Cargo == 'Administrador'
        var isGestor = utilizador.Cargo == 'Gestor'

        // Gerar o token JWT
        const token = jwt.sign({ id: utilizador.ID_Utilizador, nome: utilizador.Nome, email: utilizador.Email, isAdmin: isAdmin, isGestor: isGestor }, secretKey, { expiresIn: '1h' });

        res.cookie('Authorization', token, { httpOnly: true, secure: true, sameSite: 'Strict' });
        res.status(200).send({ message: 'Utilizador autenticado com sucesso!' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
