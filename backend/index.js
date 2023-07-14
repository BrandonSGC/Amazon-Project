// Import express.
const express = require("express");
const path = require('path');
const app = express();

const PORT = 3000;

// Servir archivos estáticos desde la carpeta 'frontend'
app.use(express.static(path.join(__dirname, '../frontend')));

// Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Routing
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, '..', "frontend", "index.html");
  res.sendFile(filePath);
});
