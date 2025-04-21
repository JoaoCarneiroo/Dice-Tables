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
        unique: {
            msg: 'O nome do café já existe.'
        }
    },
    Descricao: { 
        type: DataTypes.STRING, 
        allowNull: false,
    },
    Imagem_Cafe: {
        type: DataTypes.STRING,
        allowNull: false, 
        defaultValue: 'default.png',
    },
    Local: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    Coordenadas: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            is: {
                args: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|(\d{1,2}))(\.\d+)?)$/,
                msg: 'As coordenadas devem estar no formato "latitude,longitude".'
            }
        }
    },
    Tipo_Cafe: {
        type: DataTypes.TINYINT, 
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'O valor tem de ser entre 0 e 1.' // 0 (Café com Jogos)
            },
            max: {
                args: [1],
                msg: 'O valor tem de ser entre 0 e 1' // 1 (Café sem Jogos)
            },
            isInt: {
                msg: 'O tipo tem de ser um número entre 0 e 1.'
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
    timestamps: false,
    
});

module.exports = Cafe;
