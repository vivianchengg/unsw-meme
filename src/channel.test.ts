import { requestHelper } from './request';

let user: any;
let invitedUser: any;
let channel: any;

beforeEach(() => {
  requestHelper('DELETE', '/clear/v1', {}, {});

  // user is global owner
  const userData = {
    email: 'jr@unsw.edu.au',
    password: 'password',
    nameFirst: 'Jake',
    nameLast: 'Renzella'
  };
  user = requestHelper('POST', '/auth/register/v3', {}, userData);

  const tokenData = {
    token: user.token
  };

  const channelData = {
    name: 'COMP1531',
    isPublic: true
  };
  channel = requestHelper('POST', '/channels/create/v3', tokenData, channelData);

  const param1 = {
    email: 'arialee@gmail.com',
    password: 'dynamite',
    nameFirst: 'aria',
    nameLast: 'lee'
  };
  invitedUser = requestHelper('POST', '/auth/register/v3', {}, param1);
});

afterAll(() => {
  requestHelper('DELETE', '/clear/v1', {}, {});
});

describe('channelDetailsV3 Tests', () => {
  test('Invalid token', () => {
    const tokenData = {
      token: user.token + 'yay'
    };
    const detailRequest = {
      channelId: channel.channelId
    };

    expect(requestHelper('GET', '/channel/details/v3', tokenData, detailRequest)).toStrictEqual(403);
  });

  test('Invalid channelId', () => {
    const tokenData = {
      token: user.token
    };
    const detailRequest = {
      channelId: channel.channelId + 189
    };

    expect(requestHelper('GET', '/channel/details/v3', tokenData, detailRequest)).toStrictEqual(400);
  });

  test('Valid channelId and token but user is not in course', () => {
    const outsideUserData = {
      email: 'yj@unsw.edu.au',
      password: 'PASSWORD',
      nameFirst: 'Yuchao',
      nameLast: 'Jiang'
    };

    const outsideUser = requestHelper('POST', '/auth/register/v2', {}, outsideUserData);

    const tokenData = {
      token: outsideUser.token
    };
    const detailRequest = {
      channelId: channel.channelId
    };

    expect(requestHelper('GET', '/channel/details/v3', tokenData, detailRequest)).toStrictEqual(403);
  });

  test('Basic functionality', () => {
    const tokenData = {
      token: user.token
    };

    const profileData = {
      uId: user.authUserId
    };
    const profile = requestHelper('GET', '/user/profile/v3', tokenData, profileData);

    const detailRequest = {
      channelId: channel.channelId
    };
    const cDetail = requestHelper('GET', '/channel/details/v3', tokenData, detailRequest);
    expect(cDetail.name).toStrictEqual('COMP1531');
    expect(cDetail.isPublic).toStrictEqual(true);
    expect(cDetail.allMembers).toStrictEqual([profile.user]);
    expect(cDetail.ownerMembers).toStrictEqual([profile.user]);
  });
});

