import { getData } from './dataStore';
import { isValidUser, findUID } from './channels';

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
  let authUserId;

  if (isValidToken(token) === false) {
    return { error: 'invalid token' };
  } else {
    authUserId = findUID(token);
  }

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
