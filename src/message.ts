import { getData, setData } from './dataStore';
import { findUID } from './channels';

/** Checks if messageId is of a valid message within a channel/dm that the authorised user has joined
* @param {number} - authId of authorised user
* @param {number} - messageId of message that authorised user is trying to remove
* @returns {boolean}
*/
const msgValid = (authId: number, messageId: number) => {
  const data = getData();
  const channel = data.channels.find(c => c.messages.messagelId === messageId);
  const dm = data.dms.find(d => d.messages.messagelId === messageId);
  if (channel.allMembers.includes(authId)) {
    return channel;
  } else if (dm.allMembers.includes(authId)) {
    return dm;
  }
  return null;
};

/** Checks if message is sent by authorised user making the request => checks if user has owner permissions in this channel/dm
* @param {number} - authId of authorised user
* @param {number} - messageId of message that authorised user is trying to remove
* @returns {boolean}
*/
const msgSentByUser = (authId: number, messageId: number) => {
  const data = getData();
  const messageChann = data.channels.messages.find(c => c.messagelId === messageId);
  const messageDm = data.dms.messages.find(c => c.messagelId === messageId);
  if (messageChann.uId === authId || messageDm.uId === authId) {
    return true;
  }
  return false;
};

/** Function that checks if an authorised user is a member of channel/dm
 *
 * @param {number} authId
 * @param {number} messageId
 * @returns {number}
 */
const isOwnerChannel = (authId: number, messageId: number): boolean => {
  const data = getData();
  const channel = data.channels.find(c => c.messages.messageId === messageId);
  const dm = data.dm.find(dm => dm.messages.messageId === messageId);
  const user = data.users.find(u => u.uId === authId);
  if (channel.ownerMembers.includes(authId)) {
    return true;
  } else if (dm.owner === authId) {
    return true;
  } else if (user.pId === 1) {
    return true;
  }
  return false;
};

/**
  * Creates a unique message Id
  * @param {void}
  * ...
  * @returns {number} length
*/
const createId = () => {
  const data = getData();
  let length = 0;

  for (const channel of data.channels) {
    length += channel.messages.length;
  }

  for (const dm of data.dms) {
    length += dm.messages.length;
  }

  length += 1;
  return length;
};

/** 
  * Function that sends a message from the authorised user to the channel specified by channelId
  *
  * @param {string} - Token of individual's session
  * @param {number} channelId - Channel Id of channel that user is asking to access details of
  * @param {string} - message
  * @returns {}
  *
*/
export const messageSendV1 = (token: string, channelId: number, message: string) => {
  const data = getData();
  const authUserId = findUID(token);
  if (authUserId === null) {
    return { error: 'token is invalid' };
  }

  const channel = data.channels.find(c => c.channelId === channelId);
  if (channel === undefined) {
    return { error: 'channelId does not refer to a valid channel' };
  }

  if (!channel.allMembers.includes(authUserId)) {
    return { error: 'channelId is valid and the authorised user is not a member of the channel' };
  }

  if (message.length < 1 || message.length > 1000) {
    return { error: 'length of message is less than 1 or over 1000' };
  }

  const retMsg = {
    messageId: createId(),
    uId: authUserId,
    message: message,
    timeSent: Math.floor((new Date()).getTime() / 1000)
  };

  channel.messages.unshift(retMsg);
  setData(data);

  return {
    messageId: retMsg.messageId
  };
};

/**
  * Remove message from channel/ dm
  *
  * @param {string} - Token
  * @param {number} messageId 
  * @returns {}
*/
export const messageRemoveV1 = (token: string, messageId: number) => {
  const data = getData();
  const authId = findUID(token);

  if (authId === null) {
    return { error: 'token is invalid' };
  }

  // channel or dm
  const validMsg = msgValid(authId, messageId);
  if (validMsg === null) {
    return { error: 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined' };
  }

  if (!msgSentByUser(authId, messageId) && !isOwnerChannel(authId, messageId)) {
    return { error: 'auth user making this request did not send this message, and is also not a user of the channel/DM' };
  }

  validMsg.messages = validMsg.messages.filter(m => m.messageId !== messageId);
  setData(data);

  return {};
};
