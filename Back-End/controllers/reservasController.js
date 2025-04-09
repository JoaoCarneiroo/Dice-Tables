const Reservas = require('../models/reservasModel');

const Cafes = require('../models/cafeModel');
const Mesas = require('../models/mesasModel');
const Utilizadores = require('../models/utilizadorModel');
const Jogos = require('../models/jogosModel');

const { Op } = require('sequelize');

const isWithinCafeHours = (horaInicio, horaFim, horarioAbertura, horarioFecho) => {
    const horaInicioInt = new Date(horaInicio).getHours();
    const horaFimInt = new Date(horaFim).getHours();

    return horaInicioInt >= horarioAbertura && horaFimInt <= horarioFecho;
};

const isInFuture = (data) => {
    const agora = new Date();
    return new Date(data) > agora;
};

const isDurationValid = (horaInicio, horaFim) => {
    const inicio = new Date(horaInicio);
    const fim = new Date(horaFim);
    const diffHoras = (fim - inicio) / (1000 * 60 * 60); // Máximo 4 Horas
    return diffHoras > 0 && diffHoras <= 4;
};

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


exports.criarReserva = async (req, res) => {
    try {
        const { ID_Mesa, ID_Jogo, Hora_Inicio, Hora_Fim } = req.body;

        // Verificar se a data/hora de início é no futuro
        if (!isInFuture(Hora_Inicio)) {
            return res.status(400).json({ error: 'A data/hora de início da reserva deve ser no futuro.' });
        }
        if (!isInFuture(Hora_Fim)) {
            return res.status(400).json({ error: 'A data/hora de fim da reserva deve ser no futuro.' });
        }

        if (!isDurationValid(Hora_Inicio, Hora_Fim)) {
            return res.status(400).json({ error: 'A duração da reserva deve ser no máximo 4 horas.' });
        }

        const ID_Utilizador = req.user.id;

        // Verificar se a mesa existe e obter o ID_Cafe associado
        const mesa = await Mesas.findByPk(ID_Mesa);
        if (!mesa) {
            return res.status(404).json({ error: 'Mesa não encontrada.' });
        }
        const ID_Cafe = mesa.ID_Cafe;


        // Obter dados do café para verificar o horário
        const cafe = await Cafes.findByPk(ID_Cafe);
        if (!cafe) {
            return res.status(404).json({ error: 'Café não encontrado.' });
        }

        // Verificar se a reserva está dentro do horário de funcionamento do café
        if (!isWithinCafeHours(Hora_Inicio, Hora_Fim, cafe.Horario_Abertura, cafe.Horario_Fecho)) {
            return res.status(400).json({
                error: `A reserva deve estar entre as ${cafe.Horario_Abertura}h e ${cafe.Horario_Fecho}h, horário de funcionamento do café.`
            });
        }

        // Verificar se já existe uma reserva na mesma mesa no horário escolhido
        const reservaExistente = await Reservas.findOne({
            where: {
                ID_Mesa,
                [Op.or]: [
                    { Hora_Inicio: { [Op.between]: [Hora_Inicio, Hora_Fim] } },
                    { Hora_Fim: { [Op.between]: [Hora_Inicio, Hora_Fim] } }
                ]
            }
        });

        if (reservaExistente) {
            return res.status(400).json({ error: 'Esta mesa já está reservada neste horário.' });
        }

        // Verificar se o jogo pertence ao café da mesa e tem stock disponível
        const jogo = await Jogos.findOne({
            where: { ID_Jogo, ID_Cafe }
        });

        if (!jogo) {
            return res.status(404).json({ error: 'Este jogo não pertence a este café.' });
        }

        if (jogo.Quantidade < 1) {
            return res.status(400).json({ error: 'Este jogo está sem stock no momento.' });
        }

        // Criar a reserva
        const novaReserva = await Reservas.create({
            ID_Cafe,
            ID_Mesa,
            ID_Utilizador,
            ID_Jogo,
            Hora_Inicio,
            Hora_Fim
        });

        // Reduzir o stock do jogo
        await jogo.update({ Quantidade: jogo.Quantidade - 1 });

        res.status(201).json({ message: 'Reserva criada com sucesso!', reserva: novaReserva });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Atualizar uma reserva (Apenas o utilizador que reservou pode alterar)
exports.atualizarReserva = async (req, res) => {
    try {
        const ID_Reserva = req.params.id;
        const { ID_Mesa, ID_Jogo, Hora_Inicio, Hora_Fim } = req.body;
        const ID_Utilizador = req.user.id;

        // Verificar se a reserva existe e pertence ao utilizador autenticado
        const reserva = await Reservas.findOne({
            where: { ID_Reserva, ID_Utilizador }
        });

        if (!reserva) {
            return res.status(404).json({ error: 'Reserva não encontrada ou não pertence ao utilizador.' });
        }

        // Verificar se a nova mesa existe e pertence ao mesmo café
        if (ID_Mesa && ID_Mesa !== reserva.ID_Mesa) {
            const novaMesa = await Mesas.findByPk(ID_Mesa);
            if (!novaMesa || novaMesa.ID_Cafe !== reserva.ID_Cafe) {
                return res.status(400).json({ error: 'A mesa selecionada não existe ou não pertence ao mesmo café.' });
            }

            // Verificar se a nova mesa já está reservada no horário selecionado
            const reservaExistente = await Reservas.findOne({
                where: {
                    ID_Mesa,
                    [Op.or]: [
                        { Hora_Inicio: { [Op.between]: [Hora_Inicio, Hora_Fim] } },
                        { Hora_Fim: { [Op.between]: [Hora_Inicio, Hora_Fim] } }
                    ]
                }
            });

            if (reservaExistente) {
                return res.status(400).json({ error: 'A nova mesa já está reservada neste horário.' });
            }

            reserva.ID_Mesa = ID_Mesa;
        }

        // Verificar se o novo jogo pertence ao mesmo café e tem stock disponível
        if (ID_Jogo && ID_Jogo !== reserva.ID_Jogo) {
            const novoJogo = await Jogos.findOne({
                where: { ID_Jogo, ID_Cafe: reserva.ID_Cafe }
            });

            if (!novoJogo) {
                return res.status(400).json({ error: 'O jogo selecionado não existe ou não pertence a este café.' });
            }

            if (novoJogo.Quantidade < 1) {
                return res.status(400).json({ error: 'O jogo selecionado está sem stock.' });
            }

            // Restaurar o stock do jogo anterior
            const jogoAntigo = await Jogos.findByPk(reserva.ID_Jogo);
            if (jogoAntigo) {
                await jogoAntigo.update({ Quantidade: jogoAntigo.Quantidade + 1 });
            }

            // Reduzir o stock do novo jogo
            await novoJogo.update({ Quantidade: novoJogo.Quantidade - 1 });

            reserva.ID_Jogo = ID_Jogo;
        }

        // Atualizar horários se forem fornecidos
        if (Hora_Inicio) reserva.Hora_Inicio = Hora_Inicio;
        if (Hora_Fim) reserva.Hora_Fim = Hora_Fim;


        const cafe = await Cafes.findByPk(reserva.ID_Cafe);
        if (!cafe) {
            return res.status(404).json({ error: 'Café não encontrado.' });
        }

        if (!isInFuture(reserva.Hora_Inicio)) {
            return res.status(400).json({ error: 'A nova data/hora de início deve ser no futuro.' });
        }

        if (!isInFuture(reserva.Hora_Fim)) {
            return res.status(400).json({ error: 'A nova data/hora de fim deve ser no futuro.' });
        }

        if (!isDurationValid(reserva.Hora_Inicio, reserva.Hora_Fim)) {
            return res.status(400).json({ error: 'A duração da reserva deve ser no máximo 4 horas.' });
        }

        // Verificar se a reserva está dentro do horário de funcionamento do café
        if (!isWithinCafeHours(reserva.Hora_Inicio, reserva.Hora_Fim, cafe.Horario_Abertura, cafe.Horario_Fecho)) {
            return res.status(400).json({
                error: `A reserva deve estar entre as ${cafe.Horario_Abertura}h e ${cafe.Horario_Fecho}h, horário de funcionamento do café.`
            });
        }

        await reserva.save();

        res.status(200).json({ message: 'Reserva atualizada com sucesso!', reserva });

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