describe('channelJoinV3 function testing', () => {
  test('channelId does not refer to a valid channel', () => {
    const user1Data = {
      email: 'jr1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Jake',
      nameLast: 'Renzella'
    };
    const user1 = requestHelper('POST', '/auth/register/v3', {}, user1Data);

    const token1Data = {
      token: user1.token
    };
    const channel2Data = {
      name: 'COMP1511',
      isPublic: true
    };
    const channel2 = requestHelper('POST', '/channels/create/v3', token1Data, channel2Data);

    const tokenData = {
      token: user.token
    };
    const param = {
      channelId: channel2.channelId + 189
    };
    expect(requestHelper('POST', '/channel/join/v3', tokenData, param)).toStrictEqual(400);
  });

  test('the authorised user is already a member of the channel', () => {
    const tokenData = {
      token: user.token
    };
    const param = {
      channelId: channel.channelId
    };
    expect(requestHelper('POST', '/channel/join/v3', tokenData, param)).toStrictEqual(400);
  });

  test('private channel: authUser not global owner', () => {
    // not global owner
    const user2Data = {
      email: 'jr1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Jake',
      nameLast: 'Renzella'
    };
    const user2 = requestHelper('POST', '/auth/register/v3', {}, user2Data);

    // private channel
    const tokenData = {
      token: user.token
    };

    const channel2Data = {
      name: 'COMP1511',
      isPublic: false
    };
    const privChannel = requestHelper('POST', '/channels/create/v3', tokenData, channel2Data);

    const token1Data = {
      token: user2.token
    };
    const param3 = {
      channelId: privChannel.channelId
    };
    expect(requestHelper('POST', '/channel/join/v3', token1Data, param3)).toStrictEqual(403);
  });

  test('token is invalid', () => {
    const user1Data = {
      email: 'jr1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Jake',
      nameLast: 'Renzella'
    };
    const user1 = requestHelper('POST', '/auth/register/v3', {}, user1Data);

    const token1Data = {
      token: user1.token
    };
    const channel2Data = {
      name: 'COMP1511',
      isPublic: true
    };
    const channel2 = requestHelper('POST', '/channels/create/v3', token1Data, channel2Data);

    const tokenData = {
      token: user.token + 'yay'
    };
    const param = {
      channelId: channel2.channelId
    };
    expect(requestHelper('POST', '/channel/join/v3', tokenData, param)).toStrictEqual(403);
  });

  test('test sucessful channelJoinV2', () => {
    const user1Data = {
      email: 'jr1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Jake',
      nameLast: 'Renzella'
    };
    const user1 = requestHelper('POST', '/auth/register/v3', {}, user1Data);

    const token1Data = {
      token: user1.token
    };
    const channel2Data = {
      name: 'COMP1511',
      isPublic: true
    };
    const channel2 = requestHelper('POST', '/channels/create/v3', token1Data, channel2Data);

    const tokenData = {
      token: user.token
    };
    const param = {
      channelId: channel2.channelId
    };
    expect(requestHelper('POST', '/channel/join/v3', tokenData, param)).toStrictEqual({});
  });
});

describe('channelInviteV3 tests', () => {
  test('channelId does not refer to a valid channel', () => {
    const tokenData = {
      token: user.token
    };
    const inviteData = {
      channelId: channel.channelId + 189,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/invite/v3', tokenData, inviteData)).toStrictEqual(400);
  });

  test('uId does not refer to a valid user', () => {
    const tokenData = {
      token: user.token
    };
    const inviteData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId + 189
    };
    expect(requestHelper('POST', '/channel/invite/v3', tokenData, inviteData)).toStrictEqual(400);
  });

  test('invalid token', () => {
    const tokenData = {
      token: user.token + 'yay'
    };
    const inviteData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/invite/v3', tokenData, inviteData)).toStrictEqual(403);
  });

  test('uId refers to a user who is already a member of the channel', () => {
    const tokenData = {
      token: user.token
    };
    const inviteData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, inviteData);
    expect(requestHelper('POST', '/channel/invite/v3', tokenData, inviteData)).toStrictEqual(400);
  });

  test('authorised user is not channel member', () => {
    const user1Data = {
      email: 'jr1@unsw.edu.au',
      password: 'PASSWORD',
      nameFirst: 'Jak',
      nameLast: 'Renzell'
    };
    const user1 = requestHelper('POST', '/auth/register/v3', {}, user1Data);

    const tokenData = {
      token: user1.token
    };
    const inviteData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/invite/v3', tokenData, inviteData)).toStrictEqual(403);
  });

  test('test valid invite', () => {
    const tokenData = {
      token: user.token
    };
    const inviteData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/invite/v3', tokenData, inviteData)).toStrictEqual({});
  });
});

