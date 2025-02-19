// models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  secondLastName: String,
  email: { type: String, unique: true },
  password: String,
  esDoctor: Boolean,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
