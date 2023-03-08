import { getData } from './dataStore.js'

// stub function: creates a channel - returns a channel id
function channelsCreateV1 (authUserId, name, isPublic) {
  return {channelId: 1}
}

// stub function: creates a list of channels - returns channelId, name 
function channelsListV1 (authUserId) {
  return {
    channels: [
      {
        channelId: 1,
        name: 'My Channel',
      }
    ],
  }
}

/** Function lists details of all channels the user is in
 * 
 * @param {number} authUserId - User ID of individual calling function
 * @returns {channels: [{
 *  channelId: number,
 *  name: string
 * }] 
 * }
 * 
 * To return the above:
 * - authUserId must be valid
 * 
 * Otherwise, {error: string} is returned
 */
function channelsListAllV1 (authUserId) {
  const data = getData();
  if (validate_user(authUserId) === false) {
    return {error: 'invalid authUserId'};
  }

  let channels_list = [];
  for (const channel of data.channels) {
    if (channel_member(channel, authUserId) === true) {
      const channel_details = {
        channelId: channel.channelId,
        name: channel.name
      };

      channels_list.push(channel_details);
    }
  }

  return channels_list;
}

/** Function that checks if user ID given is valid
 *  @param {number} user_id
 *  @returns {boolean}
*/
function validate_user (user_id) {
  const data = getData();
  for (const user of data.users) {
    if (user.userId === user_id) {
      return true;
    }
  }

  return false;
}

/** Function that checks if user is member of given channel
 *  @param {channel, number}
 *  @returns {boolean}
 *  
 * Here, channel: {
 *  channelId: number,
 *  name: string,
 *  isPublic: boolean,
 *  ownerMembers: user[],
 *  allMembers: user[]
 * }
 * 
 * user: {
 *  userId: number,
 *  email: string,
 *  password: string,
 *  nameFirst: string,
 *  nameLast: string,
 *  handleStr: string,
 * 
 * }
*/
function channel_member (channel, user_id) {
  for (const member of channel.allMembers) {
    if (member.userId === user_id) {
      return true;
    }
  }

  return false;
}