const cron = require('node-cron');
const Reservas = require('../models/reservasModel');
const Jogos = require('../models/jogosModel');
const { Op } = require('sequelize');

// Executa a cada 1 minuto para atualizar o stock
cron.schedule('* * * * *', async () => {
    try {
        const agora = new Date();

        // Buscar reservas que já expiraram
        const reservasExpiradas = await Reservas.findAll({
            where: {
                Hora_Fim: { [Op.lte]: agora } // Reservas que já terminaram
            }
        });

        for (const reserva of reservasExpiradas) {
            // Aumentar o stock do jogo
            const jogo = await Jogos.findByPk(reserva.ID_Jogo);
            if (jogo) {
                jogo.Quantidade += 1; // Devolve o jogo ao stock
                await jogo.save();
                console.log(`Stock atualizado: ${jogo.Nome_Jogo} (${jogo.Quantidade} disponíveis)`);
            }

            // Remover reserva da base de dados
            await reserva.destroy();
            console.log(`Reserva ID ${reserva.ID_Reserva} removida.`);
        }

    } catch (error) {
        console.error('Erro ao atualizar o stock:', error.message);
    }
});

module.exports = cron;
