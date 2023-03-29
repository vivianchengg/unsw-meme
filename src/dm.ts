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

  const authUserId = extractUId(token);
  if (authUserId === undefined) {
    return { error: 'token is invalid' };
  }

  const dm = data.dms.find(d => d.dmId === dmId);
  if (dm === undefined) {
    return { error: 'invalid dmId' };
  }

  if (!dm.owner.includes(authUserId)) {
    return { error: 'user is not the owner of dm' };
  }

  if (!dm.allMembers.includes(authUserId)) {
    return { error: 'user is an owner who is no longer in dm' };
  }

  data.dms = data.dms.filter(d => d.dmId !== dmId);
  setData(data);
  return {};
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