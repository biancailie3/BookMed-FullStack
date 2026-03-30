const express = require('express');
const router = express.Router();
const Medic = require('../models/Medic');
const Review = require('../models/Review'); 
const { verificaToken, verificaRol } = require('../middleware/auth');

// GET - toti medicii (public)
router.get('/', async (req, res) => {
  try {
    const toti = await Medic.find().select('-parola');
    res.json(toti);
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// GET - cauta medici dupa specialitate (public)
router.get('/specialitate/:specialitate', async (req, res) => {
  try {
    const medici = await Medic.find({ 
      specialitate: req.params.specialitate 
    }).select('-parola');
    res.json(medici);
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// GET - medici neaprobati (admin)
router.get('/neaprobati', async (req, res) => {
  try {
    const medici = await Medic.find({ activ: false }).select('-parola')
    res.json(medici)
  } catch (err) {
    res.status(500).json({ eroare: err.message })
  }
})

// PUT - aproba un medic (admin)
router.put('/aproba/:id', async (req, res) => {
  try {
    const medic = await Medic.findByIdAndUpdate(
      req.params.id,
      { activ: true },
      { new: true }
    )
    res.json(medic)
  } catch (err) {
    res.status(500).json({ eroare: err.message })
  }
})

// GET - un singur medic dupa ID (public)
router.get('/:id', async (req, res) => {
  try {
    const medic = await Medic.findById(req.params.id).select('-parola');
    if (!medic) {
      return res.status(404).json({ mesaj: 'Medicul nu a fost gÄƒsit' });
    }
    res.json(medic);
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// PUT - medicul isi editeaza propriul profil (protejat)
router.put('/:id', verificaToken, verificaRol('medic'), async (req, res) => {
  try {
    const medicActualizat = await Medic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-parola');
    res.json(medicActualizat);
  } catch (err) {
    res.status(400).json({ eroare: err.message });
  }
});

router.delete('/:id', verificaToken, verificaRol('admin'), async (req, res) => {
  try {
    const mongoose = require('mongoose')
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ mesaj: 'ID invalid' })
    }
    const medic = await Medic.findByIdAndDelete(req.params.id)
    if (!medic) return res.status(404).json({ mesaj: 'Medicul nu a fost gasit' })
    
    await Programare.deleteMany({ medic: req.params.id })
    
    // Stergem si programarile asociate medicului sters
    const Programare = require('../models/Programare')
    await Programare.deleteMany({ idMedic: req.params.id })
    
    res.json({ mesaj: 'Medic sters cu succes.' })
  } catch (err) {
    res.status(500).json({ eroare: err.message })
  }
})

// ==========================================
// RUTE PENTRU REVIEWS
// ==========================================

// POST - AdaugÄƒ o recenzie È™i recalculeazÄƒ media medicului
router.post('/:id/reviews', async (req, res) => {
  try {
    const { numeUtilizator, comentariu, nota } = req.body;
    const idMedic = req.params.id;

    const reviewNou = new Review({
      idMedic,
      numeUtilizator,
      comentariu,
      nota: Number(nota)
    });
    await reviewNou.save();

    const toateReviewurile = await Review.find({ idMedic });
    const nrReviewuri = toateReviewurile.length;
    
    const sumaNote = toateReviewurile.reduce((acc, curr) => acc + curr.nota, 0);
    const mediaCalculata = (sumaNote / nrReviewuri).toFixed(1);

    await Medic.findByIdAndUpdate(idMedic, {
      rating: parseFloat(mediaCalculata),
      numarReviewuri: nrReviewuri
    });

    res.status(201).json(reviewNou);
  } catch (err) {
    res.status(400).json({ eroare: err.message });
  }
});

// GET - ObÈ›ine toate recenziile pentru un anumit medic
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ idMedic: req.params.id }).sort({ data: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// PUT - Medicul is actualizeaza poza de profil
router.put('/:id/upload-poza', verificaToken, verificaRol('medic'), async (req, res) => {
  try {
    const { pozaUrl } = req.body;
    
    if (!pozaUrl) {
      return res.status(400).json({ mesaj: "URL-ul pozei este necesar." });
    }

    const medicActualizat = await Medic.findByIdAndUpdate(
      req.params.id,
      { poza: pozaUrl },
      { new: true }
    ).select('-parola');

    res.json({ mesaj: "Poza a fost actualizatÄƒ!", medic: medicActualizat });
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

module.exports = router;