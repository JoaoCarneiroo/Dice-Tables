const db = require('../Database/database');
const multer = require('multer');

// Configuração do multer para guardar imagens na memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Função auxiliar para validar strings sem números
const isValidString = (str) => /^[A-Za-zÀ-ÿ\s]+$/.test(str);

// Função auxiliar para validar horários (inteiro entre 0 e 23)
const isValidHour = (hour) => /^\d+$/.test(hour) && hour >= 0 && hour <= 23;


// Obter todos os cafés
exports.mostrarCafes = (req, res) => {
    db.all('SELECT * FROM Cafes', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// Obter um café pelo ID
exports.mostrarCafeID = (req, res) => {
    db.get('SELECT * FROM Cafes WHERE ID_Cafe = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
};

// Criar um novo café
exports.criarCafe = (req, res) => {
    const { nome_cafe, local, tipo_cafe, horario_abertura, horario_fecho } = req.body;
    const imagem_cafe = req.file ? req.file.buffer : null; // Se houver ficheiro, guardar como BLOB

    // Validações
    if (!nome_cafe || !local || !tipo_cafe || horario_abertura === undefined || horario_fecho === undefined) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    if (!isValidString(nome_cafe) || !isValidString(local) || !isValidString(tipo_cafe)) {
        return res.status(400).json({ error: 'Nome, Local e Tipo de Café não podem conter números.' });
    }
    if (!isValidHour(horario_abertura) || !isValidHour(horario_fecho)) {
        return res.status(400).json({ error: 'Horário inválido. Insira um número entre 0 e 23.' });
    }

    db.run(
        `INSERT INTO Cafes (Nome_Cafe, Imagem_Cafe, Local, Tipo_Cafe, Horario_Abertura, Horario_Fecho) VALUES (?, ?, ?, ?, ?, ?)`,
        [nome_cafe, imagem_cafe, local, tipo_cafe, horario_abertura, horario_fecho],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: 'Café criado com sucesso!' });
        }
    );
};

// Atualizar um café
exports.atualizarCafe = (req, res) => {
    const { nome_cafe, local, tipo_cafe, horario_abertura, horario_fecho } = req.body;
    const imagem_cafe = req.file ? req.file.buffer : null; // Se houver ficheiro, guardar como BLOB

    // Buscar o café atual para preservar dados antigos se não forem enviados na request
    db.get('SELECT * FROM Cafes WHERE ID_Cafe = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Café não encontrado' });

        // Usar valores antigos caso não sejam enviados no PATCH
        const novoNome = nome_cafe || row.Nome_Cafe;
        const novoLocal = local || row.Local;
        const novoTipo = tipo_cafe || row.Tipo_Cafe;
        const novoHorarioAbertura = horario_abertura !== undefined ? horario_abertura : row.Horario_Abertura;
        const novoHorarioFecho = horario_fecho !== undefined ? horario_fecho : row.Horario_Fecho;
        const novaImagem = imagem_cafe !== null ? imagem_cafe : row.Imagem_Cafe;

        // Validações no PATCH (se forem enviados)
        if (nome_cafe && !isValidString(nome_cafe)) {
            return res.status(400).json({ error: 'Nome do café não pode conter números.' });
        }
        if (local && !isValidString(local)) {
            return res.status(400).json({ error: 'Local do café não pode conter números.' });
        }
        if (tipo_cafe && !isValidString(tipo_cafe)) {
            return res.status(400).json({ error: 'Tipo de café não pode conter números.' });
        }
        if (horario_abertura !== undefined && !isValidHour(horario_abertura)) {
            return res.status(400).json({ error: 'Horário de abertura inválido. Insira um número entre 0 e 23.' });
        }
        if (horario_fecho !== undefined && !isValidHour(horario_fecho)) {
            return res.status(400).json({ error: 'Horário de fecho inválido. Insira um número entre 0 e 23.' });
        }

        db.run(
            `UPDATE Cafes SET Nome_Cafe = ?, Imagem_Cafe = ?, Local = ?, Tipo_Cafe = ?, Horario_Abertura = ?, Horario_Fecho = ? WHERE ID_Cafe = ?`,
            [novoNome, novaImagem, novoLocal, novoTipo, novoHorarioAbertura, novoHorarioFecho, req.params.id],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Café atualizado com sucesso!' });
            }
        );
    });
};

// Remover um café
exports.apagarCafe = (req, res) => {
    db.run('DELETE FROM Cafes WHERE ID_Cafe = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Café removido com sucesso!' });
    });
};

// Exportar o middleware de upload para ser usado na rota
exports.upload = upload.single('imagem_cafe');
