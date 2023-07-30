// Variables
let products = JSON.parse(localStorage.getItem("cart")) || [];
const cartTableBody = document.getElementById("cartTableBody");
const productsCounter = document.querySelector(".cart__counter span");
const btnVaciarCarrito = document.querySelector(".cart__button");
const purchaseForm = document.querySelector("#purchaseForm");
const total = document.querySelector("#total");
const cart = document.querySelector('.cart__data');

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Show products in the cart
  showProductsInCart();
  productsCounter.textContent = getQuantityOfProducts(products);
  total.textContent = `$${getTotalAmmountToPay(products)}`;
  // Empty shopping cart.
  btnVaciarCarrito.addEventListener("click", emptyCart);

  // Delete product from shopping cart.
  cart.addEventListener('click', deleteProduct);

  // Send data to backend.
  purchaseForm.addEventListener("submit", (evt) => {
    evt.preventDefault();

    // Get values from form.
    const cedula = document.getElementById("cedula").value;
    const accountNumber = document.getElementById("accountNumber").value;
    const password = document.getElementById("password").value;

    const data = {
      cedula: cedula,
      accountNumber: accountNumber,
      password: password,
      products: products,
    };

    fetch("/purchase", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => { // <= Handle JSON response from server
        res.json().then(data => {
          
          const error = document.getElementById("error-message");
          
          if (data.success) {
            // Show the alert.
            error.textContent = data.message;
            error.className = "form__success";

            //Delete alert after 3 secs.
            setTimeout(() => {
              purchaseForm.removeChild(error);
            }, 3000);
          } else {
            console.log(data.message);
            
            // Show the alert.
            error.textContent = data.message;
            error.className = "form__error";

            //Delete alert after 3 secs.
            setTimeout(() => {
              purchaseForm.removeChild(error);
            }, 3000);
          }
        })
      }) 
      .catch((error) => console.error(error));
  });
});

// Funciones

function deleteProduct(evt) {
  if (evt.target.classList.contains('cart__delete')) {
      const name = evt.target.id;
      products = products.filter( product => product.name != name);
      showProductsInCart();
      sicronizarStorage();
      productsCounter.textContent = getQuantityOfProducts(products);
      total.textContent = `$${getTotalAmmountToPay(products)}`;
  }
}

function showProductsInCart() {
  limpiarHTML();
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
        <td><a href="#" class="cart__delete" id="${name}">X</td>`;
    cartTableBody.appendChild(row);
  });
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
  total.textContent = '$0';
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
