// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
//const User = require('../models/userModel');
//const config = require('./../../config');
const db = require('../../db');
const admin = require('firebase-admin');

exports.registerAndUpdate = async (req, res) => {
  const { email, password, username, rol, accion, userId } = req.body;

  // Validar que los campos no vengan vacios yq ue si la accion es un registro nuevo es obligatorio la contrasena
  if (!email || !username || !rol || (accion === 'add' && !password)) {
    return res.status(400).json({ error: 'Campos requeridos' });
  }

  try {
    if (accion === 'update') {
      // Si la acción es update, actualizamos el usuario existente
      //userId es el usuario que se va a actualizar
      const userRef = db.collection('users').doc(userId);

      const userDoc = await userRef.get();
      //Validar si existe en la base de datos
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'Usuario no encontrado'});
      }

      // Actualizamos los campos de usuario
      const updatedUser = {
        email: email,
        username: username,
        rol: db.collection('roles').doc(rol), 
      };

      // Si la contraseña es proporcionada en el update, se encripta y se anade al doc
      if (password) {
        updatedUser.password = await bcrypt.hash(password, 10);
      }

      await userRef.update(updatedUser);

      // Respuesta de éxito al front
      res.status(200).json({
        message: 'Usuario actualizado exitosamente',
      });
    } else {
      // Si la acción es add (Agregar),se realiza la creación del nuevo usuario
      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Referencia al rol de la colección de roles
      const roleRef = db.collection('roles').doc(rol);

      // Crear el documento del nuevo usuario
      const userRef = db.collection('users').doc();
      await userRef.set({
        email: email,
        password: hashedPassword,
        username: username,
        rol: roleRef,
        last_login: admin.firestore.Timestamp.now(),
      });

      // Respuesta de éxito al front para creación de usuario
      res.status(201).json({
        message: 'Usuario creado exitosamente',
      });
    }
  } catch (error) {
    console.error('Error al procesar solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};




//Funcion de registro que recibe en el cuerpo los datos para almacenar en la base de datos (NO FUNCIONAL, SOLO SIRVE PARA REGISTRO)
exports.register = async (req, res) => {
  const { email, password, username, rol, accion } = req.body;
  //Si la accion es update, no sera necesario un password
  const req_password = accion === 'update' ? 'no' : password; 

  if (!email || (accion !== 'update' && !req_password) || !username || !rol) { //Se valida que los campos contengan informacion
    return res.status(400).json({ error: 'Campos requeridos' });
  }

  try {
    //Encriptar la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    //Referencia al rol de la coleccion de roles
    const roleRef = db.collection('roles').doc(rol); 

    // Crear el documento de usuario en Firestore
    const userRef = db.collection('users').doc();
    await userRef.set({
      email: email,
      password: hashedPassword,
      username: username,
      rol: roleRef, 
      last_login: admin.firestore.Timestamp.now(),
    });
      //Enviar respuesta al front end
      res.status(201).json({
      message: 'Usuario creado exitosamente'
    });
  } catch (error) { //Se maneja un try catch en caso de existir agun error. 
    console.error('Error al crear user:', error); //Imprimir en consola al momento programar
    res.status(500).json({ error: 'Erroe al crear user' });
  }
};

//Funcion para generar token
function generateJWT(user) {
  //El payload contiene los siguientes datos 
  const payload = {
    email: user.email,
    rol: user.rol,
    permissions: user.permissions
  };
  //Y se procede a firmar
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}



//Funcion para loguearse, recibe como cuerpo email y password
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {//Se valida que no se reciba campos vacios
    return res.status(400).json({ error: 'Campos requeridos' });
  }

  try {
    // Buscar usuario en la base de datos por email
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      //Si no encontramos alguno regresamos un mensaje de error
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = userSnapshot.docs[0].data();
   const roleRef = user.rol;
    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    // Obtener permisos del rol
    const roleSnapshot = await roleRef.get();
    const permissions = roleSnapshot.data().permissions;
    console.log(permissions);
    // Generar token llamando la funcion, enviamos datos del user para firmar el token
    const token = generateJWT({ email: user.email, rol: roleSnapshot.id, permissions});

    // Actualizar el campo de last_login
    await userSnapshot.docs[0].ref.update({
      last_login: admin.firestore.Timestamp.now(),
    });

    res.status(200).json({
      message: 'Login exitoso',
      token: token,  
      permissions: permissions
    });
  } catch (error) {
    console.error('Error al loguearse:', error);
    res.status(500).json({ error: 'Error al loguearse' });
  }
};

// Registro de usuario
/*exports.register = async (req, res) => {
  try {
    const { firstName, lastName, secondLastName, email, password, checkMedico } = req.body;

    // Validación básica
    if (!firstName || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'El correo electrónico ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      secondLastName,
      email,
      password: hashedPassword,
      esDoctor: checkMedico || false,
    });

    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrarse', error });
  }
};*/

// Login de usuario
/*exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    const token = jwt.sign({ userId: user._id }, config.secretKey, { expiresIn: '30d' });
    res.json({
      message: 'Inicio de sesión exitoso',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
};*/
