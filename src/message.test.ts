import { requestHelper } from './request';

let user: any;
let user2: any;
let user3: any;
let channel: any;
let dm: any;
let message: any;
let dmMsg: any;
let dmMsg2: any;
let tokenData: any;

beforeEach(() => {
  requestHelper('DELETE', '/clear/v1', {}, {});

  // user is global owner
  const userData = {
    email: 'arialee@gmail.com',
    password: 'dynamite',
    nameFirst: 'aria',
    nameLast: 'lee'
  };
  user = requestHelper('POST', '/auth/register/v3', {}, userData);

  const user2Data = {
    email: 'arialee1@gmail.com',
    password: 'dynamite',
    nameFirst: 'aria',
    nameLast: 'lee'
  };
  user2 = requestHelper('POST', '/auth/register/v3', {}, user2Data);

  const user3Data = {
    email: 'arialee2@gmail.com',
    password: 'dynamite',
    nameFirst: 'aria',
    nameLast: 'lee'
  };
  user3 = requestHelper('POST', '/auth/register/v3', {}, user3Data);

  // user2's channel
  const channelData = {
    name: 'holidays',
    isPublic: false
  };
  tokenData = {
    token: user2.token,
  };
  channel = requestHelper('POST', '/channels/create/v3', tokenData, channelData);
  // user2 owner creates msg
  const messageData = {
    channelId: channel.channelId,
    message: 'hello ellen'
  };
  message = requestHelper('POST', '/message/send/v2', tokenData, messageData);

  // user2 creates dm - user3 member
  const dmData = {
    uIds: [user3.authUserId]
  };
  dm = requestHelper('POST', '/dm/create/v2', tokenData, dmData);
  // user 2 creates dm msg
  const dmMsgData = {
    dmId: dm.dmId,
    message: 'hello'
  };
  dmMsg = requestHelper('POST', '/message/senddm/v2', tokenData, dmMsgData);
  // user 3 creates dm msg
  const dmMsg2Data = {
    dmId: dm.dmId,
    message: 'hello'
  };
  tokenData.token = user3.token;
  dmMsg2 = requestHelper('POST', '/message/senddm/v2', tokenData, dmMsg2Data);

  tokenData.token = user2.token;

  const reactData = {
    messageId: dmMsg.messageId,
    reactId: 1
  };
  requestHelper('POST', '/message/react/v1', tokenData, reactData);
});

afterAll(() => {
  requestHelper('DELETE', '/clear/v1', {}, {});
});

describe('HTTP tests using Jest for messageRemoveV1', () => {
  test('global owners can remove msg + double removing msg', () => {
    const invite = {
      channelId: channel.channelId,
      uId: user.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, invite);

    const param1 = {
      messageId: message.messageId,
    };
    tokenData.token = user.token;
    requestHelper('DELETE', '/message/remove/v2', tokenData, param1);
    expect(requestHelper('DELETE', '/message/remove/v2', tokenData, param1)).toEqual(400);
  });

  test('channel writer can remove msg', () => {
    // add user3 to channel
    const invite = {
      channelId: channel.channelId,
      uId: user3.authUserId,
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, invite);

    // user3 writes msg
    const messageData = {
      channelId: channel.channelId,
      message: 'pewpewpew'
    };
    tokenData.token = user3.token;
    const message2 = requestHelper('POST', '/message/send/v2', tokenData, messageData);

    const param1 = {
      messageId: message2.messageId,
    };
    requestHelper('DELETE', '/message/remove/v2', tokenData, param1);
    expect(requestHelper('DELETE', '/message/remove/v2', tokenData, param1)).toEqual(400);
  });

  test('invalid message id', () => {
    const rmData = {
      messageId: message.messageId + 199
    };
    expect(requestHelper('DELETE', '/message/remove/v2', tokenData, rmData)).toEqual(400);
  });

  test('token is invalid', () => {
    const param1 = {
      messageId: message.messageId
    };
    tokenData.token = user2.token + 'hi';
    expect(requestHelper('DELETE', '/message/remove/v2', tokenData, param1)).toEqual(403);
  });

  test('authUser is not sender and no owner permissions', () => {
    const join = {
      channelId: channel.channelId,
      uId: user3.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, join);

    const msg3Data = {
      messageId: message.messageId
    };
    tokenData.token = user3.token;

    expect(requestHelper('DELETE', '/message/remove/v2', tokenData, msg3Data)).toEqual(403);
  });

  test('owner(not global owner) removes msg', () => {
    // user joins channel
    const join = {
      channelId: channel.channelId,
      uId: user3.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, join);
    requestHelper('POST', '/channel/addowner/v2', tokenData, join);

    const msg3Data = {
      messageId: message.messageId
    };
    tokenData.token = user3.token;
    expect(requestHelper('DELETE', '/message/remove/v2', tokenData, msg3Data)).toStrictEqual({});
  });
});

