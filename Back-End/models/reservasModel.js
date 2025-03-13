const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');

const Cafes = require('../models/cafeModel');
const Mesas = require('../models/mesasModel');
const Utilizadores = require('../models/utilizadorModel');
const Jogos = require('../models/jogosModel');


const Reservas = sequelize.define('Reservas', {
    ID_Reserva: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ID_Cafe: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Cafes,
            key: 'ID_Cafe'
        },
        onDelete: 'CASCADE'
    },
    ID_Mesa: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Mesas,
            key: 'ID_Mesa'
        },
        onDelete: 'CASCADE'
    },
    ID_Utilizador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Utilizadores,
            key: 'ID_Utilizador'
        },
        onDelete: 'CASCADE'
    },
    ID_Jogo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Jogos,
            key: 'ID_Jogo'
        },
        onDelete: 'CASCADE'
    },
    Hora_Inicio: { 
        type: DataTypes.DATE,
        allowNull: false
    },
    Hora_Fim: { 
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'Reservas',
    timestamps: false
});


Reservas.belongsTo(Cafes, { foreignKey: 'ID_Cafe' });
Reservas.belongsTo(Mesas, { foreignKey: 'ID_Mesa' });
Reservas.belongsTo(Utilizadores, { foreignKey: 'ID_Utilizador' });
Reservas.belongsTo(Jogos, { foreignKey: 'ID_Jogo' }); 

module.exports = Reservas;
