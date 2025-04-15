require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/key', (req, res) => {
    res.json({ key: process.env.SPOONACULAR_API_KEY });
});

module.exports = app;