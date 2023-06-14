const handlebars = require("express-handlebars");
const express = require("express");

const app = express();
var path = require("path");

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "handlebars");
app.engine(
  "handlebars",
  handlebars.engine({
    layoutsDir: __dirname + "/views/layouts",
  })
);

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

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
