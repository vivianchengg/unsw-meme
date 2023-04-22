import {
  generateMessageId,
} from '../Message/messageHelper';

import {
  channeldataStore,
  dataStore,
} from '../Other/types';

/**
 * Sends a the packaged standup message to the channel
 *
 * @param {dataStore} dataStore - dataStore object
 * @param {channeldataStore} channel - channeldataStore object
 */
const sendStandupMessage = (dataStore: dataStore, channel: channeldataStore) => {
  const messageId = generateMessageId(dataStore);
  let message = '';

  for (const standupMsg of channel.standupMessagesStorage) {
    message += standupMsg.handle + ': ' + standupMsg.message + '\n';
  }
  message = message.slice(0, -1);

  // Cannot use MessageSendV2 function in case user logged out after calling standup (invalid token)
  channel.messages.unshift({
    messageId: messageId,
    uId: channel.standupCallerId,
    message: message,
    timeSent: channel.standupFinish,
    isPinned: false,
    reactorUIds: [],
  });
};

export {
  sendStandupMessage,
};
