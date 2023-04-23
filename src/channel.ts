import { Channel, User, getData, setData, updateWorkSpace, updateUserStat } from './dataStore';
import { userProfileV1, isValidToken, isValidUser } from './users';
import HTTPError from 'http-errors';

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
export const channelDetailsV3 = (token: string, channelId: number) => {
  const data = getData();
  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'Invalid token');
  }

  const channel = data.channels.find(c => c.channelId === channelId);
  if (channel === undefined) {
    throw HTTPError(400, 'invalid channelId');
  }

  if (!isMember(channel, authUserId)) {
    throw HTTPError(403, 'user not member of channel');
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

/**
  * Adds a user to a channel
  *
  * @param {string} token
  * @param {number} channelId
  * @param {number} uId
  * @returns {}
 */
export const channelInviteV3 = (token: string, channelId: number, uId: number) => {
  const data = getData();
  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'token is invalid');
  }

  if (!isValidChannel(channelId)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  if (!isValidUser(uId)) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }

  const channel = data.channels.find(c => c.channelId === channelId);
  if (isMember(channel, uId)) {
    throw HTTPError(400, 'uId refers to a user who is already a member of the channel');
  }

  if (!isMember(channel, authUserId)) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  channel.allMembers.push(uId);

  const owner = data.users.find(u => u.uId === authUserId);
  const notifMsg = `${owner.handleStr} added you to ${channel.name}`;
  const notif = {
    channelId: channel.channelId,
    dmId: -1,
    notificationMessage: notifMsg
  };

  const user = data.users.find(u => u.uId === uId);
  user.notifications.unshift(notif);

  updateWorkSpace(data);
  updateUserStat(data, user);

  setData(data);
  return {};
};

/**
  * Given a channelId and token, add the user to the channel.
  *
  * @param {string} token
  * @param {number} channelId
  * @returns {}
*/
export const channelJoinV3 = (token: string, channelId: number) => {
  const data = getData();

  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'token is invalid');
  }

  if (!isValidChannel(channelId)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  const channel = data.channels.find(c => c.channelId === channelId);
  if (isMember(channel, authUserId)) {
    throw HTTPError(400, 'the authorised user is already a member of the channel');
  }

  const user = data.users.find((p) => p.uId === authUserId);
  if (!channel.isPublic && user.pId !== 1) {
    throw HTTPError(403, 'channel is private, when authorised user is not already a channel member and is not a global owner');
  }

  channel.allMembers.push(authUserId);
  updateWorkSpace(data);
  updateUserStat(data, user);
  setData(data);
  return {};
};

/**
  * Returns up to 50 messages from a channel.
  *
  * @param {string} token
  * @param {number} channelId
  * @param {number} start
  * @returns {object}
*/
export const channelMessagesV3 = (token: string, channelId: number, start: number) => {
  const data = getData();
  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'token is invalid');
  }

  if (!isValidChannel(channelId)) {
    throw HTTPError(400, 'invalid channelId');
  }

  const channel = data.channels.find(c => c.channelId === channelId);

  if (!isMember(channel, authUserId)) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  const messageLen = channel.messages.length;
  let messages;

  if (start > messageLen) {
    throw HTTPError(400, ' start is greater than the total number of messages in the channel');
  }
  let end = 0;
  if (messageLen > (start + 50)) {
    end = start + 50;
    messages = channel.messages.slice(start, end);
  } else {
    end = -1;
    messages = channel.messages.slice(start);
  }

  for (const msg of messages) {
    for (const r of msg.reacts) {
      if (r.uIds.includes(authUserId)) {
        r.isThisUserReacted = true;
      }
    }
  }

  return {
    messages: messages,
    start: start,
    end: end,
  };
};

/**
  * Given a channelId and token, remove a user from the channel.
  *
  * @param {string} token
  * @param {number} channelId
  * @returns {}
*/
export const channelLeaveV2 = (token: string, channelId: number) => {
  const data = getData();

  const userId = isValidToken(token);
  if (userId === null) {
    throw HTTPError(403, 'invalid token');
  }
  const user = data.users.find(u => u.uId === userId);

  const channel = data.channels.find(c => c.channelId === channelId);
  if (channel === undefined) {
    throw HTTPError(400, 'Invalid channel');
  }

  if (!isMember(channel, userId)) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  if (channel.standup.isActive && channel.standup.starterId === userId) {
    throw HTTPError(400, 'authorised user is the starter of an active standup');
  }

  // Need to implement error where user is starter of active standup in channel
  channel.allMembers = channel.allMembers.filter(id => id !== userId);
  channel.ownerMembers = channel.ownerMembers.filter(id => id !== userId);
  updateWorkSpace(data);
  updateUserStat(data, user);
  setData(data);
  return {};
};

/**
  * check if the user has owner permission
  *
  * @param {User} authUser
  * @param {Channel} channel
  * @returns {bool}
*/
export const hasOwnerPermission = (authUser: User, channel: Channel) => {
  for (const ownerId of channel.ownerMembers) {
    if (authUser.uId === ownerId) {
      return true;
    }
  }

  // global owner and channel member
  if (authUser.pId === 1 && isMember(channel, authUser.uId)) {
    return true;
  }

  return false;
};

/**
  * check if the user is channel owner
  *
  * @param {User} authUser
  * @param {Channel} channel
  * @returns {bool}
*/
export const isOwner = (authUser: User, channel: Channel) => {
  for (const ownerId of channel.ownerMembers) {
    if (authUser.uId === ownerId) {
      return true;
    }
  }
  return false;
};

/**
  * Given a userId, make this user the owner of the channel.
  *
  * @param {string} token
  * @param {number} channelId
  * @param {number} uId
  * @returns {}
*/
export const channelAddOwnerV2 = (token: string, channelId: number, uId: number) => {
  const data = getData();
  const channel = data.channels.find(c => c.channelId === channelId);
  const user = data.users.find(u => u.uId === uId);

  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  }

  if (channel === undefined) {
    throw HTTPError(400, 'invalid channel');
  }

  const authUser = data.users.find(u => u.uId === authUserId);

  if (!hasOwnerPermission(authUser, channel)) {
    throw HTTPError(403, 'authUser does not have owner permissions');
  }

  if (user === undefined) {
    throw HTTPError(400, 'invalid user');
  }

  if (!isMember(channel, uId)) {
    throw HTTPError(400, 'user is not a member of the channel');
  }

  if (isOwner(user, channel)) {
    throw HTTPError(400, 'user is already owner');
  }

  channel.ownerMembers.push(uId);
  setData(data);
  return {};
};

/**
  * Given a userid, remove user from owner of channel.
  *
  * @param {string} token
  * @param {number} channelId
  * @param {number} uId
  * @returns {}
*/
export const channelRemoveOwnerV2 = (token: string, channelId: number, uId: number) => {
  const data = getData();
  const channel = data.channels.find(c => c.channelId === channelId);
  const user = data.users.find(u => u.uId === uId);

  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  }

  if (channel === undefined) {
    throw HTTPError(400, 'invalid channel');
  }

  const authUser = data.users.find(u => u.uId === authUserId);
  if (!hasOwnerPermission(authUser, channel)) {
    throw HTTPError(403, 'user does not have owner permissions');
  }

  if (user === undefined) {
    throw HTTPError(400, 'invalid user');
  }

  if (!isOwner(user, channel)) {
    throw HTTPError(400, 'user is not a owner of the channel');
  }

  if (channel.ownerMembers.length === 1) {
    throw HTTPError(400, 'user is the only owner');
  }

  channel.ownerMembers = channel.ownerMembers.filter(id => id !== uId);
  setData(data);
  return {};
};
