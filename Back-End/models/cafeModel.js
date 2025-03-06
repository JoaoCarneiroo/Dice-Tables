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
        type: DataTypes.STRING, 
        allowNull: false 
    },
    Horario_Abertura: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        validate: {
            min: 0,
            max: 23,
            isInt: true,
        }
    },
    Horario_Fecho: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        validate: {
            min: 0,
            max: 23,
            isInt: true,
        }
    },
}, { 
    tableName: 'Cafes', 
    timestamps: false 
});

module.exports = Cafe;
