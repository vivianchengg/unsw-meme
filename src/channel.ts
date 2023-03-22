import { Channel, getData, setData } from './dataStore';

/** Function that returns user Id from token
 *
 * @param {string} token
 * @returns {number}
 */
const extractUId = (token: string) => {
  const data = getData();
  let userId = -1;

  for (const user of data.users) {
    for (const tokenData of user.tokens) {
      if (token === tokenData) {
        userId = user.uId;
      }
    }
  }
  return userId;
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

export const isValidToken = (token: number): boolean => {
  const data = getData();
  for (const user of data.users) {
    for (const user_tok of user.tokens) {
      if (user.tokens === token) {
        return true;
      }
    }
  }
};

/** Function that checks if channel id is valid
 *
 *
 * @param {number} channelId
 * @returns {boolean}
*/

export const isValidChannel = (channelId: number): boolean => {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      return true;
    }
  }
  return false;
};

/** Function that checks if given user is member of channel
 *
 * @param {{
 *  channelId: number,
 *  name: string,
 *  isPublic: boolean,
 *  allMembers: array,
 *  ownerMembers: array,
 *  messages: array,
 *  start: number,
 *  end: number
 *  }} channel
 *
 * @param {number} userId
 * @returns {boolean}
 */
export const isMember = (channel: Channel, userId: number): boolean => {
  for (const member of channel.allMembers) {
    if (member === userId) {
      return true;
    }
  }
  return false;
};

export const channelJoinV2 = (token: number, channelId: number) => {
  const data = getData();

  const authUserId = extractUId(token);

  if (isValidUser(authUserId) === false) {
    return { error: 'invalid authUserId' };
  }

  if (!isValidToken(token)) {
    return { error: 'token is invalid' };
  }

  if (!isValidChannel(channelId)) {
    return { error: 'channelId does not refer to a valid channel' };
  }

  const channel = data.channels.find(c => c.channelId === channelId);
  if (isMember(channel, authUserId)) {
    return { error: 'the authorised user is already a member of the channel' };
  }

  const user = data.users.find((p) => p.uId === authUserId);
  if (!channel.isPublic && user.pId !== 1) {
    return { error: 'channel is private, when authorised user is not already a channel member and is not a global owner' };
  }

  channel.allMembers.push(authUserId);
  setData(data);
  return {};
};
