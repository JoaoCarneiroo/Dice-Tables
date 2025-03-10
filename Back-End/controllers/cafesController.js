const Cafe = require('../models/cafeModel');
const Gestor = require('../models/gestorModel');
const multer = require('multer');

// Configuração do multer para upload de imagens
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Obter todos os cafés
exports.mostrarCafes = async (req, res) => {
    try {
        const cafes = await Cafe.findAll();
        res.json(cafes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obter um café pelo ID
exports.mostrarCafeID = async (req, res) => {
    try {
        const cafe = await Cafe.findByPk(req.params.id);
        if (!cafe) return res.status(404).json({ error: 'Café não encontrado' });
        res.json(cafe);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Criar um novo café
exports.criarCafe = async (req, res) => {
    try {
        if(!req.user.isGestor) return res.status(401).send({ error: 'Função restrita a gestor'})

        const { nome_cafe, local, tipo_cafe, horario_abertura, horario_fecho } = req.body;
        const imagem_cafe = req.file ? req.file.buffer : null;

        // Verifique se o gestor já tem um café
        const gestorExistente = await Gestor.findOne({ where: { ID_Utilizador: req.user.id } });
        if (gestorExistente) {
            return res.status(403).json({ message: 'Este gestor já tem um café atribuído.' });
        }

        // Criação do novo café com o ID_Gestor atribuído
        const novoCafe = await Cafe.create({
            Nome_Cafe: nome_cafe,
            Imagem_Cafe: imagem_cafe,
            Local: local,
            Tipo_Cafe: tipo_cafe,
            Horario_Abertura: horario_abertura,
            Horario_Fecho: horario_fecho,
        });

        await Gestor.create({
            ID_Cafe: novoCafe.ID_Cafe,
            ID_Utilizador: req.user.id
        });



        res.json({ id: novoCafe.id, message: 'Café criado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Atualizar um café
exports.atualizarCafe = async (req, res) => {
    try {
        if (!req.user.isGestor) return res.status(401).send({ error: 'Função restrita a gestor' });

        const cafe = await Cafe.findByPk(req.params.id);
        if (!cafe) return res.status(404).json({ error: 'Café não encontrado' });

        // Verifique se o café pertence ao gestor autenticado
        const gestorExistente = await Gestor.findOne({ where: { ID_Cafe: cafe.ID_Cafe, ID_Utilizador: req.user.id } });
        if (!gestorExistente) {
            return res.status(403).json({ message: 'Você não tem permissão para alterar este café.' });
        }

        const { nome_cafe, local, tipo_cafe, horario_abertura, horario_fecho } = req.body;
        const imagem_cafe = req.file ? req.file.buffer : cafe.Imagem_Cafe; 
        
        // Atualizar o café com as novas informações
        await cafe.update({
            Nome_Cafe: nome_cafe || cafe.Nome_Cafe,
            Imagem_Cafe: imagem_cafe,
            Local: local || cafe.Local,
            Tipo_Cafe: tipo_cafe || cafe.Tipo_Cafe,
            Horario_Abertura: horario_abertura || cafe.Horario_Abertura,
            Horario_Fecho: horario_fecho || cafe.Horario_Fecho,
        });

        res.json({ message: 'Café atualizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remover um café
exports.apagarCafe = async (req, res) => {
    try {
        const cafe = await Cafe.findByPk(req.params.id);
        if (!cafe) return res.status(404).json({ error: 'Café não encontrado' });

        // Verifique se o café pertence ao gestor autenticado
        const gestorId = req.user.ID_Gestor;
        if (cafe.ID_Gestor !== gestorId) {
            return res.status(403).json({ message: 'Você não tem permissão para remover este café.' });
        }

        // Apagar o café
        await cafe.destroy();
        res.json({ message: 'Café removido com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Exportar o middleware de upload
exports.upload = upload.single('imagem_cafe');
