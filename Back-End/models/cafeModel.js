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
        validate: {
            len: {
                args: [1, 200],
                msg: 'A descrição deve ter entre 1 e 200 caracteres.'
            }
        }
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
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
            is: {
                args: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                msg: 'O horário de abertura deve estar no formato HH:MM.'
            }
        }
    },
    Horario_Fecho: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
            is: {
                args: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                msg: 'O horário de fecho deve estar no formato HH:MM.'
            }
        }
    }

}, {
    tableName: 'Cafes',
    timestamps: false,

});

module.exports = Cafe;
