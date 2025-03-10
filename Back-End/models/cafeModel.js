const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');

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
        type: DataTypes.TINYINT, 
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'O valor tem de ser entre 0 e 1.' // 0 é o café que tem jogos
            },
            max: {
                args: [1],
                msg: 'O valor tem de ser entre 0 e 1' // 1 é o café que nao tem jogos mas permite jogar
            },
            isInt: {
                msg: 'Tem de ser um número entre 0 e 1.'
            }
        }
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
    
}, { 
    tableName: 'Cafes', 
    timestamps: false 
});


module.exports = Cafe;
