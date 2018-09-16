/*
 * Request Handlers
 *
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Define all the handlers
const handlers = {};

// health
handlers.health = (data, callback) => callback(200, { 'status': 'up' });

// Not-Found
handlers.notFound = function (data, callback) {
  callback(404);
};

// Users
handlers.users = function (data, callback) {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the users methods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function (data, callback) {

  const firstName = helpers.validateName(data.payload.firstName);
  const lastName = helpers.validateName(data.payload.lastName);
  const email = helpers.validateEmail(data.payload.email);
  const password = helpers.validateName(data.payload.password);
  const tosAgreement = helpers.validateAgreed(data.payload.tosAgreement);

  console.log('fn:', email);

  if (firstName && lastName && email && password && tosAgreement) {
    // Make sure the user doesnt already exist
    _data.read('users', email, function (err, data) {
      if (err) {
        // Hash the password
        const hashedPassword = helpers.hash(password);

        // Create the user object
        if (hashedPassword) {
          const userObject = {
            'firstName': firstName,
            'lastName': lastName,
            'email': email,
            'hashedPassword': hashedPassword,
            'tosAgreement': true
          };

          // Store the user
          _data.create('users', email, userObject, function (err) {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { 'Error': 'Could not create the new user' });
            }
          });
        } else {
          callback(500, { 'Error': 'Could not hash the user\'s password.' });
        }

      } else {
        // User alread exists
        callback(400, { 'Error': 'A user with that email already exists' });
      }
    });

  } else {
    callback(400, { 'Error': 'Missing required fields' });
  }

};

// Required data: email
// Optional data: none
handlers._users.get = function (data, callback) {

  const email = helpers.validateEmail(data.query.email);
  if (email) {
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('users', email, function (err, data) {
          if (!err && data) {
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid."})
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
};

// Required data: email
// Optional data: firstName, lastName, password (at least one must be specified)
handlers._users.put = function (data, callback) {

  const email = helpers.validateEmail(data.payload.email);

  // optional fields
  const firstName = helpers.validateName(data.payload.firstName);
  const lastName = helpers.validateName(data.payload.lastName);
  const password = helpers.validateName(data.payload.password);

  // id :email
  if (email) {
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
      if (tokenIsValid) {
        if (firstName || lastName || password) {
          _data.read('users', email, function (err, userData) {
            if (!err && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }
              _data.update('users', email, userData, function (err) {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { 'Error': 'Could not update the user.' });
                }
              });
            } else {
              callback(400, { 'Error': 'Specified user does not exist.' });
            }
          });
        } else {
          callback(400, { 'Error': 'Missing fields to update.' });
        }
      } else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid."})
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field.' });
  }
};

// Required data: email
// @TODO Cleanup (delete) any other data files associated with the user
handlers._users.delete = function (data, callback) {

  const email = helpers.validateEmail(data.query.email);
  if (email) {
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
      if (tokenIsValid) {

        _data.read('users', email, function (err, data) {
          if (!err && data) {
            _data.delete('users', email, function (err) {
              if (!err) {
                callback(200);
              } else {
                callback(500, { 'Error': 'Could not delete the specified user' });
              }
            });
          } else {
            callback(400, { 'Error': 'Could not find the specified user.' });
          }
        });
      } else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid."})
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
};


// Tokens
handlers.tokens = function (data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the tokens methods
handlers._tokens = {};

// Tokens - post
// Required data: email, password
// Optional data: none
handlers._tokens.post = function (data, callback) {

  const email = helpers.validateEmail(data.payload.email);
  const password = helpers.validateName(data.payload.password);
  if (email && password) {
    _data.read('users', email, function (err, userData) {
      if (!err && userData) {
        const hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            'email': email,
            'id': tokenId,
            'expires': expires
          };

          // Store the token
          _data.create('tokens', tokenId, tokenObject, function (err) {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { 'Error': 'Could not create the new token' });
            }
          });
        } else {
          callback(400, { 'Error': 'Password did not match the specified user\'s stored password' });
        }
      } else {
        callback(400, { 'Error': 'Could not find the specified user.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field(s).' })
  }
};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = function (data, callback) {

  const id = typeof (data.query.id) == 'string' && data.query.id.trim().length == 20 ? data.query.id.trim() : false;
  if (id) {
    _data.read('tokens', id, function (err, tokenData) {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field, or field invalid' })
  }
};

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = function (data, callback) {
  const id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  const extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
  if (id && extend) {
    _data.read('tokens', id, function (err, tokenData) {
      if (!err && tokenData) {
        if (tokenData.expires > Date.now()) {
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          _data.update('tokens', id, tokenData, function (err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, { 'Error': 'Could not update the token\'s expiration.' });
            }
          });
        } else {
          callback(400, { "Error": "The token has already expired, and cannot be extended." });
        }
      } else {
        callback(400, { 'Error': 'Specified user does not exist.' });
      }
    });
  } else {
    callback(400, { "Error": "Missing required field(s) or field(s) are invalid." });
  }
};


// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = function (data, callback) {

  const id = typeof (data.query.id) == 'string' && data.query.id.trim().length == 20 ? data.query.id.trim() : false;
  if (id) {
    _data.read('tokens', id, function (err, tokenData) {
      if (!err && tokenData) {
        _data.delete('tokens', id, function (err) {
          if (!err) {
            callback(200);
          } else {
            callback(500, { 'Error': 'Could not delete the specified token' });
          }
        });
      } else {
        callback(400, { 'Error': 'Could not find the specified token.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
};

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function (id, email, callback) {

  _data.read('tokens', id, function (err, tokenData) {
    if (!err && tokenData) {
      // Check that the token is for the given user and has not expired
      if (tokenData.email == email && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// Wrapper for menu
handlers.menu = {};

// Menu items
handlers.menu.items = function (data, callback) {
  const methods = ['get'];
  if (methods.indexOf(data.method) > -1) {
    handlers.menu._items[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Menu items methods container
handlers.menu._items = {};

// Items - get
// Required data: id
// Optional data: none
handlers.menu._items.get = function (data, callback) {

  const email = helpers.validateEmail(data.query.email);
  if (email) {
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
      if (tokenIsValid) {
        const items = [];
        const item_001 = {};
        item_001.name='Mozzarella Sticks';
        item_001.description='Five of our award-winning mozzarella sticks made completely from scratch, including housemade fresh mozzarella and garlic-herbed breadcrumbs. Served with marinara on the side.';
        item_001.price='$11.00'
        items.push(item_001);
        const item_002 = {};
        item_002.name='12" Sausage Pizza';
        item_002.description='The Quad Cities favorite: specially-seasoned housemade crumbled sausage, Roots pizza sauce, and Quad Cities mozzarella blend.';
        item_002.price='$16.00'
        items.push(item_002);
        const item_003 = {};
        item_003.name='12" Garden Pizza';
        item_003.description='Roasted mushrooms, diced green peppers, roasted red peppers, olive mix, Roots pizza sauce, and Quad Cities mozzarella blend.';
        item_003.price='$20.00'
        items.push(item_003);
        callback(200, items);        
      } else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid."})
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field' });
  }
};

// wrapper for cart
handlers.cart = {};

// Cart items methods container
handlers.cart._items = {};

// Cart items
handlers.cart.items = function (data, callback) {
  const methods = ['post', 'get', 'delete'];
  if (methods.indexOf(data.method) > -1) {
    handlers.cart._items[data.method](data, callback);
  } else {
    callback(405);
  }
};


// Export the handlers
module.exports = handlers;