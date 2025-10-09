/*===================================           CONTROLLER FOR SECURITY REQUESTS           ===================================*/

const users = require('../data/security/users.json')
const crypto = require('crypto');

/*
Function: requestLogin
Description: Evaluates if a given username and passwaord match with any register in users.json.
Developer(s):
  Andres Rodriguez Rojas
Dependencies:
  Requires:
  Required by:
Last modified by:
  Andres Rodriguez Rojas on 26/09/2025
*/
const requestLogin = (req, res) => {
  try {
    const { username, password } = req.body;

    // Validates if username and password are not empty.
    if (!username || !password){
      return res.status(400).json({
        error: 'Invalid inputs.',
        message: 'Username and password are required.'
      });
    }

    // Encrypts password given.
    const encryptedPassword = hashSha256(password)

    // Searches user with username and password given in users.json.
    const user = users.find(u => u.username === username && u.password === encryptedPassword);

    // Evaluates if a user was founded.
    if(user){
      // User found.
      const response = {
        message: 'Login successful.',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response)
    } else {
      // User not found.
      return res.status(400).json({
        error: 'Unauthorized',
        message: 'Invalid username or password.'
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error.',
      message: error.message
    });
  }
}

// 
function hashSha256(stringToEncrypt) {
    return crypto
        .createHash('sha256')
        .update(stringToEncrypt)
        .digest('hex');
}

module.exports = {
  requestLogin
};
