import {
  getData,
  setData,
} from '../dataStore';

import {
  tokenFind
} from '../Other/tokenHelper';

import {
  channelLookup
} from '../Channel/channelHelper';

import {
  sendStandupMessage,
} from './standupHelper';

import HTTPError from 'http-errors';

/**
 * Starts a standup in a channel if it isn't already running
 *
 * @param {string} token - Token of standup starter
 * @param {number} channelId - Channel where standup is to be started
 * @param {number} length - Length of standup
 * @returns {timeFinish: number} - Time when standup finishes
 */
const standupStartV1 = (token: string, channelId: number, length: number) => {
  const dataStore = getData();

  const channel = channelLookup(channelId, dataStore);
  const authUser = tokenFind(token, dataStore);

  if (authUser.status === false) {
    throw HTTPError(403, 'Invalid Token');
  }
  if (channel === null) {
    throw HTTPError(400, 'channelId is invalid');
  }
  if (length < 0) {
    throw HTTPError(400, 'standup length is negative');
  }
  if (channel.inStandupPeriod) {
    throw HTTPError(400, 'an active standup is currently running in the channel');
  }
  if (!channel.memberId.includes(authUser.user.uId)) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  const timeFinish = Math.floor((new Date()).getTime() / 1000) + length;
  channel.inStandupPeriod = true;
  channel.standupCallerId = authUser.user.uId;
  channel.standupFinish = timeFinish;

  setTimeout(() => {
    if (channel.standupMessagesStorage.length !== 0) {
      sendStandupMessage(dataStore, channel);
    }
    channel.inStandupPeriod = false;
    channel.standupCallerId = null;
    channel.standupFinish = null;
    channel.standupMessagesStorage = [];
    setData(dataStore);
  }, length * 1000);

  setData(dataStore);

  return {
    timeFinish,
  };
};

/**
 * Returns the standup status of a channel
 *
 * @param {string} token - Token of querier
 * @param {number} channelId - Channel of standup status to be queried
 * @returns {isActive: boolean, timeFinish: number | null} - Status of standup
 */
const standupActiveV1 = (token: string, channelId: number) => {
  const dataStore = getData();

  const channel = channelLookup(channelId, dataStore);
  const authUser = tokenFind(token, dataStore);

  if (authUser.status === false) {
    throw HTTPError(403, 'Invalid Token');
  }
  if (channel === null) {
    throw HTTPError(400, 'channelId is invalid');
  }
  if (!channel.memberId.includes(authUser.user.uId)) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  if (channel.inStandupPeriod) {
    return {
      isActive: true,
      timeFinish: channel.standupFinish,
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
const standupSendV1 = (token: string, channelId: number, message: string) => {
  const dataStore = getData();

  const channel = channelLookup(channelId, dataStore);
  const authUser = tokenFind(token, dataStore);

  if (authUser.status === false) {
    throw HTTPError(403, 'Invalid Token');
  }
  if (channel === null) {
    throw HTTPError(400, 'channelId is invalid');
  }
  if (message.length > 1000) {
    throw HTTPError(400, 'Message length over 1000');
  }
  if (!channel.inStandupPeriod) {
    throw HTTPError(400, 'Cannot send standup msg, not in standup!');
  }
  if (!channel.memberId.includes(authUser.user.uId)) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  channel.standupMessagesStorage.push({
    handle: authUser.user.handleStr,
    message: message,
  });

  setData(dataStore);
  return {};
};

export {
  standupStartV1,
  standupActiveV1,
  standupSendV1,
};
