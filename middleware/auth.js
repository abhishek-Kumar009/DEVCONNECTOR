const jwt = require('jsonwebtoken');
const secretKey = require('../config/default');

module.exports = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).send('No token, unauthorized access!');
    }
    try {
        const decoded = jwt.verify(token, secretKey.jwtSecretkey);
        req.user = decoded.user;
        next();

    } catch (err) {
        console.error(err.msg);
        res.status(500).send('Token was not verified!')
    }

}