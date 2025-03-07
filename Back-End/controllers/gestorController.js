const Gestor = require('../models/gestorModel');
const Utilizador = require('../models/utilizadorModel');

// Promover um utilizador a gestor
const promoverParaGestor = async (req, res) => {
    try {
        const { ID_Utilizador } = req.body;

        // Verifica se o utilizador existe
        const utilizador = await Utilizador.findByPk(ID_Utilizador);
        if (!utilizador) {
            return res.status(404).json({ message: 'Utilizador não encontrado' });
        }

        // Verifica se já é um gestor
        const gestorExistente = await Gestor.findOne({ where: { ID_Utilizador } });
        if (gestorExistente) {
            return res.status(400).json({ message: 'Utilizador já é um gestor' });
        }

        // Cria o gestor
        const novoGestor = await Gestor.create({ ID_Utilizador });
        res.status(201).json({ message: 'Utilizador promovido a gestor', gestor: novoGestor });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao promover utilizador', error: error.message });
    }
};

// Buscar todos os gestores
const mostrarGestores = async (req, res) => {
    try {
        const gestores = await Gestor.findAll({ include: Utilizador });
        res.status(200).json(gestores);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar gestores', error: error.message });
    }
};

// Buscar um gestor por ID
const mostrarGestorID = async (req, res) => {
    try {
        const { id } = req.params;
        const gestor = await Gestor.findByPk(id, { include: Utilizador });

        if (!gestor) {
            return res.status(404).json({ message: 'Gestor não encontrado' });
        }

        res.status(200).json(gestor);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar gestor', error: error.message });
    }
};

// Remover um gestor (Rebaixar para utilizador comum)
const apagarGestor = async (req, res) => {
    try {
        const { id } = req.params;
        const gestor = await Gestor.findByPk(id);

        if (!gestor) {
            return res.status(404).json({ message: 'Gestor não encontrado' });
        }

        await gestor.destroy();
        res.status(200).json({ message: 'Gestor removido com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover gestor', error: error.message });
    }
};

module.exports = {
    promoverParaGestor,
    mostrarGestores,
    mostrarGestorID,
    apagarGestor
};
