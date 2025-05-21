const Reservas = require('../models/reservasModel');

const Cafes = require('../models/cafeModel');
const Mesas = require('../models/mesasModel');
const Utilizadores = require('../models/utilizadorModel');
const Jogos = require('../models/jogosModel');
const Utilizadores_Grupos = require('../models/utilizadorGrupoModel');
const Grupos = require('../models/gruposModel');

const { Op } = require('sequelize');
const { DateTime } = require('luxon');

// Verifica se a reserva está dentro do horário do café (horaInicio e horaFim são strings ISO)

const isWithinCafeHours = (horaInicioISO, horaFimISO, horarioAberturaStr, horarioFechoStr) => {
    // Pega horas e minutos do café
    const [abrHora, abrMin] = horarioAberturaStr.split(':').map(Number);
    const [fecHora, fecMin] = horarioFechoStr.split(':').map(Number);

    // Parseia as datas como UTC, usando o construtor Date com string ISO que já é UTC
    const inicio = new Date(horaInicioISO);
    let fim = new Date(horaFimISO);

    // Se Hora_Fim for antes ou igual Hora_Inicio, adiciona 1 dia a Hora_Fim (reservas que atravessam a meia-noite)
    if (fim <= inicio) {
        fim.setUTCDate(fim.getUTCDate() + 1);
    }

    // Cria datas de abertura e fecho no mesmo dia de inicio, no UTC
    const abertura = new Date(inicio);
    abertura.setUTCHours(abrHora, abrMin, 0, 0);

    const fecho = new Date(inicio);
    fecho.setUTCHours(fecHora, fecMin, 0, 0);

    // Se fecho for menor ou igual a abertura, é do dia seguinte
    if (fecho <= abertura) {
        fecho.setUTCDate(fecho.getUTCDate() + 1);
    }

    console.log('--- VERIFICAÇÃO DE HORÁRIO DO CAFÉ (UTC) ---');
    console.log('Hora Início:', inicio.toISOString());
    console.log('Hora Fim:', fim.toISOString());
    console.log('Abertura:', abertura.toISOString());
    console.log('Fecho:', fecho.toISOString());

    return inicio >= abertura && fim <= fecho;
};

// Verifica se a data está no futuro
const isInFuture = (data) => {
    const agora = new Date();
    return new Date(data) > agora;
};