describe('HTTP tests using Jest for messageSendV1', () => {
  test('channelId does not refer to a valid channel', () => {
    const param2 = {
      channelId: channel.channelId - 100,
      message: 'Heyyy, how is ur day going'
    };
    expect(requestHelper('POST', '/message/send/v2', tokenData, param2)).toEqual(400);
  });

  test('length of message is less than 1 characters', () => {
    const param2 = {
      channelId: channel.channelId,
      message: ''
    };
    expect(requestHelper('POST', '/message/send/v2', tokenData, param2)).toEqual(400);
  });

  test('length of message is over 1000 characters', () => {
    const param2 = {
      channelId: channel.channelId,
      message: 'a'.repeat(1001)
    };
    expect(requestHelper('POST', '/message/send/v2', tokenData, param2)).toEqual(400);
  });

  test('token is invalid', () => {
    const param2 = {
      channelId: channel.channelId,
      message: 'no thanks'
    };
    tokenData.token = user2.token + 'yay';
    expect(requestHelper('POST', '/message/send/v2', tokenData, param2)).toEqual(403);
  });

  test('valid input and output', () => {
    const param2 = {
      channelId: channel.channelId,
      message: 'no thanks'
    };
    expect(requestHelper('POST', '/message/send/v2', tokenData, param2).messageId).toStrictEqual(expect.any(Number));
  });

  test('channelId is valid but user is not a member', () => {
    const param3 = {
      channelId: channel.channelId,
      message: 'Heyyy, how is ur day going'
    };
    tokenData.token = user.token;
    expect(requestHelper('POST', '/message/send/v2', tokenData, param3)).toEqual(403);
  });
});

