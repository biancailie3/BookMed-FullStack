const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("BookMed - Conectat la MongoDB!"))
  .catch(err => console.log(" Eroare Mongo:", err));

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/medici',      require('./routes/medici'));
app.use('/api/programari',  require('./routes/programari'));

const Medic = require('./models/Medic'); 



app.listen(4000, () => console.log("🚀 BookMed pornit pe portul 4000"));