const Cafe = require('../models/cafeModel');
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
        const { nome_cafe, local, tipo_cafe, horario_abertura, horario_fecho } = req.body;
        const imagem_cafe = req.file ? req.file.buffer : null;

        const novoCafe = await Cafe.create({
            Nome_Cafe: nome_cafe,
            Imagem_Cafe: imagem_cafe,
            Local: local,
            Tipo_Cafe: tipo_cafe,
            Horario_Abertura: horario_abertura,
            Horario_Fecho: horario_fecho
        });

        res.json({ id: novoCafe.id, message: 'Café criado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Atualizar um café
exports.atualizarCafe = async (req, res) => {
    try {
        const cafe = await Cafe.findByPk(req.params.id);
        if (!cafe) return res.status(404).json({ error: 'Café não encontrado' });

        await cafe.update(req.body);
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

        await cafe.destroy();
        res.json({ message: 'Café removido com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Exportar o middleware de upload
exports.upload = upload.single('imagem_cafe');
