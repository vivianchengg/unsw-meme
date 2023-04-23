import { getData, setData, updateWorkSpace, updateUserStat, Channel, Data, React } from './dataStore';
import { isValidToken } from './users';
import HTTPError from 'http-errors';
import { createId } from './message';

/**
 * Starts a standup in a channel if it isn't already running
 *
 * @param {string} token - Token of standup starter
 * @param {number} channelId - Channel where standup is to be started
 * @param {number} length - Length of standup
 * @returns {timeFinish: number} - Time when standup finishes
 */
export const standupStartV1 = (token: string, channelId: number, length: number) => {
  const data = getData();

  const channel = data.channels.find(c => c.channelId === channelId);
  const uId = isValidToken(token);

  if (uId === null) {
    throw HTTPError(403, 'Invalid Token');
  }
  const starter = data.users.find(u => u.uId === uId);

  if (channel === undefined) {
    throw HTTPError(400, 'channelId is invalid');
  }

  if (!channel.allMembers.includes(uId)) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  if (length < 0) {
    throw HTTPError(400, 'standup length is negative');
  }

  if (channel.standup.isActive) {
    throw HTTPError(400, 'an active standup is currently running in the channel');
  }

  const timeFinish = Math.floor((new Date()).getTime() / 1000) + length;
  channel.standup.isActive = true;
  channel.standup.starterId = uId;
  channel.standup.timeFinish = timeFinish;

  setTimeout(() => {
    if (channel.standup.msgStore.length !== 0) {
      sendStandupMessage(data, channel);
      updateWorkSpace(data);
      updateUserStat(data, starter);
    }

    channel.standup.isActive = false;
    channel.standup.starterId = null;
    channel.standup.timeFinish = null;
    channel.standup.msgStore = [];
    setData(data);
  }, length * 1000);

  setData(data);

  return {
    timeFinish: timeFinish
  };
};

/**
 * Sends a the packaged standup message to the channel
 *
 * @param {Data} data
 * @param {number} channelId
 */
export const sendStandupMessage = (data: Data, channel: Channel) => {
  const messageId = createId();
  let message = '';

  for (const standupMsg of channel.standup.msgStore) {
    message += standupMsg.handle + ': ' + standupMsg.message + '\n';
  }
  message = message.slice(0, -1);

  const react: React[] = [];
  const uIds: number[] = [];
  const reactData = {
    reactId: 1,
    uIds: uIds,
    isThisUserReacted: false
  };
  react.push(reactData);

  // Cannot use MessageSendV2 function in case user logged out after calling standup (invalid token)
  channel.messages.unshift({
    messageId: messageId,
    uId: channel.standup.starterId,
    message: message,
    timeSent: channel.standup.timeFinish,
    isPinned: false,
    reacts: react,
  });
  setData(data);
};

/**
 * Returns the standup status of a channel
 *
 * @param {string} token - Token of querier
 * @param {number} channelId - Channel of standup status to be queried
 * @returns {isActive: boolean, timeFinish: number | null} - Status of standup
 */
export const standupActiveV1 = (token: string, channelId: number) => {
  const data = getData();

  const channel = data.channels.find(c => c.channelId === channelId);
  const uId = isValidToken(token);

  if (uId === null) {
    throw HTTPError(403, 'Invalid Token');
  }
  if (channel === undefined) {
    throw HTTPError(400, 'channelId is invalid');
  }
  if (!channel.allMembers.includes(uId)) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  if (channel.standup.isActive) {
    return {
      isActive: true,
      timeFinish: channel.standup.timeFinish,
    };
  }

  return {
    isActive: false,
    timeFinish: null,
  };
};

/**
 * Sends a message to standup bulk message
 *
 * @param {string} token - Token of message sender
 * @param {number} channelId - Standup channel
 * @param {string} message - Message sent in standup
 * @returns {} - Empty object
 */
export const standupSendV1 = (token: string, channelId: number, message: string) => {
  const data = getData();

  const channel = data.channels.find(c => c.channelId === channelId);
  const uId = isValidToken(token);

  if (uId === null) {
    throw HTTPError(403, 'Invalid Token');
  }
  if (channel === undefined) {
    throw HTTPError(400, 'channelId is invalid');
  }
  if (message.length > 1000) {
    throw HTTPError(400, 'Message length over 1000');
  }
  if (!channel.standup.isActive) {
    throw HTTPError(400, 'Cannot send standup msg, not in standup!');
  }
  if (!channel.allMembers.includes(uId)) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  const authUser = data.users.find(u => u.uId === uId);
  channel.standup.msgStore.push({
    handle: authUser.handleStr,
    message: message,
  });

  setData(data);
  return {};
};
