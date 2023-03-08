import {getData} from './dataStore.js'

/* Function that lists details of members in the channel given that:
- authUserId is valid
- channelId is valid and user is member of channel
*/

function channelDetailsV1 (authUserId, channelId) {
  const data = getData()
  if (validate_user(authUserId) === false) {
    return {error: 'error'}
  }

  if (validate_channel(channelId) === false) {
    return {error: 'error'}
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      if (channel_member(authUserId, channel.allMembers) === false) {
        return {error: 'error'}
      }

      return {
        name: channel.name,
        isPublic: channel.isPublic,
        ownerMembers: channel.ownerMembers,
        allMembers: channel.allMembers
      }
    }
  }
}

// Function that checks if user id is valid
function validate_user(user_id) {
  const data = getData()
  for (const user of data.users) {
    if (user.userId === user_id) {
      return true
    }
  }

  return false
}

// Function that checks if channel id is valid
function validate_channel(channel_id) {
  const data = getData()
  for (const channel of data.channels) {
    if (channel.channelId === channel_id) {
      return true
    }
  }

  return false
}

// Function that checks if user with given ID is member of channel
function channel_member(user_id, member_array) {
  for (const member of member_array) {
    if (member.userId === user_id) {
      return true
    }
  }

  return false
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