describe('channelMessagesV3 test', () => {
  test('channelId does not refer to a valid channel', () => {
    const tokenData = {
      token: user.token
    };
    const param2 = {
      channelId: channel.channelId + 189,
      start: 0
    };
    expect(requestHelper('GET', '/channel/messages/v3', tokenData, param2)).toStrictEqual(400);
  });

  test('start is greater than the total number of messages', () => {
    const tokenData = {
      token: user.token
    };
    const param2 = {
      channelId: channel.channelId,
      start: 1
    };
    expect(requestHelper('GET', '/channel/messages/v3', tokenData, param2)).toStrictEqual(400);
  });

  test('authorised user is not channel member', () => {
    const user1Data = {
      email: 'jr1@unsw.edu.au',
      password: 'PASSWORD',
      nameFirst: 'Jak',
      nameLast: 'Renzell'
    };
    const user1 = requestHelper('POST', '/auth/register/v3', {}, user1Data);

    const tokenData = {
      token: user1.token
    };
    const param2 = {
      channelId: channel.channelId,
      start: 0
    };
    expect(requestHelper('GET', '/channel/messages/v3', tokenData, param2)).toStrictEqual(403);
  });

  test('token is invalid', () => {
    const tokenData = {
      token: user.token + 'yay'
    };
    const param2 = {
      channelId: channel.channelId,
      start: 0
    };
    expect(requestHelper('GET', '/channel/messages/v3', tokenData, param2)).toStrictEqual(403);
  });

  test('valid input given (start + 50) >= messageLen', () => {
    const tokenData = {
      token: user.token
    };
    const param2 = {
      channelId: channel.channelId,
      start: 0
    };

    const result = requestHelper('GET', '/channel/messages/v3', tokenData, param2);
    expect(result.messages).toStrictEqual([]);
    expect(result.start).toStrictEqual(0);
    expect(result.end).toStrictEqual(-1);
  });

  test('valid input given (start + 50) < messageLen', () => {
    const tokenData = {
      token: user.token
    };

    const messageParam = {
      token: user.token,
      channelId: channel.channelId,
      message: 'This is good'
    };

    for (let i = 0; i < 100; i++) {
      requestHelper('POST', '/message/send/v2', tokenData, messageParam);
    }

    const param2 = {
      channelId: channel.channelId,
      start: 0
    };

    const result = requestHelper('GET', '/channel/messages/v3', tokenData, param2);
    expect(result.start).toStrictEqual(0);
    expect(result.end).toStrictEqual(50);
  });
});

describe('channelLeaveV2 tests', () => {
  test('Invalid Channel', () => {
    const tokenData = {
      token: user.token
    };
    const channelData = {
      channelId: 0,
    };
    expect(requestHelper('POST', '/channel/leave/v2', tokenData, channelData)).toStrictEqual(400);
  });

  test('Invalid token', () => {
    const tokenData = {
      token: user.token
    };
    const newChannel = {
      name: 'COMP1531',
      isPublic: true
    };
    const channel = requestHelper('POST', '/channels/create/v3', tokenData, newChannel);

    const token1Data = {
      token: user.token + 'yay'
    };
    const channelData = {
      channelId: channel.channelId
    };
    expect(requestHelper('POST', '/channel/leave/v2', token1Data, channelData)).toStrictEqual(403);
  });

  test('not member', () => {
    const user1Data = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user1 = requestHelper('POST', '/auth/register/v3', {}, user1Data);

    const tokenData = {
      token: user.token
    };
    const newChannel = {
      name: 'COMP1531',
      isPublic: true
    };
    const channel = requestHelper('POST', '/channels/create/v3', tokenData, newChannel);

    const token1Data = {
      token: user1.token
    };
    const channelData = {
      channelId: channel.channelId,
    };
    expect(requestHelper('POST', '/channel/leave/v2', token1Data, channelData)).toStrictEqual(403);
  });

  test('valid channel leave', () => {
    const tokenData = {
      token: user.token
    };
    const newChannel = {
      name: 'COMP1531',
      isPublic: true
    };
    const channel = requestHelper('POST', '/channels/create/v3', tokenData, newChannel);

    const detail = {
      channelId: channel.channelId
    };
    const cDetail = requestHelper('GET', '/channel/details/v3', tokenData, detail);
    expect(cDetail.name).toStrictEqual(newChannel.name);

    const channelData = {
      channelId: channel.channelId,
    };
    const result = requestHelper('POST', '/channel/leave/v2', tokenData, channelData);
    expect(result).toStrictEqual({});
    expect(requestHelper('GET', '/channel/details/v3', tokenData, detail)).toStrictEqual(403);
  });
});

