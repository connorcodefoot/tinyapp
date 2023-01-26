
// Config files
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


// Global Scope Functions

function generateRandomString() {

  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
}

function findUser(email) {
  for (const user in usersDatabase) {

    if(email === usersDatabase[user].email) {
      return usersDatabase[user]
    }
  }
  return false
}

function urlsForUser(id) {

  const output = {
  };

  for (let url in urlDatabase) {
    if (urlDatabase[url].user_id === id)
      output[url] = urlDatabase[url].longURL;
  }

  return output;

}

// App database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    user_id: "username",
  },
  b6UT4L: {
    longURL: "https://www.barbaque.ca",
    user_id: "username2",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    user_id: "u13a24",
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

  if (req.session.user_id) {
    res.redirect('/urls');
  }

  res.render("login");
});

app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password.toString();
  const user = findUser(email); // returns user object
  

  if (!email || !password) {
    return res.status(400).send('Enter in a email and password');
  }

  if (!user) {
    return res.status(403).send('This email is not associated with a user');
  }

  bcrypt.compare(password, user.password)
    .then((result) => {
      if (result) {
        req.session.user_id = user.id;
        return res.redirect('/urls');
      } else {
        return res.status(403).send('Incorrect password');
      }
    });

});

// LOGOUT

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// REGISTER

app.get("/register", (req, res) => {

  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = {
    user: usersDatabase[req.session.user_id]
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

  if (findUser(email)) {
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
    req.session.user_id = username;
    res.redirect("/urls");
  });
});

/************************* URL ROUTES *************************/


// URLS PAGE
app.get("/urls", (req, res) => {

  const user_id = req.session.user_id;
  const userURLs = urlsForUser(user_id);

  if(!user_id) {
    res.status(403).send('You do not have permission to access this URL');
  }

  const templateVars = {
    urls: userURLs,
    user: usersDatabase[user_id],
  };
  console.log(templateVars.user);
  res.render("urls_index", templateVars);
});

// NEW URL PAGE
app.get("/urls/new", (req, res) => {

  if (!req.session.user_id) {
    res.redirect('/login');
  }

  const templateVars = {
    user: usersDatabase[req.session.user_id]
  };
  console.log(usersDatabase[req.session.user_id].email)
  res.render("urls_new", templateVars);
});

// NEW URL
app.post("/urls", (req, res) => {

  if (!req.session.user_id) {
    res.status(403).send('You do not have permission. Login first to create new URLs');
  }

  const id = (generateRandomString(req.body.longURL));
  const longURL = req.body.longURL;
  const user_id = req.session.user_id;

  urlDatabase[id] = {
    longURL,
    user_id,
  };

  res.redirect(`/urls/${id}`);
});

// URL SPECIFIC PAGE
app.get("/urls/:id", (req, res) => {

  const cookieID = req.session.user_id;
  const urlID = req.params.id;

  if (!cookieID) {
    res.redirect('/login');
  }

  if (cookieID !== urlDatabase[urlID].user_id) {
    res.status(403).send('You do not have permission to access this URL');
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

  const cookieID = req.session.user_id;
  const urlID = req.params.id;


  if (cookieID !== urlDatabase[urlID].user_id) {
    res.status(403).send('You do not have permission to access this URL');
  }

  if (!cookieID) {
    res.status(403).send('You do not have permission. Login first to create new URLs');
  }

  urlDatabase[urlID].longURL = req.body.newLongURL;
  res.redirect(`/urls/${urlID}`);
});

// EXTERNAL LINK TO URL
app.get("/u/:id", (req, res) => {


  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('Unable to find the URL your equested');
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// DELETE URL
app.post("/urls/:id/delete", (req, res) => {

  const cookieID = req.session.user_id;
  const urlID = req.params.id;

  if (!cookieID) {
    res.status(403).send('You do not have permission. Register or login first to manage URLs');
  }

  if (cookieID !== urlDatabase[urlID].user_id) {
    res.status(403).send('You do not have permission to access this URL');
  }

  delete urlDatabase[urlID];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

