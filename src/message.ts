import { getData, setData, React } from './dataStore';
import { isValidToken } from './users';
import HTTPError from 'http-errors';
import { isHandleTaken } from './auth';

let reservedMessages = 0;

/** check message and return tag
  *
  * @param {string} message
  * @returns {string[]} handle
*/
export const checkMsgTag = (message: string) => {
  const regex = /@([A-Za-z0-9]+)([A-Za-z0-9]|$)/g;
  let tags = message.match(regex)?.map(m => m.slice(1));
  const handle: string[] = [];
  if (tags === undefined) {
    return handle;
  }

  // remove duplicates
  tags = tags.filter((e, i) => tags.indexOf(e) === i);
  for (const t of tags) {
    if (isHandleTaken(t)) {
      handle.push(t);
    }
  }

  return handle;
};

/**
  * checks if user has reacted with reactId
  *
  * @param {number} authUserId
  * @param {number} messageId
  * @param {number} reactId
  * @returns {boolean}
*/
const userReacted = (authUserId: number, messageId: number, reactId: number) => {
  const data = getData();

  const channel = data.channels.find(c => c.messages.find(m => m.messageId === messageId));
  const dm = data.dms.find(d => d.messages.find(m => m.messageId === messageId));

  let platform;
  if (channel === undefined) {
    platform = dm;
  } else {
    platform = channel;
  }

  const message = platform.messages.find(m => m.messageId === messageId);
  const react = message.reacts.find(i => i.reactId === reactId && i.uIds.includes(authUserId));
  if (react !== undefined) {
    return true;
  }

  return false;
};

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
  const sender = data.users.find(s => s.uId === authUserId);

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
  const uIds: number[] = [];

  const reactData = {
    reactId: 1,
    uIds: uIds
  };
  react.push(reactData);

  const retMsg = {
    messageId: createId(),
    uId: authUserId,
    message: message,
    timeSent: Math.floor((new Date()).getTime() / 1000),
    reacts: react,
    isPinned: false
  };

  channel.messages.unshift(retMsg);

  // add notif
  const msg = message.slice(0, 20);
  const notifMsg = `${sender.handleStr} tagged you in ${channel.name}: ${msg}`;
  const notif = {
    channelId: channel.channelId,
    dmId: -1,
    notificationMessage: notifMsg
  };

  const handles = checkMsgTag(message);
  for (const h of handles) {
    const user = data.users.find(u => u.handleStr === h);
    if (channel.allMembers.includes(user.uId)) {
      user.notifications.unshift(notif);
    }
  }

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

  const sender = data.users.find(u => u.uId === authId);

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

  let notifChannel;
  for (const channel of data.channels) {
    for (const msg of channel.messages) {
      if (msg.messageId === messageId) {
        msg.message = message;
        notifChannel = channel;
      }
    }
  }

  if (notifChannel !== undefined) {
    // add notif
    const msg = message.slice(0, 20);
    const notifMsg = `${sender.handleStr} tagged you in ${notifChannel.name}: ${msg}`;
    const notif = {
      channelId: notifChannel.channelId,
      dmId: -1,
      notificationMessage: notifMsg
    };

    const handles = checkMsgTag(message);
    for (const h of handles) {
      const user = data.users.find(u => u.handleStr === h);
      if (notifChannel.allMembers.includes(user.uId)) {
        user.notifications.unshift(notif);
      }
    }
  }

  let notifDm;
  for (const dm of data.dms) {
    for (const msg of dm.messages) {
      if (msg.messageId === messageId) {
        msg.message = message;
        notifDm = dm;
      }
    }
  }

  if (notifDm !== undefined) {
    // add notif
    const msg = message.slice(0, 20);
    const notifMsg = `${sender.handleStr} tagged you in ${notifDm.name}: ${msg}`;
    const notif = {
      channelId: -1,
      dmId: notifDm.dmId,
      notificationMessage: notifMsg
    };

    const handles = checkMsgTag(message);
    for (const h of handles) {
      const user = data.users.find(u => u.handleStr === h);
      if (notifDm.allMembers.includes(user.uId)) {
        user.notifications.unshift(notif);
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
  const sender = data.users.find(u => u.uId === authUserId);

  const dm = data.dms.find(d => d.dmId === dmId);
  if (dm === undefined) {
    throw HTTPError(400, 'Invalid dmId');
  }

  if (!dm.allMembers.includes(authUserId)) {
    throw HTTPError(403, 'user is not a member of dm');
  }

  const id = createId();
  const react: React[] = [];
  const uIds: number[] = [];

  const reactData = {
    reactId: 1,
    uIds: uIds
  };
  react.push(reactData);

  const msg = {
    messageId: id,
    uId: authUserId,
    message: message,
    timeSent: Math.floor((new Date()).getTime() / 1000),
    reacts: react,
    isPinned: false
  };

  dm.messages.unshift(msg);

  // add notif
  const msg1 = message.slice(0, 20);
  const notifMsg = `${sender.handleStr} tagged you in ${dm.name}: ${msg1}`;
  const notif = {
    channelId: -1,
    dmId: dmId,
    notificationMessage: notifMsg
  };

  const handles = checkMsgTag(message);
  for (const h of handles) {
    const user = data.users.find(u => u.handleStr === h);
    if (dm.allMembers.includes(user.uId)) {
      user.notifications.unshift(notif);
    }
  }

  setData(data);
  return { messageId: id };
};

/**
 * Sends delayed message at timeSent
 * @param {number} dmId
 * @param {number} reservedId
 * @param {number} authUserId
 * @param {string} message
 * @param {number} timeSent
 */
const sendDelayedMessage = (dmId: number, reservedId: number, authUserId: number, message: string, timeSent: number) => {
  const data = getData();
  const dm = data.dms.find(d => d.dmId === dmId);
  const user = data.users.find(u => u.uId === authUserId);

  const react: React[] = [];
  const uIds: number[] = [];

  const reactData = {
    reactId: 1,
    uIds: uIds
  };
  react.push(reactData);

  const retMsg = {
    messageId: reservedId,
    uId: authUserId,
    message: message,
    timeSent: timeSent,
    reacts: react,
    isPinned: false
  };

  dm.messages.unshift(retMsg);

  // add notif
  const msg1 = message.slice(0, 20);
  const notifMsg = `${user.handleStr} tagged you in ${dm.name}: ${msg1}`;
  const notif = {
    channelId: -1,
    dmId: dmId,
    notificationMessage: notifMsg
  };

  const handles = checkMsgTag(message);
  for (const h of handles) {
    const user = data.users.find(u => u.handleStr === h);
    if (dm.allMembers.includes(user.uId)) {
      user.notifications.unshift(notif);
    }
  }

  setData(data);
  reservedMessages -= 1;
};

/** Function that when given a message, pins it
  *
  * @param {string} - Token of individual's session
  *  @param {number} - messageId of message that authorised user is trying to pin
  * @returns {}
  *
*/
export const messagePinV1 = (token: string, messageId: number) => {
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

  if (!isOwner(authId, messageId)) {
    throw HTTPError(403, 'valid message in a joined channel/DM but not an owner');
  }

  for (const channel of data.channels) {
    for (const msg of channel.messages) {
      if (msg.messageId === messageId) {
        if (msg.isPinned === true) {
          throw HTTPError(400, 'message is already pinned');
        }
        msg.isPinned = true;
      }
    }
  }

  for (const dm of data.dms) {
    for (const msg of dm.messages) {
      if (msg.messageId === messageId) {
        if (msg.isPinned === true) {
          throw HTTPError(400, 'message is already pinned');
        }
        msg.isPinned = true;
      }
    }
  }
  setData(data);
  return {};
};

/** Function that when given an pinned message, unpins it
  *
  * @param {string} - Token of individual's session
  *  @param {number} - messageId of message that authorised user is trying to pin
  * @returns {}
  *
*/
export const messageUnpinV1 = (token: string, messageId: number) => {
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

  if (!isOwner(authId, messageId)) {
    throw HTTPError(403, 'valid message in a joined channel/DM but not an owner');
  }

  for (const channel of data.channels) {
    for (const msg of channel.messages) {
      if (msg.messageId === messageId) {
        if (msg.isPinned === false) {
          throw HTTPError(400, 'message is not pinned');
        }
        msg.isPinned = false;
      }
    }
  }

  for (const dm of data.dms) {
    for (const msg of dm.messages) {
      if (msg.messageId === messageId) {
        if (msg.isPinned === false) {
          throw HTTPError(400, 'message is not pinned');
        }
        msg.isPinned = false;
      }
    }
  }
  setData(data);
  return {};
};

/**
  * Sharing a message from user
  *
  * @param {string} token
  * @param {number} ogMessageId
  * @param {string} message
  * @param {number} channelId
  * @param {number} dmId
  * @returns {{ sharedMessageId: number }}
*/
export const messageShareV1 = (token: string, ogMessageId: number, message: string, channelId: number, dmId: number) => {
  const data = getData();

  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'invalid token');
  }

  const channel = data.channels.find(c => c.channelId === channelId);
  const dm = data.dms.find(d => d.dmId === dmId);
  if (channel === undefined && dm === undefined) {
    throw HTTPError(400, 'channelId and dmId is invalid');
  }

  if (channelId !== -1 && dmId !== -1) {
    throw HTTPError(400, 'neither channelId nor dmId is -1');
  }

  const validMsg = msgValid(authUserId, ogMessageId);
  if (validMsg === null) {
    throw HTTPError(400, 'invalid ogMessageId + user not a member of');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'length of msg +1000 length');
  }

  let platform;
  if (channel === undefined) {
    platform = dm;
  } else {
    platform = channel;
  }

  if (!platform.allMembers.includes(authUserId)) {
    throw HTTPError(403, 'user is not a member of platform that they-re sending to');
  }

  const ogMsg = validMsg.messages.find(m => m.messageId === ogMessageId);

  const sharedMsgId = createId();
  const react: React[] = [];

  let msgFormat;
  if (message === '') {
    msgFormat = ogMsg.message;
  } else {
    msgFormat = `${ogMsg.message}\n${message}`;
  }

  const msg = {
    messageId: sharedMsgId,
    uId: authUserId,
    message: msgFormat,
    timeSent: Math.floor((new Date()).getTime() / 1000),
    reacts: react,
    isPinned: false,
  };
  platform.messages.unshift(msg);

  // add notif to option message
  if (message !== '') {
    const sender = data.users.find(s => s.uId === authUserId);
    const msg = message.slice(0, 20);
    const notifMsg = `${sender.handleStr} tagged you in ${platform.name}: ${msg}`;
    const notif = {
      channelId: channelId,
      dmId: dmId,
      notificationMessage: notifMsg
    };
    const handles = checkMsgTag(message);
    for (const h of handles) {
      const user = data.users.find(u => u.handleStr === h);
      if (platform.allMembers.includes(user.uId)) {
        user.notifications.unshift(notif);
      }
    }
  }

  setData(data);
  return { sharedMessageId: sharedMsgId };
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

