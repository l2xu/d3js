// Require express
const handlebars = require("express-handlebars");
const express = require("express");

// Create an express server
const app = express();
var path = require("path");

app.use(express.static(path.join(__dirname, "public")));
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "html");

//Sets our app to use the handlebars engine
app.set("view engine", "handlebars");
//Sets handlebars configurations (we will go through them later on)
app.engine(
  "handlebars",
  handlebars.engine({
    layoutsDir: __dirname + "/views/layouts",
  })
);

// Create a route handler for the home path
app.get("/", (req, res) => {
  //send vies first.html file
  res.render("index", { layout: "main" });

  // res.sendFile("/views/index.html", { root: __dirname });
});

app.get("/1", (req, res) => {
  //send vies first.html file
  res.render("1", { layout: "main" });
  // res.sendFile("/views/1.html", { root: __dirname });
});

app.get("/2", (req, res) => {
  //send vies first.html file
  res.render("2", { layout: "main" });
  // res.sendFile("/views/2.html", { root: __dirname });
});

app.get("/3", (req, res) => {
  //send vies first.html file
  res.render("3", { layout: "main" });

  // res.sendFile("/views/3.html", { root: __dirname });
});

app.get("/4", (req, res) => {
  //send vies first.html file
  res.render("4", { layout: "main" });

  // res.sendFile("/views/4.html", { root: __dirname });
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
