import { getData, setData } from './dataStore.js';

/**
  * Creates a channel for authUserId.
  * 
  * @param {number} authUserId
  * @param {string} name
  * @param {boolean} isPublic
  * ...
  * @returns {{channelId: number}}
*/
export function channelsCreateV1 (authUserId, name, isPublic) {
  const data = getData();
  if (validate_user(authUserId) === false) {
    return { error: 'invalid auth user id' };
  }

  if (check_name(name) === false) {
    return { error: 'invalid name'};
  }
  
  let size = data.channels.length;
  size = size + 1;

  let owners = [authUserId];
  let members = [authUserId];


  let channel = {
    channelId: size,
    name: name,
    isPublic: isPublic,
    ownerMembers: owners,
    allMembers: members,
    messages: [],
    start: -1,
    end: -1,
  }

  data.channels.push(channel);
  setData(data);
  
  return { channelId: size };
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

// Function lists details of all channels the user is in
export function channelsListAllV1 (authUserId) {
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
      return true
    }
  }

  return false
}

// Function that checks if user is member of given channel
function channel_member (channel, user_id) {
  for (const member of channel.allMembers) {
    if (member === user_id) {
      return true
    }
  }

  return false
}

/**
  * Checks if name is valid
  * 
  * @param {string} name
  * ...
  * @returns {boolean}
*/
function check_name (name) {
  if (name.length < 1 || name.length > 20) {
    return false;
  }
  return true;
}