import { getData, setData } from './dataStore';
import { findUID } from './channels';

/** Checks if messageId is of a valid message within a channel/dm that the authorised user has joined
  *
  * @param {number} - authId of authorised user
  * @param {number} - messageId of message that authorised user is trying to remove
  * @returns {boolean}
*/
const msgValid = (authId: number, messageId: number) => {
  const data = getData();
  const channel = data.channels.find(c => c.messages.find(m => m.messageId === messageId) && c.allMembers.includes(authId));
  const dm = data.dms.find(d => d.messages.find(m => m.messageId === messageId) && d.allMembers.includes(authId));
  if (channel !== undefined) {
    return channel;
  } else if (dm !== undefined) {
    return dm;
  } else {
    return null;
  }
};

/** Checks if message is sent by authorised user making the request => checks if user has owner permissions in this channel/dm
* @param {number} - authId of authorised user
* @param {number} - messageId of message that authorised user is trying to remove
* @returns {boolean}
*/
const isSender = (authId: number, messageId: number) => {
  const store = msgValid(authId, messageId);
  const message = store.messages.find(s => s.messageId === messageId);
  if (message.uId === authId) {
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
const isOwner = (authId: number, messageId: number): boolean => {
  const data = getData();
  const channel = data.channels.find(c => c.messages.find(m => m.messageId === messageId));
  const dm = data.dms.find(d => d.messages.find(m => m.messageId === messageId));
  const user = data.users.find(u => u.uId === authId);

  if (channel !== undefined) {
    if (channel.ownerMembers.includes(authId)) {
      return true;
    }

    if (channel.allMembers.includes(authId) && user.pId === 1) {
      return true;
    }
  }

  if (dm !== undefined && dm.owner === authId) {
    return true;
  }

  return false;
};

/**
  * Creates a unique message Id
  *
  * @param {void}
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
    return { error: 'invalid message id' };
  }

  if (!isSender(authId, messageId) && !isOwner(authId, messageId)) {
    return { error: 'user not sender and no owner permission' };
  }

  validMsg.messages = validMsg.messages.filter(m => m.messageId !== messageId);
  setData(data);

  return {};
};

/** Function that when given a message, updates it text with a new text
  * if the new message is an empty string, the message is deleted
  *
  * @param {string} - Token of individual's session
  * @param {number} channelId - Channel Id of channel that user is asking to access details of
  * @param {string} - message
  * @returns {}
  *
*/
export const messageEditV1 = (token: string, messageId: number, message: string) => {
  const data = getData();
  const authId = findUID(token);

  if (authId === null) {
    return { error: 'token is invalid' };
  }

  if (message.length === 0) {
    messageRemoveV1(token, messageId);
    return {};
  }

  if (message.length > 1000) {
    return { error: 'length of message is over 1000' };
  }

  const validMsg = msgValid(authId, messageId);
  if (validMsg === null) {
    return { error: 'invalid message id' };
  }

  if (!isSender(authId, messageId) && !isOwner(authId, messageId)) {
    return { error: 'user not sender and no owner permission' };
  }

  const msg = validMsg.messages.find(c => c.messageId === messageId);
  msg.message = message;

  setData(data);
  return {};
};

/**
  * Authorised member of dmId sending a message
  *
  * @param {string} token
  * @param {number} dmId
  * @param {string} message
  * @returns {{ messageId: number }}
*/
export const messageSendDmV1 = (token: string, dmId: number, message: string) => {
  const data = getData();

  if (message.length < 1 || message.length > 1000) {
    return { error: 'invalid message length' };
  }

  const authUserId = findUID(token);
  if (authUserId === null) {
    return { error: 'token is invalid' };
  }

  const dm = data.dms.find(d => d.dmId === dmId);
  if (dm === undefined) {
    return { error: 'invalid dmId' };
  }

  if (!dm.allMembers.includes(authUserId)) {
    return { error: 'user is not a member of dm' };
  }

  const id = createId();
  const msg = {
    messageId: id,
    uId: authUserId,
    message: message,
    timeSent: Math.floor((new Date()).getTime() / 1000),
  };

  dm.messages.unshift(msg);
  setData(data);

  return { messageId: id };
};