describe('channelAddOwnerV2 tests', () => {
  test('Valid add owner - channel owner', () => {
    const tokenData = {
      token: user.token
    };
    const inviteData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, inviteData);

    const ownerData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/addowner/v2', tokenData, ownerData)).toStrictEqual({});
    const detailData = {
      channelId: channel.channelId
    };
    const cDetail = requestHelper('GET', '/channel/details/v3', tokenData, detailData);
    expect(cDetail.ownerMembers).toEqual(expect.arrayContaining([
      expect.objectContaining({
        uId: invitedUser.authUserId
      })
    ]));
  });

  test('Valid add owner - global owner', () => {
    const user1Data = {
      email: 'vc1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user1 = requestHelper('POST', '/auth/register/v3', {}, user1Data);

    const token1Data = {
      token: user1.token
    };
    const newChannelData = {
      token: user1.token,
      name: 'COMP2511',
      isPublic: true
    };
    const newChannel = requestHelper('POST', '/channels/create/v3', token1Data, newChannelData);

    const inviteData = {
      channelId: newChannel.channelId,
      uId: invitedUser.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', token1Data, inviteData);

    const tokenData = {
      token: user.token
    };
    const ownerData = {
      channelId: newChannel.channelId,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/addowner/v2', tokenData, ownerData)).toStrictEqual(403);

    const globalData = {
      channelId: newChannel.channelId,
      uId: user.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', token1Data, globalData);

    const invite2Data = {
      channelId: newChannel.channelId,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/addowner/v2', tokenData, invite2Data)).toStrictEqual({});

    const detailData = {
      channelId: newChannel.channelId
    };
    let cDetail = requestHelper('GET', '/channel/details/v3', token1Data, detailData);
    expect(cDetail.ownerMembers).toEqual(expect.arrayContaining([
      expect.objectContaining({
        uId: invitedUser.authUserId
      })
    ]));

    // global owner add himself
    const detail2Data = {
      channelId: newChannel.channelId
    };
    cDetail = requestHelper('GET', '/channel/details/v3', token1Data, detail2Data);
    expect(cDetail.ownerMembers).toEqual(expect.not.arrayContaining([
      expect.objectContaining({
        uId: user.authUserId
      })
    ]));

    const invite3Data = {
      channelId: newChannel.channelId,
      uId: user.authUserId
    };
    expect(requestHelper('POST', '/channel/addowner/v2', tokenData, invite3Data)).toStrictEqual({});

    const detail1Data = {
      channelId: newChannel.channelId
    };
    cDetail = requestHelper('GET', '/channel/details/v3', token1Data, detail1Data);
    expect(cDetail.ownerMembers).toEqual(expect.arrayContaining([
      expect.objectContaining({
        uId: user.authUserId
      })
    ]));
  });

  test('Invalid channel', () => {
    // invite new user to channel - member
    const tokenData = {
      token: user.token
    };
    const inviteData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, inviteData);

    // add owner
    const ownerData = {
      channelId: channel.channelId + 189,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/addowner/v2', tokenData, ownerData)).toStrictEqual(400);
  });

  test('Invalid token', () => {
    const tokenData = {
      token: user.token
    };
    const inviteData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, inviteData);

    const token1Data = {
      token: user.token + 'yay'
    };
    const ownerData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/addowner/v2', token1Data, ownerData)).toStrictEqual(403);
  });

  test('Invalid uId', () => {
    const tokenData = {
      token: user.token
    };
    const inviteData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, inviteData);

    const ownerData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId + 189,
    };
    expect(requestHelper('POST', '/channel/addowner/v2', tokenData, ownerData)).toStrictEqual(400);
  });

  test('uId is not member', () => {
    const tokenData = {
      token: user.token
    };
    const ownerData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/addowner/v2', tokenData, ownerData)).toStrictEqual(400);
  });

  test('uId already owner', () => {
    const tokenData = {
      token: user.token
    };
    const ownerData = {
      channelId: channel.channelId,
      uId: user.authUserId
    };
    expect(requestHelper('POST', '/channel/addowner/v2', tokenData, ownerData)).toStrictEqual(400);
  });

  test('authId no owner permission', () => {
    const newUserData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const newUser = requestHelper('POST', '/auth/register/v3', {}, newUserData);

    const tokenData = {
      token: user.token
    };
    const inviteData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, inviteData);

    const token1Data = {
      token: newUser.token
    };
    const ownerData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/addowner/v2', token1Data, ownerData)).toStrictEqual(403);
  });
});

