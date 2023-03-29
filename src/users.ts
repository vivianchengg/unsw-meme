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
    user: person
  };
};

/**
* Changes the first and last name of user
* @param {string} token
* @param {string} nameFirst
* @param {string} nameLast
* ...
* @returns {}
  */
export const userProfileSetName = (token: string, nameFirst: string, nameLast: string) => {
  const data = getData();

  if (!invalidName(nameLast)) {
    return { error: 'name length +51 or less than 1' };
  }
  if (!invalidName(nameFirst)) {
    return { error: 'name length +51 or less than 1' };
  }

  const authUserId = extractUId(token);
  if (authUserId === undefined) {
    return { error: 'invalid token' };
  }

  const user = data.users.find(d => d.uId === authUserId);
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;

  setData(data);
  return {};
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

/** Function that returns user Id from token
 *
 * @param {string} token
 * @returns {number}
 */
const extractUId = (token: string) => {
  const data = getData();
  let userId;

  for (const user of data.users) {
    for (const tokenData of user.token) {
      if (tokenData === token) {
        userId = user.uId;
      }
    }
  }

  return userId;
};

/**
  * Checks if name last and name first is valid length
  * @param {string} nameLast
  * ...
  * @returns {boolean}
*/
const invalidName = (name: string) => {
  const length = name.length;
  const min = 1;
  const max = 50;
  if (length < min || length > max) {
    return false;
  }
  return true;
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
<<<<<<< HEAD
 * Updates authorised user's handle
 * @param {string} token
 * @param {string} handleStr
 * @returns {}
 *
 * Will return error if:
 *  - Length of handleStr is not between 3-20 characters
 *  - Non-alphanumeric characters are contained in handleStr
 *  - handleStr is already taken as handle for another user
 *  - token is invalid
 */
export const userProfileSetHandleV1 = (token: string, handleStr: string) => {
  const data = getData();

  if (!isValidToken(token)) {
    return { error: 'Invalid token' };
  }

  const minimumLength = 3;
  const maximumLength = 20;
  if (handleStr.length > maximumLength || handleStr.length < minimumLength) {
    return { error: 'Length of handleStr is not between 3-20 characters' };
  }

  if (data.users.find(u => u.handleStr === handleStr) !== undefined) {
    return { error: 'Handle already taken by another user' };
  }

  if (!isAlphanumeric(handleStr)) {
    return { error: 'Handle contains non-alphanumeric characters' };
  }

  const userId = findUID(token);
  const user = data.users.find(u => u.uId === userId);

  user.handleStr = handleStr;
  setData(data);

  return {};
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
  const data = getData();

  if (!isValidToken(token)) {
    return { error: 'Invalid token' };
  }

  if (!validator.isEmail(email)) {
    return { error: 'Invalid email entered' };
  }

  if (data.users.find(u => u.email === email) !== undefined) {
    return { error: 'Email already taken by another user' };
  }

  const userId = findUID(token);
  const user = data.users.find(u => u.uId === userId);

  user.email = email;
  setData(data);

  return {};
};

/**
 * Checks if entered string is alphanumeric
 * @param {string} str
 * @returns {boolean}
 */
const isAlphanumeric = (str: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(str);
};

/**
* List all the users in the data.
* @param {string} token
* ...
* @returns {{
*   uId: number,
*   email: string,
*   nameFirst: string,
*   nameLast: string,
*   handleStr: string,
* }} user
*/
export const usersAllV1 = (token: string) => {
  const data = getData();
  if (isValidToken(token) === false) {
    return { error: 'invalid token' };
  }

  const list = [];
  for (const user of data.users) {
    const detail = {
      uId: user.uId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.handleStr
    };
    list.push(detail);
  }

  return {
    users: list,
  };
};
