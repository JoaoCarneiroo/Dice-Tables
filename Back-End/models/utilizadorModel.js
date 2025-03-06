const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');

// Função auxiliar para validar strings sem números
const isValidString = (str) => /^[A-Za-zÀ-ÿ\s]+$/.test(str);

// Função auxiliar para validar email
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
            isValidString(value) {
                if (!isValidString(value)) {
                    throw new Error('Nome deve conter apenas letras e espaços');
                }
            }
        }
    },
    Email: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true,
        validate: {
            isValidEmail(value) {
                if (!isValidEmail(value)) {
                    throw new Error('Email inválido');
                }
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
