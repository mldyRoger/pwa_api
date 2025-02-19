// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getProfile, getAllUsers } = require('../controllers/user.controller');
const { tokenRequired } = require('../middlewares/authMiddeware');

// Ruta para obtener el perfil del usuario
router.get('/perfil', tokenRequired, getProfile);
router.get('/getUsers', getAllUsers);
module.exports = router;

