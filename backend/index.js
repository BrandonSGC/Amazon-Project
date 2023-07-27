const express = require('express');
const app = express();
const path = require('path');

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// DBs
const { loginUser, thereIsProduct, spMakePurchase } = require('./db/connection');


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
app.post("/purchase", async (req,res) => {
  const products = req.body;
  
  // 
  for (const product of products) {
    //console.log(product);

    // Validate if we have the product.
    if ((await thereIsProduct(product.name)).success) {
      console.log(`We have the product ${product.name} and enough quantity (${(await thereIsProduct(product.name)).quantity} in Stock).`);
      console.log(`Cantidad producto a vender: ${product.quantity}`)
      
      // Validate if we have the quantity of the product.
      if ((await thereIsProduct(product.name)).quantity >= product.quantity) {
        // Update the CEDI's table records.
        // Call the makePurchase function to execute the stored procedure and update the CEDI's table records.
        await spMakePurchase(product.name, product.quantity);
        console.log("Purchase completed successfully.");

      }  else {
        // Update the CEDI's table records with the quantity (get all products in stock) .

        // Then, select the cheapest product from the other tables. (loof for the rest of the products)
        console.log("Updating records of CEDI's Table and looking for the product in the other tables....")
      }

    } else {
      console.log(`We don't have the product ${product.name}.`);
      // Search for the cheapest product from the other tables and validate if there are enough quantity.

    }
  }
  
  // Get total ammount to pay.
  const total = getTotalAmmount(products);
  console.log(`Total Ammount to pay: ${total}`);
  //res.status(200).json({ received: req.body }); // Send back a confirmation JSON response
});


// Start the server on a specific port
const port = 3000; // You can change the port if you wish
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});


// Functions
function getTotalAmmount(products) {
  const total = products.reduce( (total, product) => {
    const {price, quantity} = product;
    return total + (Number(price.slice(1)) * quantity);
  }, 0);
  return total
}