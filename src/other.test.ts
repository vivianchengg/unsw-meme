import { requestHelper } from './request';
import { getData } from './dataStore';

let user: any;
let channel: any;
let tokenData: any;
let token1Data: any;
let token2Data: any;
let newUser1: any;
let newUser2: any;
let userHandle: any;
let user1Handle: any;
let user2Handle: any;

beforeEach(() => {
  requestHelper('DELETE', '/clear/v1', {}, {});

  // user
  const userData = {
    email: 'vc@unsw.edu.au',
    password: 'password',
    nameFirst: 'Vivian',
    nameLast: 'Cheng'
  };
  user = requestHelper('POST', '/auth/register/v3', {}, userData);

  const userDetailData = {
    uId: user.authUserId
  };

  const headerData = {
    token: user.token
  };

  const userDetail = requestHelper('GET', '/user/profile/v3', headerData, userDetailData);
  userHandle = userDetail.user.handleStr;

  const newUser1Data = {
    email: 'vc1@unsw.edu.au',
    password: 'password',
    nameFirst: 'Vivian',
    nameLast: 'Cheng'
  };
  newUser1 = requestHelper('POST', '/auth/register/v3', {}, newUser1Data);

  const user1DetailData = {
    uId: newUser1.authUserId
  };

  const user1Detail = requestHelper('GET', '/user/profile/v3', headerData, user1DetailData);
  user1Handle = user1Detail.user.handleStr;

  const newUser2Data = {
    email: 'vc2@unsw.edu.au',
    password: 'password',
    nameFirst: 'Vivian',
    nameLast: 'Cheng'
  };
  newUser2 = requestHelper('POST', '/auth/register/v3', {}, newUser2Data);

  const user2DetailData = {
    uId: newUser2.authUserId
  };

  const user2Detail = requestHelper('GET', '/user/profile/v3', headerData, user2DetailData);
  user2Handle = user2Detail.user.handleStr;

  token1Data = {
    token: newUser1.token
  };

  token2Data = {
    token: newUser2.token
  };

  // channel
  tokenData = {
    token: user.token
  };
  const channelData = {
    name: 'ABC',
    isPublic: true
  };
  channel = requestHelper('POST', '/channels/create/v3', tokenData, channelData);

  // newUser1 is also global owner now
  const param = {
    uId: newUser1.authUserId,
    permissionId: 1
  };
  requestHelper('POST', '/admin/userpermission/change/v1', tokenData, param);
});

afterAll(() => {
  requestHelper('DELETE', '/clear/v1', {}, {});
});

describe('Test clearV1 function', () => {
  test('test clearV1 - user and channel', () => {
    // clear
    requestHelper('DELETE', '/clear/v1', {}, {});

    // get user profile
    const profileData = {
      uId: user.authUserId,
    };

    // get channel detail
    const detailData = {
      channelId: channel.channelId,
    };

    expect(requestHelper('GET', '/user/profile/v3', tokenData, profileData)).toStrictEqual(403);
    expect(requestHelper('GET', '/channel/details/v3', tokenData, detailData)).toStrictEqual(403);
  });

  test('test clearV1 - basic output', () => {
    const userDetail = requestHelper('GET', '/users/all/v2', tokenData, {}).users;
    expect(userDetail[0].uId).toStrictEqual(user.authUserId);
    expect(requestHelper('DELETE', '/clear/v1', {}, {})).toStrictEqual({});
    expect(requestHelper('GET', '/users/all/v2', tokenData, {})).toEqual(403);
  });
});

