// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, registerAndUpdate } = require('../controllers/auth.controller');

// Ruta para registrar usuario
router.post('/registerUpdate', registerAndUpdate);

// Ruta para login de usuario
router.post('/login', login);

module.exports = router;
