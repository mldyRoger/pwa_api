import db from '../models/Db.model';  // Importar la conexión de la base de datos (pool)

// Obtener todas las ubicaciones
export const getUbicaciones = (req, res) => {
  const { id_usuario } = req.query;

  db.getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener conexión', error: err });
    }

    // Obtener las ubicaciones del usuario y las del administrador
    connection.query(`
      SELECT * FROM ubicaciones_mapa
      WHERE id_usuario = ? OR creado_por_admin = TRUE`,
      [id_usuario],
      (error, results) => {
        connection.release(); // Liberar conexión después de usarla
        if (error) {
          return res.status(500).json({ message: 'Error al obtener ubicaciones', error });
        }
        res.json(results);
      }
    );
  });
};

// Crear una nueva ubicación
export const createUbicacion = (req, res) => {
  const { id_usuario, nombre, descripcion, latitud, longitud } = req.body;

  db.getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener conexión', error: err });
    }

    connection.query(`
      INSERT INTO ubicaciones_mapa (id_usuario, nombre, descripcion, latitud, longitud, creado_por_admin)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [id_usuario, nombre, descripcion, latitud, longitud, false], // `creado_por_admin` es falso
      (error, result) => {
        connection.release(); // Liberar conexión después de usarla
        if (error) {
          return res.status(500).json({ message: 'Error al crear ubicación', error });
        }
        res.status(201).json({ message: 'Ubicación creada exitosamente', id: result.insertId });
      }
    );
  });
};

// Actualizar una ubicación
export const updateUbicacion = (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, latitud, longitud } = req.body;

  db.getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener conexión', error: err });
    }

    connection.query(`
      UPDATE ubicaciones_mapa
      SET nombre = ?, descripcion = ?, latitud = ?, longitud = ?
      WHERE id = ? AND (id_usuario = ? OR creado_por_admin = TRUE)`,
      [nombre, descripcion, latitud, longitud, id, req.body.id_usuario], // Verifica que sea del usuario o del admin
      (error) => {
        connection.release(); // Liberar conexión después de usarla
        if (error) {
          return res.status(500).json({ message: 'Error al actualizar ubicación', error });
        }
        res.json({ message: 'Ubicación actualizada exitosamente' });
      }
    );
  });
};

// Eliminar una ubicación
export const deleteUbicacion = (req, res) => {
  const { id } = req.params;
  const { id_usuario } = req.body;

  db.getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener conexión', error: err });
    }

    connection.query(`
      DELETE FROM ubicaciones_mapa
      WHERE id = ? AND id_usuario = ?`, // Solo se puede eliminar si es el creador
      [id, id_usuario],
      (error) => {
        connection.release(); // Liberar conexión después de usarla
        if (error) {
          return res.status(500).json({ message: 'Error al eliminar ubicación', error });
        }
        res.json({ message: 'Ubicación eliminada exitosamente' });
      }
    );
  });
};