describe('MessageEditV1 test', () => {
  test('trying to remove a edited empty string msg', () => {
    const param3 = {
      messageId: message.messageId,
      message: ''
    };
    requestHelper('PUT', '/message/edit/v2', tokenData, param3);

    const param = {
      messageId: message.messageId,
    };
    expect(requestHelper('DELETE', '/message/remove/v2', tokenData, param)).toEqual(400);
  });

  test('trying to edit a deleted msg', () => {
    const param = {
      messageId: message.messageId,
    };
    requestHelper('DELETE', '/message/remove/v2', tokenData, param);

    const param3 = {
      messageId: message.messageId,
      message: ''
    };
    expect(requestHelper('PUT', '/message/edit/v2', tokenData, param3)).toEqual(400);
  });

  test('double edit empty string', () => {
    const param = {
      messageId: message.messageId,
      message: ''
    };
    requestHelper('PUT', '/message/edit/v2', tokenData, param);
    expect(requestHelper('PUT', '/message/edit/v2', tokenData, param)).toEqual(400);
  });

  test('channel owner of msg, edits msg', () => {
    const param3 = {
      messageId: message.messageId,
      message: 'hello ellen, what are you doing?'
    };
    requestHelper('PUT', '/message/edit/v2', tokenData, param3);

    const param = {
      channelId: channel.channelId,
      start: 0
    };

    const msg = requestHelper('GET', '/channel/messages/v3', tokenData, param);
    expect(msg.messages[0].messageId).toStrictEqual(message.messageId);
    expect(msg.messages[0].message).toStrictEqual(param3.message);
  });

  test('dm writer of msg, edits msg', () => {
    const param3 = {
      messageId: dmMsg2.messageId,
      message: 'lmfao?'
    };
    tokenData.token = user3.token;

    requestHelper('PUT', '/message/edit/v2', tokenData, param3);

    const param = {
      dmId: dm.dmId,
      start: 0
    };

    const msg = requestHelper('GET', '/dm/messages/v2', tokenData, param);
    expect(msg.messages[0].messageId).toStrictEqual(dmMsg2.messageId);
    expect(msg.messages[0].message).toStrictEqual(param3.message);
  });

  test('global owner cannot edit dm', () => {
    // create dm with global user as not owner
    const dmData = {

      uIds: [user.authUserId],
    };

    const dm2 = requestHelper('POST', '/dm/create/v2', tokenData, dmData);

    // dm owner makes msg
    const dmMsgData = {
      dmId: dm2.dmId,
      message: 'hey'
    };

    const dmMsg3 = requestHelper('POST', '/message/senddm/v2', tokenData, dmMsgData);

    // global owner tries to edit
    const param3 = {
      messageId: dmMsg3.messageId,
      message: 'lol'
    };
    tokenData.token = user.token;

    expect(requestHelper('PUT', '/message/edit/v2', tokenData, param3)).toEqual(403);
  });

  test('global owner can edit channel', () => {
    const invite = {

      channelId: channel.channelId,
      uId: user.authUserId,
    };

    expect(requestHelper('POST', '/channel/invite/v3', tokenData, invite)).toStrictEqual({});

    // global owner edits channel
    const param3 = {
      messageId: message.messageId,
      message: 'pew'
    };
    tokenData.token = user.token;

    expect(requestHelper('PUT', '/message/edit/v2', tokenData, param3)).toStrictEqual({});

    const param = {

      channelId: channel.channelId,
      start: 0
    };

    const msg = requestHelper('GET', '/channel/messages/v3', tokenData, param);
    expect(msg.messages[0].messageId).toStrictEqual(message.messageId);
    expect(msg.messages[0].message).toStrictEqual(param3.message);
  });

  test('dm owner can edit msg', () => {
    const param4 = {
      messageId: dmMsg2.messageId,
      message: 'what'
    };
    expect(requestHelper('PUT', '/message/edit/v2', tokenData, param4)).toStrictEqual({});
  });

  test('length of message is over 1000 characters', () => {
    const param3 = {
      messageId: message.messageId,
      message: 'a'.repeat(1001)
    };
    expect(requestHelper('PUT', '/message/edit/v2', tokenData, param3)).toEqual(400);
  });

  test('invalid msg id', () => {
    const param3 = {
      messageId: message.messageId + 189,
      message: 'hello ellen, what are you doing?'
    };
    expect(requestHelper('PUT', '/message/edit/v2', tokenData, param3)).toEqual(400);
  });

  test('token is invalid', () => {
    const param3 = {
      messageId: message.messageId,
      message: 'hello ellen, what are you doing?'
    };
    tokenData.token = user2.token + 'yay';
    expect(requestHelper('PUT', '/message/edit/v2', tokenData, param3)).toEqual(403);
  });

  test('user not sender and no owner permission', () => {
    // user2 is sender and owner
    const edit1Data = {
      messageId: message.messageId,
      message: 'hello ellen, what are you doing?'
    };
    requestHelper('PUT', '/message/edit/v2', tokenData, edit1Data);

    const edit3Data = {
      messageId: message.messageId,
      message: 'hello ellen, what are you doing?'
    };
    tokenData.token = user3.token;
    expect(requestHelper('PUT', '/message/edit/v2', tokenData, edit3Data)).toEqual(400);

    // user is not member owner and not sender
    const edit4Data = {
      messageId: dmMsg.messageId,
      message: 'hello ellen, what are you doing?'
    };
    expect(requestHelper('PUT', '/message/edit/v2', tokenData, edit4Data)).toEqual(403);

    // user is dm creator(owner)
    const edit5Data = {
      messageId: dmMsg.messageId,
      message: 'hello ellen, what are you doing?'
    };
    tokenData.token = user2.token;
    expect(requestHelper('PUT', '/message/edit/v2', tokenData, edit5Data)).toStrictEqual({});

    // user is member but sender
    const edit6Data = {
      messageId: dmMsg2.messageId,
      message: 'hello ellen, what are you doing?'
    };
    tokenData.token = user3.token;
    expect(requestHelper('PUT', '/message/edit/v2', tokenData, edit6Data)).toStrictEqual({});
  });
});

