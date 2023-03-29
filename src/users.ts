import { getData, setData } from './dataStore';

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

  if (data.users.find(u => u.handleStr === handleStr)) {
    return { error: 'Handle already taken by another user' };
  }

  if (!isAlphanumeric(handleStr)) {
    return { error: 'Handle contains non-alphanumeric characters' };
  }

  const userId = findUID(token);
  const user = data.users.find(u => u.uId === userId);

  user.handleStr = handleStr;
  setData(data);
};

/**
 * Checks if entered string is alphanumeric
 * @param {string} str
 * @returns {boolean}
 */
const isAlphanumeric = (str: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(str);
};
