const mongoose = require('mongoose');

const medicSchema = new mongoose.Schema({
  nume: {
    type: String,
    required: true
  },
  poza: {
    type: String,
    default: "https://via.placeholder.com/300x300?text=Medic+BookMed"
  },
  specialitate: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  telefon: {
    type: String,
    default: ''
  },
  locatie: {
    type: String,
    required: true
  },
  descriere: {
    type: String,
    default: ''
  },
  pretConsultatie: {
    type: Number,
    default: 150
  },
  activ: {
    type: Boolean,
    default: false
  },
  parola: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  numarReviewuri: {
    type: Number,
    default: 1
  },
  program: {
    oraStart: { type: String, default: "09:00" },
    oraSfarsit: { type: String, default: "17:00" },
    zileActive: {
      type: [String],
      default: ["Luni", "Marti", "Miercuri", "Joi", "Vineri"]
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Medic', medicSchema);