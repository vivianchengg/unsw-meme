import { channelJoinV1, channelInviteV1, channelMessagesV1, channelDetailsV1 } from './channel';
import { channelsCreateV1 } from './channels';
import { authRegisterV1 } from './auth';
import { userProfileV1 } from './users';

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
beforeEach(() => {
  // deleteRequest('/clear/v1', null);
  deleteRequest('/clear/v1', null);
  user = authRegisterV1('bridgetcosta@gmail.com', 'daffodil', 'bridget', 'costa');
});

describe('channelDetailsV1 Test', () => {
  test('Invalid authUserId', () => {
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
    expect(channelDetailsV1(user.authUserId + 1, channel.channelId)).toStrictEqual(ERROR);
  });
  test('Invalid channelId', () => {
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
    expect(channelDetailsV1(user.authUserId, channel.channelId + 1)).toStrictEqual(ERROR);
  });
  test('Valid channelId and authUserId but user is not in course', () => {
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
    const outsideUser = authRegisterV1('yj@unsw.edu.au', 'PASSWORD', 'Yuchao', 'Jiang');
    expect(channelDetailsV1(outsideUser.authUserId, channel.channelId)).toStrictEqual(ERROR);
  });
  test('Basic functionality', () => {
    const channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
    const userProfile = userProfileV1(user.authUserId, user.authUserId);
    expect(channelDetailsV1(user.authUserId, channel.channelId)).toStrictEqual({
      name: 'COMP1531',
      isPublic: true,
      ownerMembers: [userProfile.user],
      allMembers: [userProfile.user],
    });
  });
});

describe('channelJoinV1 function testing', () => {
  test('channelId does not refer to a valid channel', () => {
    const channel = channelsCreateV1(user.authUserId, 'holidays', true);
    expect(channelJoinV1(user.authUserId, channel.channelId + 1)).toStrictEqual(ERROR);
  });

  test('the authorised user is already a member of the channel', () => {
    const channel = channelsCreateV1(user.authUserId, 'games', true);
    channelJoinV1(user.authUserId, channel.channelId);
    expect(channelJoinV1(user.authUserId, channel.channelId)).toStrictEqual(ERROR);
  });

  test('channelId refers to a channel that is private, when the authorised user is not already a channel member and is not a global owner', () => {
    const channel = channelsCreateV1(user.authUserId, 'sports', false);
    const user2 = authRegisterV1('dianahazea@gmail.com', 'january', 'diana', 'haze');
    expect(channelJoinV1(user2.authUserId, channel.channelId)).toStrictEqual(ERROR);
  });

  test('Test global owner can join private channel', () => {
    const user2 = authRegisterV1('dianahazea@gmail.com', 'january', 'diana', 'haze');
    const channel = channelsCreateV1(user2.authUserId, 'sports', false);
    channelJoinV1(user.authUserId, channel.channelId);
    const cDetail = channelDetailsV1(user.authUserId, channel.channelId);
    const owners = cDetail.ownerMembers.map(mem => mem.uId);
    const allmems = cDetail.allMembers.map(mem => mem.uId);
    expect(owners).toEqual(expect.not.arrayContaining([user.authUserId]));
    expect(allmems).toContain(user.authUserId);
  });

  test('authUserId is invalid', () => {
    const channel = channelsCreateV1(user.authUserId, 'music', true);
    expect(channelJoinV1(user.authUserId + 1, channel.channelId)).toStrictEqual(ERROR);
  });

  test('valid input', () => {
    const channel = channelsCreateV1(user.authUserId, 'games', true);
    const user2 = authRegisterV1('abc@gmail.com', 'password', 'Mary', 'Chan');
    expect(channelJoinV1(user2.authUserId, channel.channelId)).toStrictEqual({});
  });
});

