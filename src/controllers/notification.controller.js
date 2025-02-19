const pool = require('../models/Db.model');
const admin = require('firebase-admin');
const moment = require('moment');
import dotenv from "dotenv";

dotenv.config();
const serviceAccount = {
  type: 'service_account',
  project_id: "mobuteq-2e154",
  private_key_id: '10aa8d91d83072872663ecf218afb8c65aceb58c',
  private_key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDFkwnN4rPQCOxz
s02yisXj7YNi3lGi+iVuw4blgQ6Sjbwj0mrCciWoI0wfcFFSBCN6vZdVV3CPzIE7
ySIwpYKty8pMhesq8gfyJEjwBlpMTL9ShHfM5isp4lmGROt02BU8xYxxeyIo0iAP
teFMIBETRB4+sk9Ug5V4xBAu/+Brjjm+A3YdguEzhWdDcRYDibbNOBqZMDlvHG/L
hYpqtBqN7NsE7wlTKbCFimrARks1uzq50Y8/WUL31GO5i2VARLs/Gf9sopReLNVJ
nJ0Dyp4K7lmE/2YSdftJlv0lU86Pe0eJfl8RPezqgS2YqetFtcbFm6VEODHH1iA2
Y8pRcQnxAgMBAAECggEAC23ZsrdnKbUEcZ55E4eX0js0fyEHda81AGLu8CKOtF9e
128mBhzKjR8KmaR6jc0nvMNQKGuMG0NsI+hbEheW90ULTTEvhQ7WcxVSg1EIwvJr
HGPFltynOU9q2Juux7Xyx47RdKSX+abLHEGMGIZf2n6VpdCUinnoqQFlgsSCR9Jq
rcC4Rw8iPiei3Oz97rILK1Sa+KHXdQf92bpsCvEKGITOnjS7Fb3jjueKaLzVfLLw
WIacfsLeRxnFa+/qZkfNh+3Vf7LaxiE/DvJBiwVUxoQKPniQpAB1qEaKf5iT9gzs
52L7R/WaI06uXlPY0/CaLUa5CQAOQSPT4dpLrdfPaQKBgQDzxDevEgbAyuUTVrdc
NIGjZ3lgB6U5dIIHVcqkNjNV6OTJpIUeyMSDgiMRWMvHOpuQFE7RB7OgjItRkSyf
PLl0hn7wxObV1nG9v/GLi8X6plfOqDiUlQj15tLJIMI8GL2gvnijvaUcSMA5Hee4
ySj4ERhY0iq7WdMC5gDF3ZlVqQKBgQDPfV58A0/PHxtgSUekPQQvbeWrxc/4yZuj
02mhT/SMMFpZAQsU1tHWwRHKEdShgSjdLwwmG0LxP98LglnwhEksJps/cM1lT/YY
2Zbpk3E1bbMdH45VZ/rDt7fAXr6gBPvc8d/hZf0ipgDSpfpGjmGzdUXjTPupJUFy
tJvfS5svCQKBgQDlod023ctgyIFdY14dzRSmgu5S6UDbTAbFtCrN4IUhk+AamBIT
OtvsaqZwS+7DQlGTO543yYKMZnlDoHehlgm6XIyucT5nCLljH7MCWuxov1SOR+ft
CCxFwWilsWdoR4IzL9rjnN4yM9Jou+QzLcSbUzdVTL6WePqPi24E90jf6QKBgHEv
++X8zIG5f26kKw++NVVGRx7QVyZpnJzfDGVyP35mNjMNbaUdlvTm97Ray7qawdb+
/kqfXoJKjHszzap2D5ClMtWFzJYy65YcxMWAqCY0RJxjhXqzsUkpJHUteiHC9j5O
OAo2X8OR+SrwXjo1G7kRBWH8seBQsYZIXiuOjAY5AoGBALFnLs3jg885S5dfVJ1P
kt1eeMDeHB/0KJSalpI3iPeoC+/p9e8MhtkOhbvcIPj98LoXiw0NdwWTVxScEY2X
POVPtqqNIrsdlfO42xnsk9FebZOEmHxMzWH+4oxFJhd9HtbvXXAfGQSA3Je+31/8
GJLx//kX8GDcc/6BKKSIlZ/N
-----END PRIVATE KEY-----`,
  client_email: "firebase-adminsdk-2p3tq@mobuteq-2e154.iam.gserviceaccount.com",
  client_id: "112001954851281847359",
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-2p3tq%40mobuteq-2e154.iam.gserviceaccount.com",
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const sendNotification = (token, message) => {
    const payload = {
      notification: {
        title: message.title,
        body: message.body,
      },
      android: {
        priority: "high", 
        notification: {
          sound: "default", 
          icon: "logo", 
        }
      },
      token: token,
    };
  
    admin.messaging().send(payload)
      .then((response) => {
        console.log('Notificación enviada:', response);
      })
      .catch((error) => {
        console.error('Error al enviar la notificación:', error);
      });
  };

//Buscar horas proximas
exports.getUpcomingEvents = () => {
    const today = new Date();
    const options = { weekday: 'long' };
    const day = today.toLocaleDateString('es-ES', options);
    const now = moment().format('HH:mm:ss');
    const in5Minutes = moment().add(5, 'minutes').format('HH:mm:ss');

    const sql = `
      SELECT h.id, u.token_telefono, h.edificio, h.aula, h.hora_inicio, h.hora_fin, m.nombre, h.profesor
      FROM horario_clases AS h
      INNER JOIN materias as m ON m.id = h.id_materia
      INNER JOIN usuarios as u ON u.id = h.id_usuario
      WHERE h.dia_semana = ? 
      AND h.hora_inicio = ?
      ORDER BY h.hora_inicio ASC
    `;

    pool.query(sql, [day, in5Minutes], (err, results) => {
        if (err) throw err;
        results.forEach((clase) => {
          //sendPushNotification(clase.id_usuario, clase.nombre);
          const token = clase.token_telefono;
        if (token) {
          sendNotification(token, { 
            title: `Próxima clase: ${clase.nombre}`, 
            body: `Profesor: ${clase.profesor} - Edificio: ${clase.edificio} - Aula: ${clase.aula}` 
        });
        }
        });
    });
  };

    // Actualizar token del usuario
exports.updateTokenPhone = async (req, res) => {
    const { token } = req.body;
    const { user } = req.params;
    const query = `UPDATE usuarios SET 
        token_telefono = ?
    WHERE id = ?`;
    
    pool.query(query, [token, user], (err) => {
        if (err) {
            return res.status(400).send({ message: 'Error al cambiar token de telefono' });
        }

        res.send({ message: 'Ok al cambiar token.'});
    });
  };
