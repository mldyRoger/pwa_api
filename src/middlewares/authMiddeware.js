// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const config = require('./../../config');
const User = require('../models/userModel');

exports.tokenRequired = async (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(401).json({ message: 'Token faltante' });
  }

  try {
    const decoded = jwt.verify(token, config.secretKey);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
