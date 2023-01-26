
// Config files
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());


// Global Scope Functions

function generateRandomString() {

  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
}

function findUser(email) {
  for (const user in usersDatabase) {
    if(email === usersDatabase[user].email){
      return usersDatabase[user]
    }
    return false
  }
}

function urlsForUser(id) {

  const output = {
  }

  for (let url in urlDatabase) {
    if(urlDatabase[url].userID === id)
    output[url] = urlDatabase[url].longURL
  }

  return output

}

// App database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  b6UT4L: {
    longURL: "https://www.barbaque.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "u13a24",
  },
};

const usersDatabase = {
  userRandomID: {
    id: "userRandomID",
    email: "a@b.com",
    password: "pb",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

/************************* USER ROUTES *************************/

// LOGIN

app.get("/login", (req, res) => {

  if(req.cookies['userid']) {
    res.redirect('/urls')
  }
 
  res.render("login");
});

app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const user = findUser(email)

  if(!email || !password) {
    return res.status(400).send('Enter in an email and password')
  }

  if(!user) {
    return res.status(403).send('This email is not associated with a user')
  }

  if(user.password !== password) {
    return res.status(403).send('Incorrect password')
  }

 res.cookie('userid', user.id)
 res.redirect('/urls')
});

// LOGOUT

app.post("/logout", (req, res) => {
  res.clearCookie('userid');
  res.redirect('/login');
});

// REGISTER

app.get("/register", (req, res) => {

  if(req.cookies['userid']) {
    res.redirect('/urls')
  }
  const templateVars = {
    user: usersDatabase[req.cookies['userid']]
  };

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const userRandomID = generateRandomString();

  if(!email || !password) {
    return res.status(400).send('Something broke!')
  }

  if(findUser(req.body.email)) {
    return res.status(400).send('Something broke!')
  }
 
  usersDatabase[userRandomID] = {
    id: userRandomID,
    email,
    password,
  };
  
  res.cookie('userid', userRandomID);

  res.redirect("/urls");
});

/************************* URL ROUTES *************************/


// URLS PAGE
app.get("/urls", (req, res) => {

  const userID = req.cookies['userid']
  const userURLs = urlsForUser(userID);
  
  const templateVars = {
    urls: userURLs,
    user: usersDatabase[userID],
  }
  res.render("urls_index", templateVars);
});

// NEW URL PAGE
app.get("/urls/new", (req, res) => {

  if(!req.cookies['userid']) {
    res.redirect('/login')
  }

  const templateVars = {
    user: usersDatabase[req.cookies['userid']]
  };
  res.render("urls_new", templateVars);
});

// NEW URL
app.post("/urls", (req, res) => {

  if(!req.cookies['userid']) {
    res.status(403).send('You do not have permission. Login first to create new URLs')
  }

  const id = (generateRandomString(req.body.longURL));
  const longURL = req.body.longURL;
  const userID = req.cookies['userid']

  urlDatabase[id] = {
    longURL,
    userID,
  } 
  
  res.redirect(`/urls/${id}`);
});

// URL SPECIFIC PAGE
app.get("/urls/:id", (req, res) => {

  const cookieID = req.cookies['userid'];
  const urlID = req.params.id;

  if(!cookieID) {
    res.redirect('/login')
  }

  if(cookieID !== urlDatabase[urlID].userID) {
    res.status(403).send('You do not have permission to access this URL')
  }

  const templateVars = {
    id: urlID,
    longURL: urlDatabase[urlID].longURL,
    user: usersDatabase[cookieID]
  };
  res.render("urls_show", templateVars);
});

// URL EDIT 
app.post("/urls/:id/edit", (req, res) => {

  if(!req.cookies['userid']) {
    res.status(403).send('You do not have permission. Login first to create new URLs')
  }

  urlDatabase[req.params.id].longURL = req.body.newLongURL;
  res.redirect(`/urls/${req.params.id}`);
});

// EXTERNAL LINK TO URL
app.get("/u/:id", (req, res) => {


  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('Unable to find the URL your equested')
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// DELETE URL
app.post("/urls/:id/delete", (req, res) => {

  if(!req.cookies['userid']) {
    res.status(403).send('You do not have permission. Login first to create new URLs')
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

