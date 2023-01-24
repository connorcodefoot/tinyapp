

function generateRandomString() {
  
  const randomString = Math.random().toString(36).substring(2,8);
  return randomString
} 

// Express constants and config
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));

// App database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

/************************* Endpoint config *************************/

// All URLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Adding a URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(generateRandomString(req.body.longURL))
  res.send('Oh ya'); // Respond with 'Ok' (we will replace this)
});

// A specific URL by ID
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});


// Test Code
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
