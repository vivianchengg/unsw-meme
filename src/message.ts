import { getData, setData } from './dataStore';

/** Checks if messageId is of a valid message within a channel/dm that the authorised user has joined
* @param {number} - authId of authorised user
* @param {number} - messageId of message that authorised user is trying to remove
* @returns {boolean}
*/
const msgValid = (authId: number, messageId: number) => {
  const data = getData();
  const channel = data.channels.find(c => c.messages.messagelId === messageId);
  if (channel.allMembers.includes(authId)) {
    return true;
  }
  return false;
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

/** Function that returns user Id from token
 *
 * @param {string} token
 * @returns {number}
 */
export const extractUId = (token: string) => {
  const data = getData();
  let userId = -1;

  for (const user of data.users) {
    for (const tokenData of user.tokens) {
      if (token === tokenData) {
        userId = user.uId;
      }
    }
  }
  return userId;
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

/** Function that checks if a token is valid
 *
 *
 * @param {string} token
 * @returns {boolean}
 */
export const isValidToken = (token: string): boolean => {
  const data = getData();
  for (const user of data.users) {
    if (user.token === token) {
      return true;
    }
  }
};

/** Given a messageId for a message, this message is removed from the channel/DM
 *
 * sends a message from the authorised user to the channel specified by channelId
* @param {string} - Token of individual's session
* @param {number} channelId - Channel Id of channel that user is asking to access details of
* @param {string} - message
* @returns {}
*
*  To return the above:
* - token must be valid
* - message must be a valid message within channel/DM that authorised user has joined
* - message must be sent by authorised user making the request and the user must have owner permissions in the channel/DM
*  Otherwise, {error: string} is returned
*/

export const messageRemoveV1 = (token: number, messageId: number) => {
  const data = getData();
  const authId = extractUId(token);
  if (!msgValid(authId, messageId)) {
    return { error: 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined' };
  }
  if (!msgSentByUser(authId, messageId)) {
    return { error: 'the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM' };
  }
  if (!isValidToken(token)) {
    return { error: 'token is invalid' };
  }
  data.channels.messages = data.channels.messages.filter((message) => message.messageId !== messageId);
  data.dms.messages = data.dms.messages.filter((message) => message.messageId !== messageId);
  setData(data);
  return {};
};
