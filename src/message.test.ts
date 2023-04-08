import { putRequest, postRequest, deleteRequest } from './dataStore';

const ERROR = { error: expect.any(String) };

let user: any;
let user2: any;
let user3: any;
let channel: any;
let dm: any;
let message: any;
let dmMsg: any;
let dmMsg2: any;

beforeEach(() => {
  deleteRequest('/clear/v1', null);

  // user is global owner
  const userData = {
    email: 'arialee@gmail.com',
    password: 'dynamite',
    nameFirst: 'aria',
    nameLast: 'lee'
  };
  user = postRequest('/auth/register/v2', userData);

  const user2Data = {
    email: 'arialee1@gmail.com',
    password: 'dynamite',
    nameFirst: 'aria',
    nameLast: 'lee'
  };
  user2 = postRequest('/auth/register/v2', user2Data);

  const user3Data = {
    email: 'arialee2@gmail.com',
    password: 'dynamite',
    nameFirst: 'aria',
    nameLast: 'lee'
  };
  user3 = postRequest('/auth/register/v2', user3Data);

  // channel
  const channelData = {
    token: user2.token,
    name: 'holidays',
    isPublic: false
  };
  channel = postRequest('/channels/create/v2', channelData);

  const messageData = {
    token: user2.token,
    channelId: channel.channelId,
    message: 'hello ellen'
  };
  message = postRequest('/message/send/v1', messageData);

  // dm
  const dmData = {
    token: user2.token,
    uIds: [user3.authUserId]
  };
  dm = postRequest('/dm/create/v1', dmData);

  const dmMsgData = {
    token: user2.token,
    dmId: dm.dmId,
    message: 'hello'
  };
  dmMsg = postRequest('/message/senddm/v1', dmMsgData);

  const dmMsg2Data = {
    token: user3.token,
    dmId: dm.dmId,
    message: 'hello'
  };
  dmMsg2 = postRequest('/message/senddm/v1', dmMsg2Data);
});

afterAll(() => {
  deleteRequest('/clear/v1', null);
});

describe('HTTP tests using Jest for messageRemoveV1', () => {
  test('invalid message id', () => {
    const rmData = {
      token: user2.token,
      messageId: message.messageId + 199
    };

    expect(deleteRequest('/message/remove/v1', rmData)).toStrictEqual(ERROR);
  });

  test('authUser is not sender and no owner permissions', () => {
    // user2 is sender
    const msg1Data = {
      token: user2.token,
      messageId: message.messageId
    };
    expect(deleteRequest('/message/remove/v1', msg1Data)).toStrictEqual({});

    // user is global owner but not member of channel
    const msg2Data = {
      token: user.token,
      messageId: message.messageId
    };
    expect(deleteRequest('/message/remove/v1', msg2Data)).toStrictEqual(ERROR);

    const msg3Data = {
      token: user3.token,
      messageId: message.messageId
    };
    expect(deleteRequest('/message/remove/v1', msg3Data)).toStrictEqual(ERROR);
  });

  test('token is invalid', () => {
    const param1 = {
      token: user2.token + 'hi',
      messageId: message.messageId
    };

    expect(deleteRequest('/message/remove/v1', param1)).toStrictEqual(ERROR);
  });

  test('double remove', () => {
    const param1 = {
      token: user2.token,
      messageId: message.messageId
    };
    expect(deleteRequest('/message/remove/v1', param1)).toStrictEqual({});
    expect(deleteRequest('/message/remove/v1', param1)).toStrictEqual(ERROR);
  });

  test('valid test', () => {
    const param1 = {
      token: user2.token,
      messageId: message.messageId
    };
    expect(deleteRequest('/message/remove/v1', param1)).toStrictEqual({});
  });
});

describe('HTTP tests using Jest for messageSendV1', () => {
  test('channelId does not refer to a valid channel', () => {
    const param1 = {
      token: user.token,
      name: 'holidays',
      isPublic: true
    };
    channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token,
      channelId: channel.channelId + 199,
      message: 'Heyyy, how is ur day going'
    };
    expect(postRequest('/message/send/v1', param2)).toStrictEqual(ERROR);
  });

  test('length of message is less than 1 characters', () => {
    const param1 = {
      token: user.token,
      name: 'holidays',
      isPublic: false
    };
    channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token,
      channelId: channel.channelId,
      message: ''
    };
    expect(postRequest('/message/send/v1', param2)).toStrictEqual(ERROR);
  });

  test('length of message is over 1000 characters', () => {
    const param1 = {
      token: user.token,
      name: 'holidays',
      isPublic: false
    };
    channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token,
      channelId: channel.channelId,
      message: 'a'.repeat(1001)
    };
    expect(postRequest('/message/send/v1', param2)).toStrictEqual(ERROR);
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const param1 = {
      email: 'arialee@gmail.com',
      password: 'dynamite',
      nameFirst: 'aria',
      nameLast: 'lee'
    };
    user2 = postRequest('/auth/register/v2', param1);
    const param2 = {
      token: user2.token,
      name: 'holidays',
      isPublic: true
    };
    channel = postRequest('/channels/create/v2', param2);
    const param3 = {
      token: user.token,
      channelId: channel.channelId,
      message: 'Heyyy, how is ur day going'
    };
    expect(postRequest('/message/send/v1', param3)).toStrictEqual(ERROR);
  });

  test('token is invalid', () => {
    const param1 = {
      token: user.token,
      name: 'holidays',
      isPublic: false
    };
    channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token + 'yay',
      channelId: channel.channelId,
      message: 'no thanks'
    };
    expect(postRequest('/message/send/v1', param2)).toStrictEqual(ERROR);
  });

  test('valid input and output', () => {
    const param1 = {
      token: user.token,
      name: 'holidays',
      isPublic: false
    };
    channel = postRequest('/channels/create/v2', param1);
    const param2 = {
      token: user.token,
      channelId: channel.channelId,
      message: 'no thanks'
    };
    expect(postRequest('/message/send/v1', param2).messageId).toStrictEqual(expect.any(Number));
  });
});

