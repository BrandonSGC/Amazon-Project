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
    console.log(`Total Ammount to pay: $${purchaseAmmount}`);

    const balance = await getAccountBalance(cedula, accountNumber, password);
    console.log(`Balance: ${balance}`);

    // Validate if the user has enough money to buy.
    if (balance > purchaseAmmount) {
      try {
        await makePurchase(products, purchaseAmmount, accountNumber);
        //await spUpdateBalance(purchaseAmmount, accountNumber);
        //res.send("Comprada realizada con éxito!");
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
  
  for (const product of products) {
    const { name, price, quantity } = product;
    console.log(`- Buscando ${quantity} productos: ${name} con el precio de ${price}`);

    let availableQuantity = (await thereIsProduct(name)).quantity;

    console.log(`- Cantidad disponible del producto en CEDI: ${availableQuantity}`);

    // Validate if we have the product.
    if ((await thereIsProduct(name)).success) {
      console.log(`- Si hay producto en CEDI`);
      // Validate if we have the quantity of the product.
      if (availableQuantity >= quantity) {
        console.log(`- Hay suficiente cantidad en CEDI`);
        // Update the CEDI's table records.
        await spUpdateCEDI(name, quantity);
        //await spUpdateBalance(purchaseAmmount, accountNumber);
        console.log("- Comprada realizada con éxito!");
      } else {
        console.log(`- No hay suficiente cantidad en CEDI`);
        const difference = quantity - availableQuantity;
        console.log(`Diferencia entre la cantidad a comprar ${quantity} y cantidad disponible: ${availableQuantity}`);

        // Transfer the cheapest product to CEDI's table.
        console.log(`Datos a mandar al stored procedure: ${name}, ${parseInt(price.slice(1))} y ${difference}`);
       
        await spGetCheapestProductAndSendToCEDI(name, parseInt(price.slice(1)), difference);

        // Refresh the quuantity after resupplay
        availableQuantity = (await thereIsProduct(name)).quantity;
        
        // Update the CEDI's table.
        await spUpdateCEDI(name, availableQuantity);
        
        console.log(`Stored procedure executed, or should've...`);


        //await spUpdateBalance(purchaseAmmount, accountNumber);
        console.log("- Comprada realizada con éxito!");
      }
    } else {
      console.log(`- No hay producto en CEDI`);

      const AvailableAlibabaProduct = (await thereIsProductInAlibaba(name)).quantity;
      const AvailableEbayProduct = (await thereIsProductInEbay(name)).quantity;
      const AvailableMercadoLibreProduct = (await thereIsProductInMercadoLibre(name)).quantity;
      
      console.log(`Cantidad productos en Alibaba: ${AvailableAlibabaProduct}`);
      console.log(`Cantidad productos en Ebay: ${AvailableEbayProduct}`);
      console.log(`Cantidad productos en Mercado Libre: ${AvailableMercadoLibreProduct}`);

      // Validate that there is enough porducts on the tables
      if (
        quantity <= AvailableAlibabaProduct ||
        quantity <= AvailableEbayProduct ||
        quantity <= AvailableMercadoLibreProduct
      ) {
        console.log("- Se puede comprar porque hay suficiente cantidad en alguna tabla");
        console.log('- Realizando compra...')
        
        //Transfer the cheapest product to CEDI's table.
        console.log(`Datos a mandar al stored procedure: ${name}, ${parseInt(price.slice(1))} y ${quantity}`);
        await spGetCheapestProductAndSendToCEDI(name, parseInt(price.slice(1)), quantity);
        availableQuantity = (await thereIsProduct(name)).quantity;
        console.log(`Cantidad en el CEDI despues de obtener el producto mas barato: ${availableQuantity}`);
        // Update the CEDI's table.
        await spUpdateCEDI(name, availableQuantity);

        console.log(`Cantidad en el CEDI despues de actualizar el registro: ${availableQuantity}`);

        //await spUpdateBalance(purchaseAmmount, accountNumber);
        console.log("- Comprada realizada con éxito!");
      } else {
        console.log("- No hay suficientes productos...");
      }
    }
  }
}
