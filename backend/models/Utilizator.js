const mongoose = require('mongoose');

const utilizatorSchema = new mongoose.Schema({
  nume: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  parola: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['pacient', 'doctor', 'admin'],
    default: 'pacient'
  },
  telefon: {
    type: String,
    default: ''
  },
  varsta: {
    type: Number,
    default: null
  },
  adresa: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Utilizator', utilizatorSchema);