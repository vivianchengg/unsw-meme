// Will remove once merged but needed now to fix linting errors
import { channelJoinV1, channelInviteV1, channelMessagesV1, channelDetailsV1 } from './channel';
import { channelsCreateV1 } from './channels';
import { authRegisterV1 } from './auth';
import { clearV1 } from './other';

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
let channel: any;

describe('channelDetailsV1 Test', () => {
  beforeEach(() => {
    deleteRequest('/clear/v1', {});

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
  });

  test('Invalid token', () => {
    const detailRequest = {
      token: '',
      channelId: channel.channelId
    };

    expect(getRequest('/channel/details/v2', detailRequest)).toStrictEqual(ERROR);
  });
  test('Invalid channelId', () => {
    const detailRequest = {
      token: user.token,
      channelId: channel.channelId + 1
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
    const profileRequest = {
      token: user.token,
      user: user.authUserId
    };

    const userProfile = getRequest('/user/profile/v2', profileRequest);

    const detailRequest = {
      token: user.token,
      channelId: channel.channelId + 1
    };

    expect(getRequest('/channel/details/v2', detailRequest)).toStrictEqual({
      name: 'COMP1531',
      isPublic: true,
      ownerMembers: [userProfile.user],
      allMembers: [userProfile.user]
    });
  });
});

describe('channelJoinV1 function testing', () => {
  beforeEach(() => {
    clearV1();
    user = authRegisterV1('bridgetcosta@gmail.com', 'daffodil', 'bridget', 'costa');
  });
  test('channelId does not refer to a valid channel', () => {
    channel = channelsCreateV1(user.authUserId, 'holidays', true);
    expect(channelJoinV1(user.authUserId, channel.channelId + 1)).toStrictEqual(ERROR);
  });

  test('the authorised user is already a member of the channel', () => {
    channel = channelsCreateV1(user.authUserId, 'games', true);
    channelJoinV1(user.authUserId, channel.channelId);
    expect(channelJoinV1(user.authUserId, channel.channelId)).toStrictEqual(ERROR);
  });

  test('channelId refers to a channel that is private, when the authorised user is not already a channel member and is not a global owner', () => {
    channel = channelsCreateV1(user.authUserId, 'sports', false);
    const user2 = authRegisterV1('dianahazea@gmail.com', 'january', 'diana', 'haze');
    expect(channelJoinV1(user2.authUserId, channel.channelId)).toStrictEqual(ERROR);
  });

  test('Test global owner can join private channel', () => {
    const user2 = authRegisterV1('dianahazea@gmail.com', 'january', 'diana', 'haze');
    channel = channelsCreateV1(user2.authUserId, 'sports', false);
    channelJoinV1(user.authUserId, channel.channelId);
    const cDetail = channelDetailsV1(user.authUserId, channel.channelId);
    const owners = cDetail.ownerMembers.map(mem => mem.uId);
    const allmems = cDetail.allMembers.map(mem => mem.uId);
    expect(owners).toEqual(expect.not.arrayContaining([user.authUserId]));
    expect(allmems).toContain(user.authUserId);
  });

  test('authUserId is invalid', () => {
    channel = channelsCreateV1(user.authUserId, 'music', true);
    expect(channelJoinV1(user.authUserId + 1, channel.channelId)).toStrictEqual(ERROR);
  });

  test('valid input', () => {
    channel = channelsCreateV1(user.authUserId, 'games', true);
    const user2 = authRegisterV1('abc@gmail.com', 'password', 'Mary', 'Chan');
    expect(channelJoinV1(user2.authUserId, channel.channelId)).toStrictEqual({});
  });
});

describe('channelInviteV1 function testing', () => {
  beforeEach(() => {
    clearV1();
    user = authRegisterV1('bridgetcosta@gmail.com', 'daffodil', 'bridget', 'costa');
  });
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
  beforeEach(() => {
    clearV1();
    user = authRegisterV1('bridgetcosta@gmail.com', 'daffodil', 'bridget', 'costa');
  });
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
