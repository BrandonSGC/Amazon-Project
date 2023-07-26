// Este archivo vamos a tener la configuración de la base de datos 
// de SQL Server y la lógica relacionada.

const sql = require('mssql');

// Configuración de la conexión a la base de datos
const config = {
  user: 'sa',
  password: 'root',
  server: 'localhost',
  database: 'Amazon',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Funcion para insertar los clientes.
async function login(cedula, nombre, primerApellido,
segundoApellido, fechaNacimiento, telefono, email, sexo, estado) {
    try {
        // Creamos el pool
        const pool = await sql.connect(config);

        await pool.request()
        .input('cedula', sql.Int, cedula)
        .input('nombre', sql.VarChar(30), nombre)
        .input('primerApellido', sql.VarChar(30), primerApellido)
        .input('segundoApellido', sql.VarChar(30), segundoApellido)            
        .input('telefono', sql.Int, telefono)
        .input('email', sql.VarChar(60), email)
        .input('fechaNacimiento', sql.Date, fechaNacimiento)
        .input('sexo', sql.VarChar(1), sexo)
        .input('estado', sql.Bit, estado)
        .query('INSERT INTO Cliente VALUES (@cedula, @nombre, @primerApellido, @segundoApellido, @telefono, @email, @fechaNacimiento, @sexo, @estado)');
        pool.close();
    } catch (error) {
        console.error('Error al insertar los datos del Cliente.', error)
    }
}

// Función para obtener los clientes.
async function obtenerClientesSQLServer() {
    try {
        await sql.connect(config);
        const result = await sql.query('SELECT * FROM Cliente');
        return result.recordset;
    } catch (error) {
        throw error;
    } finally {
        sql.close();
    }
}


// Exportamos las funciones.
module.exports = {
    login,
    obtenerClientesSQLServer,
};
