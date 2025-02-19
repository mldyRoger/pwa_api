const Schedule = require('../models/Schedule.model');
const pool = require('../models/Db.model'); 

exports.getScheduleToday = async (req, res) => {
  const { user } = req.params;
  Schedule.findScheduleToday(user, (err, results) => {
        if (err) {
          return; 
        }
        
        res.json(results);
      });

}
exports.getScheduleByDayAndUser = async (req, res) => {
  const { day, user } = req.params;
  Schedule.findScheduleByDayAndUser(day, user, (err, results) => {
      if (err) {
        return;
      }
      
      res.json(results);
    });

}

exports.verifyCuatri = async (req, res) => {
  const { user } = req.params;
  try {
  const sqlGetHighestCuatri = `
  SELECT MAX(numero) AS max_cuatrimestre
  FROM cuatrimestres
  WHERE id_usuario = ?
`;
pool.query(sqlGetHighestCuatri, [user], (err, maxCuatriResult) => {
  if (err) {
    return res.status(400).send({ status: 'error', message: 'Error al obtener el cuatrimestre más alto' });
  }
  const highestCuatri = maxCuatriResult[0].max_cuatrimestre;
  console.log(highestCuatri);
  if (!highestCuatri) {
    return res.status(201).send({ status: 'no hay', message: 'Ve a Home->Calificaciones y añade tu cuatrimestre actual' });
  }

  /*const sqlVerifyHorarios = `
        SELECT hc.id
        FROM horario_clases hc
        JOIN materias m ON hc.id_materia = m.id
        JOIN cuatrimestres c ON m.id_cuatrimestre = c.id
        WHERE c.id_cuatrimestre = ? AND m.id_cuatrimestre = ? AND
        hc.id_usuario = ?
      `;*/
      const sqlVerifyHorarios = `
        SELECT hc.id
        FROM horario_clases hc
        JOIN materias m ON hc.id_materia = m.id
        JOIN cuatrimestres c ON m.id_cuatrimestre = c.id
        WHERE c.id = ? AND m.id_cuatrimestre = ? AND
        hc.id_usuario = ?
      `;
      
      pool.query(sqlVerifyHorarios, [highestCuatri, highestCuatri, user], (err, horarioResults) => {
        if (err) {
          return res.status(400).send({ status: 'error', message: 'Error al verificar horarios' });
        }
        if (horarioResults.length === 0) {
          const sqlDeleteHorarios = `
            DELETE FROM horario_clases
            WHERE id_usuario = ?
          `;
          pool.query(sqlDeleteHorarios, [user], (err) => {
            if (err) {
              return res.status(400).send({ status: 'error', message: 'Error al eliminar horarios antiguos' });
            }
            return res.status(201).send({ status: 'agrega', message: 'Parace que tienes un nuevo cuatrimestre, registra tu horario' });
          });
        } else {
          return res.status(201).send({status: 'ok',  message: 'Existen horarios para el cuatrimestre más alto. No es necesario eliminar.' });
        }
      });
});
} catch (err) {
  console.error(err);
  return res.status(500).send({ message: 'Error en el servidor' });
}
}

exports.getScheduleNowAndNextClass = async (req, res) => {
    const { day, user } = req.params;
    Schedule.findScheduleNowAndNext(day, user, (err, results) => {
        if (err) {
          return;
        }
        
        res.json(results);
      });
  
  }

exports.addSchedule = async (req, res) => {
    const { subject, teacher, schedule } = req.body;
    const { user } = req.params;
  
    try {
      
      const result = await Schedule.addScheduleData(subject, teacher, schedule, user); 
  
      if (result) {
        res.status(200).json({ message: result });
      } else {
        res.status(500).json({ error: result });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al procesar los datos' });
    }
  };

  exports.getSheduleBySubject = async (req, res) => {
    const { idSubject, user } = req.params;
    Schedule.findScheduleBySubject(idSubject, user, (err, results) => {
          if (err) {
            return; 
          }
          
          res.json(results);
        });
  
  }

      exports.getSubjectsAll = async (req, res) => {
        const { user } = req.params;
    
        // Primero obtenemos el cuatrimestre más reciente del usuario
        const sqlCuatrimestre = `
            SELECT MAX(numero) AS numero_cuatrimestre
            FROM cuatrimestres
            WHERE id_usuario = ?
        `;
        
        pool.query(sqlCuatrimestre, [user], (err, cuatrimestreResults) => {
            if (err) {
                return res.status(400).send({ message: 'Error al obtener cuatrimestre' });
            }
        console.log(cuatrimestreResults);
            // Si no se encuentra un cuatrimestre, retornar not found
            if (cuatrimestreResults[0].numero_cuatrimestre === null) {
                return res.status(404).send({ message: 'No hay cuatrimestres para este usuario.' });
            }
    
            const idCuatrimestre = cuatrimestreResults[0].numero_cuatrimestre;
    
            // Ahora obtenemos las materias para el cuatrimestre encontrado
            const sqlMaterias = `
                SELECT 
                    m.id, m.id_cuatrimestre, m.nombre
                FROM materias AS m
                WHERE m.id_cuatrimestre = ?
                ORDER BY m.nombre;
            `;
    
            pool.query(sqlMaterias, [idCuatrimestre], (err, materiasResults) => {
                if (err) {
                    return res.status(400).send({ message: 'Error al obtener las materias' });
                }
    
                res.send({ message: 'Materias encontradas.', results: materiasResults });
            });
        });
    };
    

  exports.getSubjectsByUser = async (req, res) => {
    const { user } = req.params;
    Schedule.findSubjectsByUser(user, (err, results) => {
          if (err) {
            return; 
          }
          
          res.json(results);
        });
  
  }

  exports.updateSchedule = async (req, res) => {
    const { subject, teacher, schedule } = req.body;
    const { idSubject, user } = req.params;
  
    try {
      
      const result = await Schedule.updateScheduleData(subject, teacher, schedule, idSubject, user); 
  
      if (result) {
        res.status(200).json({ message: 'Horario guardado correctamente' });
      } else {
        res.status(500).json({ error: 'Error al guardar el horario' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al procesar los datos' });
    }
  };

  exports.deleteSubjectAndSchedule = async (req, res) => {
    const { idSubject, user } = req.params;
    Schedule.deleteSubjectSchedule(idSubject, user, (err) => {
        if (err) {
            return res.status(500).send({ message: 'Error al eliminar materia y horarios.', error: err });
        }
        res.json({ message: 'Se elimino exitosamente ok' });
    });
  };





