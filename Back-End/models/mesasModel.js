const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');
const Cafe = require('../models/cafeModel');

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
        }
    },
    Lugares: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
    },
    
}, { 
    tableName: 'Mesas', 
    timestamps: false 
});

Cafe.hasMany(Mesas, { foreignKey: 'ID_Cafe' });
Mesas.belongsTo(Cafe, { foreignKey: 'ID_Cafe' });


module.exports = Mesas;
