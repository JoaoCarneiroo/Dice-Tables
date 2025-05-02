const Reservas = require('../models/reservasModel');

const Cafes = require('../models/cafeModel');
const Mesas = require('../models/mesasModel');
const Utilizadores = require('../models/utilizadorModel');
const Jogos = require('../models/jogosModel');
const Utilizadores_Grupos = require('../models/utilizadorGrupoModel');
const Grupos = require('../models/gruposModel');

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
        const ID_Utilizador = req.user.id;

        const reservas = await Reservas.findAll({
            where: { ID_Utilizador },
            include: [
                // { model: Cafes, attributes: ['Nome_Cafe', 'Local'] },
                // { model: Mesas, attributes: ['Lugares'] },
                // { model: Jogos, attributes: ['Nome_Jogo'] }
            ]
        });

        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Criação de uma Reserva
exports.criarReserva = async (req, res) => {
    try {
        const { ID_Mesa, ID_Jogo, Hora_Inicio, Hora_Fim, Nome_Grupo, Lugares_Grupo } = req.body;

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

        // Obter dados do café para verificar o horário e tipo
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

        let jogo = null;

        if (cafe.Tipo_Cafe === 0) {
            // Café com jogos — jogo é opcional
            if (ID_Jogo) {
                jogo = await Jogos.findOne({ where: { ID_Jogo, ID_Cafe } });

                if (!jogo) {
                    return res.status(404).json({ error: 'Este jogo não pertence a este café.' });
                }

                if (jogo.Quantidade < 1) {
                    return res.status(400).json({ error: 'Este jogo está sem stock no momento.' });
                }
            }
        } else {
            // Café sem jogos — não pode ter jogo associado
            if (ID_Jogo) {
                return res.status(400).json({ error: 'Este café não permite reservas com jogos.' });
            }
        }

        // Selecionar o ID de todas as reservas existentes desse café
        const reservasExistentes = await Reservas.findAll({
            where: { ID_Cafe },
            attributes: ['ID_Reserva']
        });

        // Verificar todos os grupos associados a esse café e se já existe um com o mesmo nome
        const gruposExistentes = await Grupos.findAll({
            where: { ID_Reserva: reservasExistentes.map(reserva => reserva.ID_Reserva) },
            attributes: ['Nome_Grupo']
        });

        // Verificar se já existe um grupo com o mesmo nome
        if (Nome_Grupo && Lugares_Grupo) {
            const grupoExistente = gruposExistentes.find(grupo => grupo.Nome_Grupo === Nome_Grupo);
            if (grupoExistente) {
                return res.status(400).json({ error: 'Já existe um grupo com esse nome.' });
            }
        }

        // Verificar se o número de lugares do grupo é válido consoante o número de lugares da mesa tendo em conta o prórpio
        if (Lugares_Grupo && Lugares_Grupo > mesa.Lugares) {
            return res.status(400).json({ error: 'O número de lugares do grupo não pode ser superior ao número de lugares da mesa.' });
        }


        if (reservasExistentes.length > 0) {
            return res.status(400).json({ error: 'Já existe uma reserva com esse nome de grupo.' });
        }




        // Validar se o o número de lugares não excede o número de lugares da mesa (contando com o próprio)
        if (Lugares_Grupo >= mesa.Lugares) {
            return res.status(400).json({ error: 'O número de lugares do grupo não pode ser superior ou igual ao número de lugares da mesa.' });
        }

        // Criar a reserva
        const novaReserva = await Reservas.create({
            ID_Cafe,
            ID_Mesa,
            ID_Utilizador,
            ID_Jogo: jogo ? jogo.ID_Jogo : null,
            Hora_Inicio,
            Hora_Fim
        });

        // Criar um grupo se o nome do grupo e o número de lugares forem fornecidos
        let grupo = null;

        if (Nome_Grupo && Lugares_Grupo) {
            grupo = await Grupos.create({
                Nome_Grupo,
                Lugares_Grupo,
                ID_Reserva: novaReserva.ID_Reserva
            });
        }

        //Associar o grupo ao Utilizadores_Grupos
        if (grupo) {
            await Utilizadores_Grupos.create({
                ID_Grupo: grupo.ID_Grupo,
                ID_Utilizador: ID_Utilizador
            });
        }

        // Reduzir o stock do jogo se necessário
        if (jogo) {
            await jogo.update({ Quantidade: jogo.Quantidade - 1 });
        }

        res.status(201).json({ message: 'Reserva criada com sucesso!', reserva: novaReserva });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obter as reservas do utilizador (que ele se juntou a um grupo e não fez a reserva)
exports.mostrarReservasGrupo = async (req, res) => {
    try {
        const ID_Utilizador = req.user.id;

        const reservas = await Utilizadores_Grupos.findAll({
            where: { ID_Utilizador },
            include: [
                {
                    model: Grupos,
                    include: [
                        {
                            model: Reservas,
                            where: {
                                ID_Utilizador: { [Op.ne]: ID_Utilizador } // exclui as reservas feitas pelo próprio utilizador
                            },
                            include: [
                                { model: Cafes, attributes: ['Nome_Cafe'] },
                                { model: Mesas, attributes: ['Lugares'] },
                                { model: Jogos, attributes: ['Nome_Jogo'] }
                            ]
                        }
                    ]
                }
            ]
        });

        /*
        [
            {
                "ID_Utilizador_Grupos": 1,
                "ID_Grupo": 1,
                "ID_Utilizador": 2,
                "Grupo": null
            }
        ]

    */

        // coloar as reservas cujo grupo não é null no array reservasComGrupo´
        // e ignorar as reservas cujo grupo é null com for each
        const reservasComGrupo = reservas.filter(reserva => reserva.Grupo !== null).map(reserva => {
            return reserva
        });

        if (reservasComGrupo.length === 0) {
            return res.status(404).json({ message: 'Não está inscrito em nenhuma reserva.' });
        }

        res.status(200).json(reservasComGrupo);

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

        // Atualizar os dados do grupo se forem fornecidos
        if (req.body.Nome_Grupo || req.body.Lugares_Grupo) {
            const grupo = await Grupos.findOne({ where: { ID_Reserva } });
            if (grupo) {
                if (req.body.Nome_Grupo) grupo.Nome_Grupo = req.body.Nome_Grupo;
                if (req.body.Lugares_Grupo) grupo.Lugares_Grupo = req.body.Lugares_Grupo;
                await grupo.save();
            }
        }


        res.status(200).json({ message: 'Reserva atualizada com sucesso!', reserva });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Endpoint para outra pessoa se juntar a um grupo existente
exports.juntarGrupo = async (req, res) => {
    try {
        const { id } = req.params;
        const ID_Utilizador = req.user.id;

        // Verificar se o grupo existe
        const grupo = await Grupos.findByPk(id);
        if (!grupo) {
            return res.status(404).json({ error: 'Grupo não encontrado.' });
        }

        // Verificar se o utilizador já está no grupo
        const utilizadorGrupo = await Utilizadores_Grupos.findOne({
            where: { ID_Grupo: id, ID_Utilizador }
        });

        //Verificar se ainda tem lugares disponíveis
        if (grupo.Lugares_Grupo <= 0) {
            return res.status(400).json({ error: 'Não há lugares disponíveis neste grupo.' });
        }

        if (utilizadorGrupo) {
            return res.status(400).json({ error: 'Já está neste grupo.' });
        }

        // Remover um lugar do grupo
        grupo.Lugares_Grupo -= 1;

        // Adicionar o utilizador ao grupo
        await Utilizadores_Grupos.create({
            ID_Grupo: id,
            ID_Utilizador
        });

        //Salvar as alterações no grupo
        await grupo.save();

        res.status(200).json({ message: 'Utilizador adicionado ao grupo com sucesso.' });
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

        // Se houver um jogo associado, restaurar o stock
        if (reserva.ID_Jogo) {
            const jogo = await Jogos.findByPk(reserva.ID_Jogo);
            if (jogo) {
                await jogo.update({ Quantidade: jogo.Quantidade + 1 });
            }
        }

        await reserva.destroy();
        res.status(200).json({ message: "Reserva apagada com sucesso." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};