import { getData } from './dataStore';
import { userProfileV1 } from './users';

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
    const dmMembers = [];
    for (const member of dm.allMembers) {
      const memberProfile = userProfileV1(token, member);
      dmMembers.push(memberProfile.user);
    }

    if (dm.dmId === dmId) {
      return {
        name: dm.name,
        members: dmMembers
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
    for (const tokenData of user.token) {
      if (tokenData === token) {
        userId = user.uId;
      }
    }
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
    for (const member of dm.allMembers) {
      if (member === userId) {
        return true;
      }
    }
  }

  return false;
};
