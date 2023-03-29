import { getData, setData } from './dataStore';
import validator from 'validator';

/**
* Returns information about a user
* @param {string} token
* @param {number} uId
* ...
* @returns {{
*   uId: number,
*   email: string,
*   nameFirst: string,
*   nameLast: string,
*   handleStr: string,
* }} user
*/
export const userProfileV1 = (token: string, uId: number) => {
  const data = getData();

  if (isValidToken(token) === false) {
    return { error: 'invalid token' };
  }

  const authUserId = findUID(token);

  if (!isValidUser(authUserId)) {
    return { error: 'invalid authUserId' };
  }
  if (!isValidUser(uId)) {
    return { error: 'invalid uId' };
  }

  let person;
  for (const user of data.users) {
    if (user.uId === uId) {
      person = {
        uId: user.uId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr,
      };
    }
  }

  return {
    user: person,
  };
};

/**
* Checks if user is valid
* @param {number} authUserId
* @returns {boolean}
*/
const isValidUser = (userId: number): boolean => {
  const data = getData();
  for (const user of data.users) {
    if (user.uId === userId) {
      return true;
    }
  }
  return false;
};

/**
  * Checks if the token is valid
  * @param {string} token
  * ...
  * @returns {boolean}
*/
const isValidToken = (token: string): boolean => {
  const data = getData();
  for (const user of data.users) {
    if (user.token.includes(token)) {
      return true;
    }
  }
  return false;
};

/**
  * Finds the authUserId given a token.
  * @param {string} token
  * ...
  * @returns {string} authUserId
*/
const findUID = (token: string) => {
  const data = getData();
  for (const user of data.users) {
    if (user.token.includes(token)) {
      return user.uId;
    }
  }
  return null;
};

/**
 * Updates authorised user's email address
 * @param {string} token
 * @param {string} email
 * @returns {}
 *
 * Will return error if:
 *  - email entered is not valid, defined by validator
 *  - email is already taken by another user
 *  - token is invalid
 */
export const userProfileSetEmailV1 = (token: string, email: string) => {
  if (!isValidToken(token)) {
    return { error: 'Invalid token' };
  }

  if (!validator.isEmail(email)) {
    return { error: 'Invalid email entered' };
  }

  if (!isEmailFree(email)) {
    return { error: 'Email already taken by another user' };
  }

  const data = getData();
  const userId = findUID(token);
  for (const user of data.users) {
    if (user.uId === userId) {
      user.email = email;
      setData(data);
    }
  }
};

/**
 * Checks if another user already has the inputted email
 * @param {string} email
 * @returns {boolean}
 */
const isEmailFree = (email: string): boolean => {
  const data = getData();
  for (const user of data.users) {
    if (user.email === email) {
      return false;
    }
  }

  return true;
};
