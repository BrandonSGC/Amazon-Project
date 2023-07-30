// Variables
let products = [];
const productsContainer = document.querySelector(".main__display");
const table = document.querySelector(".cart__table tbody");
const productsCounter = document.querySelector(".cart__counter span");
const btnVaciarCarrito = document.querySelector(".cart__button");
const total = document.querySelector("#total");

loadEventListeners();

// Functions
function loadEventListeners() {
  // Add products to shppping cart.
  productsContainer.addEventListener("click", addProduct);

  // Delete product from shopping cart.
  productsContainer.addEventListener("click", deleteProduct);

  // Show the products from the Local Storage
  document.addEventListener("DOMContentLoaded", () => {
    products = JSON.parse(localStorage.getItem("cart")) || [];
    productsCounter.textContent = getQuantityOfProducts(products);
    total.textContent = `$${getTotalAmmountToPay(products)}`;
    showProductsInCart();
  });

  // Empty shopping cart.
  btnVaciarCarrito.addEventListener("click", emptyCart);

  // Delete individual product.
}

function deleteProduct(evt) {
  if (evt.target.classList.contains(".cart__delete")) {
    products = products.filter();
  }
}

// Add a product to the shopping cart.
function addProduct(evt) {
  // Prevent scroll to the top when button is clicked.
  evt.preventDefault();
  if (evt.target.classList.contains("card__button")) {
    const selectedProduct = evt.target.parentElement.parentElement;
    sicronizarStorage();

    getProductInfo(selectedProduct);

    productsCounter.textContent = getQuantityOfProducts(products);
    total.textContent = `$${getTotalAmmountToPay(products)}`;
  }
}

// Returns an object with the info of the product.
function getProductInfo(product) {
  const productInfo = {
    image: product.querySelector(".card__image").src,
    name: product.querySelector(".card__product").textContent,
    price: product.querySelector(".card__price").textContent,
    quantity: 1,
  };

  // Check if a product already exists in the array.
  const exists = products.some((product) => product.name === productInfo.name);

  // If exists
  if (exists) {
    const productos = products.map((producto) => {
      if (producto.name === productInfo.name) {
        producto.quantity++;
        return producto;
      }
      return producto;
    });
    products = [...productos];
  } else {
    products.push(productInfo);
  }

  showProductsInCart();
}

function showProductsInCart() {
  limpiarHTML();

  products.forEach((product) => {
    const row = document.createElement("tr");
    const { image, name, price, quantity } = product;
    row.innerHTML = `
            <td class="td__image">
                <img class="cart__image" src="${image}" alt="Product Image">
            </td>
            <td>${name}</td>
            <td>${price}</td>
            <td>${quantity}</td>
            <td><a href="#" class="cart__delete">X</td>`;
    table.append(row);
  });

  // Add cart to localStorage.
  sicronizarStorage();
}

function sicronizarStorage() {
  localStorage.setItem("cart", JSON.stringify(products));
}

function limpiarHTML() {
  table.innerHTML = "";
}

function emptyCart() {
  products = [];
  limpiarHTML();
  productsCounter.textContent = 0;
  total.textContent = $0;
  sicronizarStorage();
}

// GetQuantityOfProducts
function getQuantityOfProducts(products) {
  let quantityProducts = products.reduce((total, product) => {
    return (total += product.quantity);
  }, 0);
  return quantityProducts;
}

// Return the total ammount to pay of the cart.
function getTotalAmmountToPay(products) {
  const total = products.reduce((total, product) => {
    const { price, quantity } = product;
    return total + Number(price.slice(1)) * quantity;
  }, 0);
  return total;
}
