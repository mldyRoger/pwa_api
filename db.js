//const firebase = require("firebase");
const admin = require('firebase-admin');
const { serviceAccount, firebaseConfig } = require('./config');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://asignatura-pwa.firebaseio.com"
});

//firebase.initializeApp(firebaseConfig);

//const db = firebase.firestore()
const db = admin.firestore()

module.exports = db;