const pool = require('./Db.model');

// Buscar eventos
exports.findAllEvents = (user, callback) => {
    const sql = `SELECT e.nombre_evento, DATE_FORMAT(f.fecha_inicio, '%Y-%m-%d') as start, 
    DATE_FORMAT(f.fecha_fin, '%Y-%m-%d') as end, e.color as backgroundColor, e.display , e.relleno, e.textColor 
    FROM fechas_evento as f 
    INNER JOIN eventos as e ON f.idevento = e.id 
    
    UNION ALL
SELECT 
        uf.nombre_evento, 
        DATE_FORMAT(uf.fecha_inicio, '%Y-%m-%d') as start, 
        DATE_FORMAT(uf.fecha_fin, '%Y-%m-%d') as end, 
        uf.color as backgroundColor, 
        uf.display, 
        uf.relleno,
        uf.textColor 
    FROM 
        usuario_eventos as uf 
    WHERE 
       id_usuario = ? ORDER BY 
    CASE 
        WHEN end = '0000-00-00' THEN 1
        ELSE 0 
    END ASC,
    relleno ASC `;
       pool.query(sql, [user], (err, results) => {
      if (err) {
        return callback(err); 
      }
      callback(null, results);
    });
  };

  // Buscar eventos
  exports.findEventsByDayAndUser = (date, user, callback) => {
    const eventsUTEQSql = `SELECT f.id, DATE_FORMAT(f.fecha_inicio, '%Y-%m-%d') as fecha_inicio, DATE_FORMAT(f.fecha_fin, '%Y-%m-%d') as fecha_fin,
    e.nombre_evento, e.color, e.relleno, e.textColor 
    FROM fechas_evento as f 
    INNER JOIN eventos AS e ON f.idevento = e.id
    WHERE ? = fecha_inicio 
      OR ? 
      BETWEEN fecha_inicio AND fecha_fin
      ORDER BY fecha_inicio ASC`;

    const eventsUserSql  = `SELECT id, id_usuario, DATE_FORMAT(fecha_inicio, '%Y-%m-%d') as fecha_inicio, DATE_FORMAT(fecha_fin, '%Y-%m-%d') as fecha_fin, 
    nombre_evento, descripcion, color, relleno, textColor
    FROM usuario_eventos WHERE id_usuario = ? AND
      (? = fecha_inicio 
      OR ? 
      BETWEEN fecha_inicio AND fecha_fin)
      ORDER BY fecha_inicio ASC`;
      
      //Consulta para eventos generales de la UTEQ
      pool.query(eventsUTEQSql, [date, date], (err, events_uteq) => {
        if (err) {
          return callback(err);
        }
    
        // Consulta para eventos del usuario
        pool.query(eventsUserSql, [user, date, date], (err, events_user) => {
          if (err) {
            return callback(err);
          }
    
          // Devolver ambos resultados en un solo objeto
          callback(null, { events_uteq, events_user });
        });
      });
  };

  exports.createAnEvent = (eventData, callback) => {
    const query = `INSERT INTO usuario_eventos 
    (id_usuario, 
    fecha_inicio, 
    fecha_fin, 
    nombre_evento, 
    descripcion, 
    color,
    relleno,
    display,
    textColor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    pool.query(query, [eventData.id_usuario, eventData.fecha_inicio, eventData.fecha_fin, eventData.nombre_evento, eventData.descripcion, eventData.color, eventData.relleno, eventData.display, eventData.textColor], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results.insertId);
    });
  }


  // Actualizar un evento por id
exports.updateEvent = (eventData, callback) => {
  const query = `UPDATE usuario_eventos SET 
      nombre_evento = ?, 
      descripcion = ?, 
      fecha_inicio = ?, 
      fecha_fin = ?, 
      color = ?, 
      relleno = ?, 
      display = ?, 
      textColor = ? 
  WHERE id = ? AND id_usuario = ?`;
  
  pool.query(query, [eventData.nombre_evento, eventData.descripcion, eventData.fecha_inicio, eventData.fecha_fin, eventData.color, eventData.relleno, eventData.display, eventData.textColor, eventData.id, eventData.id_usuario], (err) => {
      if (err) {
          return callback(err);
      }
      callback(null);
  });
};

// Eliminar un evento
exports.deleteEvent = (id, callback) => {
  const query = `DELETE FROM usuario_eventos WHERE id = ?`;
  pool.query(query, [id], (err) => {
      if (err) {
          return callback(err);
      }
      callback(null);
  });
};

  