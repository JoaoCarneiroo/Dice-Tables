const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');
const Grupos = require('../models/gruposModel');
const Reservas = require('../models/reservasModel');
const Utilizador = require('../models/utilizadorModel');


const Utilizadores_Grupos = sequelize.define('Utilizadores_Grupos', {
    ID_Utilizador_Grupos: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    ID_Grupo: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ID_Utilizador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Utilizador,
            key: 'ID_Utilizador'
        },
        onDelete: 'CASCADE'
    },
}, {
    tableName: 'Utilizadores_Grupos',
    timestamps: false
});


Utilizadores_Grupos.belongsTo(Utilizador, { foreignKey: 'ID_Utilizador' });


module.exports = Utilizadores_Grupos;
