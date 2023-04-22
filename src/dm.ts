import { Message, setData, getData } from './dataStore';
import { userProfileV1, isValidToken, isValidUser } from './users';
import HTTPError from 'http-errors';

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
      throw HTTPError(400, 'Invalid uId error');
    }

    if (uIds.indexOf(userId) !== count) {
      throw HTTPError(400, 'Duplicate uId error');
    }
    count++;
  }

  const ownerId = isValidToken(token);
  if (ownerId === null) {
    throw HTTPError(403, 'Invalid token error');
  }
  const owner = data.users.find(u => u.uId === ownerId);

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
    messages: message
  };
  data.dms.push(newDm);

  const notifMsg = `${owner.handleStr} added you to ${dmName}`;
  const notif = {
    channelId: -1,
    dmId: dmId,
    notificationMessage: notifMsg
  };

  for (const userId of uIds) {
    const user = data.users.find(u => u.uId === userId);
    user.notifications.unshift(notif);
  }

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
    throw HTTPError(400, 'Invalid dmId error');
  }

  const userId = isValidToken(token);
  if (userId === null) {
    throw HTTPError(403, 'Invalid token error');
  }

  if (!dm.allMembers.includes(userId)) {
    throw HTTPError(403, 'User is not member of DM');
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

  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'Invalid token error');
  }

  const dm = data.dms.find(d => d.dmId === dmId);
  if (dm === undefined) {
    throw HTTPError(400, 'Invalid dmId error');
  }

  if (!dm.allMembers.includes(authUserId)) {
    throw HTTPError(403, 'user is not a member of DM');
  }

  if (dm.owner !== authUserId) {
    throw HTTPError(403, 'user is not an owner');
  }

  data.dms = data.dms.filter(d => d.dmId !== dmId);
  setData(data);
  return {};
};

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

  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'Invalid token error');
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

/**
  * Returns up to 50 messages in a DM.
  *
  * @param {number} dmId
  * @param {number} channelId
  * @param {number} start
  * @returns {
*   messages: string,
*   start: number,
*   end: number
* }
*
*/
export const dmMessagesV1 = (token: string, dmId: number, start: number) => {
  const data = getData();
  const dm = data.dms.find(d => d.dmId === dmId);
  if (dm === undefined) {
    throw HTTPError(400, 'Invalid dmId error');
  }

  const msgLength = dm.messages.length;
  if (start > msgLength) {
    throw HTTPError(400, 'start is greater than the total number of messages in the channel');
  }

  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'Invalid token error');
  }

  if (!dm.allMembers.includes(authUserId)) {
    throw HTTPError(403, 'user is not member of DM');
  }

  let end;
  let messages = [];
  if (msgLength > (start + 50)) {
    end = start + 50;
    messages = dm.messages.slice(start, end);
  } else {
    end = -1;
    messages = dm.messages.slice(start);
  }

  for (const msg of messages) {
    for (const r of msg.reacts) {
      if (r.uIds.includes(authUserId)) {
        r.isThisUserReacted = true;
      }
    }
  }

  return {
    messages: messages,
    start: start,
    end: end
  };
};

/** lists details of specific DM
  *
  * @param {string} token
  * @param {number} dmId
  * @returns {object}
  *
 */
export const dmDetailsV1 = (token: string, dmId: number) => {
  const data = getData();
  const dm = data.dms.find(d => d.dmId === dmId);

  if (dm === undefined) {
    throw HTTPError(400, 'Invalid dmId error');
  }

  const userId = isValidToken(token);
  if (userId === null) {
    throw HTTPError(403, 'Invalid token error');
  }

  if (!dm.allMembers.includes(userId)) {
    throw HTTPError(403, 'user is not member of DM');
  }

  const dmMembers = [];
  for (const memberId of dm.allMembers) {
    const memberProfile = userProfileV1(token, memberId);
    dmMembers.push(memberProfile.user);
  }

  return {
    name: dm.name,
    members: dmMembers
  };
};
