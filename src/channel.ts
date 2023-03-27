import { Channel, getData, setData } from './dataStore';
import { userProfileV1 } from './users';

/** Function that lists details of members in the channel given that:
*
* @param {string} - Token of individual's session
* @param {number} channelId - Channel Id of channel that user is asking to access details of
* @returns {Channel} channel
*
* Note that channel type is specificed in dataStore.ts
*
*  To return the above:
* - token must be valid
* - channelId must be valid and user must be member of channel
*  Otherwise, {error: string} is returned
*
**/
export const channelDetailsV1 = (token: string, channelId: number) => {
  const data = getData();
  const authUserId = extractUId(token);
  if (authUserId === null) {
    return { error: 'Invalid token' };
  }

  const channel = data.channels.find(c => c.channelId === channelId);
  if (channel === undefined) {
    return { error: 'invalid channelId' };
  }

  if (!isMember(channel, authUserId)) {
    return { error: 'user not member of channel' };
  }

  const allProfiles = [];
  for (const userId of channel.allMembers) {
    const userProfile = userProfileV1(token, userId);
    allProfiles.push(userProfile.user);
  }

  const ownerProfiles = [];
  for (const userId of channel.ownerMembers) {
    const userProfile = userProfileV1(token, userId);
    ownerProfiles.push(userProfile.user);
  }

  return {
    name: channel.name,
    isPublic: channel.isPublic,
    ownerMembers: ownerProfiles,
    allMembers: allProfiles
  };
};

/** Function that returns user Id from token
 *
 * @param {string} token
 * @returns {number}
 */
export const extractUId = (token: string) => {
  const data = getData();
  for (const user of data.users) {
    for (const tokenData of user.token) {
      if (token === tokenData) {
        return user.uId;
      }
    }
  }
  return null;
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

/**
  * check if token is valid
  *
  * @param {string} token
  * @returns {bool}
*/
export const isValidToken = (token: string): boolean => {
  const data = getData();
  for (const user of data.users) {
    for (const userToken of user.token) {
      if (userToken === token) {
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

/**
  * Given a channelId of a channel that the authorised user can join,
  * adds them to that channel.
  *
  * @param {string} token
  * @param {number} channelId
  * @returns {}
*/
export const channelJoinV1 = (token: string, channelId: number) => {
  const data = getData();

  const authUserId = extractUId(token);

  if (authUserId === null) {
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
