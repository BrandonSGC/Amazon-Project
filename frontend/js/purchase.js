// Variables
let products = JSON.parse(localStorage.getItem("cart")) || [];
const cartTableBody = document.getElementById("cartTableBody");
const productsCounter = document.querySelector(".cart__counter span");
const btnVaciarCarrito = document.querySelector(".cart__button");
const purchaseForm = document.querySelector("#purchaseForm");

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Show products in the cart
  showProductsInCart();

  // Empty shopping cart.
  btnVaciarCarrito.addEventListener("click", emptyCart);

  // Send data to backend.
  purchaseForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    fetch("http://localhost:3000/purchase", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(products),
    })
      .then((res) => res.json()) // <= Handle JSON response from server
      .then((data) => console.log(data))
      .catch((error) => console.error(error));
  });
});

// Funciones

function showProductsInCart() {
  // Iterar sobre los productos y agregar filas a la tabla
  products.forEach((product) => {
    const row = document.createElement("tr");
    const { image, name, price, quantity } = product;
    row.innerHTML = `
        <td>
          <img class="cart__image" src="${image}" alt="Product Image">
        </td>
        <td>${name}</td>
        <td>${price}</td>
        <td>${quantity}</td>
        <td><a href="#" class="cart__delete">X</td>`;
    cartTableBody.appendChild(row);
  });

  productsCounter.textContent = products.length;
}

function sicronizarStorage() {
  localStorage.setItem("cart", JSON.stringify(products));
}

function limpiarHTML() {
  cartTableBody.innerHTML = "";
}

function emptyCart() {
  products = [];
  limpiarHTML();
  productsCounter.textContent = 0;
  sicronizarStorage();
}