describe('HTTP - /message/senddm/v1 tests', () => {
  test('Invalid dm ID', () => {
    const param = {
      dmId: dm.dmId + 111,
      message: 'i love food wbu?',
    };
    expect(requestHelper('POST', '/message/senddm/v2', tokenData, param)).toEqual(400);
  });

  test('Invalid token', () => {
    const param = {
      dmId: dm.dmId,
      message: 'i love food wbu?',
    };
    tokenData.token = user2.token + 'yay!';
    expect(requestHelper('POST', '/message/senddm/v2', tokenData, param)).toEqual(403);
  });

  test('0 msg length', () => {
    const param = {
      dmId: dm.dmId,
      message: '',
    };
    expect(requestHelper('POST', '/message/senddm/v2', tokenData, param)).toEqual(400);
  });

  test('+1000 msg length', () => {
    const param = {
      dmId: dm.dmId,
      message: 'a'.repeat(1001)
    };
    expect(requestHelper('POST', '/message/senddm/v2', tokenData, param)).toEqual(400);
  });

  test('dmId is valid + user not part of DM', () => {
    const param = {
      dmId: dm.dmId,
      message: 'i love food wbu?',
    };
    tokenData.token = user.token;
    expect(requestHelper('POST', '/message/senddm/v2', tokenData, param)).toEqual(403);
  });

  test('Valid token + uIds (testing if owner is in dm)', () => {
    const param = {
      dmId: dm.dmId,
      message: 'i love food wbu?',
    };
    expect(requestHelper('POST', '/message/senddm/v2', tokenData, param)).toStrictEqual({ messageId: expect.any(Number) });
  });

  test('Valid token + uIds (testing if uId is in dm)', () => {
    const param = {
      dmId: dm.dmId,
      message: 'i love food wbu?',
    };
    tokenData.token = user3.token;
    expect(requestHelper('POST', '/message/senddm/v2', tokenData, param)).toStrictEqual({ messageId: expect.any(Number) });
  });
});

describe('/message/sendlater/v1 tests', () => {
  test('Invalid channel ID', () => {
    const param = {
      channelId: channel.channelId + 1,
      message: 'i love food wbu?',
      timeSent: Math.floor(new Date().getTime() / 1000) + 2,
    };
    expect(requestHelper('POST', '/message/sendlater/v1', tokenData, param)).toEqual(400);
  });

  test('Invalid token', () => {
    const invalidTokenData = {
      token: user2.token + 'incorrect',
    };

    const param = {
      channelId: channel.channelId,
      message: 'i love food wbu?',
      timeSent: Math.floor(new Date().getTime() / 1000) + 2,
    };
    expect(requestHelper('POST', '/message/sendlater/v1', invalidTokenData, param)).toEqual(403);
  });

  test('Message less than 1 character', () => {
    const param = {
      channelId: channel.channelId,
      message: '',
      timeSent: Math.floor(new Date().getTime() / 1000) + 2,
    };
    expect(requestHelper('POST', '/message/sendlater/v1', tokenData, param)).toEqual(400);
  });

  test('Message over 1000 characters', () => {
    const param = {
      channelId: channel.channelId,
      message: 'b'.repeat(1001),
      timeSent: Math.floor(new Date().getTime() / 1000) + 2,
    };
    expect(requestHelper('POST', '/message/sendlater/v1', tokenData, param)).toEqual(400);
  });

  test('timeSent is in the past', () => {
    const param = {
      channelId: channel.channelId,
      message: 'i love food wbu?',
      timeSent: Math.floor(new Date().getTime() / 1000) - 2,
    };
    expect(requestHelper('POST', '/message/sendlater/v1', tokenData, param)).toEqual(400);
  });

  test('User not member of channel but channelId is valid', () => {
    const token1Data = {
      token: user.token,
    };

    const param = {
      channelId: channel.channelId,
      message: 'i love food wbu?',
      timeSent: Math.floor(new Date().getTime() / 1000) + 2,
    };
    expect(requestHelper('POST', '/message/sendlater/v1', token1Data, param)).toEqual(403);
  });

  test('Basic functionality', () => {
    const param = {
      channelId: channel.channelId,
      message: 'Nobody likes food surely!',
      timeSent: Math.floor(new Date().getTime() / 1000) + 2,
    };
    message = requestHelper('POST', '/message/sendlater/v1', tokenData, param);
    expect(message.messageId).toStrictEqual(expect.any(Number));

    const messageParam = {
      channelId: channel.channelId,
      message: 'i love food wbu?',
    };
    expect(requestHelper('POST', '/message/send/v2', tokenData, messageParam).messageId).toBeGreaterThan(message.messageId);
  });
});

