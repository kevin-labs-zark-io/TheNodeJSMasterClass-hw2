/*
 * Helpers for various tasks
 *
 */

// Dependencies
const config = require('./config');
const crypto = require('crypto');

// Container for all the helpers
const helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function (str) {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};

// Create a SHA256 hash
helpers.hash = function (str) {
    if (typeof (str) == 'string' && str.length > 0) {
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};


helpers.validateName = (obj) => typeof(obj) === 'string' && obj.trim().length > 0 ? obj.trim() : false;
helpers.validateEmail = (obj) => {
    if(typeof(obj) === 'string' && obj.trim().length > 0) {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(obj) ? obj.trim() : false;
    } else {
        return false;
    } 
};
helpers.validateAgreed = (obj) => typeof(obj) === 'boolean' && obj == true ? true : false;
helpers.validatePassword = (obj) => false;
helpers.validateToken = (obj) => false;

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function(strLength){
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // choose from set
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    let str = '';
    for(i = 1; i <= strLength; i++) {
        const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        str+=randomCharacter;
    }
    return str;
  } else {
    return false;
  }
};

// Export the module
module.exports = helpers;