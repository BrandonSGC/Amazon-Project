const express = require('express');
const app = express();
const path = require('path');

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// DBs
const { loginUser } = require('./db/connection');


// Middleware to serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, '..', 'frontend')));


// ROUTING

// Login Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.post('/login', async (req, res) => {
  const { cedula, password } = req.body;

  try {
    const loginResult = await loginUser(cedula, password);

    if (loginResult.success) {
      res.redirect('/home');
    } else {
      res.status(401).send(loginResult.message);
    }
  } catch (error) {
    console.error('Error durante el inicio de sesión:', error);
    res.status(500).send('Error durante el inicio de sesión');
  }
});

// Home Route
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'home.html'));
});


// Purchase Route
app.get('/purchase', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'purchase.html'));
});
// Purchase Route
app.post("/purchase", (req,res)=>{
  const products = req.body;
  //console.log(products);

  products.forEach( element => {
    console.log(element);
  });
  //res.status(200).json({ received: req.body }); // Send back a confirmation JSON response
});


// Start the server on a specific port
const port = 3000; // You can change the port if you wish
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