describe('channelInviteV1 function testing', () => {
  test('channelId does not refer to a valid channel', () => {
    const newUser = authRegisterV1('arialee@gmail.com', 'dynamite', 'aria', 'lee');
    const channel = channelsCreateV1(user.authUserId, 'music', false);
    expect(channelInviteV1(user.authUserId, channel.channelId + 1, newUser.authUserId)).toStrictEqual(ERROR);
  });

  test('uId does not refer to a valid user', () => {
    const newUser = authRegisterV1('arialee@gmail.com', 'dynamite', 'aria', 'lee');
    const channel = channelsCreateV1(user.authUserId, 'music', false);
    expect(channelInviteV1(user.authUserId, channel.channelId, newUser.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('uId refers to a user who is already a member of the channel', () => {
    const user2 = authRegisterV1('arialee@gmail.com', 'dynamite', 'aria', 'lee');
    const channel = channelsCreateV1(user.authUserId, 'music', false);
    channelInviteV1(user.authUserId, channel.channelId, user2.authUserId);
    expect(channelInviteV1(user.authUserId, channel.channelId, user2.authUserId)).toStrictEqual(ERROR);
  });
  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const channel = channelsCreateV1(user.authUserId, 'music', false);
    const user2 = authRegisterV1('dianahazea@gmail.com', 'january', 'diana', 'haze');
    const newUser = authRegisterV1('arialee@gmail.com', 'dynamite', 'aria', 'lee');
    expect(channelInviteV1(user2.authUserId, channel.channelId, newUser.authUserId)).toStrictEqual(ERROR);
  });
  test('authUserId is invalid', () => {
    const channel = channelsCreateV1(user.authUserId, 'bored', false);
    const newUser = authRegisterV1('arialee@gmail.com', 'dynamite', 'aria', 'lee');
    expect(channelInviteV1(user.authUserId + 1, channel.channelId, newUser.authUserId)).toStrictEqual(ERROR);
  });
  test('valid input ', () => {
    const user2 = authRegisterV1('arialee@gmail.com', 'dynamite', 'aria', 'lee');
    const channel = channelsCreateV1(user.authUserId, 'sports', true);
    expect(channelInviteV1(user.authUserId, channel.channelId, user2.authUserId)).toStrictEqual({});
  });
});

describe('channelMessagesV1 function testing', () => {
  test('channelId does not refer to a valid channel', () => {
    const channel = channelsCreateV1(user.authUserId, 'music', false);
    expect(channelMessagesV1(user.authUserId, channel.channelId + 1, 0)).toStrictEqual(ERROR);
  });

  test('start is greater than the total number of messages in the channel', () => {
    const channel = channelsCreateV1(user.authUserId, 'sports', false);
    expect(channelMessagesV1(user.authUserId, channel.channelId, 1)).toStrictEqual(ERROR);
  });

  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const channel = channelsCreateV1(user.authUserId, 'gaming', false);
    const user1 = authRegisterV1('dianahazea@gmail.com', 'january', 'diana', 'haze');
    expect(channelMessagesV1(user1.authUserId, channel.channelId, 0)).toStrictEqual(ERROR);
  });

  test('authUserId is invalid', () => {
    const channel = channelsCreateV1(user.authUserId, 'games', true);
    expect(channelMessagesV1(user.authUserId + 1, channel.channelId, 0)).toStrictEqual(ERROR);
  });

  test('valid input', () => {
    const channel = channelsCreateV1(user.authUserId, 'music', true);
    expect(channelMessagesV1(user.authUserId, channel.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });
});

describe('channelAddOwnerV1 test', () => {
  test('Valid add owner - channel owner', () => {
    // new channel, user is channel owner
    const newChannel = {
      token: user.token,
      name: 'COMP1531',
      isPublic: true
    };
    const channel = postRequest('/channels/create/v2', newChannel);

    // new user
    const newUserData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const newUser = postRequest('/auth/register/v2', newUserData);

    // invite new user to channel - member
    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: newUser.uId
    };
    postRequest('/channel/invite/v2', inviteData);

    // add owner
    const channelData = {
      token: user.token,
      channelId: channel.channelId,
      uId: newUser.uId,
    };
    postRequest('/channel/addowner/v1', channelData);

    const detailData = {
      token: user.token,
      channelId: channel.channelId
    };
    const cDetail = getRequest('/channel/details/v2', detailData);
    expect(cDetail.ownerMembers).toContain(newUser.uId);
  });

  test('Invalid token', () => {
    const newChannel = {
      token: user.token,
      name: 'COMP1531',
      isPublic: true
    };
    const channel = postRequest('/channels/create/v2', newChannel);
    const channelData = {
      token: user.token + '1',
      channelId: channel.channelId
    };
    expect(postRequest('/channel/leave/v1', channelData)).toStrictEqual(ERROR);
  });

  test('Valid add owner - global owner', () => {
    const user1Data = {
      email: 'vc1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user1 = postRequest('/auth/register/v2', user1Data);

    // new channel
    const newChannel = {
      token: user1.token,
      name: 'COMP1531',
      isPublic: true
    };
    const channel = postRequest('/channels/create/v2', newChannel);

    // new user
    const newUserData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const newUser = postRequest('/auth/register/v2', newUserData);

    // invite new user to channel - member
    const inviteData = {
      token: user1.token,
      channelId: channel.channelId,
      uId: newUser.uId
    };
    postRequest('/channel/invite/v2', inviteData);

    expect(user.pId).toStrictEqual(1);
    expect(user1.pId).toStrictEqual(2);
    // add owner by GLOBAL OWNER
    const channelData = {
      token: user.token,
      channelId: channel.channelId,
      uId: newUser.uId,
    };
    postRequest('/channel/addowner/v1', channelData);

    const detailData = {
      token: user1.token,
      channelId: channel.channelId
    };
    const cDetail = getRequest('/channel/details/v2', detailData);
    expect(cDetail.ownerMembers).toContain(newUser.uId);
  });

  test('Invalid channel', () => {
    // new channel, user is channel owner
    const newChannel = {
      token: user.token,
      name: 'COMP1531',
      isPublic: true
    };
    const channel = postRequest('/channels/create/v2', newChannel);

    // new user
    const newUserData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const newUser = postRequest('/auth/register/v2', newUserData);

    // invite new user to channel - member
    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: newUser.uId
    };
    postRequest('/channel/invite/v2', inviteData);

    // add owner
    const channelData = {
      token: user.token,
      channelId: channel.channelId + 1,
      uId: newUser.uId,
    };
    expect(postRequest('/channel/addowner/v1', channelData)).toStrictEqual(ERROR);
  });

  test('Invalid token', () => {
    // new channel, user is channel owner
    const newChannel = {
      token: user.token,
      name: 'COMP1531',
      isPublic: true
    };
    const channel = postRequest('/channels/create/v2', newChannel);

    // new user
    const newUserData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const newUser = postRequest('/auth/register/v2', newUserData);

    // invite new user to channel - member
    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: newUser.uId
    };
    postRequest('/channel/invite/v2', inviteData);

    // add owner
    const channelData = {
      token: user.token + '1',
      channelId: channel.channelId,
      uId: newUser.uId,
    };
    expect(postRequest('/channel/addowner/v1', channelData)).toStrictEqual(ERROR);
  });

  test('Invalid uId', () => {
    // new channel, user is channel owner
    const newChannel = {
      token: user.token,
      name: 'COMP1531',
      isPublic: true
    };
    const channel = postRequest('/channels/create/v2', newChannel);

    // new user
    const newUserData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const newUser = postRequest('/auth/register/v2', newUserData);

    // invite new user to channel - member
    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: newUser.uId
    };
    postRequest('/channel/invite/v2', inviteData);

    // add owner
    const channelData = {
      token: user.token,
      channelId: channel.channelId,
      uId: newUser.uId + 1,
    };
    expect(postRequest('/channel/addowner/v1', channelData)).toStrictEqual(ERROR);
  });

  test('uId is not member', () => {
    // new channel, user is channel owner
    const newChannel = {
      token: user.token,
      name: 'COMP1531',
      isPublic: true
    };
    const channel = postRequest('/channels/create/v2', newChannel);

    // new user
    const newUserData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const newUser = postRequest('/auth/register/v2', newUserData);

    // add owner
    const channelData = {
      token: user.token,
      channelId: channel.channelId,
      uId: newUser.uId,
    };
    expect(postRequest('/channel/addowner/v1', channelData)).toStrictEqual(ERROR);
  });

  test('uId already owner', () => {
    // new channel, user is channel owner
    const newChannel = {
      token: user.token,
      name: 'COMP1531',
      isPublic: true
    };
    const channel = postRequest('/channels/create/v2', newChannel);

    // add owner
    const channelData = {
      token: user.token,
      channelId: channel.channelId,
      uId: user.uId,
    };
    expect(postRequest('/channel/addowner/v1', channelData)).toStrictEqual(ERROR);
  });

  test('authId not owner permission', () => {
    // new channel, user is channel owner
    const newChannel = {
      token: user.token,
      name: 'COMP1531',
      isPublic: true
    };
    const channel = postRequest('/channels/create/v2', newChannel);

    // new user
    const newUserData = {
      email: 'vc@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const newUser = postRequest('/auth/register/v2', newUserData);

    // invite new user to channel - member
    const inviteData = {
      token: user.token,
      channelId: channel.channelId,
      uId: newUser.uId
    };
    postRequest('/channel/invite/v2', inviteData);

    const user1Data = {
      email: 'vc1@unsw.edu.au',
      password: 'password',
      nameFirst: 'Vivian',
      nameLast: 'Cheng'
    };
    const user1 = postRequest('/auth/register/v2', user1Data);

    expect(user1.pId).toStrictEqual(2);
    // add owner
    const channelData = {
      token: user1.token,
      channelId: channel.channelId,
      uId: newUser.uId,
    };
    expect(postRequest('/channel/addowner/v1', channelData)).toStrictEqual(ERROR);
  });
});
