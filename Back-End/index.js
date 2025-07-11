require('dotenv').config();
require('./middlewares/jogosStock');

const express = require('express');
const path = require('path');
const sequelize = require('./Database/sequelize');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const Utilizador = require('./models/utilizadorModel')

// Documentação no Swagger
const swaggerjsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const swaggerOptions = require('./swaggerConfig')

const teste = require('./models/gruposModel');

// Todas as Rotas
const cafesRoutes = require('./routes/cafesRoutes');
const utilizadoresRoutes = require('./routes/utilizadoresRoutes');
const gestorRoutes = require('./routes/gestorRoutes');
const mesasRoutes = require('./routes/mesasRoutes');
const jogosRoutes = require('./routes/jogosRoutes');
const reservasRoutes = require('./routes/reservasRoutes');


/* Criar admin */


// async function createAdmin() {

//   const hashedPassword = await bcrypt.hash('batata', 10);

//   const novoUtilizador = await Utilizador.create({
//     Nome: 'admin',
//     Email: 'joaomiko25@gmail.com',
//     Password: hashedPassword,
//     Cargo: 'Administrador',
//     EmailConfirmado: true
//   });

// }

// createAdmin();

/* Fim */



const app = express();

app.use(cors({
   origin: 'http://localhost:5173',
   methods: ['GET', 'POST', 'PATCH', 'DELETE'],
   credentials: true,
}));

app.use(express.json());
app.use(cookieParser())

// Middleware para servir arquivos estáticos (imagens)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/cafes', cafesRoutes);
app.use('/api/autenticar', utilizadoresRoutes);
app.use('/api/gestor', gestorRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/jogos', jogosRoutes);
app.use('/api/reservas', reservasRoutes);


const swaggerDocs = swaggerjsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))


// Sincronizar Sequelize
// sequelize.query('PRAGMA foreign_keys=off;') // Disable foreign key checks
//   .then(() => {
//     sequelize.sync({ force: true })
//       .then(() => {
//         console.log('Base de dados sincronizada');
//         sequelize.query('PRAGMA foreign_keys=on;'); // Re-enable foreign key checks
//       })
//       .catch(err => console.error('Erro ao sincronizar BD:', err));
//   });

// Sincronizar Sequelize
sequelize.sync()
   .then(() => console.log('Base de dados sincronizada'))
   .catch(err => console.error('Erro ao sincronizar BD:', err));


app.get('/', (req, res) => {
   res.send('Back-End a Funcionar!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor ligado na porta ${PORT}`));

module.exports = app;
