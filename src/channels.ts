import { Message, getData, setData } from './dataStore';
import { isValidUser, isMember } from './channel';

/**
  * Creates a channel for authUserId.
  *
  * @param {number} authUserId
  * @param {string} name
  * @param {boolean} isPublic
  * ...
  * @returns {{channelId: number}}
*/
export const channelsCreateV1 = (authUserId: number, name: string, isPublic: boolean) => {
  const data = getData();
  if (isValidUser(authUserId) === false) {
    return { error: 'invalid auth user id' };
  }

  if (isValidName(name) === false) {
    return { error: 'invalid name' };
  }

  let size = data.channels.length;
  size = size + 1;

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
  * @param {number} authUserId
  * ...
  * @returns {channels: [{
*   channelId: number,
*   name: string,
*   },
* ]}
*
*/
export const channelsListV1 = (authUserId: number) => {
  const data = getData();
  if (isValidUser(authUserId) === false) {
    return { error: 'invalid authUserId' };
  }

  const channelList = [];
  let channelDetail = {};
  for (const channel of data.channels) {
    if (isMember(channel, authUserId) === true) {
      channelDetail = {
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
 * @param {number} authUserId - User ID of individual calling function
 * @returns {array} channels
 *
 * Here, channels: [{
 *  channelId: number,
 *  name: string
 * }]
 *
 * To return the above:
 * - authUserId must be valid
 *
 * Otherwise, {error: string} is returned
 */

// Function lists details of all channels the user is in
export const channelsListAllV1 = (authUserId: number) => {
  const data = getData();
  if (isValidUser(authUserId) === false) {
    return { error: 'invalid authUserId' };
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
  * ...
  * @returns {boolean}
*/
const isValidName = (name: string): boolean => {
  if (name.length < 1 || name.length > 20) {
    return false;
  }
  return true;
};
