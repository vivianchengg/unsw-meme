import { getData, setData, getHash } from './dataStore';
import validator from 'validator';
import HTTPError from 'http-errors';
import { isEmailFromUser, isHandleTaken } from './auth';

/**
  * Finds the authUserId given a token, if invalid token, return null.
  *
  * @param {string} token
  * @returns {string} authUserId
*/
export const isValidToken = (token: string) => {
  const data = getData();
  const hashedToken = getHash(token);

  for (const user of data.users) {
    if (user.token.includes(hashedToken)) {
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
export const isValidUser = (userId: number): boolean => {
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

  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  }

  if (!isValidUser(uId)) {
    throw HTTPError(400, 'invalid uId');
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
        profileImgUrl: user.profileImgUrl
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

  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  }

  if (!invalidName(nameLast)) {
    throw HTTPError(400, 'name length +51 or less than 1');
  }
  if (!invalidName(nameFirst)) {
    throw HTTPError(400, 'name length +51 or less than 1');
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

  const userId = isValidToken(token);
  if (userId === null) {
    throw HTTPError(403, 'invalid token');
  }

  const minimumLength = 3;
  const maximumLength = 20;
  if (handleStr.length > maximumLength || handleStr.length < minimumLength) {
    throw HTTPError(400, 'Length of handleStr is not between 3-20 characters');
  }

  if (isHandleTaken(handleStr)) {
    throw HTTPError(400, 'Handle already taken by another user');
  }

  if (!isAlphanumeric(handleStr)) {
    throw HTTPError(400, 'Handle contains non-alphanumeric characters');
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

  const userId = isValidToken(token);
  if (userId === null) {
    throw HTTPError(403, 'invalid token');
  }

  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Invalid email entered');
  }

  if (isEmailFromUser(email)) {
    throw HTTPError(400, 'Email already taken by another user');
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

  if (isValidToken(token) === null) {
    throw HTTPError(403, 'invalid token');
  }

  const list = [];
  for (const user of data.users) {
    if (!user.isRemoved) {
      const detail = {
        uId: user.uId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr,
        profileImgUrl: user.profileImgUrl
      };
      list.push(detail);
    }
  }

  return {
    users: list,
  };
};
