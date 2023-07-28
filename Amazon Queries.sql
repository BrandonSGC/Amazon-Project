-- Creación de la base de datos.
CREATE DATABASE Amazon;
USE Amazon;


-- Creación de Tablas. CAMBIAR A UNIQUE EL NOMBRE DE LOS PRODUCTOS.
DROP TABLE IF EXISTS Usuarios;
CREATE TABLE Usuarios(
	cedula INT PRIMARY KEY,
	password VARCHAR(40) NOT NULL
);
SELECT * FROM Usuarios WHERE cedula = 117970823 AND password = 'bran123';
DROP TABLE IF EXISTS CuentaBancaria;
CREATE TABLE CuentaBancaria(	
	numCuenta INT PRIMARY KEY,
	cedula INT NOT NULL,
	saldo INT NOT NULL,
	FOREIGN KEY (cedula) REFERENCES Usuarios(cedula)
);

DROP TABLE IF EXISTS CEDI;
CREATE TABLE CEDI(
	sku INT PRIMARY KEY,
	nombreProducto VARCHAR(60) UNIQUE,
	cantidad INT NOT NULL,
	precio INT NOT NULL
);

DROP TABLE IF EXISTS Alibaba;
CREATE TABLE Alibaba(
	sku INT PRIMARY KEY,
	nombreProducto VARCHAR(60) UNIQUE,
	cantidad INT NOT NULL,
	precio INT NOT NULL
);

DROP TABLE IF EXISTS Ebay;
CREATE TABLE Ebay(
	sku INT PRIMARY KEY,
	nombreProducto VARCHAR(60) UNIQUE,
	cantidad INT NOT NULL,
	precio INT NOT NULL
);

DROP TABLE IF EXISTS MercadoLibre;
CREATE TABLE MercadoLibre(
	sku INT PRIMARY KEY,
	nombreProducto VARCHAR(60) ,
	cantidad INT NOT NULL,
	precio INT NOT NULL
);


-- Inserción de Datos.
INSERT INTO Usuarios (cedula, password)
VALUES (117970823, 'bran123');

INSERT INTO CuentaBancaria
VALUES (23123, 117970823, 0);

UPDATE CuentaBancaria
SET saldo = 5000
WHERE cedula = 117970823;

INSERT INTO CEDI 
VALUES
(1232, 'Macbook Air - 14 Pulgadas', 8, 1300),
(1431, 'Nuevo Echo Dot - Alexa - Negro', 23, 85),
(3243, 'Playstation 5 - Sony', 2, 650),
(8434, 'Speaker - JBL', 5, 299),
(2221, 'Pantalla Samsung - 70"', 5, 1500),
(9532, 'WATCH GTR Black', 6, 96);

INSERT INTO Alibaba 
VALUES
(2221, 'Pantalla Samsung - 70"', 15, 1400),
(6423, 'Macbook Air - 14 Pulgadas', 9, 1299),
(9645, 'iPhone 14 Pro', 23, 999),
(2355, 'Playstation 5 - Sony', 31, 545),
(8663, 'Hacker Mask', 27, 20),
(9974, 'NIKE Janoski', 15, 299);

INSERT INTO Ebay 
VALUES
(1431, 'Nuevo Echo Dot - Alexa - Negro', 12, 85),
(8923, 'iPhone 14 Pro', 13, 900),
(3243, 'Hacker Mask', 14, 20),
(1229, 'NIKE Janoski', 11, 299),
(3111, 'Speaker - JBL', 14, 299);

INSERT INTO MercadoLibre
VALUES
(2221, 'Pantalla Samsung - 70"', 11, 1300),
(9555, 'iPhone 14 Pro', 5, 999),
(7344, 'Hacker Mask', 14, 20),
(3243, 'Playstation 5 - Sony', 31, 620),
(2103, 'NIKE Janoski', 7, 299);


-- Procedimientos Almacenados:

-- Actualiza la tabla de CEDI restando el producto que se vendió.
CREATE PROCEDURE spAmazon_MakePurchase
	@productName VARCHAR(60),
	@quantity INT
AS
BEGIN
	UPDATE CEDI
	SET cantidad = cantidad - @quantity
	WHERE nombreProducto = @productName;
END

