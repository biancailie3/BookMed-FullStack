const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  idMedic: { type: mongoose.Schema.Types.ObjectId, ref: 'Medic', required: true },
  numeUtilizator: String,
  comentariu: String,
  nota: { type: Number, min: 1, max: 5, required: true },
  data: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);