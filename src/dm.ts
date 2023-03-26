import { getData } from './dataStore';

/** Function that lists details of specific DM
 *
 * @param {string} token
 * @param {number} dmId
 *
 * @returns {string} name
 * @returns {User[]} members
 *
 * To return the above:
 * - token must be valid
 * - dmId must refer to valid DM and user is member of DM
 *
 */
export const dmDetailsV1 = (token: string, dmId: number) => {
  const data = getData();

  if (!isValidDMId(dmId)) {
    return { error: 'dmId does not refer to valid DM' };
  }

  const userId = extractUId(token);
  if (userId === undefined) {
    return { error: 'Invalid token' };
  }

  if (!isMemberOfDM(dmId, userId)) {
    return { error: 'User is not member of DM' };
  }

  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      return {
        name: dm.name,
        members: dm.members
      };
    }
  }
};

/** Function checks if DMId refers to valid DM or not
 *
 * @param {number} dmId
 * @returns {boolean}
 */
export const isValidDMId = (dmId: number) => {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      return true;
    }
  }

  return false;
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
    userId = user.tokens.find(tokenData => tokenData === token);
  }

  return userId;
};

/** Checks if user is member of DM
 *
 * @param {number} dmId
 * @param {number} userId
 * @returns {boolean}
 */
const isMemberOfDM = (dmId: number, userId: number) => {
  const data = getData();

  for (const dm of data.dms) {
    for (const member of dm.members) {
      if (member.userId === userId) {
        return true;
      }
    }
  }

  return false;
};