describe('channelRemoveOwnerV2 tests', () => {
  test('Valid remove owner - channel owner', () => {
    const tokenData = {
      token: user.token
    };
    const inviteData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, inviteData);

    const ownerData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/addowner/v2', tokenData, ownerData)).toStrictEqual({});
    const detailData = {
      channelId: channel.channelId
    };
    let cDetail = requestHelper('GET', '/channel/details/v3', tokenData, detailData);
    expect(cDetail.ownerMembers).toEqual(expect.arrayContaining([
      expect.objectContaining({
        uId: invitedUser.authUserId
      })
    ]));

    requestHelper('POST', '/channel/removeowner/v2', tokenData, ownerData);
    cDetail = requestHelper('GET', '/channel/details/v3', tokenData, detailData);
    expect(cDetail.ownerMembers).toEqual(expect.arrayContaining([
      expect.not.objectContaining({
        uId: invitedUser.authUserId
      })
    ]));
  });

  test('Valid remove owner - global owner', () => {
    const user1Data = {
      email: 'vc1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user1 = requestHelper('POST', '/auth/register/v3', {}, user1Data);

    const token1Data = {
      token: user1.token
    };
    const newChannelData = {
      token: user1.token,
      name: 'COMP2511',
      isPublic: true
    };
    const newChannel = requestHelper('POST', '/channels/create/v3', token1Data, newChannelData);

    const inviteData = {
      channelId: newChannel.channelId,
      uId: invitedUser.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', token1Data, inviteData);

    const tokenData = {
      token: user.token
    };
    const ownerData = {
      channelId: newChannel.channelId,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/addowner/v2', tokenData, ownerData)).toStrictEqual(403);

    const globalData = {
      channelId: newChannel.channelId,
      uId: user.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', token1Data, globalData);

    const invite2Data = {
      channelId: newChannel.channelId,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/addowner/v2', tokenData, invite2Data)).toStrictEqual({});

    const detailData = {
      channelId: newChannel.channelId
    };
    let cDetail = requestHelper('GET', '/channel/details/v3', token1Data, detailData);
    expect(cDetail.ownerMembers).toEqual(expect.arrayContaining([
      expect.objectContaining({
        uId: invitedUser.authUserId
      })
    ]));

    requestHelper('POST', '/channel/removeowner/v2', tokenData, ownerData);
    cDetail = requestHelper('GET', '/channel/details/v3', tokenData, detailData);
    expect(cDetail.ownerMembers).toEqual(expect.arrayContaining([
      expect.not.objectContaining({
        uId: invitedUser.authUserId
      })
    ]));
  });

  test('Invalid channel', () => {
    const tokenData = {
      token: user.token
    };
    const inviteData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, inviteData);

    let ownerData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/addowner/v2', tokenData, ownerData)).toStrictEqual({});

    ownerData = {
      channelId: channel.channelId + 189,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/removeowner/v2', tokenData, ownerData)).toStrictEqual(400);
  });

  test('Invalid token', () => {
    const tokenData = {
      token: user.token
    };
    const inviteData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, inviteData);

    let ownerData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/addowner/v2', tokenData, ownerData)).toStrictEqual({});

    const token1Data = {
      token: user.token + 'yay'
    };
    ownerData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/addowner/v2', token1Data, ownerData)).toStrictEqual(403);
  });

  test('Invalid uId', () => {
    const tokenData = {
      token: user.token
    };
    const inviteData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, inviteData);

    let ownerData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/addowner/v2', tokenData, ownerData)).toStrictEqual({});

    ownerData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId + 189
    };
    expect(requestHelper('POST', '/channel/removeowner/v2', tokenData, ownerData)).toStrictEqual(400);
  });

  test('uId is not owner', () => {
    const tokenData = {
      token: user.token
    };
    const inviteData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, inviteData);

    const ownerData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/removeowner/v2', tokenData, ownerData)).toStrictEqual(400);
  });

  test('uId is the only owner', () => {
    const tokenData = {
      token: user.token
    };
    const ownerData = {
      channelId: channel.channelId,
      uId: user.authUserId
    };
    expect(requestHelper('POST', '/channel/removeowner/v2', tokenData, ownerData)).toStrictEqual(400);
  });

  test('authId not owner permission', () => {
    const newUserData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const newUser = requestHelper('POST', '/auth/register/v3', {}, newUserData);

    const tokenData = {
      token: user.token
    };
    const inviteData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    requestHelper('POST', '/channel/invite/v3', tokenData, inviteData);

    let ownerData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    requestHelper('POST', '/channel/addowner/v2', tokenData, ownerData);

    const token1Data = {
      token: newUser.token
    };
    ownerData = {
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(requestHelper('POST', '/channel/removeowner/v2', token1Data, ownerData)).toStrictEqual(403);
  });
});