describe('HTTP - /message/pin/v1 tests', () => {
  test('Invalid token', () => {
    const param = {
      messageId: message.messageId
    };
    tokenData.token = user2.token + 'yay!';
    expect(requestHelper('POST', '/message/pin/v1', tokenData, param)).toEqual(403);
  });

  test('message invalid', () => {
    const param = {
      messageId: dmMsg2.messageId + 1
    };
    expect(requestHelper('POST', '/message/pin/v1', tokenData, param)).toEqual(400);
  });

  test('The message is already pinned - channel', () => {
    const param = {
      messageId: message.messageId
    };
    requestHelper('POST', '/message/pin/v1', tokenData, param);
    expect(requestHelper('POST', '/message/pin/v1', tokenData, param)).toEqual(400);
  });

  test('The message is already pinned - dm', () => {
    const param = {
      messageId: dmMsg2.messageId
    };
    expect(requestHelper('POST', '/message/pin/v1', tokenData, param)).toEqual({});
    expect(requestHelper('POST', '/message/pin/v1', tokenData, param)).toEqual(400);
  });

  test('valid message in a joined channel/DM + authorised user does not have owner permissions in the channel/dm', () => {
    const join = {
      channelId: channel.channelId,
      uId: user3.authUserId
    };

    requestHelper('POST', '/channel/invite/v3', tokenData, join);

    const param = {
      messageId: message.messageId
    };

    tokenData.token = user3.token;

    expect(requestHelper('POST', '/message/pin/v1', tokenData, param)).toEqual(403);
  });

  test('valid input - channel', () => {
    const param = {
      messageId: message.messageId
    };

    const param1 = {
      channelId: channel.channelId,
      start: 0
    };

    let msg = requestHelper('GET', '/channel/messages/v3', tokenData, param1);
    expect(msg.messages[0].isPinned).toStrictEqual(false);
    requestHelper('POST', '/message/pin/v1', tokenData, param);
    msg = requestHelper('GET', '/channel/messages/v3', tokenData, param1);
    expect(msg.messages[0].isPinned).toStrictEqual(true);
  });

  test('valid input - dm', () => {
    const param = {
      messageId: dmMsg.messageId
    };

    const param1 = {
      dmId: dm.dmId,
      start: 0
    };

    let msg = requestHelper('GET', '/dm/messages/v2', tokenData, param1);
    expect(msg.messages[1].isPinned).toStrictEqual(false);
    requestHelper('POST', '/message/pin/v1', tokenData, param);
    msg = requestHelper('GET', '/dm/messages/v2', tokenData, param1);
    expect(msg.messages[1].isPinned).toStrictEqual(true);
  });
});

describe('HTTP - /message/unpin/v1 tests', () => {
  test('Invalid token', () => {
    const param = {
      messageId: message.messageId
    };
    expect(requestHelper('POST', '/message/pin/v1', tokenData, param)).toStrictEqual({});
    tokenData.token = user2.token + 'yay!';
    expect(requestHelper('POST', '/message/unpin/v1', tokenData, param)).toEqual(403);
  });

  test('message invalid', () => {
    const param = {
      messageId: dmMsg2.messageId + 1
    };
    tokenData.token = user2.token;
    expect(requestHelper('POST', '/message/unpin/v1', tokenData, param)).toEqual(400);
  });

  test('The message is already unpinned - channel', () => {
    const param = {
      messageId: message.messageId
    };
    expect(requestHelper('POST', '/message/pin/v1', tokenData, param)).toStrictEqual({});
    expect(requestHelper('POST', '/message/unpin/v1', tokenData, param)).toStrictEqual({});
    expect(requestHelper('POST', '/message/unpin/v1', tokenData, param)).toEqual(400);
  });

  test('The message is already unpinned - dm', () => {
    const param = {
      messageId: dmMsg2.messageId
    };
    expect(requestHelper('POST', '/message/pin/v1', tokenData, param)).toStrictEqual({});
    expect(requestHelper('POST', '/message/unpin/v1', tokenData, param)).toStrictEqual({});
    expect(requestHelper('POST', '/message/unpin/v1', tokenData, param)).toEqual(400);
  });

  test('valid message in a joined channel/DM + authorised user does not have owner permissions in the channel/dm', () => {
    const join = {
      channelId: channel.channelId,
      uId: user3.authUserId
    };

    requestHelper('POST', '/channel/invite/v3', tokenData, join);

    const param = {
      messageId: message.messageId
    };

    tokenData.token = user3.token;

    expect(requestHelper('POST', '/message/unpin/v1', tokenData, param)).toEqual(403);
  });

  test('valid input - channel', () => {
    const param = {
      messageId: message.messageId
    };

    expect(requestHelper('POST', '/message/pin/v1', tokenData, param)).toStrictEqual({});

    const param1 = {
      channelId: channel.channelId,
      start: 0
    };

    let msg = requestHelper('GET', '/channel/messages/v3', tokenData, param1);
    expect(msg.messages[0].isPinned).toStrictEqual(true);
    requestHelper('POST', '/message/unpin/v1', tokenData, param);
    msg = requestHelper('GET', '/channel/messages/v3', tokenData, param1);
    expect(msg.messages[0].isPinned).toStrictEqual(false);
  });

  test('valid input - dm', () => {
    const param = {
      messageId: dmMsg.messageId
    };
    expect(requestHelper('POST', '/message/pin/v1', tokenData, param)).toStrictEqual({});

    const param1 = {
      dmId: dm.dmId,
      start: 0
    };

    let msg = requestHelper('GET', '/dm/messages/v2', tokenData, param1);
    expect(msg.messages[1].isPinned).toStrictEqual(true);
    requestHelper('POST', '/message/unpin/v1', tokenData, param);
    msg = requestHelper('GET', '/dm/messages/v2', tokenData, param1);
    expect(msg.messages[1].isPinned).toStrictEqual(false);
  });
});

