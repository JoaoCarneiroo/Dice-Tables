const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');
const Cafes = require('../models/cafeModel');

const Jogos = sequelize.define('Jogos', {
    ID_Jogo: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true 
    },
    ID_Cafe: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Cafes,
            key: 'ID_Cafe'
        },
        onDelete: 'CASCADE' // Se o café for apagado, os jogos também serão removidos
    },
    Nome_Jogo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'O nome do jogo é obrigatório.' },
            notEmpty: { msg: 'O nome do jogo não pode estar vazio.' }
        }
    },
    Notas_Jogo: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    Preco: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            notNull: { msg: 'O preço é obrigatório.' },
            isNumeric: { msg: 'O preço deve ser um número.' },
            min: {
                args: [0],
                msg: 'O preço não pode ser negativo.'
            }
        }
    },
    Quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            notNull: { msg: 'A quantidade é obrigatória.' },
            isInt: { msg: 'A quantidade deve ser um número inteiro.' },
            min: {
                args: [1],
                msg: 'A quantidade deve ser pelo menos 1.'
            }
        }
    }
}, {
    tableName: 'Jogos',
    timestamps: false 
});


Jogos.belongsTo(Cafes, { foreignKey: 'ID_Cafe', onDelete: 'CASCADE' });

module.exports = Jogos;
