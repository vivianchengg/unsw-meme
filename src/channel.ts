import { Channel, getData, setData } from './dataStore';
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
  * Given a channelId of a channel that the authorised user can join, adds them to that channel.
  * @param {number} authUserId
  * @param {number} channelId
  * @returns {}
  *
  * To return the above:
  *  - channelId must refer to a valid chanel
  *  - authorised user is not already a member of the channel
  *  - channelId refers to a channel that is public
  *  - authUserId is valid
  * Otherwise, {error: string} is returned
*
*/

export const channelJoinV1 = (authUserId: number, channelId: number) => {
  const data = getData();

  if (!isValidUser(authUserId)) {
    return { error: 'authUserId is invalid' };
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

/**
  * Invites a user with ID uId to join a channel with ID channelId.
  * Once invited, the user is added to the channel immediately.
  * In both public and private channels, all members are able to invite users.
  * @param {number} authUserId
  * @param {number} channelId
  * @param {number} uId
  * @returns {}
  *
  * To return the above:
  *  - channelId must refer to a valid chanel
  *  - authorised user is already a member of the channel
  *  - uId is not already a member of the channel
  *  - authUserId refers to a valid user
  *  - uId refers to a valid user
  * Otherwise, {error: string} is returned
*
*/

export const channelInviteV1 = (authUserId: number, channelId: number, uId: number) => {
  const data = getData();

  if (!isValidUser(authUserId)) {
    return { error: 'authUserId is invalid' };
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
  * Given a channel with ID channelId that the authorised user is a member of,
  * returns up to 50 messages between index "start" and "start + 50".
  * Message with index 0 (i.e. the first element in the returned array of messages) is the most recent message in the channel.
  * This function returns a new index "end".
  * If there are more messages to return after this function call, "end" equals "start + 50".
  * If this function has returned the least recent messages in the channel,
  * "end" equals -1 to indicate that there are no more messages to load after this return.
  * @param {number} authUserId
  * @param {number} channelId
  * @param {number} start
  * @returns {
*   messages: string,
*   start: number,
*   end: number
* }
* To return the above:
*  - channelId must refer to a valid chanel
*  - authorised user is already a member of the channel
*  - authUserId is valid
*  - start must be less than or equal to the total number of messages in the channel
* Otherwise, {error: string} is returned
*
*/

export const channelMessagesV1 = (authUserId: number, channelId: number, start: number) => {
  const data = getData();

  if (!isValidUser(authUserId)) {
    return { error: 'authUserId is invalid' };
  }

  if (!isValidChannel(channelId)) {
    return { error: 'channelId does not refer to a valid channel' };
  }

  const channel = data.channels.find(c => c.channelId === channelId);
  if (!isMember(channel, authUserId)) {
    return { error: 'hannelId is valid and the authorised user is not a member of the channel' };
  }

  const messageLen = channel.messages.length;
  const messages = channel.messages.slice();

  if (start > messageLen) {
    return { error: ' start is greater than the total number of messages in the channel' };
  }

  let end = 0;
  if (messageLen > (start + 50)) {
    end = start + 50;
  } else {
    end = -1;
  }

  return {
    messages: messages,
    start: start,
    end: end,
  };
};

/**
  * get user and check whether token is valid
  *
  * @param {string} token
  * @returns {User}
*/
const validTokenUser = (token: string) => {
  const data = getData();
  for (const user of data.users) {
    for (const userToken of user.token) {
      if (userToken === token) {
        return user;
      }
    }
  }
  return null;
};

/**
  * check if the user is channel owner
  *
  * @param {number} uId
  * @param {Channel} channel
  * @returns {bool}
*/
const isChannelOwner = (uId: number, channel: Channel) => {
  for (const ownerId of channel.ownerMembers) {
    if (uId === ownerId) {
      return true;
    }
  }
  return false;
};

/**
  * check whether email entered belong to a user
  *
  * @param {string} token
  * @param {number} channelId
  * @param {number} uId
  * @returns {}
*/
export const channelAddOwnerV1 = (token: string, channelId: number, uId: number) => {
  const data = getData();
  const channel = data.channels.find(c => c.channelId === channelId);
  const user = data.users.find(u => u.uId === uId);
  if (channel === undefined) {
    return { error: 'invalid channel' };
  }

  if (user === undefined) {
    return { error: 'invalid user' };
  }

  const authUser = validTokenUser(token);
  if (authUser === null) {
    return { error: 'invalid token' };
  }

  if (!isMember(channel, uId)) {
    return { error: 'user is not a member of the channel' };
  }

  if (authUser.pId !== 1 && !isChannelOwner(authUser.uId, channel)) {
    return { error: 'user does not have owner permissions' };
  }

  channel.ownerMembers.push(uId);
  setData(data);
  return {};
};
