
// Config files
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'party',
  keys: ['bababuoy'],
}));
const bcrypt = require("bcryptjs");


// App database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userid: "username",
  },
  b6UT4L: {
    longURL: "https://www.barbaque.ca",
    userid: "username2",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userid: "u13a24",
  },
};

const usersDatabase = {
  username: {
    id: "username",
    email: "a@b.com",
    password: "easypword",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  qhl9ap: {
    id: 'qhl9ap',
    email: 'c@b.com',
    password: '$2a$10$Wqp7Cmvi2cmLDTnz7sd9j.IdWLt.cFyWxzDgybqKiEwr3gwaQvnjO'
  },
  a7ackl: {
    id: 'a7ackl',
    email: 'co@co.com',
    password: '$2a$10$qHWcTaPfi/vI1uJVGFsmqesgoy5jTiZ24.WPdxyobAvKz5QdHVtqG'
  }
};



/************************* USER ROUTES *************************/

// LOGIN

app.get("/login", (req, res) => {

  if (req.session.userid) {
    res.redirect('/urls');
  }

  return res.render("login");
});

app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password.toString();
  const user = getUserByEmail(email, usersDatabase); // returns user object


  if (!email || !password) {
    return res.status(400).send('Enter in a email and password');
  }

  if (!user) {
    return res.status(403).send('This email is not associated with a user');
  }

  bcrypt.compare(password, user.password)
    .then((result) => {
      if (result) {
        req.session.userid = user.id;
        return res.redirect('/urls');
      } else {
        return res.status(403).send('Incorrect password');
      }
    });

});

// LOGOUT

app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect('/login');
});

// REGISTER

app.get("/register", (req, res) => {

  if (req.session.userid) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: usersDatabase[req.session.userid]
  };

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const username = generateRandomString();

  if (!email || !password) {
    return res.status(400).send('Enter in a password and email');
  }

  if (getUserByEmail(email, usersDatabase)) {
    return res.status(400).send('A user with that email already exists');
  }

  bcrypt.genSalt(10)
    .then((salt) => {
      return bcrypt.hash(password, salt);
    })
    .then((hash) => {
      usersDatabase[username] = {
        id: username,
        email,
        password: hash
      };
      req.session.userid = username;
      return res.redirect("/urls");
    });
});

/************************* URL ROUTES *************************/


// URLS PAGE
app.get("/urls", (req, res) => {

  const userid = req.session.userid;
  const userURLs = urlsForUser(userid, urlDatabase);

  if (!userid) {
    return res.status(403).send('You do not have permission to access this URL');
  }

  const templateVars = {
    urls: userURLs,
    user: usersDatabase[userid],
  };

  return res.render("urls_index", templateVars);
});

// NEW URL PAGE
app.get("/urls/new", (req, res) => {

  if (!req.session.userid) {
    return res.redirect('/login');
  }

  const templateVars = {
    user: usersDatabase[req.session.userid]
  };
  return res.render("urls_new", templateVars);
});

// NEW URL
app.post("/urls", (req, res) => {

  if (!req.session.userid) {
    return res.status(403).send('You do not have permission. Login first to create new URLs');
  }

  const id = (generateRandomString(req.body.longURL));
  const longURL = req.body.longURL;
  const userid = req.session.userid;

  urlDatabase[id] = {
    longURL,
    userid,
  };

  return res.redirect(`/urls/${id}`);
});

// URL SPECIFIC PAGE
app.get("/urls/:id", (req, res) => {

  const userID = req.session.userid;
  const urlID = req.params.id;

  if (!userID) {
    return res.redirect('/login');
  }

  if (!urlDatabase[urlID]) {
    return res.status(403).send('This URL does not exist');
  }

  if (userID !== urlDatabase[urlID].userid) {
    return res.status(403).send('You do not have permission to access this URL');
  }

  const templateVars = {
    id: urlID,
    longURL: urlDatabase[urlID].longURL,
    user: usersDatabase[userID]
  };
  return res.render("urls_show", templateVars);
});

// URL EDIT
app.post("/urls/:id/edit", (req, res) => {

  const userID = req.session.userid;
  const urlID = req.params.id;


  if (userID !== urlDatabase[urlID].userid) {
    return res.status(403).send('You do not have permission to access this URL');
  }

  if (!userID) {
    return res.status(403).send('You do not have permission. Login first to create new URLs');
  }

  urlDatabase[urlID].longURL = req.body.newLongURL;
  return res.redirect(`/urls/${urlID}`);
});

// EXTERNAL LINK TO URL
app.get("/u/:id", (req, res) => {


  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('Unable to find the URL your equested');
  }

  const longURL = urlDatabase[req.params.id].longURL;
  return res.redirect(longURL);
});

// DELETE URL
app.post("/urls/:id/delete", (req, res) => {

  const userID = req.session.userid;
  const urlID = req.params.id;

  if (!userID) {
    return res.status(403).send('You do not have permission. Register or login first to manage URLs');
  }

  if (userID !== urlDatabase[urlID].userid) {
    return res.status(403).send('You do not have permission to access this URL');
  }

  delete urlDatabase[urlID];
  return res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

