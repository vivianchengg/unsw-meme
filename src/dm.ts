import { getData } from './dataStore';

/** Checks if dmId is valid
 *
 * @param {number} dmId
 * @param {number} userId
 * @returns {boolean}
 */
const isValidDm = (dmId: number) => {
  const data = getData();
  if (data.dms.find(dm => dm.dmId === dmId) === undefined) {
    return false;
  }
  return true;
};

/** Checks if user is member of DM
 *
 * @param {number} dmId
 * @param {number} userId
 * @returns {boolean}
 */
const isMemberOfDm = (dmId: number, userId: number) => {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.allmembers.includes(userId)) {
      return true;
    }
  }
  return false;
};

/** Function that checks if user id is valid
 *
 *
 * @param {number} userId
 * @returns {boolean}
 */
export const isValidUser = (userId: number): boolean => {
  const data = getData();
  for (const user of data.users) {
    if (user.uId === userId) {
      return true;
    }
  }
  return false;
};

/** Function that checks if a token is valid
 *
 *
 * @param {string} token
 * @returns {boolean}
 */
export const isValidToken = (token: string): boolean => {
  const data = getData();
  for (const user of data.users) {
    if (user.token === token) {
      return true;
    }
  }
};

/** Function that returns user Id from token
 *
 * @param {string} token
 * @returns {number}
 */
export const extractUid = (token: string) => {
  const data = getData();
  for (const user of data.users) {
    for (const tokenData of user.token) {
      if (token === tokenData) {
        return user.uId;
      }
    }
  }
  return null;
};

/**
  * Given a DM with ID dmId that the authorised user is a member of,
  * returns up to 50 messages between index "start" and "start + 50".
  * Message with index 0 (i.e. the first element in the returned array of messages) is the most recent message in the channel.
  * This function returns a new index "end".
  * If there are more messages to return after this function call, "end" equals "start + 50".
  * If this function has returned the least recent messages in the DM,
  * "end" equals -1 to indicate that there are no more messages to load after this return.
  * @param {number} dmId
  * @param {number} channelId
  * @param {number} start
  * @returns {
*   messages: string,
*   start: number,
*   end: number
* }
* To return the above:
*  - dmId must refer to a valid DM
*  - token must be valid
*  - authorised user is already a member of the dm
*  - start must be less than or equal to the total number of messages in the channel
* Otherwise, {error: string} is returned
*
*/
export const dmMessagesV1 = (token: string, dmId: number, start: number) => {
  const data = getData();
  if (!isValidDm(dmId)) {
    return { error: 'dmId does not refer to a valid DM' };
  }
  const dm = data.dms.find(dm => dm.dmId === dmId);
  const msgLength = dm.messages.length;
  if (start > msgLength) {
    return { error: 'start is greater than the total number of messages in the channel' };
  }
  const authUser = extractUid(token);
  if (!isMemberOfDm(dmId, authUser)) {
    return { error: 'dmId is valid and the authorised user is not a member of the DM' };
  }
  if (!isValidToken(token)) {
    return { error: 'token is invalid' };
  }
  let end = 0;
  let messages = null;
  if (msgLength > (start + 50)) {
    end = start + 50;
    messages = dm.messages.slice(start, end);
  } else {
    end = -1;
    messages = dm.messages.slice(start);
  }
  const retObj = {
    messages: messages,
    start: start,
    end: end
  };
  return retObj;
};
