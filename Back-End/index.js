require('dotenv').config();
require('./middlewares/jogosStock');

const express = require('express');
const sequelize = require('./Database/sequelize');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const Utilizador = require('./models/utilizadorModel')

const swaggerjsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const swaggerOptions = require('./swaggerConfig')


// Todas as Rotas
const cafesRoutes = require('./routes/cafesRoutes');
const utilizadoresRoutes = require('./routes/utilizadoresRoutes');
const gestorRoutes = require('./routes/gestorRoutes');
const mesasRoutes = require('./routes/mesasRoutes');
const jogosRoutes = require('./routes/jogosRoutes');
const reservasRoutes = require('./routes/reservasRoutes');


/* Criar admin */

// async function createAdmin() {

//   const hashedPassword = await bcrypt.hash('admin', 10);

//   const novoUtilizador = await Utilizador.create({
//     Nome: 'admin',
//     Email: 'admin@gmail.com',
//     Password: hashedPassword,
//     Cargo: 'Administrador'
//   });

// }

// createAdmin();

/* Fim */



const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser())

app.use('/cafes', cafesRoutes);
app.use('/autenticar', utilizadoresRoutes);
app.use('/gestor', gestorRoutes);
app.use('/mesas', mesasRoutes);
app.use('/jogos', jogosRoutes);
app.use('/reservas', reservasRoutes);


const swaggerDocs = swaggerjsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))


// Sincronizar Sequelize
// sequelize.query('PRAGMA foreign_keys=off;') // Disable foreign key checks
//   .then(() => {
//     sequelize.sync({ force: true })
//       .then(() => {
//         console.log('Banco de dados sincronizado');
//         sequelize.query('PRAGMA foreign_keys=on;'); // Re-enable foreign key checks
//       })
//       .catch(err => console.error('Erro ao sincronizar BD:', err));
//   });

// Sincronizar Sequelize
sequelize.sync()
   .then(() => console.log('Banco de dados sincronizado'))
   .catch(err => console.error('Erro ao sincronizar BD:', err));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor ligado na porta ${PORT}`));
