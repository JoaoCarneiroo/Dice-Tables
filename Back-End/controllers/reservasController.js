const db = require('../Database/database');

// Obter todas as reservas
exports.mostrarReservas = (req, res) => {
    db.all('SELECT * FROM Reservas', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// Obter uma reserva pelo ID
exports.mostrarReservaID = (req, res) => {
    db.get('SELECT * FROM Reservas WHERE ID_Reserva = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
};

// Criar uma nova reserva
exports.criarReserva = (req, res) => {
    const { id_cafe, id_mesa, id_utilizador, data_hora } = req.body;
    db.run(
        `INSERT INTO Reservas (ID_Cafe, ID_Mesa, ID_Utilizador, Data_Hora) VALUES (?, ?, ?, ?)`,
        [id_cafe, id_mesa, id_utilizador, data_hora],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: 'Reserva criada com sucesso!' });
        }
    );
};

// Cancelar uma reserva
exports.apagarReserva = (req, res) => {
    db.run('DELETE FROM Reservas WHERE ID_Reserva = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Reserva cancelada com sucesso!' });
    });
};
