import { createId } from './message';
import { Channel, Data, React } from './dataStore';

/**
 * Sends a the packaged standup message to the channel
 *
 * @param {Data} dataStore - dataStore object
 * @param {Channel} channel - channeldataStore object
 */
export const sendStandupMessage = (dataStore: Data, channel: Channel) => {
  const messageId = createId();
  let message = '';

  for (const standupMsg of channel.standup.msgStore) {
    message += standupMsg.handle + ': ' + standupMsg.message + '\n';
  }
  message = message.slice(0, -1);

  const react: React[] = [];
  const uIds: number[] = [];
  const reactData = {
    reactId: 1,
    uIds: uIds,
    isThisUserReacted: false
  };
  react.push(reactData);

  // Cannot use MessageSendV2 function in case user logged out after calling standup (invalid token)
  channel.messages.unshift({
    messageId: messageId,
    uId: channel.standup.starterId,
    message: message,
    timeSent: channel.standup.timeFinish,
    isPinned: false,
    reacts: react,
  });
};
