import request from 'sync-request';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };

const getRequest = (url: string, data: any) => {
  const res = request(
    'GET',
    SERVER_URL + url,
    {
      qs: data,
    }
  );
  const body = JSON.parse(res.getBody() as string);
  return body;
};

const postRequest = (url: string, data: any) => {
  const res = request(
    'POST',
    SERVER_URL + url,
    {
      json: data,
    }
  );
  const body = JSON.parse(res.getBody() as string);
  return body;
};

const deleteRequest = (url: string, data: any) => {
  const res = request(
    'DELETE',
    SERVER_URL + url,
    {
      qs: data,
    }
  );
  const body = JSON.parse(res.getBody() as string);
  return body;
};

let user: any;
let invitedUser: any;
let channel: any;

beforeEach(() => {
  deleteRequest('/clear/v1', null);

  // user is global owner
  const userData = {
    email: 'jr@unsw.edu.au',
    password: 'password',
    nameFirst: 'Jake',
    nameLast: 'Renzella'
  };
  user = postRequest('/auth/register/v2', userData);

  const channelData = {
    token: user.token,
    name: 'COMP1531',
    isPublic: true
  };
  channel = postRequest('/channels/create/v2', channelData);

  const param1 = {
    email: 'arialee@gmail.com',
    password: 'dynamite',
    nameFirst: 'aria',
    nameLast: 'lee'
  };
  invitedUser = postRequest('/auth/register/v2', param1);
});

describe('channelDetailsV1 Test', () => {
  test('Invalid token', () => {
    const detailRequest = {
      token: user.token + 'yay',
      channelId: channel.channelId
    };

    expect(getRequest('/channel/details/v2', detailRequest)).toStrictEqual(ERROR);
  });

  test('Invalid channelId', () => {
    const detailRequest = {
      token: user.token,
      channelId: channel.channelId + 189
    };

    expect(getRequest('/channel/details/v2', detailRequest)).toStrictEqual(ERROR);
  });

  test('Valid channelId and token but user is not in course', () => {
    const outsideUserData = {
      email: 'yj@unsw.edu.au',
      password: 'PASSWORD',
      nameFirst: 'Yuchao',
      nameLast: 'Jiang'
    };

    const outsideUser = postRequest('/auth/register/v2', outsideUserData);

    const detailRequest = {
      token: outsideUser.token,
      channelId: channel.channelId
    };

    expect(getRequest('/channel/details/v2', detailRequest)).toStrictEqual(ERROR);
  });

  test('Basic functionality', () => {
    const detailRequest = {
      token: user.token,
      channelId: channel.channelId
    };

    const profileData = {
      token: user.token,
      uId: user.authUserId
    };
    const profile = getRequest('/user/profile/v2', profileData);

    const cDetail = getRequest('/channel/details/v2', detailRequest);
    expect(cDetail.name).toStrictEqual('COMP1531');
    expect(cDetail.isPublic).toStrictEqual(true);
    expect(cDetail.allMembers).toStrictEqual([profile.user]);
    expect(cDetail.ownerMembers).toStrictEqual([profile.user]);
  });
});

describe('channelJoinV1 function testing', () => {
  test('channelId does not refer to a valid channel', () => {
    const user1Data = {
      email: 'jr1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Jake',
      nameLast: 'Renzella'
    };
    const user1 = postRequest('/auth/register/v2', user1Data);

    const channel2Data = {
      token: user1.token,
      name: 'COMP1511',
      isPublic: true
    };
    const channel2 = postRequest('/channels/create/v2', channel2Data);

    const param = {
      token: user.token,
      channelId: channel2.channelId + 189
    };
    expect(postRequest('/channel/join/v2', param)).toStrictEqual(ERROR);
  });

  test('the authorised user is already a member of the channel', () => {
    const param = {
      token: user.token,
      channelId: channel.channelId
    };
    expect(postRequest('/channel/join/v2', param)).toStrictEqual(ERROR);
  });

  test('private channel: authUser not global owner', () => {
    // not global owner
    const user2Data = {
      email: 'jr1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Jake',
      nameLast: 'Renzella'
    };
    const user2 = postRequest('/auth/register/v2', user2Data);

    // private channel
    const channel2Data = {
      token: user.token,
      name: 'COMP1511',
      isPublic: false
    };
    const privChannel = postRequest('/channels/create/v2', channel2Data);

    const param3 = {
      token: user2.token,
      channelId: privChannel.channelId
    };
    expect(postRequest('/channel/join/v2', param3)).toStrictEqual(ERROR);
  });

  test('token is invalid', () => {
    const user1Data = {
      email: 'jr1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Jake',
      nameLast: 'Renzella'
    };
    const user1 = postRequest('/auth/register/v2', user1Data);

    const channel2Data = {
      token: user1.token,
      name: 'COMP1511',
      isPublic: true
    };
    const channel2 = postRequest('/channels/create/v2', channel2Data);

    const param = {
      token: user.token + 'yay',
      channelId: channel2.channelId
    };
    expect(postRequest('/channel/join/v2', param)).toStrictEqual(ERROR);
  });

  test('test sucessful channelJoinV2', () => {
    const user1Data = {
      email: 'jr1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Jake',
      nameLast: 'Renzella'
    };
    const user1 = postRequest('/auth/register/v2', user1Data);

    const channel2Data = {
      token: user1.token,
      name: 'COMP1511',
      isPublic: true
    };
    const channel2 = postRequest('/channels/create/v2', channel2Data);

    const param = {
      token: user.token,
      channelId: channel2.channelId
    };
    expect(postRequest('/channel/join/v2', param)).toStrictEqual({});
  });
});

