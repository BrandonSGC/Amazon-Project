const sql = require("mssql");

// Database connection.
const config = {
  user: "sa",
  password: "root",
  server: "localhost",
  database: "Amazon",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Functions

async function loginUser(cedula, password) {
  try {
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("cedula", sql.Int, cedula)
      .input("password", sql.NVarChar, password)
      .query(
        "SELECT * FROM Usuarios WHERE cedula = @cedula AND password = @password"
      );

    if (result.recordset.length > 0) {
      // El inicio de sesión fue exitoso
      return { success: true, message: "Inicio de sesión exitoso" };
    } else {
      // Credenciales inválidas
      return { success: false, message: "Credenciales inválidas" };
    }
  } catch (error) {
    console.error("Error en la conexión o consulta SQL:", error.message);
    return { success: false, message: "Error en el servidor" };
  }
}

async function thereIsProduct(name) {
  const pool = await sql.connect(config);

  const result = await pool
    .request()
    .input("name", sql.VarChar, name)
    .query("SELECT * FROM CEDI WHERE nombreProducto = @name");

  if (result.recordset.length > 0 && result.recordset[0].cantidad > 0) {
    return { success: true, quantity: result.recordset[0].cantidad };
  } else {
    return { success: false };
  }
}

async function spUpdateCEDI(productName, quantity) {
  try {
    const pool = await sql.connect(config);

    await pool
      .request()
      .input("productName", sql.VarChar(60), productName)
      .input("quantity", sql.Int, quantity)
      .execute("spAmazon_UpdateCEDI");

    pool.close();
  } catch (err) {
    console.error("Error executing the stored procedure spUpdateCEDI:", err);
  }
}

async function spGetCheapestProductAndSendToCEDI(productName, price, quantity) {
  try {
    const pool = await sql.connect(config);

    await pool
      .request()
      .input("ProductName", sql.VarChar(60), productName)
      .input("NuevoPrecio", sql.Int, price)
      .input("Cantidad", sql.Int, quantity)
      .execute("spAmazon_GetCheapestProductAndSendToCEDI");

    pool.close();
  } catch (err) {
    console.error("Error executing the stored procedure spGetCheapestProductAndSendToCEDI:", err);
  }
}

async function getAccountBalance(cedula, accountNumber, password) {
  try {
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("cedula", sql.Int, cedula)
      .input("accountNumber", sql.Int, accountNumber)
      .input("password", sql.VarChar(30), password)
      .execute("spAmazon_GetBalance");

    if (result.recordset.length > 0) {
      pool.close();
      return result.recordset[0].saldo;
    } else {
      return 0;
    }
  } catch {
    console.error("Error al obtener el saldo de la cuenta.");
  }
}

async function spUpdateBalance(purchaseAmmount, accountNumber) {
  try {
    const pool = await sql.connect(config);

    await pool
      .request()
      .input("purchaseAmmount", sql.Int, purchaseAmmount)
      .input("accountNumber", sql.Int, accountNumber)
      .execute("spAmazon_UpdateBalance");

    pool.close();
  } catch (err) {
    console.error("Error executing the stored procedure spUpdateBalance:", err);
  }
}

// Exportamos las funciones.
module.exports = {
  loginUser,
  thereIsProduct,
  spUpdateCEDI,
  spGetCheapestProductAndSendToCEDI,
  getAccountBalance,
  spUpdateBalance,
};
