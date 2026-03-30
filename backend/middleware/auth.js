const jwt = require('jsonwebtoken');

const verificaToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mesaj: 'Acces interzis, token lipsă' });
  }

  try {
    const dateleToken = jwt.verify(token, process.env.JWT_SECRET);
    req.utilizator = dateleToken;
    next();
  } catch (err) {
    res.status(401).json({ mesaj: 'Token invalid sau expirat' });
  }
};

const verificaRol = (...roluri) => {
  return (req, res, next) => {
    if (!roluri.includes(req.utilizator.rol)) {
      return res.status(403).json({ mesaj: 'Nu ai permisiunea necesară' });
    }
    next();
  };
};

module.exports = { verificaToken, verificaRol };