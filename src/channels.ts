import { Message, getData, setData } from './dataStore';
import { isValidUser, isMember } from './channel';

/**
  * Creates a channel for authUserId.
  *
  * @param {string} token
  * @param {string} name
  * @param {boolean} isPublic
  * @returns {{channelId: number}}
*/
export const channelsCreateV1 = (token: string, name: string, isPublic: boolean) => {
  const data = getData();

  const authUserId = findUID(token);
  if (authUserId === null) {
    return { error: 'invalid token' };
  }

  if (isValidUser(authUserId) === false) {
    return { error: 'invalid auth user id' };
  }

  if (isValidName(name) === false) {
    return { error: 'invalid name' };
  }

  const size = data.channels.length + 1;

  const owners = [authUserId];
  const members = [authUserId];
  const message: Message[] = [];

  const channel = {
    channelId: size,
    name: name,
    isPublic: isPublic,
    ownerMembers: owners,
    allMembers: members,
    messages: message,
    start: -1,
    end: -1,
  };

  data.channels.push(channel);
  setData(data);

  return { channelId: size };
};

/**
  * Creates an array of all channels a user is a member of
  *
  * @param {string} token
  * @returns {channels: [{
  *   channelId: number,
  *   name: string,
  *   },
  * ]}
  *
*/
export const channelsListV1 = (token: string) => {
  const data = getData();
  let authUserId;

  if (!isValidToken(token)) {
    return { error: 'invalid token' };
  } else {
    authUserId = findUID(token);
  }

  if (!isValidUser(authUserId)) {
    return { error: 'invalid authUserId' };
  }

  const channelList = [];
  for (const channel of data.channels) {
    if (isMember(channel, authUserId)) {
      const channelDetail = {
        channelId: channel.channelId,
        name: channel.name,
      };
      channelList.push(channelDetail);
    }
  }
  return {
    channels: channelList,
  };
};

/** Function lists details of all channels
 *
 * @param {string} token - Token of individual's session
 * @returns {array} channels
 *
 * Here, channels: [{
 *  channelId: number,
 *  name: string
 * }]
 *
 * To return the above:
 * - token must be valid
 *
 * Otherwise, {error: string} is returned
 */
export const channelsListAllV1 = (token: string) => {
  const data = getData();
  const userId = findUID(token);

  if (userId === null) {
    return { error: 'Invalid token' };
  }

  const channelList = [];
  for (const channel of data.channels) {
    const channelDetail = {
      channelId: channel.channelId,
      name: channel.name
    };

    channelList.push(channelDetail);
  }

  return {
    channels: channelList
  };
};

/**
  * Checks if name is valid
  *
  * @param {string} name
  * @returns {bool}
*/
const isValidName = (name: string): boolean => {
  if (name.length < 1 || name.length > 20) {
    return false;
  }
  return true;
};

/**
  * Checks if the token is valid
  * @param {string} token
  * @returns {boolean}
*/
export const isValidToken = (token: string): boolean => {
  const data = getData();
  for (const user of data.users) {
    if (user.token.includes(token)) {
      return true;
    }
  }
  return false;
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
