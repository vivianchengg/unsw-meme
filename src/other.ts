import { getData, setData, Message } from './dataStore';
import { isValidToken } from './users';
import HTTPError from 'http-errors';

/**
  * Resets the internal data of the application to its initial state
  *
  * @param {}
  * @returns {}
*/
export const clearV1 = () => {
  const data = getData();
  data.users = [];
  data.channels = [];
  data.dms = [];
  setData(data);
  return {};
};

/**
  * Returns the user's most recent 20 notifications,
  * ordered from most recent to least recent.
  *
  * @param {string} token
  * @returns {Notif[]} notifications
*/
export const notificationsGetV1 = (token: string) => {
  const data = getData();
  const uId = isValidToken(token);
  if (uId === null) {
    throw HTTPError(403, 'invalid token');
  }

  const user = data.users.find(u => u.uId === uId);
  const notifCopy = user.notifications.slice(0, 20);

  return {
    notifications: notifCopy
  };
};

/**
  * returns a collection of messages from channel/dm
  * that contains querystr
  *
  * @param {string} token
  * @param {string} queryStr
  * @returns {Message[]} messages
*/
export const searchV1 = (token: string, queryStr: string) => {
  const data = getData();
  const uId = isValidToken(token);
  if (uId === null) {
    throw HTTPError(403, 'invalid token');
  }

  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(400, 'queryStr length < 1 or > 1000');
  }

  const matchingMsg: Message[] = [];

  for (const channel of data.channels) {
    if (channel.allMembers.includes(uId)) {
      for (const msg of channel.messages) {
        if (msg.message.toLowerCase().includes(queryStr.toLowerCase())) {
          matchingMsg.push(msg);
        }
      }
    }
  }

  for (const dm of data.dms) {
    if (dm.allMembers.includes(uId)) {
      for (const msg of dm.messages) {
        if (msg.message.toLowerCase().includes(queryStr.toLowerCase())) {
          matchingMsg.push(msg);
        }
      }
    }
  }

  return {
    messages: matchingMsg
  };
};

export const adminuserRemoveV1 = (token: string, uId: number) => {
  const data = getData();
  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  }
  const authUser = data.users.find(u => u.uId === authUserId);

  if (authUser.pId !== 1) {
    throw HTTPError(403, 'authorised user is not global owner');
  }

  const user = data.users.find(u => u.uId === uId);
  if (user === undefined) {
    throw HTTPError(400, 'invalid uId');
  }

  if (countGlobalOwner() === 1 && user.pId === 1) {
    throw HTTPError(400, 'user is only global owner');
  }

  // Changes all contents of channel messages sent by removed user to say 'Removed user' and removes user from channel
  for (const channel of data.channels) {
    for (const messageProfile of channel.messages) {
      if (messageProfile.uId === uId) {
        messageProfile.message = 'Removed user';
      }
    }

    if (channel.allMembers.includes(uId)) {
      channel.allMembers = channel.allMembers.filter(id => id !== uId);
      channel.ownerMembers = channel.ownerMembers.filter(id => id !== uId);
    }
  }

  // Changes all contents of DM messages sent by removed user to say 'Removed user' and removes user from DM
  for (const dm of data.dms) {
    for (const messageProfile of dm.messages) {
      if (messageProfile.uId === uId) {
        messageProfile.message = 'Removed user';
      }
    }

    if (dm.allMembers.includes(uId)) {
      dm.allMembers = dm.allMembers.filter(id => id !== uId);
    }

    if (dm.owner === uId) {
      dm.owner = null;
    }
  }

  // Changes user's name to Removed user and allows email + handle to be reusable
  user.nameFirst = 'Removed';
  user.nameLast = 'user';
  // Removed user will not be returned with '/users/all'
  user.isRemoved = true;

  // email and handleStr is now reusable
  user.email = '';
  user.handleStr = '';

  user.token = [];

  setData(data);
  return {};
};

/**
 * Records number of global owners in Memes
 *
 * @returns {number}
 */
const countGlobalOwner = () => {
  const data = getData();
  const globalPerm = 1;

  let count = 0;
  for (const user of data.users) {
    if (user.pId === globalPerm) {
      count += 1;
    }
  }

  return count;
};

/**
 * Sets user's permissions to new permission level
 * @param {string} token
 * @param {number} uId
 * @param {number} permissionId
 * @returns {}
 */
export const adminuserPermChangeV1 = (token: string, uId: number, permissionId: number) => {
  const data = getData();
  const globalPerm = 1;
  const userPerm = 2;
  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  }

  const authUser = data.users.find(u => u.uId === authUserId);
  if (authUser.pId !== globalPerm) {
    throw HTTPError(403, 'authorised user is not global owner');
  }

  const user = data.users.find(u => u.uId === uId);
  if (user === undefined) {
    throw HTTPError(400, 'invalid uId');
  }

  if (user.pId === permissionId) {
    throw HTTPError(400, 'user already has permission Id level');
  }

  if (permissionId !== globalPerm && permissionId !== userPerm) {
    throw HTTPError(400, 'invalid permission Id');
  }

  if (countGlobalOwner() === 1 && user.pId === globalPerm && permissionId === 2) {
    throw HTTPError(400, 'only global owner is being demoted to user');
  }

  user.pId = permissionId;
  setData(data);
  return {};
};
