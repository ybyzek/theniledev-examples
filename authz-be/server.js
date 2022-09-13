const express = require("express");
const connectDB = require("./db");
const app = express();
const cookieParser = require("cookie-parser");
const { adminAuth, userAuth } = require("./middleware/auth.js");
const { nileAuthz } = require("./middleware/authz-nile.ts");

const PORT = process.env.PORT || 5000;

app.set("view engine", "ejs");

connectDB();

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", require("./Auth/route"));

app.get("/", (req, res) => res.render("login"));
//app.get("/", (req, res) => res.render("home"));
app.get("/register", (req, res) => res.render("register"));
app.get("/login", (req, res) => res.render("login"));
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" });
  res.redirect("/");
});
app.get("/admin", adminAuth, (req, res) => res.render("admin"));
app.get("/basic", userAuth, (req, res) => res.render("user"));

// Pages to implement authz
app.get("/page1", [userAuth, nileAuthz], (req, res) => res.render("page1"));
app.get("/page2", [userAuth, nileAuthz], (req, res) => res.render("page2"));
app.get("/page3", [userAuth, nileAuthz], (req, res) => res.render("page3"));

const server = app.listen(PORT, () =>
  console.log(`Go to -->\n   http://localhost:${PORT}`)
);

process.on("unhandledRejection", (err) => {
  console.log(`An error occurred: ${err.message}`);
  server.close(() => process.exit(1));
});
