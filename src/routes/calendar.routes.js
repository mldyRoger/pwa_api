// calendar.routes.js
import { Router } from 'express';
const calendarController = require('../controllers/calendar.controller');

const router = Router();

router.get('/:user', calendarController.getEvents);

router.get('/Details/:date/:user', calendarController.getEventsByDayAndUser);
// Ruta para agregar un evento por usuario
router.post('/AddEvent', calendarController.addNewEvent);
// Ruta para editar un evento por id y usuario
router.put('/UpdateEventById', calendarController.updateEvent);
// Ruta para eliminar un evento por id
router.delete('/DeleteEventById/:id', calendarController.deleteEvent);

module.exports = router;