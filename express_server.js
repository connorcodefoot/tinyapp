

function generateRandomString() {

  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
}

function findUser(email) {
  for (const user in usersDatabase) {
    if(email === usersDatabase[user].email){
      return true
    }
  }
}

// Config files
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());


// App database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const usersDatabase = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

/************************* ROUTES *************************/

// Login

app.get("/login", (req, res) => {
  res.render("login");
});

/* app.post("/login", (req, res) => {
 res.cookie('username', req.body.username)
 res.redirect('/urls')
}); */

// Logout

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// Register

app.get("/register", (req, res) => {

  const templateVars = {
    user: usersDatabase[req.cookies['user_id']]
  };

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {

  if(req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Something broke!')
  }

  if(findUser(req.body.email)) {
    return res.status(400).send('Something broke!')
  }
 
  const userRandomID = generateRandomString();
  usersDatabase[userRandomID] = {
    id: userRandomID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie('user_id', userRandomID);
  res.redirect("/urls");
});


// Urls index page - includes all URLs/IDs stored within the urldatabase
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: usersDatabase[req.cookies['user_id']]
  };
  res.render("urls_index", templateVars);
});

// Render URL Index submission form
app.get("/urls/new", (req, res) => {

  const templateVars = {
    user: usersDatabase[req.cookies['user_id']]
  };
  res.render("urls_new", templateVars);
});

// Posting data from /urls/new to url database + redirect to urls/id
app.post("/urls", (req, res) => {
  const id = (generateRandomString(req.body.longURL));
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

// Render URL Show with information for the ID provided within the URL param
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: usersDatabase[req.cookies['user_id']]
  };
  res.render("urls_show", templateVars);
});

// Edit URL
app.post("/urls/:id/edit", (req, res) => {

  urlDatabase[req.params.id] = req.body.newLongURL;
  res.redirect(`/urls/${req.params.id}`);
});

// Redirect user to the URL that corresponds to the ID provided with the URL param
app.get("/u/:id", (req, res) => {

  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// Delete URL from database
app.post("/urls/:id/delete", (req, res) => {

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
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
