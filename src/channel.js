import {getData} from './dataStore.js'

/** Function that lists details of members in the channel given that:
*
* @param {number} authUserId - User Id of individual asking for details of a channel
* @param {number} channelId - Channel Id of channel that user is asking to access details of
* @returns {channel: {
*  name: string, 
*  isPublic: boolean, 
*  ownerMembers: user[]
*  allMembers: user[]
*  }}
*
*  - Here, user: {
*  email: string,
*  password: string,
*  nameFirst: string,
*  nameLast: string
*  }
*
*  To return the above:
* - authUserId must be valid
* - channelId must be valid and user must be member of channel
* Otherwise, {error: string} is returned
*
**/

function channelDetailsV1 (authUserId, channelId) {
  const data = getData();
  if (validate_user(authUserId) === false) {
    return {error: 'invalid authUserId'};
  }

  if (validate_channel(channelId) === false) {
    return {error: 'invalid channelId'};
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      if (channel_member(authUserId, channel.allMembers) === false) {
        return {error: 'user not member of channel'};
      }

      return {
        name: channel.name,
        isPublic: channel.isPublic,
        ownerMembers: channel.ownerMembers,
        allMembers: channel.allMembers
      };
    }
  }
}

/** Function that checks if user id is valid
 *
 * 
 * @param {number} user_id 
 * @returns {boolean}
 */
function validate_user(user_id) {
  const data = getData();
  for (const user of data.users) {
    if (user.userId === user_id) {
      return true;
    }
  }

  return false;
}

/** Function that checks if channel id is valid
 * 
 * 
 * @param {number} channel_id
 * @returns {boolean}
*/

function validate_channel(channel_id) {
  const data = getData()
  for (const channel of data.channels) {
    if (channel.channelId === channel_id) {
      return true;
    }
  }

  return false;
}


//channelJoinV1 stub function 
function channelJoinV1(authUserId, channelId) {
  return {
  }
}

//channelInviteV1 stub function 
function channelInviteV1(authUserId, channelId, uId) {
  return {
  }
}

//channelMessagesV1 stub function
function channelMessagesV1(authUserId, channelId, start) {
  return {
    messages: [
      {  
        messageId: 1,
        uId: 1,
        message: 'Hello world',
        timeSent: 1582426789,
      }
    ],
    start: 0,
    end: 50,
  }             
}

export { channelDetailsV1 };