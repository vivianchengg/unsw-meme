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
