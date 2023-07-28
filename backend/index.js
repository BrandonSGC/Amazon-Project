const express = require("express");
const app = express();
const path = require("path");

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// DBs
const {
  loginUser,
  thereIsProduct,
  spUpdateCEDI,
  spGetCheapestProductAndSendToCEDI,
} = require("./db/connection");
const { connect } = require("http2");

// Middleware to serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, "..", "frontend")));

// ROUTING

// Login Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.post("/login", async (req, res) => {
  const { cedula, password } = req.body;

  try {
    const loginResult = await loginUser(cedula, password);

    if (loginResult.success) {
      res.redirect("/home");
    } else {
      res.status(401).send(loginResult.message);
    }
  } catch (error) {
    console.error("Error durante el inicio de sesión:", error);
    res.status(500).send("Error durante el inicio de sesión");
  }
});

// Home Route
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "home.html"));
});

// Purchase Route
app.get("/purchase", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "purchase.html"));
});
// Purchase Route
app.post("/purchase", async (req, res) => {
  // Get products and account data.
  const {cedula, accountNumber, password, products} = req.body;

  // Validate if the user has enough money to buy it.
  
  // Get total ammount to pay.
  const total = getTotalAmmount(products);
  console.log(`Total Ammount to pay: ${total}`);

  await makePurchase(products);

  
  //res.status(200).json({ received: req.body }); // Send back a confirmation JSON response
});

// Start the server on a specific port
const port = 3000; // You can change the port if you wish
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

// Functions
function getTotalAmmount(products) {
  const total = products.reduce((total, product) => {
    const { price, quantity } = product;
    return total + Number(price.slice(1)) * quantity;
  }, 0);
  return total;
}

async function makePurchase(products) {
  // Funcionality make the purchase of the products.
  for (const product of products) {
    // Validate if we have the product.
    if ((await thereIsProduct(product.name)).success) {
      console.log("-Hay producto:");

      // Validate if we have the quantity of the product.
      if ((await thereIsProduct(product.name)).quantity >= product.quantity) {
        // Update the CEDI's table records.
        await spUpdateCEDI(product.name, product.quantity);
        console.log("Purchase completed successfully.");
      } else {
        const cediQuantity = (await thereIsProduct(product.name)).quantity;
        const difference = product.quantity - cediQuantity;

        console.log(`Necesitamos traer: ${difference} productos mas...`);

        // Transfer the cheapest product to CEDI's table.
        await spGetCheapestProductAndSendToCEDI(
          product.name,
          parseInt(product.price.slice(1)),
          difference
        );
        console.log(`Hemos traido los ${difference} productos que faltaban...`);

        // Update the CEDI's table.
        await spUpdateCEDI(
          product.name,
          (
            await thereIsProduct(product.name)
          ).quantity
        );
        console.log("Purchase completed successfully.");
      }
    } else {
      console.log("- No hay producto:");
      // Transfer the cheapest product to CEDI's table.
      await spGetCheapestProductAndSendToCEDI(
        product.name,
        parseInt(product.price.slice(1)),
        product.quantity
      );
      // Update the CEDI's table.
      await spUpdateCEDI(
        product.name,
        (
          await thereIsProduct(product.name)
        ).quantity
      );
      console.log("Purchase completed successfully.");
    }
  }
}
