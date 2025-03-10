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
        allowNull: false
    },
    Notas_Jogo: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    Preco: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    Quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
}, {
    tableName: 'Jogos',
    timestamps: false 
});


Jogos.belongsTo(Cafes, { foreignKey: 'ID_Cafe', onDelete: 'CASCADE' });

module.exports = Jogos;
