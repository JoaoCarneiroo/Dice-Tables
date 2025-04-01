const Utilizador = require('../models/utilizadorModel');
const Cafe = require('../models/cafeModel');
const Gestor = require('../models/gestorModel');
const fs = require('fs');
const path = require('path');


// Promover um utilizador a gestor
exports.promoverParaGestor = async (req, res) => {
    try {
        if(!req.user.isAdmin) return res.status(401).send({ error: 'Função restrita a admin'})

        const { ID_Utilizador } = req.body;

        // Verifica se o utilizador existe
        const utilizador = await Utilizador.findByPk(ID_Utilizador);
        if (!utilizador) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }

        // Verifica se já é um gestor
        if (utilizador.Cargo == 'Gestor') {
            return res.status(400).json({ message: 'Utilizador já é um gestor' });
        }

        // Muda o cargo para gestor
        utilizador.Cargo = 'Gestor'
        await utilizador.save();
        res.status(201).json({ message: 'Utilizador promovido a gestor', id: utilizador.ID_Utilizador });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao promover utilizador', error: error.message });
    }
};

// Buscar todos os gestores
exports.mostrarGestores = async (req, res) => {
    try {
        if(!req.user.isAdmin) return res.status(401).send({ error: 'Função restrita a admin'})

        const gestores = await Utilizador.findAll({ where: { Cargo: 'Gestor' } });
        res.status(200).json(gestores);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar gestores', error: error.message });
    }
};

// Buscar um gestor por ID
exports.mostrarGestorID = async (req, res) => {
    try {
        if(!req.user.isAdmin) return res.status(401).send({ error: 'Função restrita a admin'})

        const { id } = req.params;
        const gestor = await Utilizador.findByPk(id, { where: { Cargo: 'Gestor' } });

        if (!gestor) {
            return res.status(404).json({ message: 'Gestor não encontrado' });
        }

        res.status(200).json(gestor);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar gestor', error: error.message });
    }
};

// Remover um gestor (Rebaixar para utilizador comum) e apagar o café associado
exports.despromoverGestor = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(401).json({ error: 'Função restrita a admin' });
        }

        const { id } = req.params;

        // Verificar se o utilizador existe
        const utilizador = await Utilizador.findByPk(id);
        if (!utilizador) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }

        if (utilizador.Cargo !== 'Gestor') {
            return res.status(400).json({ message: 'Este utilizador não é um gestor.' });
        }

        // Procurar o gestor na tabela Gestores para verificar se tem um café associado
        const gestor = await Gestor.findOne({
            where: { ID_Utilizador: id },
            include: {
                model: Cafe,
                attributes: ['ID_Cafe', 'Imagem_Cafe']
            }
        });

        if (gestor && gestor.Cafe) {
            // Se tiver um café associado, remover o café e a imagem
            const cafe = gestor.Cafe;

            if (cafe.Imagem_Cafe !== 'default.png') {
                const oldImagePath = path.resolve(__dirname, "..", "uploads", "cafes", cafe.Imagem_Cafe);
                try {
                    await fs.promises.access(oldImagePath, fs.constants.F_OK);
                    await fs.promises.unlink(oldImagePath);
                } catch (err) {
                    console.error('Erro ao remover a imagem do café:', err);
                }
            }

            await cafe.destroy();

            // Remover o gestor da tabela `Gestores`
            await gestor.destroy();
        }

        // Atualizar o cargo do utilizador para "Utilizador"
        utilizador.Cargo = 'Utilizador';
        await utilizador.save();

        res.status(200).json({ message: 'Gestor despromovido para utilizador. Café associado apagado se existisse.' });

    } catch (error) {
        console.error('Erro ao despromover gestor:', error);
        res.status(500).json({ message: 'Erro ao despromover gestor', error: error.message });
    }
};