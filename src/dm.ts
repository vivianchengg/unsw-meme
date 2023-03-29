import { Message, setData, getData } from './dataStore';
import { isValidUser, validTokenUser } from './channel';
import { findUID } from './channels';

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
    if (dm.allMembers.includes(userId)) {
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
  if (authUser === undefined) {
    return { error: 'token is invalid' };
  }
  if (!isMemberOfDm(dmId, authUser)) {
    return { error: 'dmId is valid and the authorised user is not a member of the DM' };
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

/**
  * check whether email entered belong to a user
  *
  * @param {string} token
  * @param {number[]} uIds
  * @returns {number} dmId
*/
export const dmCreateV1 = (token: string, uIds: number[]) => {
  const data = getData();
  let count = 0;
  for (const userId of uIds) {
    if (!isValidUser(userId)) {
      return { error: 'invalid uId exists' };
    }

    if (uIds.indexOf(userId) !== count) {
      return { error: 'duplicate uId' };
    }
    count++;
  }

  const owner = validTokenUser(token);
  if (owner === null) {
    return { error: 'invalid token' };
  }

  const dmId = data.dms.length + 1;
  const allHandle = [owner.handleStr];

  const dmOwner = owner.uId;
  const dmMember = [owner.uId];
  for (const userId of uIds) {
    dmMember.push(userId);

    const user = data.users.find(u => u.uId === userId);
    allHandle.push(user.handleStr);
  }

  allHandle.sort();
  let dmName = '';
  for (const handle of allHandle) {
    if (dmName.length !== 0) {
      dmName += ', ';
    }
    dmName += handle;
  }

  const message: Message[] = [];

  const newDm = {
    dmId: dmId,
    name: dmName,
    allMembers: dmMember,
    owner: dmOwner,
    messages: message,
    start: -1,
    end: -1,
  };
  data.dms.push(newDm);
  setData(data);

  return {
    dmId: dmId
  };
};

/** Function that removes member from DM
  *
  * @param {string} token
  * @param {number} dmId
  *
  * @returns {}
  *
  * To return the above:
  * - token must be valid
  * - dmId must refer to valid DM and user is member of DM
  *
 */
export const dmLeaveV1 = (token: string, dmId: number) => {
  const data = getData();

  const dm = data.dms.find(d => d.dmId === dmId);
  if (dm === undefined) {
    return { error: 'dmId does not refer to valid DM' };
  }

  const userId = findUID(token);
  if (userId === null) {
    return { error: 'Invalid token' };
  }

  if (!dm.allMembers.includes(userId)) {
    return { error: 'User is not member of DM' };
  }

  dm.allMembers = dm.allMembers.filter(d => d !== userId);
  if (dm.owner === userId) {
    dm.owner = null;
  }

  setData(data);
  return {};
};

/**
  * Owner of Dm deleting Dm.
  * @param {string} token
  * @param {number} dmId
  * ...
  * @returns {}
*/
export const dmRemoveV1 = (token: string, dmId: number) => {
  const data = getData();

  const authUserId = findUID(token);
  if (authUserId === null) {
    return { error: 'token is invalid' };
  }

  const dm = data.dms.find(d => d.dmId === dmId);
  if (dm === undefined) {
    return { error: 'invalid dmId' };
  }

  if (dm.owner !== authUserId) {
    return { error: 'user is not the owner of dm' };
  }

  if (!dm.allMembers.includes(authUserId)) {
    return { error: 'user is an owner who is no longer in dm' };
  }

  data.dms = data.dms.filter(d => d.dmId !== dmId);
  setData(data);
  return {};
};