-- Busca el producto mas barato, lo pasa al cedi y actualiza las tablas.
ALTER PROCEDURE spAmazon_GetCheapestProductAndSendToCEDI
    @ProductName VARCHAR(60),
    @NuevoPrecio INT,  -- Nuevo precio del producto en la tabla CEDI
    @Cantidad INT      -- Cantidad del producto que se necesita en CEDI
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CheapestProduct TABLE (
        sku INT PRIMARY KEY,
        nombreProducto VARCHAR(60),
        cantidad INT NOT NULL,
        precio INT NOT NULL
    );

    BEGIN
        -- Check if the product exists in the Alibaba table and add to the temporary table if found
        INSERT INTO @CheapestProduct
        SELECT TOP 1 * FROM Alibaba WHERE nombreProducto = @ProductName ORDER BY precio;

        -- Check if the product exists in the Ebay table and add to the temporary table if found
        INSERT INTO @CheapestProduct
        SELECT TOP 1 * FROM Ebay WHERE nombreProducto = @ProductName ORDER BY precio;

        -- Check if the product exists in the MercadoLibre table and add to the temporary table if found
        INSERT INTO @CheapestProduct
        SELECT TOP 1 * FROM MercadoLibre WHERE nombreProducto = @ProductName ORDER BY precio;

        -- Get the cheapest product
        DECLARE @CheapestProductID INT;
        SELECT TOP 1 @CheapestProductID = sku FROM @CheapestProduct ORDER BY precio;

        -- Update the cheapest product's price with the new price
        UPDATE @CheapestProduct
        SET precio = @NuevoPrecio
        WHERE sku = @CheapestProductID;

        -- Get the available quantity of the cheapest product
        DECLARE @AvailableQuantity INT;
        SELECT @AvailableQuantity = cantidad FROM @CheapestProduct WHERE sku = @CheapestProductID;

        -- Calculate the quantity to be sent to CEDI (minimum of available quantity and required quantity)
        DECLARE @QuantityToSend INT;
        SET @QuantityToSend = CASE WHEN @AvailableQuantity >= @Cantidad THEN @Cantidad ELSE @AvailableQuantity END;

        -- Subtract the quantity to be sent from the original table
        IF @QuantityToSend > 0
        BEGIN
            UPDATE Alibaba SET cantidad = cantidad - @QuantityToSend WHERE sku = @CheapestProductID;
            UPDATE Ebay SET cantidad = cantidad - @QuantityToSend WHERE sku = @CheapestProductID;
            UPDATE MercadoLibre SET cantidad = cantidad - @QuantityToSend WHERE sku = @CheapestProductID;
        END;

        -- Check if the product already exists in the CEDI table
        DECLARE @CediProductID INT;
        SELECT @CediProductID = sku FROM CEDI WHERE nombreProducto = @ProductName;

        -- If the product exists, update the quantity; otherwise, insert the new entry in the CEDI table
        IF @CediProductID IS NOT NULL
        BEGIN
            UPDATE CEDI SET cantidad = cantidad + @QuantityToSend WHERE sku = @CediProductID;
        END
        ELSE
        BEGIN
            -- Insert a new entry for the cheapest product in the CEDI table with the specified quantity
            INSERT INTO CEDI (sku, nombreProducto, cantidad, precio)
            VALUES (@CheapestProductID, (SELECT nombreProducto FROM @CheapestProduct WHERE sku = @CheapestProductID), @QuantityToSend, @NuevoPrecio);
        END;
    END;
END;

SELECT * FROM CEDI;
SELECT * FROM Alibaba;
SELECT * FROM Ebay;
SELECT * FROM MercadoLibre;

UPDATE CEDI
SET cantidad = 3
WHERE sku = 2221;
UPDATE MercadoLibre
SET cantidad = 15
WHERE sku = 2221;
UPDATE Alibaba
SET cantidad = 15
WHERE sku = 2321;

-- Obtener los detalles de los usuarios con sus respectivas cuentas bancarias.
SELECT Usuarios.cedula AS cedula_cliente, CuentaBancaria.numCuenta AS numero_cuenta, CuentaBancaria.saldo AS saldo
FROM Usuarios
JOIN CuentaBancaria
ON Usuarios.cedula = CuentaBancaria.cedula;
