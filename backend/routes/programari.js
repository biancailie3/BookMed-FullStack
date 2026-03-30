
const express = require('express');
const router = express.Router();
const Programare = require('../models/Programare');
const Utilizator = require('../models/Utilizator');
const Medic = require('../models/Medic');
const { verificaToken, verificaRol } = require('../middleware/auth');

// GET - programarile pacientului logat
router.get('/ale-mele', verificaToken, verificaRol('pacient'), async (req, res) => {
  try {
    const programari = await Programare.find({ pacient: req.utilizator.id })
      .populate('medic', 'nume specialitate locatie poza')
      .sort({ data: -1 });
    res.json(programari);
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// GET - programarile unui medic
router.get('/medic/:medicId', async (req, res) => {
  try {
    const programari = await Programare.find({ medic: req.params.medicId })
      .populate('pacient', 'nume email telefon')
      .sort({ data: -1 });
    res.json(programari);
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// GET - programarile unui pacient
router.get('/pacient/:pacientId', async (req, res) => {
  try {
    const programari = await Programare.find({ pacient: req.params.pacientId })
      .populate('medic', 'nume specialitate locatie poza')
      .sort({ data: -1 });
    res.json(programari);
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// GET - programarile medicului logat
router.get('/ale-medicului', verificaToken, verificaRol('medic'), async (req, res) => {
  try {
    const programari = await Programare.find({ medic: req.utilizator.id })
      .populate('pacient', 'nume email telefon')
      .sort({ data: -1 });
    res.json(programari);
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// GET - toate programarile (admin)
router.get('/toate', async (req, res) => {
  try {
    const programari = await Programare.find()
      .populate('pacient', 'nume email')
      .populate('medic', 'nume specialitate')
      .sort({ data: -1 });
    res.json(programari);
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// GET - orele ocupate ale unui medic intr-o zi (public)
router.get('/ocupate/:medicId/:data', async (req, res) => {
  try {
    const { medicId, data } = req.params;
    const dataStart = new Date(data);
    dataStart.setHours(0, 0, 0, 0);
    const dataEnd = new Date(data);
    dataEnd.setHours(23, 59, 59, 999);
    const programari = await Programare.find({
      medic: medicId,
      data: { $gte: dataStart, $lte: dataEnd },
      status: { $ne: 'anulata' }
    });
    res.json(programari.map(p => p.ora));
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// POST - creaza programare noua (doar pacient)
router.post('/', verificaToken, verificaRol('pacient'), async (req, res) => {
  try {
    const { medic, data, ora, motiv } = req.body;
    const medicDoc   = await Medic.findById(medic);
    const pacientDoc = await Utilizator.findById(req.utilizator.id);
    console.log(`âœ… Programare nouÄƒ: ${pacientDoc.nume} la ${medicDoc.nume}, ora ${ora}`);
    const programareNoua = new Programare({
      pacient: req.utilizator.id,
      medic, data, ora, motiv,
      status: 'pending'
    });
    await programareNoua.save();
    res.status(201).json(programareNoua);
  } catch (err) {
    res.status(400).json({ eroare: err.message });
  }
});

// PUT - admin anuleaza orice programare
router.put('/:id/anuleaza-admin', verificaToken, verificaRol('admin'), async (req, res) => {
  try {
    const programare = await Programare.findByIdAndUpdate(
      req.params.id, { status: 'anulata' }, { new: true }
    );
    if (!programare) return res.status(404).json({ mesaj: 'Programarea nu a fost gÄƒsitÄƒ' });
    res.json(programare);
  } catch (err) {
    res.status(400).json({ eroare: err.message });
  }
});

// PUT - MEDIC anuleaza propria programare
router.put('/:id/anuleaza-medic', verificaToken, verificaRol('medic'), async (req, res) => {
  try {
    const programare = await Programare.findById(req.params.id);
    if (!programare) return res.status(404).json({ mesaj: 'Programarea nu a fost gÄƒsitÄƒ' });
    if (programare.medic.toString() !== req.utilizator.id)
      return res.status(403).json({ mesaj: 'Nu poÈ›i anula aceastÄƒ programare' });
    programare.status = 'anulata';
    await programare.save();
    res.json(programare);
  } catch (err) {
    res.status(400).json({ eroare: err.message });
  }
});

// PUT - PACIENT anuleaza propria programare
router.put('/:id/anuleaza-pacient', verificaToken, verificaRol('pacient'), async (req, res) => {
  try {
    const programare = await Programare.findById(req.params.id);
    if (!programare) return res.status(404).json({ mesaj: 'Programarea nu a fost gÄƒsitÄƒ' });
    if (programare.pacient.toString() !== req.utilizator.id)
      return res.status(403).json({ mesaj: 'Nu poÈ›i anula aceastÄƒ programare' });
    programare.status = 'anulata';
    await programare.save();
    res.json(programare);
  } catch (err) {
    res.status(400).json({ eroare: err.message });
  }
});

module.exports = router;