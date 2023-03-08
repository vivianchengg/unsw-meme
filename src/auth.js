import { getData } from './dataStore.js';

/**
  * check whether email entered belong to a user
  * 
  * @param {string} email 
  * @returns {bool}
*/
function isEmailFromUser(email) {
  const data = getData();
  let user = undefined;
  if (data.users !== undefined) {
    user = data.users.find(person => person.email === email);
  }

  if (user === undefined) {
    return false;
  } 
  return true;
}


/**
  * Given a registered user's email and password, returns their authUserId value.
  * 
  * @param {string} email 
  * @param {string} password 
  * @returns {{authUserId: number}}
*/
export function authLoginV1(email, password) {
  const data = getData();

  // error: email entered does not belong to a user or incorrect password
  if (!isEmailFromUser(email)) {
    return { error: 'invalid email' };
  }

  const user = data.users.find(person => person.email === email);
  if (user.password !== password) {
    return { error: 'incorrect password' };
  }

  const id = user.uId;

  return {
    authUserId: id,
  }
}

// stub for authRegisterV1
function authRegisterV1(email, password, nameFirst, nameLast) {
  return {
    authUserId: 1,
  }
}