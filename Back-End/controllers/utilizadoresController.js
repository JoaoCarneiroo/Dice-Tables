const Utilizador = require('../models/utilizadorModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { enviarEmailConfirmacao } = require('../middlewares/email');
const { enviarCodigo2FAEmail } = require('../middlewares/email');

const secretKey = process.env.secretKeyJWT;
const codes2FA = new Map();

exports.verificarSeGestor = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Utilizador não autenticado' });
    }

    if (req.user.isGestor) {
        return res.json({ isGestor: true });
    } else {
        return res.status(401).json({ error: 'Acesso negado: Não é Gestor' });
    }
};

exports.verificarSeAdmin = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Utilizador não autenticado' });
    }

    if (req.user.isAdmin) {
        return res.json({ isAdmin: true });
    } else {
        return res.status(401).json({ error: 'Acesso negado: Não é Admin' });
    }
};

// Login de Utilizador
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verificar se já existe um token ativo na cookie
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
                console.error("Erro ao verificar token existente:", error.message);
            }
        }

        // Procurar o Utilizador
        const utilizador = await Utilizador.findOne({ where: { Email: email } });


        // Verificar o Email e se está confirmado
        if (!utilizador) {
            return res.status(404).json({ error: 'Email ou Password incorretos' });
        }
        if (!utilizador.EmailConfirmado) {
            return res.status(403).json({ error: 'É necessário confirmar o email antes de iniciar sessão.' });
        }


        // Verificar a Password
        const match = await bcrypt.compare(password, utilizador.Password);
        if (!match) {
            return res.status(401).json({ error: 'Email ou Password incorretos' });
        }

        // Gerar código 2FA de 6 dígitos
        const codigo2FA = Math.floor(100000 + Math.random() * 900000).toString();

        codes2FA.set(utilizador.ID_Utilizador, { code: codigo2FA, expires: Date.now() + 5 * 60 * 1000 });

        await enviarCodigo2FAEmail(utilizador.Email, codigo2FA);

        return res.status(200).json({ message: 'Código 2FA enviado para o email. Por favor, valide para continuar.', email: utilizador.Email });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.verificarCodigo2FA = async (req, res) => {
    const { email, codigo } = req.body;

    try {
        const utilizador = await Utilizador.findOne({ where: { Email: email } });
        if (!utilizador) {
            return res.status(404).json({ error: 'Utilizador não encontrado' });
        }

        const dadosCodigo = codes2FA.get(utilizador.ID_Utilizador);
        if (!dadosCodigo) {
            return res.status(400).json({ error: 'Nenhum código 2FA foi gerado para este utilizador' });
        }

        if (Date.now() > dadosCodigo.expires) {
            codes2FA.delete(utilizador.ID_Utilizador);
            return res.status(400).json({ error: 'Código expirado' });
        }

        if (codigo !== dadosCodigo.code) {
            return res.status(400).json({ error: 'Código inválido' });
        }

        codes2FA.delete(utilizador.ID_Utilizador);

        // Criar token JWT
        var isAdmin = utilizador.Cargo == 'Administrador';
        var isGestor = utilizador.Cargo == 'Gestor';

        const token = jwt.sign({ id: utilizador.ID_Utilizador, nome: utilizador.Nome, email: utilizador.Email, isAdmin, isGestor }, secretKey, { expiresIn: '1h' });

        res.cookie('Authorization', token, { httpOnly: false, secure: false, sameSite: 'Lax' });

        return res.json({ message: 'Autenticado com sucesso!', token });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Logout de Utilizador
exports.logout = (req, res) => {
    res.clearCookie('Authorization', {
        httpOnly: false,
        secure: false,
        sameSite: 'Lax'
    });
    res.status(200).json({ message: 'Desconectado com sucesso!' });
};


// Obter todos os utilizadores
exports.mostrarUtilizadores = async (req, res) => {
    try {
        const utilizadores = await Utilizador.findAll({
            attributes: ['ID_Utilizador', 'Nome', 'Email', 'Cargo']
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
            attributes: ['ID_Utilizador', 'Nome', 'Email', 'Cargo']
        });
        if (!utilizador) {
            return res.status(404).json({ error: 'Utilizador não encontrado' });
        }
        res.json(utilizador);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Obter o Utilizador Autenticado
exports.mostrarUtilizadorAutenticado = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Utilizador não autenticado' });
        }

        const utilizador = await Utilizador.findByPk(req.user.id, {
            attributes: ['ID_Utilizador', 'Nome', 'Email', 'Cargo']
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

        const tokenConfirmacao = crypto.randomBytes(32).toString('hex');

        // Criação do novo utilizador
        const novoUtilizador = await Utilizador.create({
            Nome: nome,
            Email: email,
            Password: hashedPassword,
            TokenConfirmacao: tokenConfirmacao,
            EmailConfirmado: false
        });

        // Enviar e-mail com link de confirmação
        const urlConfirmacao = `${process.env.CLIENT_URL}/api/autenticar/confirmar-email/${tokenConfirmacao}`;
        await enviarEmailConfirmacao(email, urlConfirmacao);

        res.status(201).json({ message: 'Utilizador criado! Verifique o seu email para confirmar a sua conta.' });
    } catch (err) {
        // Sequelize valida automaticamente os campos Nome e Email
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: err.errors.map(e => e.message) });
        }
        res.status(500).json({ error: err.message });
    }
};

// Confirmação de Email
exports.confirmarEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const utilizador = await Utilizador.findOne({ where: { TokenConfirmacao: token } });

        if (!utilizador) {
            return res.status(400).json({ error: 'Token de confirmação Inválido ou Expirado.' });
        }

        utilizador.EmailConfirmado = true;
        utilizador.TokenConfirmacao = null;

        await utilizador.save();

        res.redirect(`${process.env.CLIENT_URL}/login`);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Atualizar um utilizador
exports.atualizarUtilizador = async (req, res) => {
    const { nome, password } = req.body;

    try {
        const utilizador = await Utilizador.findByPk(req.user.id);
        if (!utilizador) {
            return res.status(404).json({ error: 'Utilizador não encontrado' });
        }

        // Atualizar apenas os campos enviados
        if (nome) {
            utilizador.Nome = nome;
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

        if (req.user.isAdmin) {
            return res.status(401).json({ error: 'Operação não permitida' })
        }

        await utilizador.destroy();

        // Limpeza da Cookie
        res.clearCookie('Authorization', {
            httpOnly: false,
            secure: false,
            sameSite: 'Lax'
        });

        res.json({ message: 'Utilizador removido com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



