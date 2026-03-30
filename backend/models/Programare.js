const mongoose = require('mongoose');

const programareSchema = new mongoose.Schema({
  pacient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilizator',
    required: true
  },
  medic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medic',
    required: true
  },
  data: {
    type: Date,
    required: true
  },
  ora: {
    type: String,
    required: true
  },
  motiv: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmata', 'anulata'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Programare', programareSchema);