describe('notifications/get/v1 test', () => {
  test('invalid token', () => {
    const invalidTokenData = {
      token: user.token + 'yay'
    };
    expect(requestHelper('GET', '/notifications/get/v1', invalidTokenData, {})).toEqual(403);
  });

  test('valid notif: being tagged', () => {
    // message
    const token1Data = {
      token: newUser1.token
    };

    const param = {
      channelId: channel.channelId
    };
    requestHelper('POST', '/channel/join/v3', token1Data, param);
    let notif = requestHelper('GET', '/notifications/get/v1', token1Data, {});
    expect(notif.notifications).toStrictEqual([]);

    const channelMsgData = {
      channelId: channel.channelId,
      message: `hello @${user1Handle}, @${user2Handle}!`
    };
    const channelMsg = requestHelper('POST', '/message/send/v2', tokenData, channelMsgData);
    notif = requestHelper('GET', '/notifications/get/v1', tokenData, {});
    expect(notif.notifications).toStrictEqual([]);
    let notif2 = requestHelper('GET', '/notifications/get/v1', token2Data, {});
    expect(notif2.notifications).toStrictEqual([]);
    notif = requestHelper('GET', '/notifications/get/v1', token1Data, {});
    expect(notif.notifications[0].channelId).toStrictEqual(channel.channelId);
    expect(notif.notifications[0].dmId).toStrictEqual(-1);

    // msg edited
    const param3 = {
      messageId: channelMsg.messageId,
      message: `hello @${user2Handle}`
    };
    requestHelper('PUT', '/message/edit/v2', tokenData, param3);
    const notif1 = requestHelper('GET', '/notifications/get/v1', token1Data, {});
    expect(notif1).toStrictEqual(notif);
    notif2 = requestHelper('GET', '/notifications/get/v1', token2Data, {});
    expect(notif2.notifications).toStrictEqual([]);

    const param4 = {
      messageId: channelMsg.messageId,
      message: `hello @${userHandle} @noway${userHandle}`
    };
    requestHelper('PUT', '/message/edit/v2', tokenData, param4);
    notif = requestHelper('GET', '/notifications/get/v1', tokenData, {});
    expect(notif.notifications.length).toStrictEqual(1);
  });

  test('valid notif: tag themselves', () => {
    const channelMsgData = {
      channelId: channel.channelId,
      message: `hello @${userHandle}! Bye @${user2Handle}`
    };
    const channelMsg = requestHelper('POST', '/message/send/v2', tokenData, channelMsgData);

    const notif1 = requestHelper('GET', '/notifications/get/v1', tokenData, {});
    expect(notif1.notifications[0].channelId).toStrictEqual(channel.channelId);
    expect(notif1.notifications[0].dmId).toStrictEqual(-1);

    // non member will not receive notif
    const invalidNotif = requestHelper('GET', '/notifications/get/v1', token2Data, {});
    expect(invalidNotif.notifications).toStrictEqual([]);

    // not affected by remove
    const param1 = {
      messageId: channelMsg.messageId,
    };
    requestHelper('DELETE', '/message/remove/v2', tokenData, param1);
    const notif2 = requestHelper('GET', '/notifications/get/v1', tokenData, {});
    expect(notif2).toStrictEqual(notif1);
  });

  test('valid notif: tag themselves for sendLater', () => {
    const channelMsgData = {
      channelId: channel.channelId,
      message: `hello @${userHandle}! Bye @${user2Handle}`,
      timeSent: Math.floor(new Date().getTime() / 1000) + 5
    };
    const channelMsg = requestHelper('POST', '/message/sendlater/v1', tokenData, channelMsgData);
    let timeNow = Math.floor(new Date().getTime() / 1000);
    while (timeNow < channelMsgData.timeSent) {
      timeNow = Math.floor(new Date().getTime() / 1000);
    }

    const notif1 = requestHelper('GET', '/notifications/get/v1', tokenData, {});
    expect(notif1.notifications[0].channelId).toStrictEqual(channel.channelId);
    expect(notif1.notifications[0].dmId).toStrictEqual(-1);

    // non member will not receive notif
    const invalidNotif = requestHelper('GET', '/notifications/get/v1', token2Data, {});
    expect(invalidNotif.notifications).toStrictEqual([]);

    // not affected by remove
    const param1 = {
      messageId: channelMsg.messageId,
    };
    requestHelper('DELETE', '/message/remove/v2', tokenData, param1);
    const notif2 = requestHelper('GET', '/notifications/get/v1', tokenData, {});
    expect(notif2).toStrictEqual(notif1);
  });

  test('valid notif: dm', () => {
    const dmData = {
      uIds: [newUser2.authUserId]
    };
    const dm = requestHelper('POST', '/dm/create/v2', tokenData, dmData);
    let notif = requestHelper('GET', '/notifications/get/v1', tokenData, {});
    expect(notif.notifications).toStrictEqual([]);

    const dmMsgData = {
      dmId: dm.dmId,
      message: `hello @${userHandle} @${user2Handle} where is @${user1Handle}`
    };
    const dmMsg = requestHelper('POST', '/message/senddm/v2', tokenData, dmMsgData);
    notif = requestHelper('GET', '/notifications/get/v1', tokenData, {});
    let notif2 = requestHelper('GET', '/notifications/get/v1', token2Data, {});
    let notif1 = requestHelper('GET', '/notifications/get/v1', token1Data, {});
    expect(notif1.notifications).toStrictEqual([]);
    expect(notif.notifications[0].channelId).toStrictEqual(-1);
    expect(notif.notifications[0].dmId).toStrictEqual(dm.dmId);
    expect(notif2.notifications.length).toStrictEqual(2);

    const param3 = {
      messageId: dmMsg.messageId,
      message: `hello @${user1Handle} @yay${user1Handle}`
    };
    requestHelper('PUT', '/message/edit/v2', tokenData, param3);
    notif1 = requestHelper('GET', '/notifications/get/v1', token1Data, {});
    expect(notif1.notifications).toStrictEqual([]);
    notif2 = requestHelper('GET', '/notifications/get/v1', token2Data, {});
    expect(notif2.notifications.length).toStrictEqual(2);

    const param4 = {
      messageId: dmMsg.messageId,
      message: `hello @${user2Handle} @noway${user2Handle} @${userHandle}`
    };
    requestHelper('PUT', '/message/edit/v2', tokenData, param4);
    notif = requestHelper('GET', '/notifications/get/v1', tokenData, {});
    notif2 = requestHelper('GET', '/notifications/get/v1', token2Data, {});
    expect(notif.notifications.length).toStrictEqual(2);
    expect(notif2.notifications.length).toStrictEqual(3);
  });

  test('valid notif: being added: channel invite then dm create', () => {
    // channel invite
    const inviteData = {
      channelId: channel.channelId,
      uId: newUser1.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, inviteData);

    const notif = requestHelper('GET', '/notifications/get/v1', token1Data, {});
    expect(notif.notifications[0].channelId).toStrictEqual(channel.channelId);
    expect(notif.notifications[0].dmId).toStrictEqual(-1);

    // dm create
    const dmData = {
      uIds: [newUser1.authUserId, newUser2.authUserId]
    };
    const dm = requestHelper('POST', '/dm/create/v2', tokenData, dmData);
    const notif1 = requestHelper('GET', '/notifications/get/v1', token1Data, {});
    const notif2 = requestHelper('GET', '/notifications/get/v1', token2Data, {});
    expect(notif1.notifications[0].channelId).toStrictEqual(-1);
    expect(notif1.notifications[0].dmId).toStrictEqual(dm.dmId);
    expect(notif1.notifications[1].channelId).toStrictEqual(channel.channelId);
    expect(notif1.notifications[1].dmId).toStrictEqual(-1);

    expect(notif2.notifications[0].channelId).toStrictEqual(-1);
    expect(notif2.notifications[0].dmId).toStrictEqual(dm.dmId);
  });

  test('valid notif: messageReact', () => {
    const send = {
      channelId: channel.channelId,
      message: 'hey'
    };
    const msg = requestHelper('POST', '/message/send/v2', tokenData, send);

    const react = {
      messageId: msg.messageId,
      reactId: 1,
    };
    requestHelper('POST', '/message/react/v1', tokenData, react);

    const notif = requestHelper('GET', '/notifications/get/v1', tokenData, {});
    expect(notif.notifications[0].channelId).toStrictEqual(channel.channelId);
    expect(notif.notifications[0].dmId).toStrictEqual(-1);
    expect(notif.notifications[0].notificationMessage).toStrictEqual('viviancheng reacted to your message in ABC');
  });
});