describe('channelInviteV1 test', () => {
  test('channelId does not refer to a valid channel', () => {
    const inviteData = {
      token: user.token,
      channelId: channel.channelId + 189,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/invite/v2', inviteData)).toStrictEqual(ERROR);
  });

  test('uId does not refer to a valid user', () => {
    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId + 189
    };
    expect(postRequest('/channel/invite/v2', inviteData)).toStrictEqual(ERROR);
  });

  test('invalid token', () => {
    const inviteData = {
      token: user.token + 'yay',
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/invite/v2', inviteData)).toStrictEqual(ERROR);
  });

  test('uId refers to a user who is already a member of the channel', () => {
    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    postRequest('/channel/invite/v2', inviteData);
    expect(postRequest('/channel/invite/v2', inviteData)).toStrictEqual(ERROR);
  });

  test('authorised user is not channel member', () => {
    const user1Data = {
      email: 'jr1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Jake',
      nameLast: 'Renzella'
    };
    const user1 = postRequest('/auth/register/v2', user1Data);

    const inviteData = {
      token: user1.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/invite/v2', inviteData)).toStrictEqual(ERROR);
  });

  test('test valid invite', () => {
    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/invite/v2', inviteData)).toStrictEqual({});
  });
});

describe('channelMessagesV1 test', () => {
  test('channelId does not refer to a valid channel', () => {
    const param2 = {
      token: user.token,
      channelId: channel.channelId + 189,
      start: 0
    };
    expect(getRequest('/channel/messages/v2', param2)).toStrictEqual(ERROR);
  });

  test('start is greater than the total number of messages', () => {
    const param2 = {
      token: user.token,
      channelId: channel.channelId,
      start: 1
    };
    expect(getRequest('/channel/messages/v2', param2)).toStrictEqual(ERROR);
  });

  test('authorised user is not channel member', () => {
    const user1Data = {
      email: 'jr@unsw.edu.au',
      password: 'password',
      nameFirst: 'Jake',
      nameLast: 'Renzella'
    };
    const user1 = postRequest('/auth/register/v2', user1Data);

    const param2 = {
      token: user1.token,
      channelId: channel.channelId,
      start: 0
    };
    expect(getRequest('/channel/messages/v2', param2)).toStrictEqual(ERROR);
  });

  test('token is invalid', () => {
    const param2 = {
      token: user.token + 'yay',
      channelId: channel.channelId,
      start: 0
    };
    expect(getRequest('/channel/messages/v2', param2)).toStrictEqual(ERROR);
  });

  test('valid input', () => {
    const param2 = {
      token: user.token,
      channelId: channel.channelId,
      start: 0
    };

    const result = getRequest('/channel/messages/v2', param2);
    expect(result.messages).toStrictEqual([]);
    expect(result.start).toStrictEqual(0);
    expect(result.end).toStrictEqual(-1);
  });
});

describe('channelLeaveV1 test', () => {
  test('Invalid Channel', () => {
    const channelData = {
      token: user.token,
      channelId: 0,
    };
    expect(postRequest('/channel/leave/v1', channelData)).toStrictEqual(ERROR);
  });

  test('Invalid token', () => {
    const newChannel = {
      token: user.token,
      name: 'COMP1531',
      isPublic: true
    };
    const channel = postRequest('/channels/create/v2', newChannel);
    const channelData = {
      token: user.token + 'yay',
      channelId: channel.channelId
    };
    expect(postRequest('/channel/leave/v1', channelData)).toStrictEqual(ERROR);
  });

  test('not member', () => {
    const user1Data = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user1 = postRequest('/auth/register/v2', user1Data);

    const newChannel = {
      token: user.token,
      name: 'COMP1531',
      isPublic: true
    };
    const channel = postRequest('/channels/create/v2', newChannel);

    const channelData = {
      token: user1.token,
      channelId: channel.channelId,
    };
    expect(postRequest('/channel/leave/v1', channelData)).toStrictEqual(ERROR);
  });

  test('valid channel leave', () => {
    const newChannel = {
      token: user.token,
      name: 'COMP1531',
      isPublic: true
    };
    const channel = postRequest('/channels/create/v2', newChannel);

    const detail = {
      token: user.token,
      channelId: channel.channelId
    };
    const cDetail = getRequest('/channel/details/v2', detail);
    expect(cDetail.name).toStrictEqual(newChannel.name);

    const channelData = {
      token: user.token,
      channelId: channel.channelId,
    };
    const result = postRequest('/channel/leave/v1', channelData);
    expect(result).toStrictEqual({});
    expect(getRequest('/channel/details/v2', detail)).toStrictEqual(ERROR);
  });
});

describe('channelAddOwnerV1 test', () => {
  test('Valid add owner - channel owner', () => {
    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    postRequest('/channel/invite/v2', inviteData);

    const ownerData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/addowner/v1', ownerData)).toStrictEqual({});
    const detailData = {
      token: user.token,
      channelId: channel.channelId
    };
    const cDetail = getRequest('/channel/details/v2', detailData);
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
    const user1 = postRequest('/auth/register/v2', user1Data);

    const newChannelData = {
      token: user1.token,
      name: 'COMP2511',
      isPublic: true
    };
    const newChannel = postRequest('/channels/create/v2', newChannelData);

    const inviteData = {
      token: user1.token,
      channelId: newChannel.channelId,
      uId: invitedUser.authUserId
    };
    postRequest('/channel/invite/v2', inviteData);

    const ownerData = {
      token: user.token,
      channelId: newChannel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/addowner/v1', ownerData)).toStrictEqual(ERROR);

    const globalData = {
      token: user1.token,
      channelId: newChannel.channelId,
      uId: user.authUserId
    };
    postRequest('/channel/invite/v2', globalData);

    const invite2Data = {
      token: user.token,
      channelId: newChannel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/addowner/v1', invite2Data)).toStrictEqual({});

    const detailData = {
      token: user1.token,
      channelId: newChannel.channelId
    };
    let cDetail = getRequest('/channel/details/v2', detailData);
    expect(cDetail.ownerMembers).toEqual(expect.arrayContaining([
      expect.objectContaining({
        uId: invitedUser.authUserId
      })
    ]));

    // global owner add himself
    const detail2Data = {
      token: user1.token,
      channelId: newChannel.channelId
    };
    cDetail = getRequest('/channel/details/v2', detail2Data);
    expect(cDetail.ownerMembers).toEqual(expect.not.arrayContaining([
      expect.objectContaining({
        uId: user.authUserId
      })
    ]));

    const invite3Data = {
      token: user.token,
      channelId: newChannel.channelId,
      uId: user.authUserId
    };
    expect(postRequest('/channel/addowner/v1', invite3Data)).toStrictEqual({});

    const detail1Data = {
      token: user1.token,
      channelId: newChannel.channelId
    };
    cDetail = getRequest('/channel/details/v2', detail1Data);
    expect(cDetail.ownerMembers).toEqual(expect.arrayContaining([
      expect.objectContaining({
        uId: user.authUserId
      })
    ]));
  });

  test('Invalid channel', () => {
    // invite new user to channel - member
    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    postRequest('/channel/invite/v2', inviteData);

    // add owner
    const ownerData = {
      token: user.token,
      channelId: channel.channelId + 189,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/addowner/v1', ownerData)).toStrictEqual(ERROR);
  });

  test('Invalid token', () => {
    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    postRequest('/channel/invite/v2', inviteData);

    const ownerData = {
      token: user.token + 'yay',
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/addowner/v1', ownerData)).toStrictEqual(ERROR);
  });

  test('Invalid uId', () => {
    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    postRequest('/channel/invite/v2', inviteData);

    const ownerData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId + 189,
    };
    expect(postRequest('/channel/addowner/v1', ownerData)).toStrictEqual(ERROR);
  });

  test('uId is not member', () => {
    const ownerData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/addowner/v1', ownerData)).toStrictEqual(ERROR);
  });

  test('uId already owner', () => {
    const ownerData = {
      token: user.token,
      channelId: channel.channelId,
      uId: user.authUserId
    };
    expect(postRequest('/channel/addowner/v1', ownerData)).toStrictEqual(ERROR);
  });

  test('authId no owner permission', () => {
    const newUserData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const newUser = postRequest('/auth/register/v2', newUserData);

    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    postRequest('/channel/invite/v2', inviteData);

    const ownerData = {
      token: newUser.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/addowner/v1', ownerData)).toStrictEqual(ERROR);
  });
});

describe('channelRemoveOwnerV1 test', () => {
  test('Valid remove owner - channel owner', () => {
    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    postRequest('/channel/invite/v2', inviteData);

    const ownerData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/addowner/v1', ownerData)).toStrictEqual({});
    const detailData = {
      token: user.token,
      channelId: channel.channelId
    };
    let cDetail = getRequest('/channel/details/v2', detailData);
    expect(cDetail.ownerMembers).toEqual(expect.arrayContaining([
      expect.objectContaining({
        uId: invitedUser.authUserId
      })
    ]));

    postRequest('/channel/removeowner/v1', ownerData);
    cDetail = getRequest('/channel/details/v2', detailData);
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
    const user1 = postRequest('/auth/register/v2', user1Data);

    const newChannelData = {
      token: user1.token,
      name: 'COMP2511',
      isPublic: true
    };
    const newChannel = postRequest('/channels/create/v2', newChannelData);

    const inviteData = {
      token: user1.token,
      channelId: newChannel.channelId,
      uId: invitedUser.authUserId
    };
    postRequest('/channel/invite/v2', inviteData);

    const ownerData = {
      token: user.token,
      channelId: newChannel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/addowner/v1', ownerData)).toStrictEqual(ERROR);

    const globalData = {
      token: user1.token,
      channelId: newChannel.channelId,
      uId: user.authUserId
    };
    postRequest('/channel/invite/v2', globalData);

    const invite2Data = {
      token: user.token,
      channelId: newChannel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/addowner/v1', invite2Data)).toStrictEqual({});

    const detailData = {
      token: user1.token,
      channelId: newChannel.channelId
    };
    let cDetail = getRequest('/channel/details/v2', detailData);
    expect(cDetail.ownerMembers).toEqual(expect.arrayContaining([
      expect.objectContaining({
        uId: invitedUser.authUserId
      })
    ]));

    postRequest('/channel/removeowner/v1', ownerData);
    cDetail = getRequest('/channel/details/v2', detailData);
    expect(cDetail.ownerMembers).toEqual(expect.arrayContaining([
      expect.not.objectContaining({
        uId: invitedUser.authUserId
      })
    ]));
  });

  test('Invalid channel', () => {
    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    postRequest('/channel/invite/v2', inviteData);

    let ownerData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/addowner/v1', ownerData)).toStrictEqual({});

    ownerData = {
      token: user.token,
      channelId: channel.channelId + 189,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/removeowner/v1', ownerData)).toStrictEqual(ERROR);
  });

  test('Invalid token', () => {
    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    postRequest('/channel/invite/v2', inviteData);

    let ownerData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/addowner/v1', ownerData)).toStrictEqual({});

    ownerData = {
      token: user.token + 'yay',
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/removeowner/v1', ownerData)).toStrictEqual(ERROR);
  });

  test('Invalid uId', () => {
    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    postRequest('/channel/invite/v2', inviteData);

    let ownerData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/addowner/v1', ownerData)).toStrictEqual({});

    ownerData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId + 189
    };
    expect(postRequest('/channel/removeowner/v1', ownerData)).toStrictEqual(ERROR);
  });

  test('uId is not owner', () => {
    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    postRequest('/channel/invite/v2', inviteData);

    const ownerData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/removeowner/v1', ownerData)).toStrictEqual(ERROR);
  });

  test('uId is the only owner', () => {
    const ownerData = {
      token: user.token,
      channelId: channel.channelId,
      uId: user.authUserId
    };
    expect(postRequest('/channel/removeowner/v1', ownerData)).toStrictEqual(ERROR);
  });

  test('authId not owner permission', () => {
    const newUserData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const newUser = postRequest('/auth/register/v2', newUserData);

    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    postRequest('/channel/invite/v2', inviteData);

    let ownerData = {
      token: user.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    postRequest('/channel/addowner/v1', ownerData);

    ownerData = {
      token: newUser.token,
      channelId: channel.channelId,
      uId: invitedUser.authUserId
    };
    expect(postRequest('/channel/removeowner/v1', ownerData)).toStrictEqual(ERROR);
  });
});
