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
      .input('cedula', sql.Int, cedula)
      .input('password', sql.NVarChar, password)
      .query('SELECT * FROM Usuarios WHERE cedula = @cedula AND password = @password');

    if (result.recordset.length > 0) {
      // El inicio de sesión fue exitoso
      return { success: true, message: 'Inicio de sesión exitoso' };
    } else {
      // Credenciales inválidas
      return { success: false, message: 'Credenciales inválidas' };
    }
  } catch (error) {
    console.error('Error en la conexión o consulta SQL:', error.message);
    return { success: false, message: 'Error en el servidor' };
  }
}


async function thereIsProduct(name) {
  const pool = await sql.connect(config);

  const result = await pool
  .request()
  .input('name', sql.VarChar, name)
  .query('SELECT * FROM CEDI WHERE nombreProducto = @name');


  if (result.recordset.length > 0 && result.recordset[0].cantidad > 0) {
    return {success: true, quantity: result.recordset[0].cantidad};
  } else {
    return {success: false};
  }
}


async function spUpdateCEDI(productName, quantity) {
  try {
    // Create a new connection pool.
    const pool = await sql.connect(config);

    // Execute the stored procedure.
    await pool.request()
      .input("productName", sql.VarChar(60), productName)
      .input("quantity", sql.Int, quantity)
      .execute("spAmazon_MakePurchase");

    // Close the connection pool.
    pool.close();
  } catch (err) {
    console.error("Error executing the stored procedure:", err);
  }
}

async function spGetCheapestProductAndSendToCEDI(productName, price, quantity) {
  try {
    // Create a new connection pool.
    const pool = await sql.connect(config);

    // Execute the stored procedure.
    await pool
      .request()
      .input("ProductName", sql.VarChar(60), productName)
      .input("NuevoPrecio", sql.Int, price)
      .input("Cantidad", sql.Int, quantity)
      .execute("spAmazon_GetCheapestProductAndSendToCEDI"); // Corrected the execute statement

    // Close the connection pool.
    pool.close();
  } catch (err) {
    console.error("Error executing the stored procedure:", err);
  }
}



async function obtenerClientesSQLServer() {
  try {
    await sql.connect(config);
    const result = await sql.query("SELECT * FROM Cliente");
    return result.recordset;
  } catch (error) {
    throw error;
  } finally {
    sql.close();
  }
}

// Exportamos las funciones.
module.exports = { 
  loginUser, 
  thereIsProduct,
  spUpdateCEDI,
  spGetCheapestProductAndSendToCEDI,
};
