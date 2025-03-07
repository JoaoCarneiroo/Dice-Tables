const jwt = require('jsonwebtoken');
const secretKey = 'carneiro_secret';

const checkAuth = (req, res, next) => {
    const token = req.cookies.Authorization;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.user = decoded;  // Attach user data to request object
        next();
    });

    return;
};

module.exports = checkAuth;
