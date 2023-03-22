import { Channel, getData } from './dataStore';
import { userProfileV1 } from './users';

/** Function that lists details of members in the channel given that:
*
* @param {number} authUserId - User Id of individual asking for details of a channel
* @param {number} channelId - Channel Id of channel that user is asking to access details of
* @returns {object} channel
*
*  - Here, channel: {
*  name: string,
*  isPublic: boolean,
*  ownerMembers: array,
*  allMembers: array
*  }
*
*  - Also, user: {
*  uId: number,
*  email: string,
*  password: string,
*  nameFirst: string,
*  nameLast: string,
*  handleStr: string
*  }

*
*  To return the above:
* - authUserId must be valid
* - channelId must be valid and user must be member of channel
*  Otherwise, {error: string} is returned
*
**/

export const channelDetailsV1 = (authUserId: number, channelId: number) => {
  const data = getData();
  if (isValidUser(authUserId) === false) {
    return { error: 'invalid authUserId' };
  }

  if (isValidChannel(channelId) === false) {
    return { error: 'invalid channelId' };
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      if (isMember(channel, authUserId) === false) {
        return { error: 'user not member of channel' };
      }

      const allProfiles = [];
      for (const userId of channel.allMembers) {
        const userProfile = userProfileV1(authUserId, userId);
        allProfiles.push(userProfile.user);
      }

      const ownerProfiles = [];
      for (const userId of channel.ownerMembers) {
        const userProfile = userProfileV1(authUserId, userId);
        ownerProfiles.push(userProfile.user);
      }

      return {
        name: channel.name,
        isPublic: channel.isPublic,
        ownerMembers: ownerProfiles,
        allMembers: allProfiles
      };
    }
  }
};

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
    if (user.tokens.includes(token)) {
      return true;
    }
  }
  return false;
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

export const channelMessagesV2 = (token: number, channelId: number, start: number) => {
  const data = getData();
  const authUserId = extractUId(token);
  if (!isValidUser(authUserId)) {
    return { error: 'authUserId is invalid' };
  }

  if (!isValidChannel(channelId)) {
    return { error: 'channelId does not refer to a valid channel' };
  }

  const channel = data.channels.find(c => c.channelId === channelId);
  if (!isMember(channel, authUserId)) {
    return { error: 'channelId is valid and the authorised user is not a member of the channel' };
  }

  const messageLen = channel.messages.length;
  let messages;

  if (start > messageLen) {
    return { error: ' start is greater than the total number of messages in the channel' };
  }
  let end = 0;
  if (messageLen > (start + 50)) {
    end = start + 50;
    messages = channel.messages.slice(start, end);
  } else {
    end = -1;
    messages = channel.messages.slice(start);
  }

  return {
    messages: messages,
    start: start,
    end: end,
  };
};