describe('searchV1 test', () => {
  test('invalid token', () => {
    const invalidToken = {
      token: user.token + 'yay'
    };

    const searchData = {
      queryStr: 'Hello'
    };

    expect(requestHelper('GET', '/search/v1', invalidToken, searchData)).toStrictEqual(403);
  });

  test('invalid queryStr length', () => {
    const search1Data = {
      queryStr: ''
    };

    expect(requestHelper('GET', '/search/v1', tokenData, search1Data)).toStrictEqual(400);

    const search2Data = {
      queryStr: 'a'.repeat(1001)
    };

    expect(requestHelper('GET', '/search/v1', tokenData, search2Data)).toStrictEqual(400);
  });

  test('valid test', () => {
    const channel1Data = {
      name: 'ABC',
      isPublic: true
    };
    requestHelper('POST', '/channels/create/v3', token1Data, channel1Data);

    const channelMsg1Data = {
      channelId: channel.channelId,
      message: 'Hello, world!'
    };
    requestHelper('POST', '/message/send/v2', tokenData, channelMsg1Data);

    const channelMsg2Data = {
      channelId: channel.channelId,
      message: 'Foobarhello2000'
    };
    requestHelper('POST', '/message/send/v2', tokenData, channelMsg2Data);

    const dm1Data = {
      uIds: [newUser2.authUserId]
    };
    const dm1 = requestHelper('POST', '/dm/create/v2', tokenData, dm1Data);

    const dm2Data = {
      uIds: [newUser2.authUserId]
    };
    requestHelper('POST', '/dm/create/v2', tokenData, dm2Data);

    const dmMsgData = {
      dmId: dm1.dmId,
      message: 'Example message!'
    };
    requestHelper('POST', '/message/senddm/v2', tokenData, dmMsgData);

    const query1Data = {
      queryStr: 'hello'
    };
    expect(requestHelper('GET', '/search/v1', tokenData, query1Data).messages.length).toStrictEqual(2);

    const query2Data = {
      queryStr: '!'
    };
    expect(requestHelper('GET', '/search/v1', tokenData, query2Data).messages.length).toStrictEqual(2);
    expect(requestHelper('GET', '/search/v1', token1Data, query1Data).messages.length).toStrictEqual(0);
  });
});

