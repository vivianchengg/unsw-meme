import { getData, Dm } from './dataStore';
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
  const dm: Dm = data.dms.find(d => d.dmId === dmId);

  if (dm === undefined) {
    return { error: 'dmId does not refer to valid DM' };
  }

  const userId = findUID(token);
  if (userId === undefined) {
    return { error: 'Invalid token' };
  }

  if (!dm.allMembers.includes(userId)) {
    return { error: 'User is not member of DM' };
  }

  const dmMembers = [];
  for (const member of dm.allMembers) {
    const memberProfile = userProfileV1(token, member);
    dmMembers.push(memberProfile.user);
  }

  return {
    name: dm.name,
    members: dmMembers
  };
};

/**
  * Finds the authUserId given a token.
  *
  * @param {string} token
  * @returns {string} authUserId
*/
export const findUID = (token: string) => {
  const data = getData();
  for (const user of data.users) {
    if (user.token.includes(token)) {
      return user.uId;
    }
  }
  return null;
};
