const Utilizador = require('../models/utilizadorModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secretKey = 'carneiro_secret';


// Login de Utilizador
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verificar se já existe um token na cookie
        const tokenExistente = req.cookies.Authorization;
        if (tokenExistente) {
            try {
                const decoded = jwt.verify(tokenExistente, secretKey);
                if (decoded.email === email) {
                    return res.status(400).json({ error: 'Utilizador já autenticado!' });
                } else {
                    return res.status(400).json({ error: 'Utilizador já autenticado com outra conta!' });
                }
            } catch (error) {
                console.error("Erro ao verificar token existente:", error.message);            }
        }

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

        res.cookie('Authorization', token, { httpOnly: false, secure: false, sameSite: 'Lax' });
        
        res.status(200).json({message: 'Utilizador autenticado com sucesso!', token, });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Logout de Utilizador
exports.logout = (req, res) => {
    res.clearCookie('Authorization', {
        httpOnly: true,  
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'Strict'
    });

    // Retorna uma resposta informando que o usuário foi desconectado
    res.status(200).json({ message: 'Desconectado com sucesso!' });
};


// Obter todos os utilizadores
exports.mostrarUtilizadores = async (req, res) => {
    try {
        const utilizadores = await Utilizador.findAll({
            attributes: ['ID_Utilizador', 'Nome', 'Email']
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


// Endpoint para verificar o token JWT e retornar as informações do utilizador autenticado
exports.mostrarUtilizadorAutenticado = async (req, res) => {
    try {
        // Pegar o token do cookie
        const token = req.cookies.Authorization;
        
        // Verificar se o token está presente
        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido ou inválido' });
        }

        // Verificar o token JWT
        const decoded = jwt.verify(token, secretKey);  // Verifica a validade do token

        // Agora temos as informações do utilizador decodificadas
        const utilizadorId = decoded.id;

        // Buscar o utilizador no banco de dados com base no ID
        const utilizador = await Utilizador.findByPk(utilizadorId, {
            attributes: ['ID_Utilizador', 'Nome', 'Email', 'Cargo'] // Atributos que você deseja retornar
        });

        // Verificar se o utilizador existe
        if (!utilizador) {
            return res.status(404).json({ error: 'Utilizador não encontrado' });
        }

        // Retornar as informações do utilizador
        res.json(utilizador);
    } catch (err) {
        // Em caso de erro ao verificar o token ou ao buscar o utilizador
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido' });
        }
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

        // Criação do novo utilizador
        const novoUtilizador = await Utilizador.create({
            Nome: nome,
            Email: email,
            Password: hashedPassword
        });

        // Gerar o token JWT
        const token = jwt.sign(
            { id: novoUtilizador.ID_Utilizador, nome: novoUtilizador.Nome, email: novoUtilizador.Email },
            secretKey,
            { expiresIn: '1h' }
        );

        res.status(201).json({ token, message: 'Utilizador criado com sucesso!' });

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

    try {
        const utilizador = await Utilizador.findByPk(req.user.id);
        if (!utilizador) {
            return res.status(404).json({ error: 'Utilizador não encontrado' });
        }

        if(req.user.isAdmin) res.status(401).json({ error: 'Operação não permitida' })

        await utilizador.destroy();

        // Limpeza da Cookie
        res.clearCookie('Authorization', {
            httpOnly: true,  
            secure: process.env.NODE_ENV === 'production',  
            sameSite: 'Strict' 
        });

        res.json({ message: 'Utilizador removido com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



