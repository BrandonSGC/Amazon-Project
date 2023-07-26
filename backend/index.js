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

// Routing.

// Route to show the login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Login Route
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'home.html'));
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


// Other routes you may need, such as the purchase page
app.get('/purchase', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'purchase.html'));
});

// Start the server on a specific port
const port = 3000; // You can change the port if you wish
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
