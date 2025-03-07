const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');
const Gestor = require('../models/gestorModel');

const Cafe = sequelize.define('Cafe', {
    ID_Cafe: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true,
        unique: true 
    },
    Nome_Cafe: { 
        type: DataTypes.STRING, 
        allowNull: false,
        unique: true 
    },
    Imagem_Cafe: { 
        type: DataTypes.BLOB('long') 
    },
    Local: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    Tipo_Cafe: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    Horario_Abertura: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'O horário de abertura deve ser no mínimo 0 (meia-noite).'
            },
            max: {
                args: [23],
                msg: 'O horário de abertura deve ser no máximo 23 (11 da noite).'
            },
            isInt: {
                msg: 'O horário de abertura deve ser um número inteiro entre 0 e 23.'
            }
        }
    },
    Horario_Fecho: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'O horário de fecho deve ser no mínimo 0 (meia-noite).'
            },
            max: {
                args: [23],
                msg: 'O horário de fecho deve ser no máximo 23 (11 da noite).'
            },
            isInt: {
                msg: 'O horário de fecho deve ser um número inteiro entre 0 e 23.'
            }
        }
    },
    ID_Gestor: { // Este campo faz a associação do café ao gestor
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Gestor,
            key: 'ID_Gestor'
        }
    }
}, { 
    tableName: 'Cafes', 
    timestamps: false 
});

// Relacionamentos
Cafe.belongsTo(Gestor, { foreignKey: 'ID_Gestor' });
Gestor.hasMany(Cafe, { foreignKey: 'ID_Gestor' });

module.exports = Cafe;
