const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    image: {
      type: String, // Almacenamos la imagen en base64
      required: true,
    },
  },
  {
    timestamps: true, // Agrega timestamps de creación y actualización
  }
);

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;
