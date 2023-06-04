// Require express
const express = require("express");

// Create an express server
const app = express();
var path = require("path");

app.use(express.static(path.join(__dirname, "public")));
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "html");

// Create a route handler for the home path
app.get("/", (req, res) => {
  //send vies first.html file
  res.sendFile("/views/index.html", { root: __dirname });
});

app.get("/co2_sektor", (req, res) => {
  //send vies first.html file
  res.sendFile("/views/co2_sektor.html", { root: __dirname });
});

app.get("/co2_product", (req, res) => {
  //send vies first.html file
  res.sendFile("/views/co2_product.html", { root: __dirname });
});

app.get("/produce_meat", (req, res) => {
  //send vies first.html file
  res.sendFile("/views/produce_meat.html", { root: __dirname });
});

app.get("/test", (req, res) => {
  //send vies first.html file
  res.sendFile("/views/test.html", { root: __dirname });
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
