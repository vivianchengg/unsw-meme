import { getData } from './dataStore';

/**
  * Returns a list of dms that the user is part of
  * @param {string} token
  * ...
  * @returns {dms: [{
  *   dmId: number,
  *   name: string,
  *   },
  * ]}
*/
export const dmListV1 = (token: string) => {
  const data = getData();

  const authUserId = extractUId(token);
  if (authUserId === undefined) {
    return { error: 'invalid token' };
  }

  const list = [];
  let detail = {};
  for (const dm of data.dms) {
    if (dm.allMembers.includes(authUserId)) {
      detail = {
        dmId: dm.dmId,
        name: dm.name,
      };
      list.push(detail);
    }
  }

  return {
    dms: list
  };
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
    for (const tokenData of user.tokens) {
      if (tokenData === token) {
        userId = user.uId;
      }
    }
  }

  return userId;
};
