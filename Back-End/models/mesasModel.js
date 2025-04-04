const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');
const Cafes = require('../models/cafeModel');

const Mesas = sequelize.define('Mesas', {
    ID_Mesa: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true,
        unique: true 
    },
    ID_Cafe: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
            model: 'Cafes',
            key: 'ID_Cafe'
        },
        onDelete: 'CASCADE' // Se o café for apagado também são apagadas as Mesas
    },
    Lugares: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'Uma mesa deve ter pelo menos 1 lugar.'
            },
            isInt: {
                msg: 'O número de lugares deve ser um inteiro.'
            }
        }
    },
    
}, { 
    tableName: 'Mesas', 
    timestamps: false 
});


Cafes.hasMany(Mesas, { foreignKey: 'ID_Cafe' });
Mesas.belongsTo(Cafes, { foreignKey: 'ID_Cafe', onDelete: 'CASCADE'  });

module.exports = Mesas;