// Verifica se a duração da reserva é válida (máximo 4 horas e > 0)
const isDurationValid = (horaInicio, horaFim) => {
    let inicio = new Date(horaInicio);
    let fim = new Date(horaFim);

    // Se Hora_Fim for antes ou igual Hora_Inicio, adiciona 1 dia a Hora_Fim
    if (fim <= inicio) {
        fim.setDate(fim.getDate() + 1);
    }

    const diffHoras = (fim - inicio) / (1000 * 60 * 60);
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
                { model: Grupos, attributes: ['Nome_Grupo', 'Lugares_Grupo'] },
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
        let horaInicio = new Date(Hora_Inicio);
        let horaFim = new Date(Hora_Fim);

        if (horaFim <= horaInicio) {
            horaFim.setDate(horaFim.getDate() + 1);
        }

        // Verificar se a data/hora de início é no futuro
        if (!isInFuture(horaInicio)) {
            return res.status(400).json({ error: 'A data/hora de início da reserva deve ser no futuro.' });
        }
        if (!isInFuture(horaFim)) {
            return res.status(400).json({ error: 'A data/hora de fim da reserva deve ser no futuro.' });
        }

        if (!isDurationValid(horaInicio, horaFim)) {
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
        // Exemplo: passando o timezone do café (deve obter isso do banco ou setar padrão)
        if (!isWithinCafeHours(horaInicio.toISOString(), horaFim.toISOString(), cafe.Horario_Abertura, cafe.Horario_Fecho)) {
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
            Hora_Inicio: horaInicio,
            Hora_Fim: horaFim
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

        // Associar o grupo ao Utilizadores_Grupos
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

// Atualizar uma reserva (Apenas o utilizador que reservou pode alterar)
exports.atualizarReserva = async (req, res) => {
    try {
        const ID_Reserva = req.params.id;
        const { Hora_Inicio, Hora_Fim, Lugares_Grupo } = req.body;
        const ID_Utilizador = req.user.id;

        // Verificar se a reserva existe e pertence ao utilizador autenticado
        const reserva = await Reservas.findOne({
            where: { ID_Reserva, ID_Utilizador }
        });

        if (!reserva) {
            return res.status(404).json({ error: 'Reserva não encontrada ou não pertence ao utilizador.' });
        }

        // Validar e atualizar apenas os campos permitidos
        const cafe = await Cafes.findByPk(reserva.ID_Cafe);
        if (!cafe) {
            return res.status(404).json({ error: 'Café não encontrado.' });
        }

        // Verificar se a nova data/hora de início é no futuro
        if (Hora_Inicio && !isInFuture(Hora_Inicio)) {
            return res.status(400).json({ error: 'A nova data/hora de início deve ser no futuro.' });
        }

        // Verificar se a nova data/hora de fim é no futuro
        if (Hora_Fim && !isInFuture(Hora_Fim)) {
            return res.status(400).json({ error: 'A nova data/hora de fim deve ser no futuro.' });
        }

        // Verificar a duração da reserva (máximo de 4 horas)
        if (Hora_Inicio && Hora_Fim && !isDurationValid(Hora_Inicio, Hora_Fim)) {
            return res.status(400).json({ error: 'A duração da reserva deve ser no máximo 4 horas.' });
        }

        // Verificar se a reserva está dentro do horário de funcionamento do café
        if (Hora_Inicio && Hora_Fim && !isWithinCafeHours(Hora_Inicio, Hora_Fim, cafe.Horario_Abertura, cafe.Horario_Fecho)) {
            return res.status(400).json({
                error: `A reserva deve estar entre as ${cafe.Horario_Abertura}h e ${cafe.Horario_Fecho}h, horário de funcionamento do café.`
            });
        }

        // Atualizar os campos que forem fornecidos
        if (Hora_Inicio) reserva.Hora_Inicio = Hora_Inicio;
        if (Hora_Fim) reserva.Hora_Fim = Hora_Fim;

        // Verificar a mesa para a validade de Lugares_Grupo
        if (Lugares_Grupo) {
            const mesa = await Mesas.findByPk(reserva.ID_Mesa);
            if (Lugares_Grupo >= mesa.Lugares) {
                return res.status(400).json({ error: 'O número de lugares do grupo não pode ser superior ou igual ao número de lugares da mesa.' });
            }

            // Atualizar o grupo se houver
            const grupo = await Grupos.findOne({ where: { ID_Reserva: reserva.ID_Reserva } });
            if (grupo) {
                grupo.Lugares_Grupo = Lugares_Grupo;
                await grupo.save();
            }
        }

        // Salvar a reserva atualizada
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

// Mostrar as reservas que tiverem lugares de grupo disponíveis em um café
exports.mostrarReservasComLugares = async (req, res) => {
    try {
        const id = req.params.id;

        // Obter todas as reservas do café com lugares de grupo disponíveis
        const reservas = await Reservas.findAll({
            where: { ID_Cafe: id },
            include: [
                {
                    model: Grupos,
                    where: { Lugares_Grupo: { [Op.gt]: 0 } },
                    required: false
                }
            ]
        });

        if (reservas.length === 0) {
            return res.status(204).json({ message: 'Não há reservas com lugares disponíveis neste café.' });
        }

        res.status(200).json(reservas);
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


exports.mostrarReservasGrupo = async (req, res) => {
    try {
        const ID_Utilizador = req.user.id;

        const utilizadorGrupos = await Utilizadores_Grupos.findAll({
            where: { ID_Utilizador },
            include: [
                {
                    model: Grupos,
                    attributes: ['ID_Grupo', 'Nome_Grupo', 'Lugares_Grupo'],

                    include: [
                        {
                            model: Reservas,
                            required: true,
                            where: {
                                ID_Utilizador: { [Op.ne]: ID_Utilizador } // Ignorar Reservas criadas pelo próprio
                            },
                            include: [
                                { model: Cafes, attributes: ['Nome_Cafe'] },
                                { model: Mesas, attributes: ['Nome_Mesa', 'Lugares'] },
                                { model: Jogos, attributes: ['Nome_Jogo'] }
                            ]
                        }
                    ]
                }
            ]
        });

        // Garantir que só devolvemos reservas válidas com grupo oe reserva associada
        const reservasComGrupo = utilizadorGrupos
            .filter(entry => entry.Grupo && entry.Grupo.Reserva)
            .map(entry => ({
                ID_Grupo: entry.ID_Grupo,
                Nome_Grupo: entry.Grupo.Nome_Grupo,
                Lugares_Grupo: entry.Grupo.Lugares_Grupo,
                Reserva: entry.Grupo.Reserva
            }));

        if (reservasComGrupo.length === 0) {
            return res.status(204).json({ message: 'Não está inscrito em nenhuma reserva de grupo que não tenha feito.' });
        }

        res.status(200).json(reservasComGrupo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Sair de um grupo da reserva que o Utilizador se Juntou
exports.sairGrupo = async (req, res) => {
    try {
        const { id } = req.params;
        const ID_Utilizador = req.user.id;

        // Verificar se o grupo existe
        const grupo = await Grupos.findByPk(id);
        if (!grupo) {
            return res.status(404).json({ error: 'Grupo não encontrado.' });
        }

        // Verificar se o utilizador está no grupo
        const utilizadorGrupo = await Utilizadores_Grupos.findOne({
            where: { ID_Grupo: id, ID_Utilizador }
        });

        if (!utilizadorGrupo) {
            return res.status(400).json({ error: 'Não está neste grupo.' });
        }

        // Adicionar um lugar ao grupo
        grupo.Lugares_Grupo += 1;

        // Remover o utilizador do grupo
        await utilizadorGrupo.destroy();

        //Salvar as alterações no grupo
        await grupo.save();

        res.status(200).json({ message: 'Utilizador removido do grupo com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};