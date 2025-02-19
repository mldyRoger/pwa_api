import { Router } from 'express';
import {
  getUbicaciones,
  createUbicacion,
  updateUbicacion,
  deleteUbicacion
} from '../controllers/mapa.controller';

const router = Router();

// Obtener todas las ubicaciones
router.get('/ubicaciones', getUbicaciones);

// Crear una nueva ubicación
router.post('/ubicaciones', createUbicacion);

// Actualizar una ubicación
router.put('/ubicaciones/:id', updateUbicacion);

// Eliminar una ubicación
router.delete('/ubicaciones/:id', deleteUbicacion);

export default router;
