// controllers/userController.js
const User = require('../models/userModel');
const db = require('../../db');
const admin = require('firebase-admin');
//const Activity = require('../models/activityModel');

exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    const activities = await Activity.find({ userId: user._id });

    const activitiesList = activities.map(activity => ({
      nombre_actividad: activity.name,
      fecha_entrega: activity.dueDate,
      status: activity.status,
    }));

    res.json({ user: { ...user.toObject(), password: undefined }, activities: activitiesList });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el perfil', error });
  }
};

// Obtener todos los usuarios registrados en la base de datos
exports.getAllUsers = async (req, res) => {
  try {
    // Obtener todos los documentos de la colección
    const usersSn = await db.collection('users').get();
    
    if (usersSn.empty) {
      return res.status(404).json({ message: 'No se encontraron usuarios' });
    }

    // Crear un array de usuarios con los datos de cada documento
    const users = usersSn.docs.map(doc => {
      const userData = doc.data();
      return {
        id: doc.id, // ID del documento
        email: userData.email,
        username: userData.username,
        rol: userData.rol, // Aquí se puede expandir con los datos de rol
        last_login: userData.last_login,
      };
    });

    // Devolver la lista de usuarios
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

