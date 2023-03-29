import { Message, Dm, setData, getData } from './dataStore';
import { isValidUser, validTokenUser } from './channel';
import { findUID } from './channels';

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
  let data = getData();
  
  let dm = data.dms.find(d => d.dmId === dmId);
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

  if (dm.owner === authUserId) {
    return { error: 'user is not the owner of dm' };
  }

  if (!dm.allMembers.includes(authUserId)) {
    return { error: 'user is an owner who is no longer in dm' };
  }

  data.dms = data.dms.filter(d => d.dmId !== dmId);
  setData(data);
  return {};
};
