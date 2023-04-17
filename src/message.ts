import { getData, setData, React } from './dataStore';
import { isValidToken } from './users';
import HTTPError from 'http-errors';

let reservedMessages = 0;

/** Checks if messageId is of a valid message within a channel/dm that the authorised user has joined
  *
  * @param {number} - authId of authorised user
  * @param {number} - messageId of message that authorised user is trying to remove
  * @returns {Dm} - dm
  * @returns {Channel} - channel
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
const isSender = (authId: number, messageId: number): boolean => {
  const store = msgValid(authId, messageId);
  const message = store.messages.find(s => s.messageId === messageId);
  if (message.uId === authId) {
    return true;
  }
  return false;
};

/** check if has owner permission
 *
 * @param {number} authId
 * @param {number} messageId
 * @returns {boolean}
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
  length += reservedMessages;
  return length;
};

/**
  * Function that sends a message from the authorised user to the channel specified by channelId
  *
  * @param {string} - Token of individual's session
  * @param {number} channelId - Channel Id of channel that user is asking to access details of
  * @param {string} - message
  * @returns {{ messageId: number }}
  *
*/
export const messageSendV1 = (token: string, channelId: number, message: string) => {
  const data = getData();
  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'Invalid token error');
  }

  const channel = data.channels.find(c => c.channelId === channelId);
  if (channel === undefined) {
    throw HTTPError(400, 'Invalid channelId');
  }

  if (!channel.allMembers.includes(authUserId)) {
    throw HTTPError(403, 'user is not a member of the channel');
  }

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Invalid message length');
  }

  const react: React[] = [];

  const retMsg = {
    messageId: createId(),
    uId: authUserId,
    message: message,
    timeSent: Math.floor((new Date()).getTime() / 1000),
    reacts: react,
    isPinned: false
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
  const authId = isValidToken(token);

  if (authId === null) {
    throw HTTPError(403, 'Invalid token error');
  }

  // channel or dm
  const validMsg = msgValid(authId, messageId);
  if (validMsg === null) {
    throw HTTPError(400, 'Invalid message id error');
  }

  if (!isSender(authId, messageId) && !isOwner(authId, messageId)) {
    throw HTTPError(403, 'user not sender and no owner permission error');
  }

  for (const channel of data.channels) {
    channel.messages = channel.messages.filter(m => m.messageId !== messageId);
  }

  for (const dm of data.dms) {
    dm.messages = dm.messages.filter(m => m.messageId !== messageId);
  }

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
  const authId = isValidToken(token);

  if (authId === null) {
    throw HTTPError(403, 'Invalid token error');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'Invalid message length');
  }

  const validMsg = msgValid(authId, messageId);
  if (validMsg === null) {
    throw HTTPError(400, 'Invalid message id error');
  }

  if (!isSender(authId, messageId) && !isOwner(authId, messageId)) {
    throw HTTPError(403, 'user is not sender or no owner permission');
  }

  if (message.length === 0) {
    return messageRemoveV1(token, messageId);
  }

  for (const channel of data.channels) {
    for (const msg of channel.messages) {
      if (msg.messageId === messageId) {
        msg.message = message;
      }
    }
  }

  for (const dm of data.dms) {
    for (const msg of dm.messages) {
      if (msg.messageId === messageId) {
        msg.message = message;
      }
    }
  }

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
    throw HTTPError(400, 'Invalid message length');
  }

  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'Invalid token error');
  }

  const dm = data.dms.find(d => d.dmId === dmId);
  if (dm === undefined) {
    throw HTTPError(400, 'Invalid dmId');
  }

  if (!dm.allMembers.includes(authUserId)) {
    throw HTTPError(403, 'user is not a member of dm');
  }

  const id = createId();
  const react: React[] = [];
  const msg = {
    messageId: id,
    uId: authUserId,
    message: message,
    timeSent: Math.floor((new Date()).getTime() / 1000),
    reacts: react,
    isPinned: false
  };

  dm.messages.unshift(msg);
  setData(data);

  return { messageId: id };
};

const sendDelayedMessage = (dmId: number, reservedId: number, authUserId: number, message: string, timeSent: number) => {
  const data = getData();
  const dm = data.dms.find(d => d.dmId === dmId);

  const react: React[] = [];
  const retMsg = {
    messageId: reservedId,
    uId: authUserId,
    message: message,
    timeSent: timeSent,
    reacts: react,
    isPinned: false
  };

  dm.messages.unshift(retMsg);
  setData(data);
  reservedMessages -= 1;
};

/**
 * Sends message from authorised user to DM at specified time in the future
 * @param {string} token
 * @param {number} dmId
 * @param {string} message
 * @param {number} timeSent
 * @returns {{ messageId: number }}
*/
export const messageSendLaterDMV1 = (token: string, dmId: number, message: string, timeSent: number) => {
  const data = getData();
  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  }

  const dm = data.dms.find(d => d.dmId === dmId);
  if (dm === undefined) {
    throw HTTPError(400, 'invalid dmId');
  }

  const minLength = 1;
  const maxLength = 1000;
  if (message.length < minLength || message.length > maxLength) {
    throw HTTPError(400, 'Message too short or long');
  }

  let timeNow = Math.floor(new Date().getTime() / 1000);
  if (timeSent < timeNow) {
    throw HTTPError(400, 'Time sent is in the past');
  }

  if (!dm.allMembers.includes(authUserId)) {
    throw HTTPError(403, 'Authorised user not in DM');
  }

  const reservedId = createId();
  reservedMessages += 1;

  timeNow = Math.floor(new Date().getTime() / 1000);
  setTimeout(sendDelayedMessage, timeSent - timeNow, dmId, reservedId, authUserId, message, timeSent);

  console.log(data.dms);
  return {
    messageId: reservedId
  };
};
