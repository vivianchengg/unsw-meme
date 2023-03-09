import { authRegisterV1 } from 'auth.js';

/**
* Returns information about a user
* @param {number} authUserId
* @param {number} uId
* ...
* @returns {{
*  uId: number,
*  email: string,
*  nameFirst: string,
*  nameLast: string,
*  handleStr: string,
* }} user
*/

export function userProfileV1 (authUserId, uId) {
  const data = getData();
  if (validate_user(authUserId) === false) {
    return { error: 'invalid authUserId' };
  }
  if (validate_user(uId) === false) {
    return { error: 'invalid uId' };
  }

  for (const user of data.users) {
    if (user.uId === uId) {
      const person = {
        uId: user.uId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr,

      };
    }
  }

  return person;
}

/**
* Checks if user is valid
* @param {number} authUserId
* @returns {boolean}
*/
function validate_user(user_id) {
  const data = getData();
  for (const user of data.users) {
    if (user.uId === user_id) {
      return true;
    }
  }

  return false;
}