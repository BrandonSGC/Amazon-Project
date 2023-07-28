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
  getAccountBalance,
} = require("./db/connection");

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
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false, message: loginResult.message });
    }
  } catch (error) {
    console.error("Error durante el inicio de sesión:", error);
    res
      .status(500)
      .json({ success: false, message: "Error durante el inicio de sesión" });
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
  const { cedula, accountNumber, password, products } = req.body;
  try {
    // Get total ammount to pay.
    const total = getTotalAmmount(products);
    console.log(`Total Ammount to pay: ${total}`);

    const balance = await getAccountBalance(cedula, accountNumber, password);
    console.log(`Balance: ${balance}`);

    // Validate if the user has enough money to buy it.
    if (balance > total) {
      await makePurchase(products);
      console.log("Comprada realizada con éxito!");
      res.send("Comprada realizada con éxito!");
    } else {
      console.log("No se ha podido realizar la compra.");
      res.send("Datos invalidos.");
    }
  } catch (error) {
    console.error("Error al realizar la compra:", error);
    res.status(500).send("Error al realizar la compra...");
  }
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
      // Validate if we have the quantity of the product.
      if ((await thereIsProduct(product.name)).quantity >= product.quantity) {
        // Update the CEDI's table records.
        await spUpdateCEDI(product.name, product.quantity);
      } else {
        const cediQuantity = (await thereIsProduct(product.name)).quantity;
        const difference = product.quantity - cediQuantity;

        // Transfer the cheapest product to CEDI's table.
        await spGetCheapestProductAndSendToCEDI(
          product.name,
          parseInt(product.price.slice(1)),
          difference
        );

        // Update the CEDI's table.
        await spUpdateCEDI(
          product.name,
          (
            await thereIsProduct(product.name)
          ).quantity
        );
      }
    } else {
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
    }
  }
}
