const Reservas = require('../models/reservasModel');

const Cafes = require('../models/cafeModel');
const Mesas = require('../models/mesasModel');
const Utilizadores = require('../models/utilizadorModel');

// Obter todas as reservas
exports.mostrarReservas = async (req, res) => {
    try {
        const reservas = await Reservas.findAll({
            include: [
                { model: Cafes, attributes: ['Nome_Cafe'] },
                { model: Mesas, attributes: ['Lugares'] },
                { model: Utilizadores, attributes: ['Nome', 'Email'] }
            ]
        });
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obter reservas do utilizador autenticado
exports.mostrarReservasUtilizador = async (req, res) => {
    try {
        const ID_Utilizador = req.user.id; // ID do utilizador autenticado

        const reservas = await Reservas.findAll({
            where: { ID_Utilizador },
            include: [
                { model: Cafes, attributes: ['Nome_Cafe', 'Local'] },
                { model: Mesas, attributes: ['Lugares'] }
            ]
        });

        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Criar uma nova reserva
exports.criarReserva = async (req, res) => {
    try {
        const { ID_Mesa, Data_Hora } = req.body;
        const ID_Utilizador = req.user.id; // Utilizador autenticado

        // Verificar se a mesa existe
        const mesa = await Mesas.findByPk(ID_Mesa);
        if (!mesa) {
            return res.status(404).json({ error: "Mesa não encontrada." });
        }

        // Criar a reserva
        const novaReserva = await Reservas.create({
            ID_Cafe: mesa.ID_Cafe,
            ID_Mesa,
            ID_Utilizador,
            Data_Hora
        });

        res.status(201).json(novaReserva);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Atualizar uma reserva (Apenas o utilizador que reservou pode alterar)
exports.atualizarReserva = async (req, res) => {
    try {
        const { id } = req.params; // ID da reserva a ser alterada
        const { ID_Mesa, Data_Hora } = req.body;
        const ID_Utilizador = req.user.id; // Utilizador autenticado

        // Verificar se a reserva pertence ao utilizador autenticado
        const reserva = await Reservas.findOne({
            where: { ID_Reserva: id, ID_Utilizador }
        });

        if (!reserva) {
            return res.status(404).json({ error: "Reserva não encontrada ou não pertence a este utilizador." });
        }

        // Verificar se a nova mesa pertence ao mesmo café da reserva original
        if (ID_Mesa) {
            const novaMesa = await Mesas.findOne({ where: { ID_Mesa } });
            if (!novaMesa || novaMesa.ID_Cafe !== reserva.ID_Cafe) {
                return res.status(400).json({ error: "A mesa escolhida não pertence ao mesmo café da reserva." });
            }
        }

        // Atualizar a reserva com a nova mesa e/ou data
        await reserva.update({
            ID_Mesa: ID_Mesa || reserva.ID_Mesa, // Manter o valor anterior se não for enviado um novo
            Data_Hora: Data_Hora || reserva.Data_Hora
        });

        res.json({ message: "Reserva atualizada com sucesso!", reserva });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Apagar uma reserva (Apenas o utilizador que reservou pode remover)
exports.apagarReserva = async (req, res) => {
    try {
        const { id } = req.params;
        const ID_Utilizador = req.user.id;

        const reserva = await Reservas.findByPk(id);
        if (!reserva) {
            return res.status(404).json({ error: "Reserva não encontrada." });
        }

        // Verificar se o utilizador é dono da reserva
        if (reserva.ID_Utilizador !== ID_Utilizador) {
            return res.status(403).json({ error: "Não tem permissão para apagar esta reserva." });
        }

        await reserva.destroy();
        res.status(200).json({ message: "Reserva apagada com sucesso." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
