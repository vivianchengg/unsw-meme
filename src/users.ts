import { getData, setData } from './dataStore';

/**
* Returns information about a user
* @param {number} authUserId
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
export const userProfileV1 = (authUserId: number, uId: number) => {
  const data = getData();
  if (isValidUser(authUserId) === false) {
    return { error: 'invalid authUserId' };
  }
  if (isValidUser(uId) === false) {
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
  let authUserId;

  if (!invalidLastName(nameLast)) {
    return { error: 'name length +51 or less than 1' };
  }
  if (!invalidFirstName(nameFirst)) {
    return { error: 'name length +51 or less than 1' };
  }

  if (!isValidToken(token)) {
    return { error: 'invalid token' };
  } else {
    authUserId = findUID(token);
  }

  for (const user of data.users) {
    if (user.uId === authUserId) {
      user.nameFirst = nameFirst;
      user.nameLast = nameLast;
    }
  }
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
  * Checks if last name is of valid length
  * @param {string} nameLast
  * ...
  * @returns {boolean}
*/
const invalidLastName = (nameLast: string) => {
  const length = nameLast.length;
  if (length < 1 || length > 50) {
    return false;
  }
  return true;
};

/**
  * Checks if first name is of valid length
  * @param {string} nameFirst
  * ...
  * @returns {boolean}
*/
const invalidFirstName = (nameFirst: string) => {
  const length = nameFirst.length;
  if (length < 1 || length > 50) {
    return false;
  }
  return true;
};
