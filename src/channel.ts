import { Channel, getData, setData } from './dataStore';
import { userProfileV1 } from './users';
import { findUID } from './channels';

/** check if user is channel member
  *
  * @param {Channel} channel
  * @param {number} userId
  * @returns {bool}
 */
export const isMember = (channel: Channel, userId: number): boolean => {
  for (const member of channel.allMembers) {
    if (member === userId) {
      return true;
    }
  }
  return false;
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
  const authUserId = findUID(token);
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

/** Invite user to channel
  *
  *
  * @param {string} token
  * @param {number} channelId
  * @param {number} uId
  * @returns {}
 */
export const channelInviteV1 = (token: string, channelId: number, uId: number) => {
  const data = getData();
  const authUserId = findUID(token);
  if (authUserId === null) {
    return { error: 'token is invalid' };
  }

  if (!isValidChannel(channelId)) {
    return { error: 'channelId does not refer to a valid channel' };
  }

  if (!isValidUser(uId)) {
    return { error: 'uId does not refer to a valid user' };
  }

  const channel = data.channels.find(c => c.channelId === channelId);
  if (isMember(channel, uId)) {
    return { error: 'uId refers to a user who is already a member of the channel' };
  }

  if (!isMember(channel, authUserId)) {
    return { error: 'channelId is valid and the authorised user is not a member of the channel' };
  }

  channel.allMembers.push(uId);
  setData(data);
  return {};
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

  const authUserId = findUID(token);

  if (authUserId === null) {
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

export const channelMessagesV1 = (token: string, channelId: number, start: number) => {
  const data = getData();
  const authUserId = findUID(token);
  if (authUserId === null) {
    return { error: 'authUserId is invalid' };
  }

  if (!isValidChannel(channelId)) {
    return { error: 'invalid channelId' };
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
