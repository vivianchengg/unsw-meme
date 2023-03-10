import {getData} from './dataStore.js';
import {userProfileV1} from './users.js';

/** Function that lists details of members in the channel given that:
*
* @param {number} authUserId - User Id of individual asking for details of a channel
* @param {number} channelId - Channel Id of channel that user is asking to access details of
* @returns {object} channel 
*
*  - Here, channel: {
*  name: string, 
*  isPublic: boolean, 
*  ownerMembers: array,
*  allMembers: array
*  }
*
*  - Also, user: {
*  uId: number,
*  email: string,
*  password: string,
*  nameFirst: string,
*  nameLast: string,
*  handleStr: string
*  }

*
*  To return the above:
* - authUserId must be valid
* - channelId must be valid and user must be member of channel
*  Otherwise, {error: string} is returned
*
**/

export function channelDetailsV1 (authUserId, channelId) {
  const data = getData();
  if (validate_user(authUserId) === false) {
    return {error: 'invalid authUserId'};
  }

  if (validate_channel(channelId) === false) {
    return {error: 'invalid channelId'};
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      if (channel_member(channel, authUserId) === false) {
        return {error: 'user not member of channel'};
      }

      let allProfiles = [];
      for (const user_id of channel.allMembers) {
        const user_profile = userProfileV1(authUserId, user_id);
        allProfiles.push(user_profile);
      }

      let ownerProfiles = [];
      for (const user_id of channel.ownerMembers) {
        const user_profile = userProfileV1(authUserId, user_id);
        ownerProfiles.push(user_profile);
      }

      return {
        name: channel.name,
        isPublic: channel.isPublic,
        ownerMembers: ownerProfiles,
        allMembers: allProfiles
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
    if (user.uId === user_id) {
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
  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channel_id) {
      return true;
    }
  }

  return false;
}

/** Function that checks if given user is member of channel
 * 
 * @param channel: {
*  name: string, 
*  isPublic: boolean, 
*  ownerMembers: array
*  allMembers: array
*  }}
*
*  - Here, user: {
*  uId: number,
*  email: string,
*  password: string,
*  nameFirst: string,
*  nameLast: string,
*  handleStr: string
*  }
 * @param {number} user_id 
 * @returns {boolean} 
 */
function channel_member (channel, user_id) {
  for (const member of channel.allMembers) {
    if (member === user_id) {
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