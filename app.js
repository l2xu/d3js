// Import required modules
const handlebars = require("express-handlebars");
const express = require("express");

// Create an instance of Express
const app = express();
const path = require("path");

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Configure Handlebars as the view engine
app.set("view engine", "handlebars");
app.engine(
  "handlebars",
  handlebars.engine({
    layoutsDir: path.join(__dirname, "/views/layouts"),
  })
);

// Define routes and render corresponding views
app.get("/", (req, res) => {
  res.render("index", { layout: "main" });
});

app.get("/1", (req, res) => {
  res.render("1", { layout: "main" });
});

app.get("/2", (req, res) => {
  res.render("2", { layout: "main" });
});

app.get("/3", (req, res) => {
  res.render("3", { layout: "main" });
});

app.get("/4", (req, res) => {
  res.render("4", { layout: "main" });
});

app.get("/outro", (req, res) => {
  res.render("outro", { layout: "main" });
});

// Start the server and listen on port 3000
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
