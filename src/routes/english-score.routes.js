import { Router } from 'express';
const englishScoreController = require('../controllers/english-score.controller');

const router = Router();

router.get('/GetScoreByUser/:user', englishScoreController.getScores);

router.post('/AddScoreByUser/:user', englishScoreController.addNewScore);

router.put('/UpdateScoreById/:id', englishScoreController.updateScore);

router.delete('/DeleteScoreById/:id', englishScoreController.deleteScore);

module.exports = router;
