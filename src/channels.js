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

/** Function lists details of all channels
 * 
 * @param {number} authUserId - User ID of individual calling function
 * @returns {array} channels
 * 
 * Here, channels: [{
 *  channelId: number,
 *  name: string
 * }]
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
      const channel_details = {
        channelId: channel.channelId,
        name: channel.name
      }

      channels_list.push(channel_details);
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
    if (user.uId === user_id) {
      return true;
    }
  }

  return false;
}

export { channelsListAllV1 };