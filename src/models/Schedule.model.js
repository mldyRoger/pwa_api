const pool = require('./Db.model'); 
const moment = require('moment-timezone');
// Buscar horario
exports.findScheduleToday = (user, callback) => {
  const today = new Date();
  const options = { weekday: 'long' };
  const day = today.toLocaleDateString('es-ES', options);

    const sql = `SELECT h.id, h.edificio, h.aula, h.hora_inicio, h.hora_fin, m.nombre, h.profesor 
    FROM horario_clases as h
    INNER JOIN materias as m ON m.id = h.id_materia
    WHERE h.id_usuario = ? AND
    h.dia_semana = ?
    ORDER BY h.hora_inicio ASC`;
       pool.query(sql, [user, day], (err, results) => {
      if (err) {
        return callback(err); 
      }
      callback(null, results);
    });
  };

  // Buscar Horario por dia y usuario
  exports.findScheduleByDayAndUser = (day, user, callback) => {
    const sql = `SELECT h.id, h.edificio, h.aula, h.hora_inicio, h.hora_fin, m.nombre, h.profesor 
    FROM horario_clases as h
    INNER JOIN materias as m ON m.id = h.id_materia
    WHERE h.id_usuario = ? AND
    h.dia_semana = ?
    ORDER BY h.hora_inicio ASC`;
       pool.query(sql, [user, day], (err, results) => {
      if (err) {
        return callback(err); 
      }
      
      callback(null, results);
    });
  };

  //Buscar materia con clase ahora y la proxima
  exports.findScheduleNowAndNext = (day, user, callback) => {
    const now = moment.tz('America/Mexico_City').format('HH:mm:ss');
    const sqlNow = `
      SELECT h.id, h.edificio, h.aula, h.hora_inicio, h.hora_fin, m.nombre, h.profesor
      FROM horario_clases AS h
      INNER JOIN materias as m ON m.id = h.id_materia
      WHERE h.id_usuario = ? 
        AND h.dia_semana = ? 
         AND ? BETWEEN h.hora_inicio AND h.hora_fin
      ORDER BY h.hora_inicio ASC
      LIMIT 1
    `;
  
    // Consulta para obtener el próximo horario
    const sqlNext = `
      SELECT h.id, h.edificio, h.aula, h.hora_inicio, h.hora_fin, m.nombre, h.profesor
      FROM horario_clases AS h
      INNER JOIN materias as m ON m.id = h.id_materia
      WHERE h.id_usuario = ? 
        AND h.dia_semana = ? 
        AND h.hora_inicio > ?
      ORDER BY h.hora_inicio ASC
      LIMIT 1
    `;
  
    // Ejecutar ambas consultas
    pool.query(sqlNow, [user, day, now], (errNow, resultNow) => {
      if (errNow) {
        return callback(errNow);
      }
  
      pool.query(sqlNext, [user, day, now], (errNext, resultNext) => {
        if (errNext) {
          return callback(errNext);
        }
  
        // Devolver objeto con los dos horarios
        const schedule = {
          class_now: resultNow[0] || null, 
          class_next: resultNext[0] || null 
        };
  
        callback(null, schedule);
      });
    });
  };

  

  // Agregar los datos del horario
  exports.addScheduleData = async (subject, teacher, scheduleData, user) => {
    const connection = await pool.promise().getConnection();
    
    try {
      await connection.beginTransaction();
  
      const verifySql = `
        SELECT * 
        FROM horario_clases
        WHERE id_usuario = ? AND id_materia = ?
      `;
      const [Result] = await connection.query(verifySql, [user, subject]);
  
      if (Result.length > 0) {
        return 'Ya se encuentra registrada la materia!';
      }
  
      const values = [];
  
      for (const day in scheduleData) {
        if (scheduleData.hasOwnProperty(day)) {
          const dayData = scheduleData[day];
  
          // Verificar si el día está seleccionado (selected = true)
          if (dayData.selected) {
            values.push([
              user,            
              day,                 
              dayData.building,     
              dayData.classroom,   
              dayData.startTime,    
              dayData.endTime,    
              subject, 
              teacher
            ]);
          }
        }
      }
  
      // Si no hay horarios seleccionados, devolver un mensaje
      if (values.length === 0) {
        return 'No hay horarios seleccionados para insertar';
      }
      
  
      // Insertar todos los horarios a la vez
      const insertHorariosSql = `
        INSERT INTO horario_clases (id_usuario, dia_semana, edificio, aula, hora_inicio, hora_fin, id_materia, profesor)
        VALUES ?
      `;
      await connection.query(insertHorariosSql, [values]);
  
      // Confirmar la transacción
      await connection.commit();
  
      return 'Materia y horarios insertados correctamente';
  
    } catch (err) {
      // Si ocurre algún error, deshacemos la transacción
      await connection.rollback();
      throw new Error('Error al insertar los datos');
    } finally {
      // Liberar la conexión
      connection.release();
    }
  };

  //Buscar por materia
  exports.findScheduleBySubject = (idSubject, user, callback) => {
    const sql = `SELECT 
        h.id, h.edificio, h.aula, h.hora_inicio, h.hora_fin, h.id_materia,
        m.nombre AS subject, h.profesor AS teacher, h.dia_semana 
        FROM horario_clases AS h
        INNER JOIN materias as m ON m.id = h.id_materia
        WHERE h.id_materia = ? AND h.id_usuario = ?
        ORDER BY h.dia_semana, h.hora_inicio;`;
         pool.query(sql, [idSubject, user], (err, results) => {
        if (err) {
          return callback(err); 
        }
        console.log(results);
        if (!results.length) {
          return callback(null, {
            subject: '',
            teacher: '',
            schedule: {}
          });
        }

        const schedule = {
          subject: results[0].subject,  
          teacher: results[0].teacher, 
          schedule: {}                  
        };
    
        // Recorrer los resultados y agrupamos los horarios por día de la semana
        results.forEach(result => {
          const dayKey = result.dia_semana;
    
          // Si el día no está en el objeto schedule, se inizializa
          if (!schedule.schedule[dayKey]) {
            schedule.schedule[dayKey] = {};
          }
    
          // Añadir el horario para ese día
          schedule.schedule[dayKey] = {
            id: result.id,
            selected: true, 
            building: result.edificio,
            classroom: result.aula,
            startTime: result.hora_inicio,
            endTime: result.hora_fin
          };
        });


        callback(null, schedule);
      });
    };

    exports.findSubjectsByUser = (user, callback) => {
        const sql = `SELECT h.id, h.id_materia, m.nombre, h.profesor, COUNT(h.id) AS totalClases 
        FROM horario_clases as h
        INNER JOIN materias as m ON m.id = h.id_materia
        WHERE h.id_usuario = ?
        GROUP BY m.id
        ORDER BY m.nombre ASC`;
           pool.query(sql, [user], (err, results) => {
          if (err) {
            return callback(err); 
          }
          callback(null, results);
        });
      };

  
  exports.updateScheduleData = async (subject, teacher, scheduleData, idSubject, user) => {
        const connection = await pool.promise().getConnection();
        
        try {
          // Comenzar una transacción
          await connection.beginTransaction();
      
      
          // Procesar los horarios, verificando si se debe hacer un UPDATE, CREATE o DELETE
          for (const day in scheduleData) {
            if (scheduleData.hasOwnProperty(day)) {
              const dayData = scheduleData[day];
      
              // Si el día está seleccionado
              if (dayData.selected) {
                if (dayData.id > 0) {
                  // Si `id` > 0 y `selected` es true, hacer un UPDATE
                  const updateScheduleSql = `
                    UPDATE horario_clases 
                    SET edificio = ?, aula = ?, hora_inicio = ?, hora_fin = ?, id_materia = ?, profesor = ? 
                    WHERE id = ?
                  `;
                  await connection.query(updateScheduleSql, [
                    dayData.building,
                    dayData.classroom,
                    dayData.startTime,
                    dayData.endTime,
                    subject,
                    teacher,
                    dayData.id
                  ]);
                } else if (dayData.id === 0) {
                  // Si `id` es 0 y `selected` es true, hacer un CREATE (INSERT)
                  const insertScheduleSql = `
                    INSERT INTO horario_clases (id_usuario, id_materia, profesor, dia_semana, edificio, aula, hora_inicio, hora_fin) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                  `;
                  await connection.query(insertScheduleSql, [
                    user,             
                    subject, 
                    teacher,          
                    day,             
                    dayData.building,  
                    dayData.classroom, 
                    dayData.startTime, 
                    dayData.endTime    
                  ]);
                }
              } else if (dayData.id > 0 && !dayData.selected) {
                // Si `id` > 0 y `selected` es false, hacer un DELETE
                const deleteScheduleSql = `
                  DELETE FROM horario_clases WHERE id_materia = ? AND id_usuario = ?
                `;
                await connection.query(deleteScheduleSql, [idSubject, user]);
              }
            }
          }
      
          // Confirmamos la transacción
          await connection.commit();
      
          return 'Materia y horarios actualizados correctamente';
      
        } catch (err) {
          // Si ocurre algún error, deshacemos la transacción
          await connection.rollback();
          throw new Error('Error al procesar los datos');
        } finally {
          // Liberar la conexión de vuelta al pool
          connection.release();
        }
      };
      
      exports.deleteSubjectSchedule = (idSubject, user, callback) => {
        const deleteScheduleSQL = `DELETE FROM horario_clases WHERE id_materia = ? AND id_usuario = ?`;

        pool.query(deleteScheduleSQL, [idSubject, user], (err) => {
          if (err) {
            return callback(err);
          }
      
            callback(null);
        
        });
      };
