const Cafe = require('../models/cafeModel');
const Gestor = require('../models/gestorModel');
const Jogos = require('../models/jogosModel');
const multer = require('multer');
const fs = require('fs');
const path = require('path')

const filePath = 'C:\\Users\\joaom\\Desktop\\Dice-Tables\\Back-End\\uploads\\cafes';

function deleteFile(fileName) {
    fs.unlink(filePath + "\\" + fileName, (err) => {
        if (err) {
            console.error("Erro detetando o ficheiro:", err);
        }
    });
}

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(path.join(__dirname, "..", "uploads", "cafes")));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname).toLowerCase(); // Pega a extensão corretamente
        const fileName = `${file.fieldname}-${uniqueSuffix}${extension}`;
        req.fileName = fileName;
        cb(null, fileName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Apenas imagens JPEG ou PNG são permitidas"), false);
        }
        cb(null, true);
    }
});



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

// Obter o café do gestor autenticado
exports.mostrarCafeGestor = async (req, res) => {
    try {
        // Verificar se o utilizador autenticado é um gestor
        if (!req.user.isGestor) {
            return res.status(403).json({ error: "Função restrita a Gestor" });
        }

        // Buscar o gestor e o café associado a ele
        const gestor = await Gestor.findOne({
            where: { ID_Utilizador: req.user.id },
            include: {
                model: Cafe,
                attributes: ['ID_Cafe', 'Nome_Cafe', 'Descricao', 'Local', 'Coordenadas', 'Tipo_Cafe', 'Horario_Abertura', 'Horario_Fecho', 'Imagem_Cafe']
            }
        });

        // Verificar se o gestor possui um café atribuído
        if (!gestor || !gestor.Cafe) {
            return res.status(204).json(null);
        }

        res.json(gestor.Cafe);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Criar um novo café
exports.criarCafe = async (req, res) => {
    try {
        if (!req.user.isGestor) return res.status(401).send({ error: 'Função restrita a gestor' });

        // Usar let para permitir reatribuição das variáveis
        let { nome_cafe, descricao, local, coordenadas, tipo_cafe, horario_abertura, horario_fecho } = req.body;

        // Definindo imagem padrão inicialmente
        const imagem_cafe = req.file ? req.file.filename : 'default.png';

        // Garantir que horario_abertura e horario_fecho sejam convertidos para inteiros
        horario_abertura = parseInt(horario_abertura, 10);
        horario_fecho = parseInt(horario_fecho, 10);

        // Verificação se o horário de abertura é menor que o de fecho
        if (horario_abertura >= horario_fecho) {
            if (req.file.filename) {
                deleteFile(req.file.filename);
            }
            return res.status(400).json({ error: 'O horário de abertura deve ser menor que o horário de fecho.' });
        }

        // Verifique se o gestor já tem um café
        const gestorExistente = await Gestor.findOne({ where: { ID_Utilizador: req.user.id } });
        if (gestorExistente) {
            if (req.file.filename) {
                deleteFile(req.file.filename);
            }
            return res.status(403).json({ message: 'Este gestor já tem um café atribuído.' });
        }

        // Criação do novo café com o ID_Gestor atribuído
        const novoCafe = await Cafe.create({
            Nome_Cafe: nome_cafe,
            Descricao: descricao,
            Imagem_Cafe: imagem_cafe,
            Local: local,
            Coordenadas: coordenadas || null,
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
        if (error.name === 'SequelizeValidationError') {
            if (req.file.filename) {
                deleteFile(req.file.filename);
            }
            const validationErrors = error.errors.map(err => err.message);
            return res.status(400).json({ error: validationErrors });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.atualizarCafe = async (req, res) => {
    try {
        if (!req.user.isGestor) {
            deleteFile(req.file.filename);
            return res.status(403).json({ error: "Função restrita a Gestor" });
        }

        const gestor = await Gestor.findOne({
            where: { ID_Utilizador: req.user.id },
            include: {
                model: Cafe,
                attributes: ['ID_Cafe', 'Nome_Cafe', 'Local', 'Tipo_Cafe', 'Horario_Abertura', 'Horario_Fecho', 'Imagem_Cafe']
            }
        });

        if (!gestor || !gestor.Cafe) {
            deleteFile(req.file.filename);
            return res.status(404).json({ error: "Você não tem um café associado para atualizar." });
        }

        const cafe = gestor.Cafe;
        const tipoCafeAntigo = cafe.Tipo_Cafe;
        
        let { nome_cafe, descricao, local, coordenadas, tipo_cafe, horario_abertura, horario_fecho } = req.body;
        const novaImagem = req.file ? req.file.filename : cafe.Imagem_Cafe;

        horario_abertura = parseInt(horario_abertura, 10);
        horario_fecho = parseInt(horario_fecho, 10);

        const novoTipo = parseInt(tipo_cafe, 10);

        if (horario_abertura >= horario_fecho) {
            if (req.file) {
                deleteFile(req.file.filename);
            }
            return res.status(400).json({ error: 'O horário de abertura deve ser menor que o horário de fecho.' });
        }

        // Apagar jogos se mudar de tipo 0 para 1
        if (tipoCafeAntigo === 0 && novoTipo === 1) {
            await Jogo.destroy({ where: { ID_Cafe: cafe.ID_Cafe } });
        }

        if (req.file && cafe.Imagem_Cafe !== 'default.png') {
            deleteFile(cafe.Imagem_Cafe);
        }

        try {
            await cafe.update({
                Nome_Cafe: nome_cafe || cafe.Nome_Cafe,
                Descricao: descricao || cafe.Descricao,
                Imagem_Cafe: novaImagem,
                Local: local || cafe.Local,
                Coordenadas: coordenadas || cafe.Coordenadas,
                Tipo_Cafe: tipo_cafe || cafe.Tipo_Cafe,
                Horario_Abertura: horario_abertura || cafe.Horario_Abertura,
                Horario_Fecho: horario_fecho || cafe.Horario_Fecho,
            });

            res.json({ message: 'Café atualizado com sucesso!' });
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                const validationErrors = error.errors.map(err => err.message);
                return res.status(400).json({ error: validationErrors });
            }
            res.status(500).json({ error: error.message });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Apagar o café associado ao Gestor
exports.apagarCafe = async (req, res) => {
    try {

        // Verificar se o utilizador autenticado é um gestor
        if (!req.user.isGestor) {
            return res.status(403).json({ error: "Função restrita a Gestor" });
        }


        // Buscar o gestor associado ao utilizador autenticado
        const gestor = await Gestor.findOne({
            where: { ID_Utilizador: req.user.id },
            include: {
                model: Cafe,
                attributes: ['ID_Cafe', 'Nome_Cafe', 'Imagem_Cafe', 'Local', 'Tipo_Cafe', 'Horario_Abertura', 'Horario_Fecho']
            }
        });

        // Verificar se o gestor tem um café associado
        if (!gestor || !gestor.Cafe) {
            return res.status(404).json({ error: 'Você não tem um café associado para remover.' });
        }

        const cafe = gestor.Cafe;  // O café associado ao gestor

        // Se o café possui uma imagem associada e não for a imagem padrão
        if (cafe.Imagem_Cafe !== 'default.png') {
            const oldImagePath = path.resolve(path.join(__dirname, "..", "uploads", "cafes", cafe.Imagem_Cafe));

            // Verificar se a imagem existe e removê-la
            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error('Erro ao remover a imagem do café:', err);
                }
            });
        }

        // Apagar o café da base de dados
        await cafe.destroy();
        res.json({ message: 'Café removido com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Exportar o middleware de upload
exports.upload = upload;