/**
  * adds a reaction of reactId from user
  *
  * @param {string} token
  * @param {number} messageId
  * @param {number} reactId
  * @returns {void}
*/
export const messageReactV1 = (token: string, messageId: number, reactId: number) => {
  const data = getData();

  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'Invalid token');
  }

  const validMsg = msgValid(authUserId, messageId);
  if (validMsg === null) {
    throw HTTPError(400, 'messageId invalid and user not in platform');
  }

  const rId = [1];
  if (!rId.includes(reactId)) {
    throw HTTPError(400, 'invalid reactId');
  }

  if (userReacted(authUserId, messageId, reactId)) {
    throw HTTPError(400, 'user has already reacted with the reactId');
  }

  const channel = data.channels.find(c => c.messages.find(m => m.messageId === messageId));
  const dm = data.dms.find(d => d.messages.find(m => m.messageId === messageId));

  let platform;
  if (channel === undefined) {
    platform = dm;
  } else {
    platform = channel;
  }

  const message = platform.messages.find(m => m.messageId === messageId);
  const react = message.reacts.find(i => i.reactId === reactId);
  react.uIds.push(authUserId);

  const user = data.users.find(u => u.uId === authUserId);
  const notifMsg = `${user.handleStr} reacted to your message in ${platform.name}`;
  let notif;
  if (channel === undefined) {
    notif = { channelId: -1, dmId: dm.dmId, notificationMessage: notifMsg };
  }
  if (dm === undefined) {
    notif = { channelId: channel.channelId, dmId: -1, notificationMessage: notifMsg };
  }
  user.notifications.unshift(notif);

  setData(data);
  return {};
};

