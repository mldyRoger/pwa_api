const Calendar = require('../models/Calendar.model');

//Obtener todos los eventos incluyendo del usuario si esta logeado
exports.getEvents = async (req, res) => {
  const { user } = req.params;
    Calendar.findAllEvents(user, (err, results) => {
        if (err) {
          return; 
        }
         
        res.json(results);
      });

}

//Obtener todos los eventos de la fecha seleccionada y usuario logueado
exports.getEventsByDayAndUser = async (req, res) => {
  const { date, user } = req.params;
  Calendar.findEventsByDayAndUser(date, user, (err, results) => {
      if (err) {
        return;
      }
      
      res.json(results);
    });

}

//Agregar un evento del usuario
exports.addNewEvent = async (req, res) => {
  const { id_usuario, nombre_evento, descripcion, fecha_inicio, fecha_fin } = req.body;
  if (!id_usuario || !nombre_evento || !fecha_inicio) {
    return res.status(400).send({ message: 'Todos los campos son obligatorios.' });
  }
  var color = '#0F5B95'; //Por el momento es estatico
  var relleno = 7; //Para la forma que tendra en la vista del calendario
  var display = 'sn'; //Como es un evento del usuario es SN (sin display)
  var textColor = '#ffffff';
  Calendar.createAnEvent({id_usuario, nombre_evento, descripcion, fecha_inicio, fecha_fin, color, relleno, display, textColor}, (err, eventId) => {
    if (err) {
      return res.status(500).send({ message: 'Error al registrar evento.', error: err });
    }
    res.status(201).json({ message: 'Evento agregado exitosamente', id: eventId });
  });

}


// Editar un evento por id
exports.updateEvent = async (req, res) => {
  const { id, id_usuario, nombre_evento, descripcion, fecha_inicio, fecha_fin } = req.body;

  if (!id || !id_usuario || !nombre_evento || !fecha_inicio) {
      return res.status(400).send({ message: 'Todos los campos son obligatorios.' });
  }

  const updatedEventData = {
      id,
      id_usuario,
      nombre_evento,
      descripcion,
      fecha_inicio,
      fecha_fin,
      color: '#0F5B95', // Por el momento, default
      relleno: 7, // Para la vista del calendario
      display: 'sn', // Evento de usuario
      textColor: '#ffffff'
  };

  Calendar.updateEvent(updatedEventData, (err) => {
      if (err) {
          return res.status(500).send({ message: 'Error al actualizar evento.', error: err });
      }
      res.json({ message: 'Evento actualizado exitosamente' });
  });
};

// Eliminar un evento por id
exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  Calendar.deleteEvent(id, (err) => {
      if (err) {
          return res.status(500).send({ message: 'Error al eliminar evento.', error: err });
      }
      res.json({ message: 'Evento eliminado exitosamente' });
  });
};
