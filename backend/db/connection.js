// Este archivo vamos a tener la configuración de la base de datos
// de SQL Server y la lógica relacionada.

const sql = require("mssql");

// Configuración de la conexión a la base de datos
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

// Funcion para insertar los clientes.
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

// Función para obtener los clientes.
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
module.exports = { loginUser };
