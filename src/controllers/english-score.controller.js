const pool = require('../models/Db.model');



// Buscar Scores
exports.getScores = async (req, res) => {
    const { user } = req.params;
    const sqlScores = `
    SELECT 
        id, score, id_usuario
    FROM english_score
    WHERE id_usuario = ?
    ORDER BY id;
`;

pool.query(sqlScores, [user], (err, scoresResults) => {
    if (err) {
        return res.status(400).send({ message: 'Error al obtener scores' });
    }

    res.send({ message: 'Scores encontradas.', results: scoresResults });
});
  };

 exports.addNewScore = async (req, res) => {
    const { user } = req.params;
    const { score } = req.body;
    const sqlScores = `
    INSERT INTO english_score (id_usuario, score)
        VALUES (?, ?)
      `;

pool.query(sqlScores, [user, score], (err, scoresResults) => {
    if (err) {
        return res.status(400).send({ message: 'Error al ingresar score' });
    }

    res.send({ message: 'success', result: true });
});
 }

 exports.updateScore = async (req, res) => {
    const { id } = req.params;
    const { score } = req.body;
    const sqlScores = `
    UPDATE english_score SET
    score = ? 
    WHERE id = ?`;

pool.query(sqlScores, [score, id], (err, resultUpdateScore) => {
    if (err) {
        return res.status(400).send({ message: 'Error al modificar score' });
    }

    res.send({ message: 'success', result: true });
});
 }

 exports.deleteScore = async (req, res) => {
    const { id } = req.params;
    const sqlScores = `
    DELETE FROM english_score 
    WHERE id = ?`;

pool.query(sqlScores, [id], (err, resultDeleteScore) => {
    if (err) {
        return res.status(400).send({ message: 'Error al eliminar score' });
    }

    res.send({ message: 'success', result: true });
});
 }

 