describe('message/react/v1 tests', () => {
  test('messageId is invalid', () => {
    // channel
    const param = {
      messageId: message.messageId - 100,
      reactId: 1,
    };
    expect(requestHelper('POST', '/message/react/v1', tokenData, param)).toStrictEqual(400);

    // dm
    const param2 = {
      messageId: dmMsg.messageId - 100,
      reactId: 1
    };
    expect(requestHelper('POST', '/message/react/v1', tokenData, param2)).toStrictEqual(400);
  });

  test('user is not member of msgId channel', () => {
    tokenData.token = user.token;
    const param = {
      messageId: message.messageId,
      reactId: 1,
    };
    expect(requestHelper('POST', '/message/react/v1', tokenData, param)).toStrictEqual(400);
  });

  test('reactId is invalid', () => {
    const param = {
      messageId: message.messageId,
      reactId: 0,
    };
    expect(requestHelper('POST', '/message/react/v1', tokenData, param)).toStrictEqual(400);
  });

  test('user has already reacted with reactId', () => {
    // channel
    const param = {
      messageId: message.messageId,
      reactId: 1
    };
    expect(requestHelper('POST', '/message/react/v1', tokenData, param)).toStrictEqual({});
    expect(requestHelper('POST', '/message/react/v1', tokenData, param)).toStrictEqual(400);
  });

  test('invalid token', () => {
    tokenData.token = user.token - 10;
    const param = {
      messageId: message.messageId,
      reactId: 1
    };
    expect(requestHelper('POST', '/message/react/v1', tokenData, param)).toStrictEqual(403);
  });

  test('valid input - channel', () => {
    const param = {
      messageId: message.messageId,
      reactId: 1
    };
    expect(requestHelper('POST', '/message/react/v1', tokenData, param)).toStrictEqual({});

    const invite = {
      channelId: channel.channelId,
      uId: user3.authUserId,
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, invite);

    tokenData.token = user3.token;
    expect(requestHelper('POST', '/message/react/v1', tokenData, param)).toStrictEqual({});

    const msgList = {
      channelId: channel.channelId,
      start: 0,
    };
    expect(requestHelper('GET', '/channel/messages/v3', tokenData, msgList).messages[0].reacts).toStrictEqual([{
      reactId: 1,
      uIds: [20, 30],
    }]);
  });

  test('valid input dm', () => {
    const param = {
      messageId: dmMsg.messageId,
      reactId: 1
    };

    tokenData.token = user3.token;
    expect(requestHelper('POST', '/message/react/v1', tokenData, param)).toStrictEqual({});

    const msgList = {
      dmId: dm.dmId,
      start: 0,
    };

    const msgResult = requestHelper('GET', '/dm/messages/v2', tokenData, msgList);
    expect(msgResult.messages[1].reacts).toStrictEqual([{
      reactId: 1,
      uIds: [20, 30],
    }]);
  });
});

