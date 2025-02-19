import app from "../app";
import dotenv from "dotenv";
//const db = require('./models/Db.model'); // Conexión a la base de datos
//const { db, adminDb } = require('../db');
//const admin = require('firebase-admin');
//const firebase = require("firebase");
//const express =require("express");


dotenv.config();
app.listen(3000, '0.0.0.0', () =>{
    console.log('Servidor corriendo en http://0.0.0.0:3000');
})
