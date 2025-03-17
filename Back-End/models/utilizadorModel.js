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
        validate: {
            is: {
                args: /^[A-Za-zÀ-ÿ\s]+$/i,
                msg: 'O nome deve conter apenas letras e espaços.'
            },
        }
    },
    Email: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: {
            msg: 'Este email já está registado. Tente outro email.'
        },
        validate: {
            isEmail: {
                msg: 'O email fornecido é inválido.'
            },
        }
    },
    Password: { 
        type: DataTypes.STRING, 
        allowNull: false,
    },
    Cargo: {
        type: DataTypes.ENUM,
        values: ['Utilizador', 'Gestor', 'Administrador'], 
        allowNull: false,
        defaultValue: 'Utilizador',
        validate: {
            isIn: {
                args: [['Utilizador', 'Gestor', 'Administrador']],
                msg: 'Cargo inválido. Os valores válidos são: Utilizador, Gestor, Administrador.'
            }
        }
    }
}, { 
    tableName: 'Utilizadores', 
    timestamps: false 
});


module.exports = Utilizador;
