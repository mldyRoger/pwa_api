import express from 'express';
const mongoose = require('mongoose');
const cors = require('cors');
const winston = require('winston');
const bodyParser = require('body-parser');
//import authRoutes from './src/routes/auth.routes';
//import englishScoreRoutes from './src/routes/english-score.routes';
import qrRoutes from './src/routes/qr.routes';
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const config = require('./config');
const db = require('./db');
const app = express();
app.use(express.json());
app.use(cors());

// Logger de Winston
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console(),
  ],
});

// Conectar a MongoDB
/*mongoose.connect(config.mongoURI)
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch((error) => {
    logger.error('Error al conectar a MongoDB: ' + error);
    process.exit(1);
  });*/


// Middleware para parsear cuerpos de solicitud como JSON
app.use(express.json());


app.use(express.json());
//app.use('/api', authRoutes);
//app.use('/api/english-score', englishScoreRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
// Ruta para obtener datos de Firestore
app.get('/data', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const data = snapshot.docs.map(doc => doc.data());
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send('Error fetching data from Firebase');
  }
});
// Manejo de errores
app.use((req, res) => {
  res.status(404).json({ message: 'Recurso no encontrado' });
});

app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

export default app;