describe('message/unreact/v1 tests', () => {
  test('token is invalid', () => {
    const param = {
      messageId: dmMsg.messageId,
      reactId: 1
    };
    tokenData.token = user.token - 10;
    expect(requestHelper('POST', '/message/unreact/v1', tokenData, param)).toStrictEqual(403);
  });

  test('msgId is invalid', () => {
    const param = {
      messageId: dmMsg.messageId + 100,
      reactId: 1
    };
    expect(requestHelper('POST', '/message/unreact/v1', tokenData, param)).toStrictEqual(400);
  });

  test('user is not a member', () => {
    const param = {
      messageId: dmMsg.messageId,
      reactId: 1
    };
    tokenData.token = user.token;
    expect(requestHelper('POST', '/message/unreact/v1', tokenData, param)).toStrictEqual(400);
  });

  test('reactId is invalid', () => {
    const param = {
      messageId: dmMsg.messageId,
      reactId: -1
    };
    expect(requestHelper('POST', '/message/unreact/v1', tokenData, param)).toStrictEqual(400);
  });

  test('msgId is invalid', () => {
    const param = {
      messageId: dmMsg.messageId + 100,
      reactId: 1
    };
    expect(requestHelper('POST', '/message/unreact/v1', tokenData, param)).toStrictEqual(400);
  });

  test('user does not contain the reactId that user used', () => {
    const param = {
      messageId: dmMsg.messageId,
      reactId: 1
    };
    expect(requestHelper('POST', '/message/unreact/v1', tokenData, param)).toStrictEqual({});
    expect(requestHelper('POST', '/message/unreact/v1', tokenData, param)).toStrictEqual(400);
  });

  test('channel - valid input', () => {
    // create react
    const react = {
      messageId: message.messageId,
      reactId: 1
    };
    requestHelper('POST', '/message/react/v1', tokenData, react);

    // remove react
    const param = {
      messageId: message.messageId,
      reactId: 1
    };
    expect(requestHelper('POST', '/message/unreact/v1', tokenData, param)).toStrictEqual({});

    // list reactions
    const list = {
      channelId: channel.channelId,
      start: 0
    };
    expect(requestHelper('GET', '/channel/messages/v3', tokenData, list).messages[0].reacts).toStrictEqual([{
      reactId: 1,
      uIds: [],
    }]);
  });

  test('dm - valid input', () => {
    // remove react
    const param = {
      messageId: dmMsg.messageId,
      reactId: 1
    };
    expect(requestHelper('POST', '/message/unreact/v1', tokenData, param)).toStrictEqual({});

    // list reactions
    const list = {
      dmId: dm.dmId,
      start: 0
    };
    expect(requestHelper('GET', '/dm/messages/v2', tokenData, list).messages[1].reacts).toStrictEqual([{
      reactId: 1,
      uIds: [],
    }]);
  });
});

