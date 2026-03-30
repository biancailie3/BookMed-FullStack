
/*const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Utilizator = require('../models/Utilizator');
const Medic = require('../models/Medic');
const { verificaToken } = require('../middleware/auth');

// 1. POST - inregistrare
router.post('/register', async (req, res) => {
  try {
    const { nume, email, parola, rol } = req.body;
    const Model = rol === 'medic' ? Medic : Utilizator;

    const existaDeja = await Model.findOne({ email });
    if (existaDeja) {
      return res.status(400).json({ mesaj: 'Email-ul este deja folosit' });
    }

    const sare = await bcrypt.genSalt(10);
    const parolaCriptata = await bcrypt.hash(parola, sare);

    const contNou = new Model({
      ...req.body,
      parola: parolaCriptata
    });

    await contNou.save();
    res.status(201).json({ mesaj: 'Cont creat cu succes!' });
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// 2. GET - toti utilizatorii(admin)
router.get('/utilizatori', async (req, res) => {
  try {
    const utilizatori = await Utilizator.find().select('-parola');
    res.json(utilizatori);
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// 3. POST - Login (detectie automata rol)
router.post('/login', async (req, res) => {
  try {
    const { email, parola } = req.body;

    // cautam intai in utilizatori, daca nu gasim, cautam in medici (asta pentru a detecta automat rolul)
    let utilizator = await Utilizator.findOne({ email });
    let rolDetectat = 'pacient';

    if (!utilizator) {
      utilizator = await Medic.findOne({ email });
      rolDetectat = 'medic';
    }

    if (!utilizator) {
      return res.status(400).json({ mesaj: 'Email sau parolă incorecte' });
    }

    // Verificam daca medicul este aprobat de admin
    if (rolDetectat === 'medic' && !utilizator.activ) {
      return res.status(403).json({ mesaj: 'Contul tău nu a fost aprobat încă de admin.' });
    }

    const parolaCorecta = await bcrypt.compare(parola, utilizator.parola);
    if (!parolaCorecta) {
      return res.status(400).json({ mesaj: 'Email sau parolă incorecte' });
    }

    const token = jwt.sign(
      { id: utilizator._id, rol: rolDetectat },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      utilizator: {
        id: utilizator._id,
        nume: utilizator.nume,
        email: utilizator.email,
        rol: rolDetectat
      }
    });
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// 4. PUT - Actualizare profil Pacient
router.put('/utilizatori/:id', verificaToken, async (req, res) => {
  try {
      if (req.utilizator.id !== req.params.id && req.utilizator.rol !== 'admin') {
          return res.status(403).json({ error: 'Acces interzis.' });
      }

      const utilizator = await Utilizator.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true, select: '-parola' }
      );

      res.json(utilizator);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

module.exports = router;*/
/*
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Utilizator = require('../models/Utilizator');
const Medic = require('../models/Medic');
const { verificaToken } = require('../middleware/auth');

// 1. POST - inregistrare
router.post('/register', async (req, res) => {
  try {
    const { nume, email, parola, rol } = req.body;
    const Model = rol === 'medic' ? Medic : Utilizator;
    const existaDeja = await Model.findOne({ email });
    if (existaDeja) {
      return res.status(400).json({ mesaj: 'Email-ul este deja folosit' });
    }
    const sare = await bcrypt.genSalt(10);
    const parolaCriptata = await bcrypt.hash(parola, sare);
    const contNou = new Model({
      ...req.body,
      parola: parolaCriptata
    });
    await contNou.save();
    res.status(201).json({ mesaj: 'Cont creat cu succes!' });
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// 2. GET - toti utilizatorii(admin)
router.get('/utilizatori', async (req, res) => {
  try {
    const utilizatori = await Utilizator.find().select('-parola');
    res.json(utilizatori);
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// 3. POST - Login (detectie automata rol)
router.post('/login', async (req, res) => {
  try {
    const { email, parola } = req.body;

    // cautam intai in utilizatori, daca nu gasim, cautam in medici
    let utilizator = await Utilizator.findOne({ email });
    let rolDetectat = utilizator?.rol || null;

    if (!utilizator) {
      utilizator = await Medic.findOne({ email });
      rolDetectat = 'medic';
    }

    if (!utilizator) {
      return res.status(400).json({ mesaj: 'Email sau parolÄƒ incorecte' });
    }

    // Verificam daca medicul este aprobat de admin
    if (rolDetectat === 'medic' && !utilizator.activ) {
      return res.status(403).json({ mesaj: 'Contul tÄƒu nu a fost aprobat Ã®ncÄƒ de admin.' });
    }

    const parolaCorecta = await bcrypt.compare(parola, utilizator.parola);
    if (!parolaCorecta) {
      return res.status(400).json({ mesaj: 'Email sau parolÄƒ incorecte' });
    }

    const token = jwt.sign(
      { id: utilizator._id, rol: rolDetectat },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      utilizator: {
        id: utilizator._id,
        nume: utilizator.nume,
        email: utilizator.email,
        rol: rolDetectat
      }
    });
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// 4. PUT - Actualizare profil Pacient
router.put('/utilizatori/:id', verificaToken, async (req, res) => {
  try {
    if (req.utilizator.id !== req.params.id && req.utilizator.rol !== 'admin') {
      return res.status(403).json({ error: 'Acces interzis.' });
    }
    const utilizator = await Utilizator.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, select: '-parola' }
    );
    res.json(utilizator);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;*/
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Utilizator = require('../models/Utilizator');
const Medic = require('../models/Medic');
const { verificaToken } = require('../middleware/auth');

