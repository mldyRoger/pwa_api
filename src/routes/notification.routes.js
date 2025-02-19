const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

//router.get('/getHours', notificationController.getUpcomingEvents);
router.put('/UpdateToken/:user', notificationController.updateTokenPhone);

module.exports = router;