describe('message/share/v1 tests', () => {
  test('both channelId + dmId is invalid', () => {
    const param = {
      ogMessageId: message.messageId,
      message: 'lol',
      channelId: channel.channelId - 100,
      dmId: dm.dmId - 100,
    };
    expect(requestHelper('POST', '/message/share/v1', tokenData, param)).toStrictEqual(400);
  });

  test('neither channelId nor dmId is -1', () => {
    const param = {
      ogMessageId: message.messageId,
      message: 'lol',
      channelId: channel.channelId,
      dmId: dm.dmId,
    };
    expect(requestHelper('POST', '/message/share/v1', tokenData, param)).toStrictEqual(400);
  });

  test('ogMessageId does not refer to a valid msgId that user has joined', () => {
    tokenData.token = user.token;

    // channel
    const param = {
      ogMessageId: message.messageId - 100,
      message: 'lol',
      channelId: channel.channelId,
      dmId: -1,
    };
    expect(requestHelper('POST', '/message/share/v1', tokenData, param)).toStrictEqual(400);

    // dm
    const param2 = {
      ogMessageId: dmMsg.messageId - 100,
      message: 'lol',
      channelId: -1,
      dmId: dmMsg.dmId,
    };
    expect(requestHelper('POST', '/message/share/v1', tokenData, param2)).toStrictEqual(400);
  });

  test('optional msg is +1000 length', () => {
    const param = {
      ogMessageId: dmMsg.messageId,
      message: 'a'.repeat(1001),
      channelId: -1,
      dmId: dm.dmId,
    };
    expect(requestHelper('POST', '/message/share/v1', tokenData, param)).toStrictEqual(400);
  });

  test('user has not joined channel - where msg it sent to', () => {
    const tokenData2 = {
      token: user3.token,
    };
    const channel2Data = {
      name: 'lol',
      isPublic: 'true',
    };
    const channel2 = requestHelper('POST', '/channels/create/v3', tokenData2, channel2Data);

    const param = {
      ogMessageId: message.messageId,
      message: 'lol',
      channelId: channel2.channelId,
      dmId: -1,
    };
    expect(requestHelper('POST', '/message/share/v1', tokenData, param)).toStrictEqual(403);
  });

  test('user has not joined dm - where msg it sent to', () => {
    const tokenData2 = {
      token: user3.token
    };

    const dm2Data = {
      uIds: [user.authUserId]
    };
    const dm2 = requestHelper('POST', '/dm/create/v2', tokenData2, dm2Data);
    const param = {
      ogMessageId: dmMsg.messageId,
      message: 'lol',
      channelId: -1,
      dmId: dm2.dmId,
    };
    expect(requestHelper('POST', '/message/share/v1', tokenData, param)).toStrictEqual(403);
  });

  test('both channelId and messageId is valid', () => {
    const param = {
      ogMessageId: message.messageId,
      message: 'lol',
      channelId: channel.channelId,
      dmId: dm.dmId
    };
    expect(requestHelper('POST', '/message/share/v1', tokenData, param)).toStrictEqual(400);
  });

  test('invalid token', () => {
    tokenData.token = user.token - 2;
    const param = {
      ogMessageId: message.messageId,
      message: 'lol',
      channelId: channel.channelId,
      dmId: -1,
    };
    expect(requestHelper('POST', '/message/share/v1', tokenData, param)).toStrictEqual(403);
  });

  test('valid channel send', () => {
    // user 3 joins channel

    const profile = {
      uId: user2.authUserId
    };
    const user2Detail = requestHelper('GET', '/user/profile/v3', tokenData, profile);
    const user2Handle = user2Detail.user.handleStr;

    const profile2 = {
      uId: user3.authUserId
    };
    tokenData.token = user3.token;
    const userDetail = requestHelper('GET', '/user/profile/v3', tokenData, profile2);
    const userHandle = userDetail.user.handleStr;

    tokenData.token = user2.token;

    const join = {
      channelId: channel.channelId,
      uId: user3.authUserId,
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, join);

    tokenData.token = user3.token;

    // user 3 creates channel
    const channel2Data = {
      name: 'lol',
      isPublic: 'true',
    };
    const channel2 = requestHelper('POST', '/channels/create/v3', tokenData, channel2Data);
    // sharing message from channel to channel 2
    let param = {
      ogMessageId: message.messageId,
      message: `I like food @${userHandle}`,
      channelId: channel2.channelId,
      dmId: -1
    };
    expect(requestHelper('POST', '/message/share/v1', tokenData, param)).toStrictEqual({ sharedMessageId: expect.any(Number) });
    param = {
      ogMessageId: message.messageId,
      message: `Hey @${user2Handle}!`,
      channelId: channel2.channelId,
      dmId: -1
    };
    expect(requestHelper('POST', '/message/share/v1', tokenData, param)).toStrictEqual({ sharedMessageId: expect.any(Number) });

    // sharing og msg + ''
    param = {
      ogMessageId: message.messageId,
      message: '',
      channelId: channel2.channelId,
      dmId: -1
    };
    expect(requestHelper('POST', '/message/share/v1', tokenData, param)).toStrictEqual({ sharedMessageId: expect.any(Number) });

    const msg = {
      channelId: channel2.channelId,
      start: 0
    };
    expect(requestHelper('GET', '/channel/messages/v3', tokenData, msg).messages[0].message).toStrictEqual('hello ellen');
    expect(requestHelper('GET', '/channel/messages/v3', tokenData, msg).messages[1].message).toStrictEqual('hello ellen\nHey @arialee0!');
  });

  test('valid sending channel msg to dm', () => {
    const join = {
      channelId: channel.channelId,
      uId: user3.authUserId,
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, join);

    tokenData.token = user3.token;
    // user 3 creates dm
    const dm2Data = {
      uIds: [user.authUserId]
    };
    const dm2 = requestHelper('POST', '/dm/create/v2', tokenData, dm2Data);

    // sharing message from dm to dm 2
    const param = {
      ogMessageId: message.messageId,
      message: 'food',
      channelId: -1,
      dmId: dm2.dmId,
    };
    expect(requestHelper('POST', '/message/share/v1', tokenData, param)).toStrictEqual({ sharedMessageId: expect.any(Number) });
    // sharing ogMsg + ''
    const param2 = {
      ogMessageId: message.messageId,
      message: '',
      channelId: -1,
      dmId: dm2.dmId,
    };
    expect(requestHelper('POST', '/message/share/v1', tokenData, param2)).toStrictEqual({ sharedMessageId: expect.any(Number) });
  });
});
