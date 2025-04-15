require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Serve static files
app.use(express.static('./'));

// API key endpoint
app.get('/api/key', (req, res) => {
    res.json({ key: process.env.SPOONACULAR_API_KEY });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});