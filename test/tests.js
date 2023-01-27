const { assert } = require('chai');



// Test Get User By Email function


const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user object with an ID equal to the users ID', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID)
  });

  it('should return false if the email requested does not exist', function() {
    const user = getUserByEmail("use5r@example.com", testUsers)
    const expectedReturn = false;
    assert.notEqual(expectedReturn, user)
  });

  it('should return false if the database requested does not exist', function() {
    const user = getUserByEmail("user@example.com", 'testURLs')
    const expectedReturn = false;
    assert.notEqual(expectedReturn, user)
  });
});


//Test URLs for User function

const testUrlDatabase = {
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
  f9pkkr: {
    longURL: "http://www.myspace.com",
    user_id: "u13a24",
  },
};
