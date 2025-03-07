const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');
const Cafe = require('../models/cafeModel');
const Utilizador = require('../models/utilizadorModel'); 

const Gestor = sequelize.define('Gestor', {
    ID_Gestor: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true,
        unique: true,
    },
    ID_Cafe: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
            model: 'Cafes',
            key: 'ID_Cafe'
        }
    },
    ID_Utilizador: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
            model: 'Utilizadores',
            key: 'ID_Utilizador'
        }
    }
}, { 
    tableName: 'Gestores', 
    timestamps: false 
});


Utilizador.hasMany(Gestor, { foreignKey: 'ID_Utilizador' });
Gestor.belongsTo(Utilizador, { foreignKey: 'ID_Utilizador' });

Cafe.hasMany(Gestor, { foreignKey: 'ID_Cafe' });
Gestor.belongsTo(Cafe, { foreignKey: 'ID_Cafe' });


module.exports = Gestor;