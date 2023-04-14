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

describe('HTTP - /message/pin/v1 tests', () => {
  test('Invalid token', () => {
    const param = {
      messageId: message.messageId
    };
    tokenData.token = user2.token + 'yay!';
    expect(requestHelper('POST', '/message/pin/v1 ', tokenData, param)).toEqual(403);
  });

  test('message invalid', () => {
    const param = {
      messageId: dmMsg2.messageId + 1
    };
    tokenData.token = user2.token;
    expect(requestHelper('POST', '/message/pin/v1 ', tokenData, param)).toEqual(400);
  });

  test('The message is already pinned - channel', () => {
    const param = {
      messageId: message.messageId
    };
    tokenData.token = user2.token;
    requestHelper('POST', '/message/pin/v1 ', tokenData, param)
    expect(requestHelper('POST', '/message/pin/v1 ', tokenData, param)).toEqual(400);
  });

  test('The message is already pinned - dm', () => {
    const param = {
      messageId: dmMsg2.messageId
    };
    tokenData.token = user2.token;
    requestHelper('POST', '/message/pin/v1 ', tokenData, param)
    expect(requestHelper('POST', '/message/pin/v1 ', tokenData, param)).toEqual(400);
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
    
    expect(requestHelper('POST', '/message/pin/v1 ', tokenData, param)).toEqual(403);
  });

  test('valid input - channel', () => {
    const param = {
      messageId: message.messageId
    };
    tokenData.token = user2.token;
    expect(requestHelper('POST', '/message/pin/v1 ', tokenData, param)).toEqual({});
  });

  test('valid input - dm', () => {
    const param = {
      messageId: dmMsg.messageId
    };
    tokenData.token = user2.token;
    expect(requestHelper('POST', '/message/pin/v1 ', tokenData, param)).toEqual({});
  });
});

describe('HTTP - /message/unpin/v1 tests', () => {
  test('Invalid token', () => {
    const param = {
      messageId: message.messageId
    };
    tokenData.token = user2.token;
    expect(requestHelper('POST', '/message/pin/v1 ', tokenData, param)).toStrictEqual({});

    tokenData.token = user3.token + 1;
    expect(requestHelper('POST', '/message/unpin/v1 ', tokenData, param)).toEqual(403);

  });

  test('message invalid', () => {
    const param = {
      messageId: message.messageId
    };
    tokenData.token = user2.token;
    expect(requestHelper('POST', '/message/pin/v1 ', tokenData, param)).toStrictEqual({});
    const param2 = {
      messageId: dmMsg2.messageId + 1
    };
    expect(requestHelper('POST', '/message/unpin/v1 ', tokenData, param2)).toEqual(400);
  });

  test('The message is not pinned - channel', () => {
    const param = {
      messageId: message.messageId
    };
    tokenData.token = user2.token;
    expect(requestHelper('POST', '/message/unpin/v1 ', tokenData, param)).toEqual(400);
  });

  test('The message is not pinned - dm', () => {
    const param = {
      messageId: dmMsg2.messageId
    };
    tokenData.token = user2.token;
    expect(requestHelper('POST', '/message/unpin/v1 ', tokenData, param)).toEqual(400);
  });

  test('valid message in a joined channel/DM + authorised user does not have owner permissions in the channel/dm', () => {
    const param = {
      messageId: message.messageId
    };
    tokenData.token = user2.token;
    expect(requestHelper('POST', '/message/pin/v1 ', tokenData, param)).toStrictEqual({});
   
   
    const join = {
      channelId: channel.channelId,
      uId: user3.authUserId
    };

    requestHelper('POST', '/channel/invite/v3', tokenData, join);

    tokenData.token = user3.token;
    
    expect(requestHelper('POST', '/message/unpin/v1 ', tokenData, param)).toEqual(403);
  });

  test('valid input - channel', () => {
    const param = {
      messageId: message.messageId
    };
    tokenData.token = user2.token;
    expect(requestHelper('POST', '/message/pin/v1 ', tokenData, param)).toStrictEqual({});
    expect(requestHelper('POST', '/message/unpin/v1 ', tokenData, param)).toEqual({});
  });

  test('valid input - dm', () => {
    const param = {
      messageId: dmMsg.messageId
    };
    tokenData.token = user2.token;
    expect(requestHelper('POST', '/message/pin/v1 ', tokenData, param)).toStrictEqual({});
    expect(requestHelper('POST', '/message/unpin/v1 ', tokenData, param)).toEqual({});
  });
});
