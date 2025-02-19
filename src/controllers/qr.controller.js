const nodemailer = require('nodemailer');
const validator = require('validator');
const QRCode = require('qrcode');
// Configurar nodemailer para enviar correos
const transporter = nodemailer.createTransport({
    service: 'gmail', // Usar un servicio como Gmail
    auth: {
      user: 'rogeliogudinodeleon@gmail.com',
      pass: 'hspzogczaxrmgbkl'
    },
    tls: {
      rejectUnauthorized: false // Deshabilita la verificación de certificados
    }
  });
// Registrar un usuario
exports.sendQR = async (req, res) => {
    const { asistente, evento, descripcion, email, fecha, qrData } = req.body;
  
    if (!validator.isEmail(email)) {
      return res.status(400).send({ message: 'Correo no es válido.' });
    }
  
   

    try {
        const qrImageBuffer = await QRCode.toBuffer(qrData);
        // Enviar correo de confirmación
        const mailOptions = {
          from: 'rogeliogudinodeleon@gmail.com',
          to: email,
          subject: 'Nueva invitación',
          text: `Invitación`,
          html: `
                  <p>Hola ${asistente},</p>
                  <p>Haz recibido una invitación para el evento: ${evento}</p>
                  <p>Fecha: ${fecha}</p>
                  <p>${descripcion}</p>
                  <p>Deebes presentar el código QR para el acceso al evento</p>
                  <br/>
              `,
          attachments: [
                {
                  filename: 'invitation-qr.png',
                  content: qrImageBuffer, 
                  encoding: 'base64', 
                },
              ],
        };
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(500).send({ message: 'Error al enviar invitación.' });
          }
  
          res.send({ message: 'Invitación enviada con éxito' });
        });
    } catch (error) {
        console.error('Error al generar el QR o enviar el correo:', error);
        res.status(500).send('Error al generar el QR o enviar el correo');
      }
  };