describe('MessageEditV1 test', () => {
  test('length of message is over 1000 characters', () => {
    const param3 = {
      token: user2.token,
      messageId: message.messageId,
      message: 'a'.repeat(1001)
    };
    expect(putRequest('/message/edit/v1', param3)).toStrictEqual(ERROR);
  });

  test('invalid msg id', () => {
    const param3 = {
      token: user2.token,
      messageId: message.messageId + 189,
      message: 'hello ellen, what are you doing?'
    };
    expect(putRequest('/message/edit/v1', param3)).toStrictEqual(ERROR);
  });

  test('user not sender and no owner permission', () => {
    // user2 is sender and owner
    const edit1Data = {
      token: user2.token,
      messageId: message.messageId,
      message: 'hello ellen, what are you doing?'
    };
    expect(putRequest('/message/edit/v1', edit1Data)).toStrictEqual({});

    // user is global owner but not member
    const edit2Data = {
      token: user.token,
      messageId: message.messageId,
      message: 'hello ellen, what are you doing?'
    };
    expect(putRequest('/message/edit/v1', edit2Data)).toStrictEqual(ERROR);

    const edit3Data = {
      token: user3.token,
      messageId: message.messageId,
      message: 'hello ellen, what are you doing?'
    };
    expect(putRequest('/message/edit/v1', edit3Data)).toStrictEqual(ERROR);

    // user is not member owner and not sender
    const edit4Data = {
      token: user3.token,
      messageId: dmMsg.messageId,
      message: 'hello ellen, what are you doing?'
    };
    expect(putRequest('/message/edit/v1', edit4Data)).toStrictEqual(ERROR);

    // user is dm creator(owner)
    const edit5Data = {
      token: user2.token,
      messageId: dmMsg.messageId,
      message: 'hello ellen, what are you doing?'
    };
    expect(putRequest('/message/edit/v1', edit5Data)).toStrictEqual({});

    // user is member but sender
    const edit6Data = {
      token: user3.token,
      messageId: dmMsg2.messageId,
      message: 'hello ellen, what are you doing?'
    };
    expect(putRequest('/message/edit/v1', edit6Data)).toStrictEqual({});
  });

  test('token is invalid', () => {
    const param3 = {
      token: user2.token + 'yay',
      messageId: message.messageId,
      message: 'hello ellen, what are you doing?'
    };
    expect(putRequest('/message/edit/v1', param3)).toStrictEqual(ERROR);
  });

  test('string is empty', () => {
    const param3 = {
      token: user2.token,
      messageId: message.messageId,
      message: ''
    };
    expect(putRequest('/message/edit/v1', param3)).toStrictEqual({});
  });

  test('valid input', () => {
    const param3 = {
      token: user2.token,
      messageId: message.messageId,
      message: 'hello ellen, what are you doing?'
    };
    expect(putRequest('/message/edit/v1', param3)).toStrictEqual({});
  });
});

describe('HTTP - /message/senddm/v1 tests', () => {
  test('Invalid dm ID', () => {
    const param = {
      token: user3.token,
      dmId: dm.dmId + 190,
      message: 'i love food wbu?',
    };
    expect(postRequest('/message/senddm/v1', param)).toStrictEqual(ERROR);
  });

  test('Invalid token', () => {
    const param = {
      token: user3.token + 'yay!',
      dmId: dm.dmId,
      message: 'i love food wbu?',
    };
    expect(postRequest('/message/senddm/v1', param)).toStrictEqual(ERROR);
  });

  test('0 msg length', () => {
    const param = {
      token: user3.token,
      dmId: dm.dmId,
      message: '',
    };
    expect(postRequest('/message/senddm/v1', param)).toStrictEqual(ERROR);
  });

  test('+1000 msg length', () => {
    const param = {
      token: user3.token,
      dmId: dm.dmId,
      message: 'a'.repeat(1001)
    };
    expect(postRequest('/message/senddm/v1', param)).toStrictEqual(ERROR);
  });

  test('dmId is valid + user not part of DM', () => {
    const param = {
      token: user.token,
      dmId: dm.dmId,
      message: 'i love food wbu?',
    };
    expect(postRequest('/message/senddm/v1', param)).toStrictEqual(ERROR);
  });

  test('Valid token + uIds (testing if owner is in dm)', () => {
    const param = {
      token: user2.token,
      dmId: dm.dmId,
      message: 'i love food wbu?',
    };
    expect(postRequest('/message/senddm/v1', param)).toStrictEqual({ messageId: expect.any(Number) });
  });

  test('Valid token + uIds (testing if uId is in dm)', () => {
    const param = {
      token: user3.token,
      dmId: dm.dmId,
      message: 'i love food wbu?',
    };
    expect(postRequest('/message/senddm/v1', param)).toStrictEqual({ messageId: expect.any(Number) });
  });
});
