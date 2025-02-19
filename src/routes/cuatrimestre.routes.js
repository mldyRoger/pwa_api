import express from 'express';
import { getCuatrimestres, createCuatrimestre, getCuatrimestre, deleteCuatrimestre, getMateriasByCuatrimestre, createCalificacion, getCalificacionesByAlumno, verificarCalificacionExistente, getTopUsers } from '../controllers/cuatrimestre.controller';
const router = express.Router();

router.get('/users/top3', getTopUsers);
router.get('/materias/cuatri/:cuatrimestreNumero', getMateriasByCuatrimestre);
router.post('/materias/calific', createCalificacion);
router.post('/calificaciones/verificar', verificarCalificacionExistente);
router.get('/calific/materias/:id_usuario/:numero_cuatrimestre', getCalificacionesByAlumno);
router.get('/:id_usuario/:cuatrimestre_id', getCuatrimestre);
router.delete('/:id_usuario/:cuatrimestre_id', deleteCuatrimestre);
router.get('/:id_usuario', getCuatrimestres);
router.post('/:id_usuario', createCuatrimestre);


export default router;
