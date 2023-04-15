import { getData, setData } from './dataStore';
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