/**
  * Removes a reaction from a message
  *
  * @param {string} token
  * @param {number} messageId
  * @param {number} reactId
  * @returns {void}
*/
export const messageUnreactV1 = (token: string, messageId: number, reactId: number) => {
  const data = getData();

  const authUserId = isValidToken(token);
  if (authUserId === null) {
    throw HTTPError(403, 'Invalid token');
  }

  const validMsg = msgValid(authUserId, messageId);
  if (validMsg === null) {
    throw HTTPError(400, 'invalid msgId or/and user is not member');
  }

  const rId = [1];
  if (!rId.includes(reactId)) {
    throw HTTPError(400, 'invalid reactId');
  }

  if (!userReacted(authUserId, messageId, reactId)) {
    throw HTTPError(400, 'message does not contain user-s reactId');
  }

  const channel = data.channels.find(c => c.messages.find(m => m.messageId === messageId));
  const dm = data.dms.find(d => d.messages.find(m => m.messageId === messageId));

  let platform;
  if (channel === undefined) {
    platform = dm;
  } else {
    platform = channel;
  }

  const message = platform.messages.find(m => m.messageId === messageId);
  const react = message.reacts.find(i => i.reactId === reactId);
  react.uIds = react.uIds.filter(uId => uId !== authUserId);

  setData(data);
  return {};
};