describe('Test adminUserPermChangeV1 function', () => {
  test('uId not valid', () => {
    const param1 = {
      uId: user.authUserId + 189,
      permissionId: 2
    };

    expect(requestHelper('POST', '/admin/userpermission/change/v1', tokenData, param1)).toEqual(400);
  });
  test('Only global owner being demoted to user', () => {
    const param1 = {
      uId: newUser1.authUserId,
      permissionId: 2
    };

    const param = {
      uId: user.authUserId,
      permissionId: 2
    };

    expect(requestHelper('POST', '/admin/userpermission/change/v1', tokenData, param1)).toStrictEqual({});
    expect(requestHelper('POST', '/admin/userpermission/change/v1', tokenData, param)).toEqual(400);
  });
  test('pId not valid', () => {
    const param = {
      uId: user.authUserId,
      permissionId: 100
    };

    expect(requestHelper('POST', '/admin/userpermission/change/v1', tokenData, param)).toEqual(400);
  });
  test('User already has pId level', () => {
    const param = {
      uId: user.authUserId,
      permissionId: 1
    };

    expect(requestHelper('POST', '/admin/userpermission/change/v1', tokenData, param)).toEqual(400);
  });
  test('token not valid', () => {
    const invalidTokenData = {
      token: user.token + 'yay'
    };

    const param = {
      uId: user.authUserId,
      permissionId: 2
    };

    expect(requestHelper('POST', '/admin/userpermission/change/v1', invalidTokenData, param)).toEqual(403);
  });
  test('Authorised user is not global owner', () => {
    const param = {
      uId: user.authUserId,
      permissionId: 2
    };

    expect(requestHelper('POST', '/admin/userpermission/change/v1', token2Data, param)).toEqual(403);
  });
  test('Basic functionality', () => {
    const param = {
      uId: user.authUserId,
      permissionId: 2
    };

    let data = getData();
    expect(data.users[0].pId).toEqual(1);

    requestHelper('POST', '/admin/userpermission/change/v1', tokenData, param);

    data = getData();
    expect(data.users[0].pId).toEqual(2);
  });
});

