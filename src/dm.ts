import { getData, setData } from './dataStore';

/**
  * Owner of Dm deleting Dm.
  * @param {string} token
  * @param {number} dmId
  * ...
  * @returns {}
*/
export const dmRemoveV1 = (token: string, dmId: number) => {
  const data = getData();
  let authUserId;

  if (!isValidToken(token)) {
    return { error: 'invalid token' };
  } else {
    authUserId = findUID(token);
  }

  if (!isValidMember(authUserId, dmId)) {
    return { error: 'either dmId does not exist or user is not a member' };
  }

  if (!isValidOwner(authUserId, dmId)) {
    return { error: 'dm is valid but not the creator' };
  }

  const newList = data.dms.filter(d => d.dmId !== dmId);
  data.dms = newList;
  setData(data);
  return {};
};

/**
  * Checks if user is owner of dm
  * @param {number} authUserId
  * @param {number} dmId
  * ...
  * @returns {boolean}
*/
const isValidOwner = (authUserId: number, dmId: number) => {
  const data = getData();
  const dm = data.dms.find(d => d.dmId === dmId);
  if (dm.owner === authUserId) {
    return true;
  }
  return false;
};

/**
  * Checks if dm exist and if user is a member
  * @param {number} authUserId
  * @param {number} dmId
  * ...
  * @returns {boolean}
*/
const isValidMember = (authUserId: number, dmId: number) => {
  const data = getData();
  const dm = data.dms.find(d => d.dmId === dmId);
  if (dm === undefined) {
    return false;
  }
  if (!dm.allMembers.includes(authUserId)) {
    return false;
  }
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
