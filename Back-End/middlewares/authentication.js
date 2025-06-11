const jwt = require('jsonwebtoken');
const secretKey = process.env.secretKeyJWT;

const checkAuth = (req, res, next) => {
    const token = req.cookies.Authorization;

    if (!token) {
        return res.status(401).json({ error: 'Não existe nenhuma autenticação, por favor realize o login' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Login Inválido ou Expirado' });
        }

        req.user = decoded;  // Attach user data to request object
        next();
    });

    return;
};

module.exports = checkAuth;
