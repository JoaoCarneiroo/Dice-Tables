const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');
const Utilizadores_Grupos = require('../models/utilizadorGrupoModel');
const Reservas = require('../models/reservasModel');

const Grupos = sequelize.define('Grupos', {
    ID_Grupo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    ID_Reserva: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Reservas,
            key: 'ID_Reserva'
        },
        onDelete: 'CASCADE' 
    },
    Nome_Grupo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'O nome do grupo é obrigatório.' },
            notEmpty: { msg: 'O nome do grupo não pode estar vazio.' }
        }
    },
    Lugares_Grupo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { msg: 'O número de lugares é obrigatório.' },
            notEmpty: { msg: 'O número de lugares não pode estar vazio.' }
        }
    },
}, {
    tableName: 'Grupos',
    timestamps: false
});

Grupos.belongsTo(Reservas, { foreignKey: 'ID_Reserva' });
Reservas.hasOne(Grupos, { foreignKey: 'ID_Reserva' });

Grupos.hasMany(Utilizadores_Grupos, { foreignKey: 'ID_Grupo' });
Utilizadores_Grupos.belongsTo(Grupos, { foreignKey: 'ID_Grupo' });

module.exports = Grupos;
