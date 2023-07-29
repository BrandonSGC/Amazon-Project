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
  spUpdateBalance,
  thereIsProductInAlibaba,
  thereIsProductInEbay,
  thereIsProductInMercadoLibre,
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
    // Get total purchase ammount to pay.
    const purchaseAmmount = getTotalAmmount(products);
    console.log(`Total Ammount to pay: ${purchaseAmmount}`);

    const balance = await getAccountBalance(cedula, accountNumber, password);
    console.log(`Balance: ${balance}`);

    // Validate if the user has enough money to buy it.
    if (balance > purchaseAmmount) {
      try {
        await makePurchase(products, purchaseAmmount, accountNumber);
        //await spUpdateBalance(purchaseAmmount, accountNumber);
        res.send("Comprada realizada con éxito!");
      } catch (error) {
        console.log(`Error al comprar: ${error}`);
      }
    } else {
      console.log("Fondos insuficientes.");
      res.send("Fondos insuficientes.");
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

async function makePurchase(products, purchaseAmmount, accountNumber) {

  // Funcionality make the purchase of the products.
  for (const product of products) {

    const { name, price, quantity } = product;

    const availableQuantity = (await thereIsProduct(name)).quantity;
    // Validate if we have the product.
    if ((await thereIsProduct(name)).success) {
      // Validate if we have the quantity of the product.
      if (availableQuantity >= quantity) {
        // Update the CEDI's table records.
        await spUpdateCEDI(name, quantity);
        await spUpdateBalance(purchaseAmmount, accountNumber);
        console.log('Comprada realizada con éxito!');
      } else {
        const difference = quantity - availableQuantity;

        // Transfer the cheapest product to CEDI's table.
        await spGetCheapestProductAndSendToCEDI(
          name,
          parseInt(price.slice(1)),
          difference
        );

        // Update the CEDI's table.
        await spUpdateCEDI(name, availableQuantity);
        await spUpdateBalance(purchaseAmmount, accountNumber);
        console.log('Comprada realizada con éxito!');
      }
    } else {

      const AvailableAlibabaProduct = (await thereIsProductInAlibaba(name)).quantity;
      const AvailableEbayProduct = (await thereIsProductInEbay(name)).quantity;
      const AvailableMercadoLibreProduct = (await thereIsProductInMercadoLibre(name)).quantity;

      // Validate that there is enough porducts on the tables
      if (quantity <= AvailableAlibabaProduct || quantity <= AvailableEbayProduct || quantity <= AvailableMercadoLibreProduct) {
        console.log('Se puede comprar');

        //Transfer the cheapest product to CEDI's table.
        await spGetCheapestProductAndSendToCEDI(
          name,
          parseInt(price.slice(1)),
          quantity
        );
        // Update the CEDI's table.
        await spUpdateCEDI(
          name,
          (
            await thereIsProduct(name)
          ).quantity
        );
        await spUpdateBalance(purchaseAmmount, accountNumber);
        console.log('Comprada realizada con éxito!');
      } else {
        console.log('No hay suficientes productos...');
      }
    }
  }
}
