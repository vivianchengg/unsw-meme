import { Message, getData, setData } from './dataStore';
import { isMember } from './channel';
import { isValidToken } from './users';
import HTTPError from 'http-errors';

/**
  * Checks if name is valid
  *
  * @param {string} name
  * @returns {bool}
*/
export const isValidName = (name: string): boolean => {
  if (name.length < 1 || name.length > 20) {
    return false;
  }
  return true;
};

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

  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'Invalid token error');
  }

  if (isValidName(name) === false) {
    throw HTTPError(400, 'Invalid name length error');
  }

  const size = data.channels.length + 1;

  const owners = [authUserId];
  const members = [authUserId];
  const message: Message[] = [];
  const timeFinish: number = null;
  const standup = {
    isActive: false,
    timeFinish: timeFinish,
    starterId: -1
  };

  const channel = {
    channelId: size,
    name: name,
    isPublic: isPublic,
    ownerMembers: owners,
    allMembers: members,
    messages: message,
    standup: standup
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

  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'Invalid token error');
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
 * @returns {channels: [{
 *   channelId: number,
 *   name: string,
 *   },
 * ]}
 *
 */
export const channelsListAllV1 = (token: string) => {
  const data = getData();

  const userId = isValidToken(token);

  if (userId === null) {
    throw HTTPError(403, 'Invalid token error');
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
