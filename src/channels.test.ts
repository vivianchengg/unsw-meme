// Will remove once merged, here to fix linting errors
import { channelsCreateV1, channelsListV1 } from './channels';
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

describe('channelsCreateV1 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Test: valid name & authid!', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    expect(channelsCreateV1(user.authUserId, 'pewpewpew!', true)).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Test: invalid 0 name length', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    expect(channelsCreateV1(user.authUserId, '', false)).toStrictEqual(ERROR);
  });

  test('Test: invalid +20 name length', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    expect(channelsCreateV1(user.authUserId, 'verycoolchannelname1234567891011121314151617181920', true)).toStrictEqual(ERROR);
  });

  test('Test: invalid authUserId', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    expect(channelsCreateV1(user.authUserId + 1, 'pewpewpew!', true)).toStrictEqual(ERROR);
  });
});

describe('channelsListV1 Tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Test: invalid authUserId', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    channelsCreateV1(user.authUserId, 'pineapplesunshine', true);
    expect(channelsListV1(user.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('Valid authUserId', () => {
    const user = authRegisterV1('christine@gmail.com', 'password', 'christine', 'chu');
    const channel = channelsCreateV1(user.authUserId, 'pineapplesunshine', true);
    expect(channelsListV1(user.authUserId)).toStrictEqual({
      channels: [{
        channelId: channel.channelId,
        name: 'pineapplesunshine',
      }]
    });
  });
});

describe('channelListAllV1 Tests', () => {
  let user: any;
  let channel: any;

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
    const listRequest = {
      token: []
    };
    expect(getRequest('/channels/listall/v2', listRequest)).toStrictEqual(ERROR);
  });
  test('Basic functionality', () => {
    const channel2Data = {
      token: user.token,
      name: 'COMP2511',
      isPublic: true
    };

    const channel2 = postRequest('/channels/create/v2', channel2Data);

    const listRequest = {
      token: user.token
    };

    expect(getRequest('/channels/listall/v2', listRequest)).toStrictEqual({
      channels:
      [{
        channelId: channel.channelId,
        name: 'COMP1531'
      }, {
        channelId: channel2.channelId,
        name: 'COMP2511'
      }]
    });
  });
  test('Includes private with public channels', () => {
    const channel2Data = {
      token: user.token,
      name: 'COMP2511',
      isPublic: true
    };

    const channel2 = postRequest('/channels/create/v2', channel2Data);

    const channelPrivData = {
      token: user.token,
      name: 'COMP3311',
      isPublic: false
    };

    const channelPriv = postRequest('/channels/create/v2', channelPrivData);

    const listRequest = {
      token: user.token
    };

    expect(getRequest('/channels/listall/v2', listRequest)).toStrictEqual({
      channels:
      [{
        channelId: channel.channelId,
        name: 'COMP1531'
      }, {
        channelId: channel2.channelId,
        name: 'COMP2511'
      }, {
        channelId: channelPriv.channelId,
        name: 'COMP3311'
      }]
    });
  });
  test('Includes channels user is not part of', () => {
    const outsideUserData = {
      email: 'yj@unsw.edu.au',
      password: 'PASSWORD',
      nameFirst: 'Yuchao',
      nameLast: 'Jiang'
    };

    const outsideUser = postRequest('/auth/register/v2', outsideUserData);

    const channel2Data = {
      token: user.token,
      name: 'COMP2511',
      isPublic: true
    };

    const channel2 = postRequest('/channels/create/v2', channel2Data);

    const channelPrivData = {
      token: user.token,
      name: 'COMP3311',
      isPublic: false
    };

    const channelPriv = postRequest('/channels/create/v2', channelPrivData);

    const listRequest = {
      token: outsideUser.token
    };

    expect(getRequest('/channels/listall/v2', listRequest)).toStrictEqual({
      channels:
    [{
      channelId: channel.channelId,
      name: 'COMP1531'
    }, {
      channelId: channel2.channelId,
      name: 'COMP2511'
    }, {
      channelId: channelPriv.channelId,
      name: 'COMP3311'
    }]
    });
  });
});
