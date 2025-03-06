require('dotenv').config();
const express = require('express');
const sequelize = require('./Database/sequelize');
const cors = require('cors');

const cafesRoutes = require('./routes/cafesRoutes');
const utilizadoresRoutes = require('./routes/utilizadoresRoutes');

//const reservasRoutes = require('./routes/reservasRoutes');


const app = express();
app.use(cors());
app.use(express.json());


app.use('/cafes', cafesRoutes);
app.use('/autenticar', utilizadoresRoutes);

//app.use('/reservas', reservasRoutes);

// Sincronizar Sequelize

sequelize.query('PRAGMA foreign_keys=off;') // Disable foreign key checks
  .then(() => {
    sequelize.sync({ force: true })
      .then(() => {
        console.log('Banco de dados sincronizado');
        sequelize.query('PRAGMA foreign_keys=on;'); // Re-enable foreign key checks
      })
      .catch(err => console.error('Erro ao sincronizar BD:', err));
  });



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
