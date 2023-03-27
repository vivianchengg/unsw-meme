import { getData } from './dataStore';

export const dmListV1 = (token: string) => {
  const data = getData();
  let authUserId;

  if (!isValidToken(token)) {
    return { error: 'invalid token' };
  } else {
    authUserId = findUID(token);
  }

  const list = [];
  let detail = {};
  for (const dm of data.Dm) {
    if (dm.allMembers.includes(authUserId)) {
      detail = {
        dmId: dm.dmId,
        name: dm.name,
      };
      list.push(detail);
    }
  }

  return {
    dms: list,
  };
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
