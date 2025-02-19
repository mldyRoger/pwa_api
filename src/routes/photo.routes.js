const express = require('express');
const router = express.Router();
const { savePhoto, getAllPhotos, deletePhoto } = require('../controllers/photo.controller');

// Ruta para guardar una foto
router.post('/photos', savePhoto);

// Ruta para obtener todas las fotos
router.get('/photos', getAllPhotos);

// Ruta para eliminar una foto
router.delete('/photos/:photoId', deletePhoto);

module.exports = router;
