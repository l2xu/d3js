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

app.get("/1", (req, res) => {
  //send vies first.html file
  res.sendFile("/views/1.html", { root: __dirname });
});

app.get("/2", (req, res) => {
  //send vies first.html file
  res.sendFile("/views/2.html", { root: __dirname });
});

app.get("/3", (req, res) => {
  //send vies first.html file
  res.sendFile("/views/3.html", { root: __dirname });
});

app.get("/4", (req, res) => {
  //send vies first.html file
  res.sendFile("/views/4.html", { root: __dirname });
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