describe('Test adminUserRemoveV1 function', () => {
  test('uId not valid', () => {
    const param = {
      uId: user.authUserId + 100
    };

    expect(requestHelper('DELETE', '/admin/user/remove/v1', tokenData, param)).toEqual(400);
  });
  test('Only global owner being removed', () => {
    const param1 = {
      uId: newUser1.authUserId,
      permissionId: 2
    };
    requestHelper('POST', '/admin/userpermission/change/v1', tokenData, param1);

    const param = {
      uId: user.authUserId
    };

    expect(requestHelper('DELETE', '/admin/user/remove/v1', tokenData, param)).toEqual(400);
  });
  test('token not valid', () => {
    const invalidTokenData = {
      token: user.token + 'yay'
    };

    const param = {
      uId: newUser1.authUserId
    };

    expect(requestHelper('DELETE', '/admin/user/remove/v1', invalidTokenData, param)).toEqual(403);
  });
  test('Authorised user is not global owner', () => {
    const param = {
      uId: user.authUserId
    };

    expect(requestHelper('DELETE', '/admin/user/remove/v1', token2Data, param)).toEqual(403);
  });
  test('Basic functionality', () => {
    const user34Data = {
      email: 'vc34@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user34 = requestHelper('POST', '/auth/register/v3', {}, user34Data);

    const inviteParam = {
      channelId: channel.channelId,
      uId: newUser1.authUserId
    };

    requestHelper('POST', '/channel/invite/v3', tokenData, inviteParam);

    const messageParam = {
      channelId: channel.channelId,
      message: 'Haha, bet this gets removed'
    };

    requestHelper('POST', '/message/send/v2', token1Data, messageParam);

    const dmParam = {
      uIds: [user.authUserId, user34.authUserId]
    };

    const dm = requestHelper('POST', '/dm/create/v2', token1Data, dmParam);

    const dmMessageParam = {
      dmId: dm.dmId,
      message: '$200 this still survives'
    };

    requestHelper('POST', '/message/senddm/v2', token1Data, dmMessageParam);

    const infoParam = {
      uId: newUser1.authUserId
    };

    const user1Info = requestHelper('GET', '/user/profile/v3', tokenData, infoParam);

    // remove newUser1
    expect(requestHelper('DELETE', '/admin/user/remove/v1', tokenData, infoParam)).toStrictEqual({});
    const usersResult = requestHelper('GET', '/users/all/v2', tokenData, {});
    expect(usersResult.users).toEqual(expect.not.arrayContaining([user1Info]));

    // remove newUser2
    const info2Param = {
      uId: newUser2.authUserId
    };
    requestHelper('DELETE', '/admin/user/remove/v1', tokenData, info2Param);

    const info3Param = {
      uId: user34.authUserId
    };
    requestHelper('DELETE', '/admin/user/remove/v1', tokenData, info3Param);

    const channelParam = {
      channelId: channel.channelId
    };

    const cResult = requestHelper('GET', '/channel/details/v3', tokenData, channelParam);
    expect(cResult.allMembers).toEqual(expect.not.arrayContaining([newUser1.authUserId]));

    const messageDetailParam = {
      channelId: channel.channelId,
      start: 0
    };

    const channelMessage = requestHelper('GET', '/channel/messages/v3', tokenData, messageDetailParam);
    expect(channelMessage.messages[0].message).toStrictEqual('Removed user');

    const dmDetailParam = {
      dmId: dm.dmId,
      start: 0
    };

    const dmMessage = requestHelper('GET', '/dm/messages/v2', tokenData, dmDetailParam).messages[0];
    expect(dmMessage.message).toStrictEqual('Removed user');

    const data = getData();
    const dmFull = data.dms.find(d => d.dmId === dm.dmId);
    expect(dmFull.owner).toStrictEqual(null);
    expect(dmFull.allMembers).not.toEqual(expect.arrayContaining([newUser1.authUserId]));

    const removedInfo = requestHelper('GET', '/user/profile/v3', tokenData, infoParam);
    expect(removedInfo.user.nameFirst).toStrictEqual('Removed');
    expect(removedInfo.user.nameLast).toStrictEqual('user');
    expect(removedInfo.user.handleStr).toStrictEqual('');
    expect(removedInfo.user.email).toStrictEqual('');

    const oldEmail = user1Info.user.email;
    const oldHandleStr = user1Info.user.handleStr;
    const handleParam = {
      handleStr: oldHandleStr
    };
    expect(requestHelper('PUT', '/user/profile/sethandle/v2', tokenData, handleParam)).toStrictEqual({});

    const emailParam = {
      email: oldEmail
    };
    expect(requestHelper('PUT', '/user/profile/setemail/v2', tokenData, emailParam)).toStrictEqual({});
  });
  test('Owners are allowed to remove other owners, including first owner', () => {
    const param = {
      uId: user.authUserId
    };

    expect(requestHelper('DELETE', '/admin/user/remove/v1', token1Data, param)).toStrictEqual({});

    const channelParam = {
      channelId: channel.channelId
    };

    const owners = requestHelper('GET', '/channel/details/v3', token2Data, channelParam).ownerMembers;
    expect(owners).toEqual(expect.not.arrayContaining([user.authUserId]));
  });
});
