// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');

// Ruta para registrar usuario
router.post('/registro', register);

// Ruta para login de usuario
router.post('/login', login);

module.exports = router;
