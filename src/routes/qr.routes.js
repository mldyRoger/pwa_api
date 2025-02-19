const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qr.controller');


router.post('/send-qr', qrController.sendQR);


module.exports = router;