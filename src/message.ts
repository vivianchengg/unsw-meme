import { Channel, getData, setData } from './dataStore';

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

/** Function that returns user Id from token
 *
 * @param {string} token
 * @returns {number}
 */
export const extractUId = (token: string) => {
  const data = getData();
  let userId = -1;

  for (const user of data.users) {
    for (const tokenData of user.token) {
      if (token === tokenData) {
        userId = user.uId;
      }
    }
  }
  return userId;
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
  if (data.channels!= undefined && data.channels.length !== 0) {
    for (const channel of data.channels) {
      length = length + channel.messages.length;
    }
  }
  if (data.dms != undefined && data.dms.length !== 0) {
    for (const dm of data.dms) {
      length = length + dm.messages.length;
    }
  }
  length = length + 1;
  return length;
};

/** Function that sends a message from the authorised user to the channel specified by channelId
* @param {string} - Token of individual's session
* @param {number} channelId - Channel Id of channel that user is asking to access details of
* @param {string} - message
* @returns {}
*
*  To return the above:
* - token must be valid
* - channelId must be valid and authorised user must be member of channel
* - length of message cannot be under 1 or greater than 1000
*  Otherwise, {error: string} is returned
*
**/
export const messageSendV1 = (token: string, channelId: number, message: string) => {
  const data = getData();
  const uId = extractUId(token);
  if (!isValidToken(token)) {
    return { error: 'token is invalid' };
  }
  if (!isValidChannel(channelId)) {
    return { error: 'channelId does not refer to a valid channel' };
  }
  const authUserId = extractUId(token);
  const channel = data.channels.find(c => c.channelId === channelId);
  if (!isMember(channel, authUserId)) {
    return { error: 'channelId is valid and the authorised user is not a member of the channel' };
  }
  if (message.length < 1 || message.length > 1000) {
    return { error: 'length of message is less than 1 or over 1000' };
  }
  const retMsg = {
    messageId: createId(),
    uId: uId,
    message: message,
    timeSent: Math.floor((new Date()).getTime() / 1000)
  };
  channel.messages.unshift(retMsg);
  setData(data);
  return retMsg.messageId;
};
