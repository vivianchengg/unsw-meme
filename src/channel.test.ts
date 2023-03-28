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
beforeEach(() => {
  deleteRequest('/clear/v1', null);

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

describe('channelDetailsV1 Test', () => {
  test('Invalid token', () => {
    const detailRequest = {
      token: user.token + '1',
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
      channelId: channel2.channelId + 1
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
    const param2 = {
      email: 'dianahazea@gmail.com',
      password: 'january',
      nameFirst: 'diana',
      nameLast: 'haze'
    };
    const user2 = postRequest('/auth/register/v2', param2);

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
      token: user.token + '1',
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