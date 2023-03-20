import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

const ERROR = { error: expect.any(String) };
const SERVERurl = `${url}:${port}`;

//let user : { authUserId: number } | any = { authUserId: -1 };
//let channel : { channelId: number } | any = { channelId: -1 };

// iteration 2
const postRequest = (url: string, data: any) => {
  const res = request('POST', SERVERurl + url, { json: data, });
  const body = JSON.parse(String(res.getBody()));
  return body;
}

const deleteRequest = (url: string, data: any) => {
  const res = request('DELETE', SERVERurl + url, { qs: data, });
  const body = JSON.parse(String(res.getBody()));
  return body;
}

beforeEach(() => {
  deleteRequest('/clear/v1', {});
  
  const person = {
    email: 'jr@unsw.edu.au',
    password: 'password',
    nameFirst: 'Jake',
    nameLast: 'Renzella'
  }

  const user = postRequest('/auth/register/v2', user);
});

describe('HTTP - channelsCreateV2 Tests', () => {
  test('Testing valid token + name', () => {
    const param = {
      token: user.token[0],
      name: 'pewpewpew!',
      isPublic: true,
    }
    
    const channelId = postRequest('/channels/create/v2', param);
    expect(channelId).toStrictEqual({ channelId: expect.any(Number) });
  })

  test('Testing invalid token', () => {
    const param = {
      token: user.token[0] + 'yay!',
      name: 'pewpewpew!',
      isPublic: true,
    }
    
    const channelId = postRequest('/channels/create/v2', param);
    expect(channelId).toStrictEqual(ERROR);
  })

  test('Testing invalid name', () => {
    const param = {
      token: user.token[0],
      name: 'verycoolchannelname1234567891011121314151617181920',
      isPublic: true,
    }
    
    const channelId = postRequest('/channels/create/v2', param);
    expect(channelId).toStrictEqual(ERROR);
  })
});

//iteration 1
/*
beforeEach(() => {
  clearV1();
  user = authRegisterV1('jr@unsw.edu.au', 'password', 'Jake', 'Renzella');
  channel = channelsCreateV1(user.authUserId, 'COMP1531', true);
});
*/

describe('channelsCreateV1 Tests', () => {
  test('Test: valid name & authid!', () => {
    expect(channelsCreateV1(user.authUserId, 'pewpewpew!', true)).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Test: invalid 0 name length', () => {
    expect(channelsCreateV1(user.authUserId, '', false)).toStrictEqual(ERROR);
  });

  test('Test: invalid +20 name length', () => {
    expect(channelsCreateV1(user.authUserId, 'verycoolchannelname1234567891011121314151617181920', true)).toStrictEqual(ERROR);
  });

  test('Test: invalid authUserId', () => {
    expect(channelsCreateV1(user.authUserId + 1, 'pewpewpew!', true)).toStrictEqual(ERROR);
  });
});

describe('channelsListV1 Tests', () => {
  test('Test: invalid authUserId', () => {
    expect(channelsListV1(user.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('Valid authUserId', () => {
    expect(channelsListV1(user.authUserId)).toStrictEqual({
      channels: [{
        channelId: channel.channelId,
        name: 'COMP1531',
      }]
    });
  });
});

describe('channelListAllV1 Tests', () => {
  test('Invalid authUserId', () => {
    channelsCreateV1(user.authUserId, 'COMP1531', true);
    expect(channelsListAllV1(user.authUserId + 1)).toStrictEqual(ERROR);
  });
  test('Basic functionality', () => {
    const channel2 = channelsCreateV1(user.authUserId, 'COMP2511', true);
    expect(channelsListAllV1(user.authUserId)).toStrictEqual({
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
    const channel2 = channelsCreateV1(user.authUserId, 'COMP2511', true);
    const channelPriv = channelsCreateV1(user.authUserId, 'COMP3311', false);
    expect(channelsListAllV1(user.authUserId)).toStrictEqual({
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
    const user2 = authRegisterV1('yj@unsw.edu.au', 'PASSWORD', 'Yuchao', 'Jiang');
    const channel2 = channelsCreateV1(user.authUserId, 'COMP2511', true);
    const channelPriv = channelsCreateV1(user2.authUserId, 'COMP3311', false);
    expect(channelsListAllV1(user.authUserId)).toStrictEqual({
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
