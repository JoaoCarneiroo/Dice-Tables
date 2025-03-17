const Utilizador = require('../models/utilizadorModel');

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

// Remover um gestor (Rebaixar para utilizador comum)
exports.despromoverGestor = async (req, res) => {
    try {
        if(!req.user.isAdmin) return res.status(401).send({ error: 'Função restrita a admin'})

        const { id } = req.params;
        const utilizador = await Utilizador.findByPk(id);

        if (!utilizador) {
            return res.status(404).json({ message: 'Gestor não encontrado' });
        }

        utilizador.Cargo = 'Utilizador'
        await utilizador.save();
        res.status(200).json({ message: 'Gestor despromovido para utilizador' });


    } catch (error) {
        res.status(500).json({ message: 'Erro ao despromover gestor', error: error.message });
    }
};

