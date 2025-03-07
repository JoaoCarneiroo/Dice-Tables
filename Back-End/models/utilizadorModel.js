const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');

const Utilizador = sequelize.define('Utilizador', {
    ID_Utilizador: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true,
        unique: true
    },
    Nome: { 
        type: DataTypes.STRING, 
        allowNull: false,
        unique: true,
        validate: {
            is: {
                args: /^[A-Za-zÀ-ÿ\s]+$/i, // Permite apenas letras e espaços
                msg: 'Nome deve conter apenas letras e espaços'
            }
        }
    },
    Email: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true,
        validate: {
            isEmail: {
                msg: 'Email inválido'
            }
        }
    },
    Password: { 
        type: DataTypes.STRING, 
        allowNull: false 
    }
}, { 
    tableName: 'Utilizadores', 
    timestamps: false 
});

module.exports = Utilizador;
