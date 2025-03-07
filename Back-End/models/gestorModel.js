const { DataTypes } = require('sequelize');
const sequelize = require('../Database/sequelize');
const Cafe = require('../models/cafeModel');
const Utilizador = require('../models/utilizadorModel'); 

const Gestor = sequelize.define('Gestor', {
    ID_Gestor: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true,
        unique: true
    },
    ID_Utilizador: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: {
            model: Utilizador, // Ligação ao utilizador que é gestor
            key: 'ID_Utilizador'
        }
    }
}, { 
    tableName: 'Gestores', 
    timestamps: false 
});

// Um utilizador pode ser gestor de vários cafés
Utilizador.hasMany(Gestor, { foreignKey: 'ID_Utilizador' });
Gestor.belongsTo(Utilizador, { foreignKey: 'ID_Utilizador' });

// Um gestor pode gerir vários cafés


module.exports = Gestor;
