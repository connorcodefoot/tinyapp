const generateRandomString = () => {

  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
}

const getUserByEmail = (email, database) => {
  for (const user in database) {

    if(email === database[user].email) {
      return database[user]
    }
  }
  false
}

const urlsForUser = (id, database) => {

  const output = {};

  for (let url in database) {
    if (database[url].user_id === id)
      output[url] = database[url].longURL;
  }

  return output;

}

module.exports = { generateRandomString, getUserByEmail, urlsForUser }