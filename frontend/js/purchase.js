let products = JSON.parse(localStorage.getItem("cart")) || [];
const cartTableBody = document.getElementById("cartTableBody");
const productsCounter = document.querySelector(".cart__counter span");
const btnVaciarCarrito = document.querySelector('.cart__button');

// Mostrar los productos en el carrito cuando se cargue la página
document.addEventListener("DOMContentLoaded", () => {
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
});

// Empty shopping cart.
btnVaciarCarrito.addEventListener("click", emptyCart);


function sicronizarStorage() {
    localStorage.setItem('cart', JSON.stringify(products))
}

function limpiarHTML() {
  cartTableBody.innerHTML = '';
}

function emptyCart() {    
    products = [];
    limpiarHTML();
    productsCounter.textContent = 0;
    sicronizarStorage();
}
