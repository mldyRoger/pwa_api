const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');


router.get('/:user', scheduleController.getScheduleToday);

router.get('/Details/:day/:user', scheduleController.getScheduleByDayAndUser);

router.get('/VerifyCuatri/:user', scheduleController.verifyCuatri);

router.get('/DetailsScheduleStatusNow/:day/:user', scheduleController.getScheduleNowAndNextClass);

router.post('/AddSchedule/:user', scheduleController.addSchedule);

router.get('/GetScheduleById/:idSubject/:user', scheduleController.getSheduleBySubject);

router.get('/GetSubjectByUser/:user', scheduleController.getSubjectsByUser);

router.put('/UpdateSchedule/:idSubject/:user', scheduleController.updateSchedule);

router.delete('/DeleteSubjectAndScheduleById/:idSubject/:user', scheduleController.deleteSubjectAndSchedule);

router.get('/GetSubjectAll/:user', scheduleController.getSubjectsAll);

module.exports = router;
