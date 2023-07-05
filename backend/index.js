// Import express.
const express = require("express");
const app = express();

const PORT = 3000;

// Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// Routing
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/html/index.html"));
});
