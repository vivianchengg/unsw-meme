import { getData, setData } from './dataStore';
import validator from 'validator';

/**
  * Finds the authUserId given a token, if invalid token, return null.
  *
  * @param {string} token
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
  * Checks if entered string is alphanumeric
  * @param {string} str
  * @returns {boolean}
 */
const isAlphanumeric = (str: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(str);
};

/**
  * Returns user information given a token and uId.
  *
  * @param {string} token
  * @param {number} uId
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

  const authUserId = findUID(token);
  if (authUserId === null) {
    return { error: 'invalid token' };
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
  *
  * @param {string} token
  * @param {string} nameFirst
  * @param {string} nameLast
  * @returns {}
*/
export const userProfileSetName = (token: string, nameFirst: string, nameLast: string) => {
  const data = getData();

  const authUserId = findUID(token);
  if (authUserId === null) {
    return { error: 'invalid token' };
  }

  if (!invalidName(nameLast)) {
    return { error: 'name length +51 or less than 1' };
  }
  if (!invalidName(nameFirst)) {
    return { error: 'name length +51 or less than 1' };
  }

  const user = data.users.find(d => d.uId === authUserId);
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;

  setData(data);
  return {};
};

/**
  * Updates authorised user's handle
  *
  * @param {string} token
  * @param {string} handleStr
  * @returns {}
  *
 */
export const userProfileSetHandleV1 = (token: string, handleStr: string) => {
  const data = getData();

  const userId = findUID(token);
  if (userId === null) {
    return { error: 'invalid token' };
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

  const user = data.users.find(u => u.uId === userId);

  user.handleStr = handleStr;
  setData(data);

  return {};
};

/**
  * Updates authorised user's email address
  *
  * @param {string} token
  * @param {string} email
  * @returns {}
  *
*/
export const userProfileSetEmailV1 = (token: string, email: string) => {
  const data = getData();

  const userId = findUID(token);
  if (userId === null) {
    return { error: 'invalid token' };
  }

  if (!validator.isEmail(email)) {
    return { error: 'Invalid email entered' };
  }

  if (data.users.find(u => u.email === email) !== undefined) {
    return { error: 'Email already taken by another user' };
  }

  const user = data.users.find(u => u.uId === userId);

  user.email = email;
  setData(data);

  return {};
};

/**
  * List all the users in the data.
  *
  * @param {string} token
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

  if (findUID(token) === null) {
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