// 1. POST - inregistrare
router.post('/register', async (req, res) => {
  try {
    const { nume, email, parola, rol } = req.body;
    const Model = rol === 'medic' ? Medic : Utilizator;
    const existaDeja = await Model.findOne({ email });
    if (existaDeja) {
      return res.status(400).json({ mesaj: 'Email-ul este deja folosit' });
    }
    const sare = await bcrypt.genSalt(10);
    const parolaCriptata = await bcrypt.hash(parola, sare);
    const contNou = new Model({
      ...req.body,
      parola: parolaCriptata
    });
    await contNou.save();
    res.status(201).json({ mesaj: 'Cont creat cu succes!' });
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// 2. GET - toti utilizatorii(admin)
router.get('/utilizatori', async (req, res) => {
  try {
    const utilizatori = await Utilizator.find().select('-parola');
    res.json(utilizatori);
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// 3. POST - Login (detectie automata rol)
router.post('/login', async (req, res) => {
  try {
    const { email, parola } = req.body;

    // cautam intai in utilizatori, daca nu gasim, cautam in medici
    let utilizator = await Utilizator.findOne({ email });
    let rolDetectat = utilizator?.rol || null;

    if (!utilizator) {
      utilizator = await Medic.findOne({ email });
      rolDetectat = 'medic';
    }

    if (!utilizator) {
      return res.status(400).json({ mesaj: 'Email sau parolÄƒ incorecte' });
    }

    // Verificam daca medicul este aprobat de admin
    if (rolDetectat === 'medic' && !utilizator.activ) {
      return res.status(403).json({ mesaj: 'Contul tÄƒu nu a fost aprobat Ã®ncÄƒ de admin.' });
    }

    const parolaCorecta = await bcrypt.compare(parola, utilizator.parola);
    if (!parolaCorecta) {
      return res.status(400).json({ mesaj: 'Email sau parolÄƒ incorecte' });
    }

    const token = jwt.sign(
      { id: utilizator._id, rol: rolDetectat },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      utilizator: {
        id: utilizator._id,
        nume: utilizator.nume,
        email: utilizator.email,
        rol: rolDetectat
      }
    });
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// 4. GET - un singur utilizator dupa ID
router.get('/utilizatori/:id', verificaToken, async (req, res) => {
  try {
    const utilizator = await Utilizator.findById(req.params.id).select('-parola');
    if (!utilizator) return res.status(404).json({ mesaj: 'Utilizatorul nu a fost gasit' });
    res.json(utilizator);
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

// 5. PUT - Actualizare profil Pacient
router.put('/utilizatori/:id', verificaToken, async (req, res) => {
  try {
    if (req.utilizator.id !== req.params.id && req.utilizator.rol !== 'admin') {
      return res.status(403).json({ error: 'Acces interzis.' });
    }
    const utilizator = await Utilizator.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, select: '-parola' }
    );
    res.json(utilizator);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;