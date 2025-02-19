import db from '../models/Db.model';  // Importar la conexión de la base de datos

// Obtener todos los cuatrimestres de un usuario
export const getCuatrimestres = (req, res) => {
    const { id_usuario } = req.params;

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener conexión', error: err });
        }

        connection.query(`
      SELECT * FROM cuatrimestres
      WHERE id_usuario = ? ORDER BY CAST(SUBSTRING_INDEX(nombre, ' ', 1) AS UNSIGNED);`,
            [id_usuario],
            (error, results) => {
                connection.release(); // Liberar conexión después de usarla
                if (error) {
                    return res.status(500).json({ message: 'Error al obtener cuatrimestres', error });
                }
                res.json(results);
            }
        );
    });
};

// Crear un nuevo cuatrimestre para un usuario
export const createCuatrimestre = (req, res) => {
    const { id_usuario, nombre } = req.body;

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener conexión', error: err });
        }

        // Consulta para obtener el número más alto de cuatrimestre para el usuario
        connection.query(
            `SELECT COALESCE(MAX(numero), 0) + 1 AS siguienteNumero FROM cuatrimestres WHERE id_usuario = ?`,
            [id_usuario],
            (error, results) => {
                if (error) {
                    connection.release();
                    return res.status(500).json({ message: 'Error al obtener el número del cuatrimestre', error });
                }

                const siguienteNumero = results[0].siguienteNumero; // Número consecutivo del cuatrimestre

                // Inserta el nuevo cuatrimestre con el número calculado
                connection.query(
                    `INSERT INTO cuatrimestres (id_usuario, numero, nombre) VALUES (?, ?, ?)`,
                    [id_usuario, siguienteNumero, nombre],
                    (insertError, result) => {
                        connection.release(); // Liberar conexión después de usarla

                        if (insertError) {
                            return res.status(500).json({ message: 'Error al crear cuatrimestre', error: insertError });
                        }

                        res.status(201).json({ message: 'Cuatrimestre creado exitosamente', id: result.insertId });
                    }
                );
            }
        );
    });
};

// Obtener un cuatrimestre específico de un usuario
export const getCuatrimestre = (req, res) => {
    const { id_usuario, cuatrimestre_id } = req.params;

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener conexión', error: err });
        }

        connection.query(`
      SELECT * FROM cuatrimestres
      WHERE id = ? AND id_usuario = ?`,
            [cuatrimestre_id, id_usuario],
            (error, result) => {
                connection.release(); // Liberar conexión después de usarla
                if (error) {
                    return res.status(500).json({ message: 'Error al obtener el cuatrimestre', error });
                }
                res.json(result[0]);
            }
        );
    });
};

// Eliminar un cuatrimestre específico de un usuario
export const deleteCuatrimestre = (req, res) => {
    const { cuatrimestre_id, id_usuario } = req.params;

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener conexión', error: err });
        }

        connection.query(`
        DELETE FROM cuatrimestres
        WHERE id = ? AND id_usuario = ?`,
            [cuatrimestre_id, id_usuario],
            (error, result) => {
                connection.release(); // Liberar conexión después de usarla
                if (error) {
                    return res.status(500).json({ message: 'Error al eliminar el cuatrimestre', error });
                }
                // Verificar si se eliminó alguna fila
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Cuatrimestre no encontrado o no eliminado' });
                }
                res.json({ message: 'Cuatrimestre eliminado exitosamente' });
            }
        );
    });
};

// Obtener materias de un cuatrimestre específico
export const getMateriasByCuatrimestre = (req, res) => {
    const { cuatrimestreNumero } = req.params;

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener conexión', error: err });
        }

        connection.query(`
            SELECT id, nombre 
            FROM materias 
            WHERE id_cuatrimestre = ?;
        `, [cuatrimestreNumero], (error, results) => {
            connection.release();   

            if (error) {
                return res.status(500).json({ message: 'Error al obtener materias', error });
            }

            res.status(200).json(results);
        });
    });
};

export const createCalificacion = (req, res) => {
    const { id_materia, numero_cuatrimestre, parcial, calificacion, id_usuario } = req.body;

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener conexión', error: err });
        }

        // Inserta la calificación en la tabla de calificaciones para un cuatrimestre específico
        connection.query(`
            INSERT INTO calificaciones (id_materia, id_cuatrimestre, id_usuario, materia, parcial, calificacion)
            SELECT m.id, c.id, ?, m.nombre, ?, ?
            FROM materias m
            JOIN cuatrimestres c ON c.numero = ? AND c.id_usuario = ? 
            WHERE m.id = ?;
        `, [id_usuario, parcial, calificacion, numero_cuatrimestre, id_usuario, id_materia], (error, result) => {
            connection.release();

            if (error) {
                return res.status(500).json({ message: 'Error al agregar calificación', error });
            }

            res.status(201).json({ message: 'Calificación agregada exitosamente', id: result.insertId });
        });
    });
};

// Obtener calificaciones de un alumno en un cuatrimestre específico
export const getCalificacionesByAlumno = (req, res) => {
    const { id_usuario, numero_cuatrimestre } = req.params;

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener conexión', error: err });
        }

        connection.query(`
            SELECT c.id AS id_calificacion, 
                   m.nombre AS materia, 
                   c.parcial, 
                   c.calificacion, 
                   c.created_at
            FROM calificaciones c
            JOIN materias m ON c.id_materia = m.id
            JOIN cuatrimestres cu ON c.id_cuatrimestre = cu.id
            WHERE cu.numero = ? AND cu.id_usuario = ?
            ORDER BY c.parcial;
        `, [numero_cuatrimestre, id_usuario], (error, results) => {
            connection.release();

            if (error) {
                return res.status(500).json({ message: 'Error al obtener calificaciones', error });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'No se encontraron calificaciones para este alumno en este cuatrimestre' });
            }

            res.json(results);
        });
    });
};

// Verificar si ya existe una calificación para la materia y el parcial
export const verificarCalificacionExistente = (req, res) => {
    const { id_usuario, numero_cuatrimestre, id_materia, parcial } = req.body;

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener conexión', error: err });
        }

        connection.query(`
            SELECT COUNT(*) AS count
            FROM calificaciones c
            JOIN cuatrimestres cu ON c.id_cuatrimestre = cu.id
            WHERE cu.numero = ? AND cu.id_usuario = ? AND c.id_materia = ? AND c.parcial = ?;
        `, [numero_cuatrimestre, id_usuario, id_materia, parcial], (error, results) => {
            connection.release();

            if (error) {
                return res.status(500).json({ message: 'Error al verificar calificación', error });
            }

            const exists = results[0].count > 0;
            res.json(exists);
        });
    });
};

// Obtener los 3 mejores usuarios
export const getTopUsers = (req, res) => {
    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener conexión', error: err });
        }

        connection.query(`
            SELECT 
                u.id AS usuario_id,
                u.nombre AS usuario_nombre,
                AVG(c.calificacion) AS promedio
            FROM 
                usuarios u
            JOIN 
                calificaciones c ON u.id = c.id_usuario
            GROUP BY 
                u.id, u.nombre
            ORDER BY 
                promedio DESC
            LIMIT 3;
        `, (error, results) => {
            connection.release(); // Liberar la conexión

            if (error) {
                return res.status(500).json({ message: 'Error al obtener los mejores usuarios', error });
            }

            res.json(results);
        });
    });
};
