const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Parse JSON request bodies
app.use(express.json());

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// Load scheme data once at startup
const dataPath = path.join(__dirname, 'data', 'formatted-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// POST /search — return all schemes (no filtering in phase 1)
app.post('/search', (req, res) => {
  res.json(data.schemes);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
