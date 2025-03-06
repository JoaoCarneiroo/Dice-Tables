require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const cafesRoutes = require('./routes/cafesRoutes');
const reservasRoutes = require('./routes/reservasRoutes');

app.use('/cafes', cafesRoutes);
app.use('/reservas', reservasRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
