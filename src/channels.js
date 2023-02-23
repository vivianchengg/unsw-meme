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