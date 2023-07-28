// Variables
const form = document.querySelector(".form");

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Send data to backend.
  form.addEventListener("submit", sendReceiveData);
});

// Functions
function sendReceiveData(evt) {
  evt.preventDefault();

  // Get values from form.
  const cedula = document.getElementById("cedula").value;
  const password = document.getElementById("password").value;

  const data = {
    cedula: cedula,
    password: password,
  };

  fetch("/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => {
      // Check if the response status is 200 (OK) or 401 (Unauthorized)
      if (res.status === 200) {
        // If the login is successful (status code 200), redirect to the home page
        window.location.href = "/home";
      } else if (res.status === 401) {
        // If the login fails (status code 401), parse the response as JSON
        // and display the error message to the user
        res.json().then((data) => {
          const error = document.getElementById("error-message");

          error.textContent = data.message;
          error.className = "form__error";

          setTimeout(() => {
            form.removeChild(error);
          }, 3000);
        });
      } else {
        const error = document.getElementById("error-message");
        error.textContent = 'Ha ocurrido un error durante el Inicio de Sesión';
        error.className = "form__error";
      }
    })
    .catch((error) => {.
      console.error("Fetch error:", error);
    });
}
