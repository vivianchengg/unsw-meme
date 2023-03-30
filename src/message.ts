import { getData, setData } from './dataStore';
import { findUID } from './channels';

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
